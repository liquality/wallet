/* global chrome */
import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, bitcoinProvider, nearProvider, paymentUriHandler } from './inject'
import buildConfig from './build.config'
import { ChainNetworks } from './store/utils'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())
inject(nearProvider())

function injectEthereum (state, chain) {
  const name = chain === 'ethereum' ? 'eth' : chain
  const network = ChainNetworks[chain][state.activeNetwork]
  inject(ethereumProvider({
    name,
    chain,
    network,
    overrideEthereum: state.injectEthereum && chain === state.injectEthereumChain
  }))
}

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']

  buildConfig.chains.forEach(chain => {
    injectEthereum(state, chain)
  })
})

inject(paymentUriHandler())
