import buildConfig from '../../build.config'

const evmChainToRpcProviders = {
  1: `https://eth-mainnet.gateway.pokt.network/v1/lb/${buildConfig.pocketApiKey[1]}`,
  3: `https://eth-ropsten.gateway.pokt.network/v1/lb/${buildConfig.pocketApiKey[3]}`,
  56: `https://bsc-mainnet.gateway.pokt.network/v1/lb/${buildConfig.pocketApiKey[56]}`,
  137: `https://poly-mainnet.gateway.pokt.network/v1/lb/${buildConfig.pocketApiKey[137]}`
}

export { evmChainToRpcProviders }
