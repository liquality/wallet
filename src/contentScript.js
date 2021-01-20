/* global chrome */
import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, bitcoinProvider } from './inject'
import { AssetNetworks } from './store/factory/client'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']
  if (state.injectEthereum) {
    const asset = state.injectEthereumAsset
    const network = AssetNetworks[asset][state.activeNetwork]
    inject(ethereumProvider({
      asset: state.injectEthereumAsset,
      networkVersion: network.networkId,
      chainId: `0x${network.chainId.toString(16)}`
    }))
  }
})
