import BN from 'bignumber.js'
import { v4 as uuidv4 } from 'uuid'
import { LCDClient } from '@terra-money/terra.js'

import cryptoassets from '@/utils/cryptoassets'
import { chains, currencyToUnit, unitToCurrency } from '@liquality/cryptoassets'
import { TerraNetworks } from '@liquality/terra-networks'
import { withInterval } from '../../store/actions/performNextAction/utils'

import { getRateNativeToAsset, getRateERC20ToERC20, buildSwapFromNativeTokenMsg, buildSwapFromContractTokenMsg, buildSwapFromContractTokenToUSTMsg } from './queries';
import { SwapProvider } from '../SwapProvider'

class AstroportSwapProvider extends SwapProvider {
  pairAddress;
  fromTokenAddress;
  toTokenAddress;

  async getSupportedPairs() {
    return []
  }

  async getQuote({ from, to, amount }) {
    const fromInfo = cryptoassets[from]
    const toInfo = cryptoassets[to]

    // only for Terra network swaps
    if (fromInfo.chain !== 'terra' || toInfo.chain !== 'terra' || amount <= 0) {
      return null
    }

    const fromAmountInUnit = currencyToUnit(fromInfo, BN(amount)).toFixed()
    const rate = await this._getSwapRate(fromAmountInUnit, fromInfo, toInfo)

    return {
      from,
      to,
      fromAmount: fromAmountInUnit,
      toAmount: rate.amount?.toString() || rate.return_amount?.toString(),
    }
  }

  async newSwap({ network, walletId, quote }) {
    const client = this.getClient(network, walletId, quote.from, quote.fromAccountId)
    const [{ address }] = await client.wallet.getAddresses();

    const denom = this._getDenom(quote.from)

    const isFromNative = quote.from === 'UST' || quote.from === 'LUNA' && quote.to === 'UST'
    const isFromERC20ToUST = this.fromTokenAddress && quote.to === 'UST'

    let txData

    if (isFromNative) {
      txData = buildSwapFromNativeTokenMsg(quote, denom, address, this.pairAddress)
    } else if (isFromERC20ToUST) {
      txData = buildSwapFromContractTokenToUSTMsg(quote, address, this.fromTokenAddress, this.pairAddress)
    } else {
      txData = buildSwapFromContractTokenMsg(quote, address, this.fromTokenAddress, this.toTokenAddress)
    }

    await this.sendLedgerNotification(quote.fromAccountId, 'Signing required to complete the swap.')

    const swapTx = await client.chain.sendTransaction(txData)

    const updates = {
      status: 'WAITING_FOR_SWAP_CONFIRMATIONS',
      swapTx,
      swapTxHash: swapTx.hash
    }

    return {
      id: uuidv4(),
      fee: quote.fee,
      slippage: 50,
      ...updates
    }
  }




  // ======== STATE TRANSITIONS ========

  async waitForSwapConfirmations({ swap, network, walletId }) {
    const client = this.getClient(network, walletId, swap.from, swap.fromAccountId)

    try {
      const tx = await client.chain.getTransactionByHash(swap.swapTxHash)
      if (tx && tx.confirmations > 0) {
        const { status } = await client.getMethod('getTransactionByHash')(swap.swapTxHash)
        this.updateBalances({ network, walletId, assets: [swap.from] })
        return {
          endTime: Date.now(),
          status
        }
      }
    } catch (e) {
      if (e.name === 'TxNotFoundError') console.warn(e)
      else throw e
    }
  }

  async performNextSwapAction(store, { network, walletId, swap }) {
    if (swap.status === 'WAITING_FOR_SWAP_CONFIRMATIONS') {
      return await withInterval(async () =>
        this.waitForSwapConfirmations({ swap, network, walletId })
      )
    }
  }

  // ========= FEES ========


  async estimateFees({ asset, txType, quote, feePrices }) {
    if (txType !== AstroportSwapProvider.fromTxType) throw new Error(`Invalid tx type ${txType}`)

    const nativeAsset = chains[cryptoassets[asset].chain].nativeAsset

    const gasLimit = (quote.from === 'UST' || quote.from === 'LUNA' && quote.to === 'UST') ?
      400_000 : 1_500_000

    const fees = {}

    for (const feePrice of feePrices) {
      let fee = BN(gasLimit).times(feePrice)
      fees[feePrice] = unitToCurrency(cryptoassets[nativeAsset], fee).toFixed()
    }

    return fees
  }


