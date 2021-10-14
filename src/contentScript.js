/* global chrome */
import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, overrideEthereum, bitcoinProvider, nearProvider, paymentUriHandler, solanaProvider } from './inject'
import buildConfig from './build.config'
import { ChainNetworks } from '@/utils/networks'
import { chains, isEthereumChain } from '@liquality/cryptoassets'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())
inject(nearProvider())
inject(solanaProvider())

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
    const { externalConnections, activeWalletId } = state
    const ethereumChain = Object.keys(externalConnections[activeWalletId]?.[origin] || {})[0] || state.injectEthereumChain
    inject(overrideEthereum(ethereumChain))
  }
})

inject(paymentUriHandler())
