import buildConfig from '../build.config'
import * as swaps from '../swaps'

export const SwapProtocol = {
  LIQUALITY: 'LIQUALITY',
  UNISWAPV2: 'UNISWAPV2'
}

export const PROTOCOL_TYPE_MAP = {
  [SwapProtocol.LIQUALITY]: swaps.liquality,
  [SwapProtocol.UNISWAPV2]: swaps.uniswap
}

function getSwapProtocolByType (type) {
  return PROTOCOL_TYPE_MAP[type]
}

function getSwapProtocolConfig (network, protocolId) {
  return buildConfig.swapProtocols[network][protocolId]
}

function getSwapProtocol (network, protocolId) {
  const protocolType = getSwapProtocolConfig(network, protocolId).type
  return getSwapProtocolByType(protocolType)
}

export { getSwapProtocolByType, getSwapProtocolConfig, getSwapProtocol }
