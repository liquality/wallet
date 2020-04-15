import { isTestnet, isAppOrExtension } from './network'

const isProd = process.env.NODE_ENV !== 'production'

const cors = 'https://cors-anywhere.herokuapp.com/https://liquality.io'

export default [
  `${isProd ? 'http://localhost:8010/proxy' : (isAppOrExtension ? cors : '/api')}/swap${isTestnet ? '-testnet' : ''}-dev/agent/api/swap`,
  `${isProd ? 'http://localhost:8010/proxy' : (isAppOrExtension ? cors : '/api')}/swap${isTestnet ? '-testnet' : ''}/agent/api/swap`
]
