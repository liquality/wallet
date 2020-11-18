import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, bitcoinProvider } from './inject'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']
  if (state.injectEthereum) {
    inject(ethereumProvider({
      networkVersion: state.activeNetwork === 'mainnet' ? '1' : '4', // TODO: pull from network object + consider asset (i.e. other eth based chains)
      chainId: state.activeNetwork === 'mainnet' ? '0x1' : '0x4'
    }))
  }
})
