import { isAppOrExtension } from './network'

const isLocal = process.env.NODE_ENV !== 'production'

const corsPrefix = 'https://cors-anywhere.herokuapp.com'

const getCommonAgents = isTestnet => [
  `/swap${isTestnet ? '-testnet' : ''}-dev/agent/api/swap`,
  `/swap${isTestnet ? '-testnet' : ''}/agent/api/swap`
]

const getOtherAgents = isTestnet => isTestnet
  ? []
  : [
    '/swap/btc/api/swap',
    '/swap/eth/api/swap'
  ]

export default isTestnet => {
  const agents = getCommonAgents(isTestnet).concat(getOtherAgents(isTestnet))

  if (isLocal) {
    return agents.map(agent => `http://localhost:8010/proxy${agent}`)
  }

  if (isAppOrExtension) {
    return agents.map(agent => `${corsPrefix}${agent}`)
  }

  return agents.map(agent => `/api${agent}`)
}
