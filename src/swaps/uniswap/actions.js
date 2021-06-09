import BN from 'bignumber.js'
import { Token, WETH9, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { Route, Trade, Pair } from '@uniswap/v2-sdk'
import * as ethers from 'ethers'
import buildConfig from '../../build.config'
import { chains, currencyToUnit } from '@liquality/cryptoassets'
import cryptoassets from '@/utils/cryptoassets'
import { isEthereumChain } from '../../utils/asset'
import { AssetNetworks } from '../../store/utils'

export async function getSupportedPairs () {
  return []
}

function getUniswapToken (chainId, asset) {
  if (asset === 'ETH') { return WETH9[chainId] }
  const assetData = cryptoassets[asset]

  return new Token(chainId, assetData.contractAddress, assetData.decimals, assetData.code, assetData.name)
}

export async function getQuote ({ commit, getters, state }, { network, from, to, amount }) {
  // Uniswap only provides liquidity for ethereum tokens
  if (!isEthereumChain(from) || !isEthereumChain(to)) return null

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
  const tokenAmount = CurrencyAmount.fromRawAmount(tokenA, fromAmountInUnit.toString())
  const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT)

  const toAmountInUnit = currencyToUnit(cryptoassets[to], BN(trade.outputAmount.toExact()))
  return {
    // TODO: hnumbers should come out in bignumber
    from, to, fromAmount: fromAmountInUnit.toNumber(), toAmount: toAmountInUnit.toNumber()
  }
}

// https://vomtom.at/how-to-use-uniswap-v2-as-a-developer/
// https://github.com/cryptocamtech/uniswap-sdk-tutorial/blob/master/ethToDai.js
// https://soliditydeveloper.com/uniswap2
export async function newSwap ({ commit, getters, dispatch }, { network, walletId, quote }) {

}
