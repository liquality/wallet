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
      'AVAX',
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
      'AVAX',
      'SOL',
      'LUNA',
      'UST'
    ]
  },
  infuraApiKey: 'da99ebc8c0964bb8bb757b6f8cc40f1f',
  exploraApis: {
    testnet: 'https://electrs-testnet-api.liq-chainhub.net/',
    mainnet: 'https://electrs-mainnet-api.liq-chainhub.net/'
  },
  batchEsploraApis: {
    testnet: 'https://electrs-batch-testnet-api.liq-chainhub.net/',
    mainnet: 'https://electrs-batch-mainnet-api.liq-chainhub.net/'
  },
  swapProviders: {
    testnet: {
      liquality: {
        name: 'Liquality',
        icon: 'liquality.svg',
        type: SwapProviderType.LIQUALITY,
        agent: process.env.VUE_APP_AGENT_TESTNET_URL || 'https://testnet-dev-agent.liq-chainhub.net'
      },
      liqualityBoostNativeToERC20: {
        name: 'Liquality Boost',
        type: SwapProviderType.LIQUALITYBOOST_NATIVE_TO_ERC20,
        network: 'testnet',
        icon: 'liqualityboost.svg',
        supportedBridgeAssets: ['RBTC', 'MATIC', 'AVAX', 'LUNA', 'UST']
      },
      liqualityBoostERC20toNative: {
        name: 'Liquality Boost',
        type: SwapProviderType.LIQUALITYBOOST_ERC20_TO_NATIVE,
        network: 'testnet',
        icon: 'liqualityboost.svg',
        supportedBridgeAssets: ['RBTC', 'MATIC', 'AVAX', 'LUNA', 'UST']
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
        name: 'Sovryn',
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
        agent: process.env.VUE_APP_AGENT_MAINNET_URL || 'https://mainnet-dev-agent.liq-chainhub.net'
      },
      liqualityBoostNativeToERC20: {
        name: 'Liquality Boost',
        type: SwapProviderType.LIQUALITYBOOST_NATIVE_TO_ERC20,
        network: 'mainnet',
        icon: 'liqualityboost.svg',
        supportedBridgeAssets: ['RBTC', 'MATIC', 'AVAX', 'LUNA', 'UST']
      },
      liqualityBoostERC20toNative: {
        name: 'Liquality Boost',
        type: SwapProviderType.LIQUALITYBOOST_ERC20_TO_NATIVE,
        network: 'mainnet',
        icon: 'liqualityboost.svg',
        supportedBridgeAssets: ['RBTC', 'MATIC', 'AVAX', 'LUNA', 'UST']
      },
      uniswapV2: {
        name: 'Uniswap V2',
        icon: 'uniswap.svg',
        type: SwapProviderType.UNISWAPV2,
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      },
      oneinchV4: {
        name: 'Oneinch V4',
        icon: 'oneinch.svg',
        type: SwapProviderType.ONEINCHV4,
        agent: 'https://api.1inch.exchange/v4.0',
        routerAddress: '0x1111111254fb6c44bac0bed2854e76f90643097d',
        referrerAddress: {
          ethereum: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
          polygon: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
          bsc: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
          avalanche: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5'
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
        name: 'Sovryn',
        icon: 'sovryn.svg',
        type: SwapProviderType.SOVRYN,
        routerAddress: SovrynMainnetAddresses.swapNetwork,
        routerAddressRBTC: SovrynMainnetAddresses.proxy3,
        rpcURL: process.env.VUE_APP_SOVRYN_RPC_URL_MAINNET
      },
      thorchain: {
        name: 'Thorchain',
        icon: 'thorchain.svg',
        type: SwapProviderType.THORCHAIN,
        thornode: 'https://thornode.thorchain.info'
      },
      astroport: {
        name: 'Astroport',
        icon: 'astroport.svg',
        type: SwapProviderType.ASTROPORT,
        URL: 'https://lcd.terra.dev',
        chainID: 'columbus-5'
      }
    }
  },
  discordUrl: 'https://discord.gg/Xsqw7PW8wk',
  networks: ['mainnet', 'testnet'],
  chains: [
    'bitcoin',
    'ethereum',
    'rsk',
    'bsc',
    'near',
    'polygon',
    'arbitrum',
    'terra',
    'fuse',
    'avalanche'
  ],
  supportedBridgeAssets: ['MATIC', 'RBTC', 'AVAX']
}
