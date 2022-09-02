import { ProviderManager } from './providerManager'
import { addEthereumChain } from './ethereumProvider'
import { addGlobalEthereumProvider } from './globalEthereumProvider'
import { addBitcoinProvider } from './bitcoinProvider'
import { addPaymentUriProvider } from './paymentUri'
import { addTerraProvider } from './terraProvider'
import { addNearProvider } from './nearProvider'
import { addSolanaProvider } from './solanaProvider'

// TODO: refactor providers here to follow a more opiniated format
// class PageProvider {
//   setup() {}
// }
// class BitcoinProvider extends PageProvider {
//   setup(window) {
//     window.bitcoin = {
//       isLiquality: true
//     }
//   }
// }
// const providers = [new BitcoinProvider()]
// providers.forEach((p) => p.setup())

window.providerManager = new ProviderManager()
window.liquality.evmChains.forEach((evmChain) => addEthereumChain(evmChain))
addGlobalEthereumProvider()
addBitcoinProvider()
addNearProvider()
addSolanaProvider()
addTerraProvider()
addPaymentUriProvider()
