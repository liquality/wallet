/* global chrome */
import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, overrideEthereum, bitcoinProvider, nearProvider, terraProvider, paymentUriHandler } from './inject'
import buildConfig from './build.config'
import { ChainNetworks } from './store/utils'
import { chains, isEthereumChain } from '@liquality/cryptoassets'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())
inject(nearProvider())
inject(terraProvider())

function injectEthereum (state, chain) {
  const network = ChainNetworks[chain][state.activeNetwork]
  inject(ethereumProvider({
    chain,
    asset: chains[chain].nativeAsset,
    network
  }))
}

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']

  buildConfig.chains
    .filter(isEthereumChain)
    .forEach(chain => {
      injectEthereum(state, chain)
    })

  if (state.injectEthereum && state.injectEthereumChain) {
    inject(overrideEthereum(state.injectEthereumChain))
  }
})

inject(paymentUriHandler())
