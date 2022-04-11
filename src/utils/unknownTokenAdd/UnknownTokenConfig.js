import { ethers } from 'ethers'
import ERC20 from '@uniswap/v2-core/build/ERC20.json'
import routerV2Abi from './routerV2Abi.json'
import AggregationRouterV4 from './AggregationRouterV4.json'
import store from '../../store'
import { assets } from '@liquality/cryptoassets'

export class UnknownTokenConfig {
  UNISWAP = 'uniswap'
  ONEINCH = '1inch'
  request
  validOrigins = {
    'https://app.uniswap.org': this.UNISWAP,
    'https://app.1inch.io': this.ONEINCH
  }
  validMethods = {
    'chain.sendTransaction': true
  }
  chain
  origin
  config
  mainnetRpcURLs = {
    arbitrum: 'https://rpc.ankr.com/arbitrum',
    polygon: 'https://polygon-rpc.com',
    bsc: 'https://bsc-dataseed.binance.org'
  }
  constructor(request) {
    if (this.constructor === UnknownTokenConfig) {
      throw new TypeError('Abstract class "UnknownAssetConfig" cannot be instantiated directly.')
    }
    this.request = request
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
              this.isMainnet() ? this.mainnetRpcURLs.arbitrum : 'https://rinkeby.arbitrum.io/rpc'
            )
          },
          polygon: () => {
            return new ethers.providers.StaticJsonRpcProvider(
              this.isMainnet() ? this.mainnetRpcURLs.polygon : 'https://rpc-mumbai.maticvigil.com'
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
          return this.fetchTokenDetailsEVM(contractAddress)
        }
      },
      [this.ONEINCH]: {
        sig: '0x7c0252',
        getProvider: {
          ethereum: (client) => {
            return client._providers[1]._jsonRpcProvider
          },
          arbitrum: () => {
            return new ethers.providers.StaticJsonRpcProvider(this.mainnetRpcURLs.arbitrum)
          },
          polygon: () => {
            return new ethers.providers.StaticJsonRpcProvider(this.mainnetRpcURLs.polygon)
          },
          bsc: () => {
            return new ethers.providers.StaticJsonRpcProvider(this.mainnetRpcURLs.bsc)
          }
        },
        getDestinationTokenAddress: () => {
          const interface0 = new ethers.utils.Interface(AggregationRouterV4)
          const decodedSwapCall = interface0.parseTransaction({
            data: this.request.args[0].data
          })
          return decodedSwapCall.args?.[1]?.dstToken
        },
        fetchTokenDetails: async (contractAddress) => {
          return this.fetchTokenDetailsEVM(contractAddress)
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
    return this.config[this.origin].sig
  }

  async fetchTokenDetailsEVM(contractAddress) {
    const contract = new ethers.Contract(contractAddress, ERC20.abi, await this.getProvider())
    const [decimals, name, symbol] = await Promise.all([
      contract.decimals(),
      contract.name(),
      contract.symbol()
    ])
    return { decimals, name, symbol }
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
