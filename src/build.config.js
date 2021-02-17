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
      'RBTC'
    ],
    testnet: [
      'BTC',
      'ETH',
      'DAI',
      'RBTC'
    ]
  },
  agentEndpoints: {
    testnet: ['https://liquality.io/swap-testnet-dev/agent'],
    mainnet: ['https://liquality.io/swap/agent']
  },
  telegramUrl: 'https://t.me/liquality'
}
