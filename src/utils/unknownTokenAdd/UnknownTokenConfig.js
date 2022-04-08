import { ethers } from 'ethers'
import ERC20 from '@uniswap/v2-core/build/ERC20.json'
import routerV2Abi from './routerV2Abi.json'
import store from '../../store'
import { assets } from '@liquality/cryptoassets'

export class UnknownTokenConfig {
  UNISWAP = 'uniswap'
  request
  request
  validOrigins
  validMethods
  chain
  origin
  config
  constructor(request) {
    if (this.constructor === UnknownTokenConfig) {
      throw new TypeError('Abstract class "UnknownAssetConfig" cannot be instantiated directly.')
    }
    this.request = request
    this.validOrigins = {
      'https://app.uniswap.org': this.UNISWAP
    }
    this.validMethods = {
      'chain.sendTransaction': true
    }
    this.chain = assets[this.request.asset].chain
    this.origin = this.validOrigins[this.request.origin]
    this.config = {
      [this.UNISWAP]: {
        sig: '0x5ae401dc',
        getProvider: {
          ethereum: (client) => {
            return client._providers[1]._jsonRpcProvider
          },
          arbitrum: () => {
            return new ethers.providers.StaticJsonRpcProvider(
              this.isMainnet() ? 'https://rpc.ankr.com/arbitrum' : 'https://rinkeby.arbitrum.io/rpc'
            )
          },
          polygon: () => {
            return new ethers.providers.StaticJsonRpcProvider(
              this.isMainnet() ? 'https://polygon-rpc.com' : 'https://rpc-mumbai.maticvigil.com'
            )
          }
        },
        getDestinationTokenAddress: () => {
          const interface0 = new ethers.utils.Interface(routerV2Abi)
          const decodedMulticall = interface0.parseTransaction({
            data: this.request.args[0].data
          })
          const decodedSwapCall = interface0.parseTransaction({
            data: decodedMulticall.args.data[0]
          })
          const opt1 = decodedSwapCall.args.params?.tokenOut
          const opt2 = decodedSwapCall.args.path?.[decodedSwapCall.args.path?.length - 1]
          const opt3 = decodedSwapCall.args.params?.path?.substring(
            decodedSwapCall.args.params?.path?.length - 40
          )
          if (opt1) return opt1
          if (opt2) return opt2
          if (opt3) return '0x' + opt3
        },
        fetchTokenDetails: async (contractAddress) => {
          const contract = new ethers.Contract(contractAddress, ERC20.abi, await this.getProvider())
          const [decimals, name, symbol] = await Promise.all([
            contract.decimals(),
            contract.name(),
            contract.symbol()
          ])
          return { decimals, name, symbol }
        }
      }
    }
  }

  isMainnet() {
    return this.request.network === 'mainnet'
  }

  isValidMethod() {
    if (!this.request?.method) return
    return this.validMethods[this.request.method]
  }

  isValidFunctionSignature() {
    const data = this.request?.args?.[0]?.data
    if (!data) return
    return data.startsWith(this.config[this.origin].sig)
  }

  async getClient() {
    return store.getters.client({
      network: this.request.network,
      walletId: this.request.walletId,
      asset: this.request.asset,
      accountId: this.request.accountId
    })
  }

  async getProvider() {
    return this.config[this.origin].getProvider[this.chain](await this.getClient())
  }
}
