import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider } from './inject'

;(new Script()).start()

inject(providerManager)

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']
  if (state.injectEthereum) inject(ethereumProvider)
})
