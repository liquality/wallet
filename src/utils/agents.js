import { isTestnet } from './network'

const endpoint = 'https://liquality.io'

export default [
  `${endpoint}/swap${isTestnet ? '-testnet' : ''}-dev/agent/api/swap`,
  `${endpoint}/swap${isTestnet ? '-testnet' : ''}/agent/api/swap`
]