  // ======== UTILS ========

  _getRPC() {
    const { chainID, nodeUrl } = TerraNetworks.terra_mainnet

    return new LCDClient({
      chainID,
      URL: nodeUrl
    })
  }

  _getDenom(asset) {
    return {
      LUNA: 'uluna',
      UST: 'uusd'
    }[asset]
  }

  async _getSwapRate(fromAmount, fromInfo, toInfo) {
    const rpc = this._getRPC()

    // Check coin types
    const nativeToNative = fromInfo.type === 'native' && toInfo.type === 'native'
    const erc20ToErc20 = fromInfo.type === 'erc20' && toInfo.type === 'erc20'
    const nativeToErc20 = fromInfo.type === 'native' && toInfo.type === 'erc20'
    const erc20ToNative = fromInfo.type === 'erc20' && toInfo.type === 'native'

    // Select correct query and address depending on coin types
    let contractData = {
      address: '',
      query: ''
    }

    if (nativeToNative) {
      this.fromTokenAddress = '';
      this.toTokenAddress = '';

      const fromDenom = this._getDenom(fromInfo.code)

      contractData = getRateNativeToAsset(fromAmount, fromDenom)
    } else if (erc20ToErc20) {
      this.fromTokenAddress = fromInfo.contractAddress
      this.toTokenAddress = toInfo.contractAddress

      contractData = getRateERC20ToERC20(fromAmount, this.fromTokenAddress, this.toTokenAddress)
    } else if (nativeToErc20) {
      this.fromTokenAddress = '';
      this.toTokenAddress = toInfo.contractAddress

      const fromDenom = this._getDenom(fromInfo.code)

      const pairAddress = await this._getPairAddress(this.toTokenAddress);

      contractData = fromInfo.code === 'LUNA' ? getRateERC20ToERC20(fromAmount, fromDenom, this.toTokenAddress)
        : getRateNativeToAsset(fromAmount, fromDenom, pairAddress)
    } else if (erc20ToNative) {
      this.fromTokenAddress = fromInfo.contractAddress
      this.toTokenAddress = '';

      const toDenom = this._getDenom(toInfo.code)

      const pairAddress = await this._getPairAddress(this.fromTokenAddress);

      contractData = toInfo.code === 'LUNA' ? getRateERC20ToERC20(fromAmount, this.fromTokenAddress, toDenom)
        : getRateNativeToAsset(fromAmount, this.fromTokenAddress, pairAddress)
    } else {
      throw new Error(`From: ${fromInfo.type} To: ${toInfo.type}`)
    }

    const { address, query } = contractData

    this.pairAddress = address;

    return await rpc.wasm.contractQuery(address, query)
  }

  async _getPairAddress(tokenAddress) {
    const rpc = this._getRPC()

    const resp = await rpc.wasm.contractQuery('terra1fnywlw4edny3vw44x04xd67uzkdqluymgreu7g', {
      pair: {
        asset_infos: [
          {
            token: {
              contract_addr: tokenAddress
            }
          },
          {
            native_token: {
              denom: "uusd"
            }
          }
        ]
      }
    })

    return resp.contract_addr
  }

  // ======== STATIC ========

  static txTypes = {
    SWAP: 'SWAP'
  }

  static statuses = {
    WAITING_FOR_SWAP_CONFIRMATIONS: {
      step: 0,
      label: 'Swapping {from}',
      filterStatus: 'PENDING',
      notification() {
        return {
          message: 'Engaging Astroport'
        }
      }
    },
    SUCCESS: {
      step: 1,
      label: 'Completed',
      filterStatus: 'COMPLETED',
      notification(swap) {
        return {
          message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to
            } ready to use`
        }
      }
    },
    FAILED: {
      step: 1,
      label: 'Swap Failed',
      filterStatus: 'REFUNDED',
      notification() {
        return {
          message: 'Swap failed'
        }
      }
    }
  }

  static fromTxType = AstroportSwapProvider.txTypes.SWAP
  static toTxType = null
  static timelineDiagramSteps = ['SWAP']
  static totalSteps = 2
}

export { AstroportSwapProvider }