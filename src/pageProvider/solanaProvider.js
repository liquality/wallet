import { PageProvider } from './pageProvider'
// import { PhantomWallet } from './solana/PhantomInjection';
import { COMMON_REQUEST_MAP } from './utils'

import { initialize } from '@liquality/solana-wallet-standard'
import { LiqualitySolanaWallet } from '@liquality/solana-wallet-injection'

class SolanaPageProvider extends PageProvider {
  async handleRequest(req) {
    const solana = this.window.providerManager.getProviderFor('SOL')
    const method = COMMON_REQUEST_MAP[req.method] || req.method
    return solana.getMethod(method)(...req.params)
  }
  setup() {
    // Create a reference to your wallet's existing API.
    const liqualityWallet = new LiqualitySolanaWallet(this.window)

    // Register your wallet using the Wallet Standard, passing the reference.
    initialize(liqualityWallet)

    // Attach the reference to the window, guarding against errors.
    try {
      Object.defineProperty(window, 'liquality', { value: liqualityWallet })
    } catch (error) {
      console.error(error)
    }
  }
}

export { SolanaPageProvider }
