import { SwapProviderType } from './utils/swaps'

import SovrynMainnetAddresses from '@blobfishkate/sovryncontracts/contracts-mainnet.json'
import SovrynTestnetAddresses from '@blobfishkate/sovryncontracts/contracts-testnet.json'

export default {
  defaultAssets: {
    mainnet: [
      'BTC',
      'ETH',
      'DAI',
      'USDC',
      'USDT',
      'WBTC',
      'UNI',
      'RBTC',
      'SOV',
      'BNB',
      'NEAR',
      'MATIC',
      'PWETH',
      'ARBETH',
      'FISH',
      'LUNA',
      'UST'
    ],
    testnet: [
      'BTC',
      'ETH',
      'DAI',
      'RBTC',
      'BNB',
      'NEAR',
      'SOV',
      'MATIC',
      'PWETH',
      'ARBETH',
      'SOL',
      'LUNA',
      'UST'
    ]
  },
  infuraApiKey: 'da99ebc8c0964bb8bb757b6f8cc40f1f',
  exploraApis: {
    testnet: 'https://liquality.io/testnet/electrs',
    mainnet: 'https://api-mainnet-bitcoin-electrs.liquality.io'
  },
  batchEsploraApis: {
    testnet: 'https://liquality.io/electrs-testnet-batch',
    mainnet: 'https://api-mainnet-bitcoin-electrs-batch.liquality.io'
  },
  swapProviders: {
    testnet: {
      liquality: {
        name: 'Liquality',
        icon: 'liquality.svg',
        type: SwapProviderType.LIQUALITY,
        agent: process.env.VUE_APP_AGENT_TESTNET_URL || 'https://liquality.io/swap-testnet-dev/agent'
      },
      liqualityBoost: {
        name: 'Liquality Boost',
        type: SwapProviderType.LIQUALITYBOOST,
        network: 'testnet',
        icon: 'liqualityboost.svg',
        supportedBridgeAssets: ['RBTC']
      },
      uniswapV2: {
        name: 'Uniswap V2',
        icon: 'uniswap.svg',
        type: SwapProviderType.UNISWAPV2,
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      },
      thorchain: {
        name: 'Thorchain',
        icon: 'thorchain.svg',
        type: SwapProviderType.THORCHAIN,
        thornode: 'https://testnet.thornode.thorchain.info'
      },
      sovryn: {
        name: 'Sovyrn',
        icon: 'sovryn.svg',
        type: SwapProviderType.SOVRYN,
        routerAddress: SovrynTestnetAddresses.swapNetwork,
        routerAddressRBTC: SovrynTestnetAddresses.proxy3,
        rpcURL: process.env.VUE_APP_SOVRYN_RPC_URL_TESTNET
      }
    },
    mainnet: {
      liquality: {
        name: 'Liquality',
        icon: 'liquality.svg',
        type: SwapProviderType.LIQUALITY,
        agent: 'https://liquality.io/swap-dev/agent'
      },
      liqualityBoost: {
        name: 'Liquality Boost',
        type: SwapProviderType.LIQUALITYBOOST,
        network: 'mainnet',
        icon: 'liqualityboost.svg',
        supportedBridgeAssets: ['MATIC', 'RBTC']
      },
      uniswapV2: {
        name: 'Uniswap V2',
        icon: 'uniswap.svg',
        type: SwapProviderType.UNISWAPV2,
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      },
      oneinchV3: {
        name: 'Oneinch V3',
        icon: 'oneinch.svg',
        type: SwapProviderType.ONEINCHV3,
        agent: 'https://api.1inch.exchange/v3.0',
        routerAddress: '0x11111112542d85b3ef69ae05771c2dccff4faa26',
        referrerAddress: {
          ethereum: '0xaf2C465dC79DeDf7305CDe782439171D147Abac7',
          polygon: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
          bsc: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5'
        },
        referrerFee: 0.3
      },
      fastBTC: {
        name: 'FastBTC',
        icon: 'sovryn.svg',
        type: SwapProviderType.FASTBTC,
        bridgeEndpoint: 'http://3.131.33.161:3000/'
      },
      sovryn: {
        name: 'Sovyrn',
        icon: 'sovryn.svg',
        type: SwapProviderType.SOVRYN,
        routerAddress: SovrynMainnetAddresses.swapNetwork,
        routerAddressRBTC: SovrynMainnetAddresses.proxy3,
        rpcURL: process.env.VUE_APP_SOVRYN_RPC_URL_MAINNET
      }
    }
  },
  discordUrl: 'https://discord.gg/Xsqw7PW8wk',
  networks: ['mainnet', 'testnet'],
  chains: ['bitcoin', 'ethereum', 'rsk', 'bsc', 'near', 'polygon', 'arbitrum', 'terra'],
  supportedBridgeAssets: ['MATIC', 'RBTC']
}
