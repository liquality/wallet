import BN from 'bignumber.js'
import JSBI from 'jsbi'
import { v4 as uuidv4 } from 'uuid'
import { Token, WETH9, CurrencyAmount, TradeType, Fraction, Percent } from '@uniswap/sdk-core'
import { Route, Trade, Pair } from '@uniswap/v2-sdk'
import * as ethers from 'ethers'
import buildConfig from '../../build.config'
import { chains, currencyToUnit } from '@liquality/cryptoassets'
import cryptoassets from '@/utils/cryptoassets'
import { isEthereumChain } from '../../utils/asset'
import { AssetNetworks } from '../../store/utils'
import { withInterval } from '../../store/actions/performNextAction/utils'

const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export async function getSupportedPairs () {
  return []
}

function getUniswapToken (chainId, asset) {
  if (asset === 'ETH') { return WETH9[chainId] }
  const assetData = cryptoassets[asset]

  return new Token(chainId, assetData.contractAddress, assetData.decimals, assetData.code, assetData.name)
}

function getMinimumOutput (outputAmount) { // TODO: configurable slippage?
  const slippageTolerance = new Percent('50', '10000') // 0.5%
  const slippageAdjustedAmountOut = new Fraction(JSBI.BigInt(1))
    .add(slippageTolerance)
    .invert()
    .multiply(outputAmount.quotient).quotient
  return CurrencyAmount.fromRawAmount(outputAmount.currency, slippageAdjustedAmountOut)
}

export async function getQuote ({ commit, getters, state }, { network, from, to, amount }) {
  // Uniswap only provides liquidity for ethereum tokens
  if (!isEthereumChain(from) || !isEthereumChain(to)) return null
  // Only uniswap on ethereum is supported atm
  if (cryptoassets[from].chain !== 'ethereum' || cryptoassets[to].chain !== 'ethereum') return null

  const nativeAsset = chains[cryptoassets[from].chain].nativeAsset
  const chainId = AssetNetworks[nativeAsset][network].chainId

  const tokenA = getUniswapToken(chainId, from)
  const tokenB = getUniswapToken(chainId, to)

  const pairAddress = Pair.getAddress(tokenA, tokenB)

  const api = new ethers.providers.InfuraProvider(chainId, buildConfig.infuraApiKey)
  const contract = new ethers.Contract(pairAddress, [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
  ], api)
  const reserves = await contract.getReserves()
  const token0Address = await contract.token0()
  const token1Address = await contract.token1()
  const token0 = [tokenA, tokenB].find(token => token.address === token0Address)
  const token1 = [tokenA, tokenB].find(token => token.address === token1Address)
  const pair = new Pair(
    CurrencyAmount.fromRawAmount(token0, reserves.reserve0.toString()),
    CurrencyAmount.fromRawAmount(token1, reserves.reserve1.toString())
  )

  const route = new Route([pair], tokenA, tokenB)

  const fromAmountInUnit = currencyToUnit(cryptoassets[from], BN(amount))
  const tokenAmount = CurrencyAmount.fromRawAmount(tokenA, fromAmountInUnit.toFixed())
  const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT)

  const toAmountInUnit = currencyToUnit(cryptoassets[to], BN(trade.outputAmount.toExact()))
  return {
    // TODO: numbers should come out in bignumber
    from,
    to,
    fromAmount: fromAmountInUnit.toNumber(),
    toAmount: toAmountInUnit.toNumber()
  }
}

export async function newSwap ({ commit, getters, dispatch }, { network, walletId, quote }) {
  const toChain = chains[cryptoassets[quote.to].chain]
  const nativeAsset = toChain.nativeAsset
  const chainId = AssetNetworks[nativeAsset][network].chainId

  const fromToken = getUniswapToken(chainId, quote.from)
  const toToken = getUniswapToken(chainId, quote.to)

  const outputAmount = CurrencyAmount.fromRawAmount(toToken, BN(quote.toAmount).toFixed())
  const minimumOutput = getMinimumOutput(outputAmount)

  const value = BN(quote.fromAmount)
  const path = [fromToken.address, toToken.address]
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // TODO: should this use chain time instead?
  const minimumOutputInUnit = currencyToUnit(cryptoassets[quote.to], BN(minimumOutput.toExact()))
  const outputAmountHex = ethers.BigNumber.from(minimumOutputInUnit.toFixed()).toHexString()

  const [toAddressRaw] = await dispatch('getUnusedAddresses', { network, walletId, assets: [quote.to], accountId: quote.toAccountId })
  const toAddress = toChain.formatAddress(toAddressRaw)

  const api = new ethers.providers.InfuraProvider(chainId, buildConfig.infuraApiKey)
  const uniswap = new ethers.Contract(
    UNISWAP_ROUTER_ADDRESS,
    ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
    api
  )

  const encodedData = uniswap.interface.encodeFunctionData('swapExactETHForTokens', [
    outputAmountHex, path, toAddress, deadline
  ])

  const account = getters.accountItem(quote.fromAccountId)
  const client = getters.client(network, walletId, quote.from, account?.type)
  const tx = await client.chain.sendTransaction({ to: UNISWAP_ROUTER_ADDRESS, value, data: encodedData, fee: quote.fee })

  return {
    id: uuidv4(),
    status: 'WAITING_FOR_CONFIRMATIONS',
    fee: quote.fee,
    tx,
    slippage: 50,
    txHash: tx.hash
  }
}

async function waitForConfirmations ({ getters, dispatch }, { order, network, walletId }) {
  const account = getters.accountItem(order.accountId)
  const client = getters.client(network, walletId, order.from, account?.type)

  try {
    const tx = await client.chain.getTransactionByHash(order.txHash)
    if (tx && tx.confirmations > 0) {
      dispatch('updateBalances', { network, walletId, assets: [order.from] })
      return {
        endTime: Date.now(),
        status: 'SUCCESS'
      }
    }
  } catch (e) {
    if (e.name === 'TxNotFoundError') console.warn(e)
    else throw e
  }
}

export async function performNextSwapAction (store, { network, walletId, order }) {
  let updates

  if (order.status === 'WAITING_FOR_CONFIRMATIONS') {
    updates = await withInterval(async () => waitForConfirmations(store, { order, network, walletId }))
  }

  return updates
}
