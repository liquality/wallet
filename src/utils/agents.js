const isProd = process.env.NODE_ENV !== 'production'

export default [
  `${isProd ? 'http://localhost:8010/proxy' : '/api'}/swap-testnet-dev/agent/api/swap`,
  `${isProd ? 'http://localhost:8010/proxy' : '/api'}/swap-testnet/agent/api/swap`
]
