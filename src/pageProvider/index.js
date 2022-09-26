import { ProviderManager } from './providerManager'
import { EthereumPageProvider } from './ethereumProvider'
import { GlobalEthereumPageProvider } from './globalEthereumProvider'
import { BitcoinPageProvider } from './bitcoinProvider'
import { PagementURIPageProvivder } from './paymentUri'
import { TerraPageProvider } from './terraProvider'
import { NearPageProvider } from './nearProvider'
import { SolanaPageProvider } from './solanaProvider'

const { override, ethereumChain } = window.liquality.globalEthereum

const ethereumProviders = window.liquality.evmChains.map(
  (evmChain) => new EthereumPageProvider(window, evmChain.chain, evmChain.asset, evmChain.network)
)

const providers = [
  new ProviderManager(window),
  ...ethereumProviders,
  new GlobalEthereumPageProvider(window, override, ethereumChain),
  new BitcoinPageProvider(window),
  new NearPageProvider(window),
  new SolanaPageProvider(window),
  new TerraPageProvider(window),
  new PagementURIPageProvivder(window)
]

providers.forEach((p) => p.setup())
