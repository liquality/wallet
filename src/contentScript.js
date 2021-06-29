/* global chrome */
import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, bitcoinProvider, nearProvider, paymentUriHandler } from './inject'
import { AssetNetworks } from './store/utils'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())
inject(nearProvider())

function injectEthereum (state, asset, name) {
  const network = AssetNetworks[asset][state.activeNetwork]
  inject(ethereumProvider({
    name,
    asset,
    network,
    overrideEthereum: state.injectEthereum && asset === state.injectEthereumAsset
  }))
}

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']
  injectEthereum(state, 'ETH', 'eth')
  injectEthereum(state, 'RBTC', 'rsk')
  injectEthereum(state, 'BNB', 'bsc')
  injectEthereum(state, 'POLYGON', 'polygon')
  injectEthereum(state, 'ARBETH', 'arbitrum')
})

inject(paymentUriHandler())
