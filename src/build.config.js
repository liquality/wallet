import { SwapProviderType } from './utils/swaps'

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
      'PWETH'
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
      'PWETH'
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
        type: SwapProviderType.LIQUALITY,
        agent: process.env.VUE_APP_AGENT_TESTNET_URL || 'https://liquality.io/swap-testnet/agent'
      },
      uniswapV2: {
        name: 'Uniswap V2',
        type: SwapProviderType.UNISWAPV2,
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      }
    },
    mainnet: {
      liquality: {
        name: 'Liquality',
        type: SwapProviderType.LIQUALITY,
        agent: 'https://liquality.io/swap/agent'
      },
      uniswapV2: {
        name: 'Uniswap V2',
        type: SwapProviderType.UNISWAPV2,
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      }
    }
  },
  discordUrl: 'https://discord.gg/Xsqw7PW8wk',
  networks: ['mainnet', 'testnet'],
  chains: ['bitcoin', 'ethereum', 'rsk', 'bsc', 'near', 'polygon']
}
