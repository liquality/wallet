/* global chrome */
import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, overrideEthereum, bitcoinProvider, nearProvider, paymentUriHandler, solanaProvider, terraProvider } from './inject'
import buildConfig from './build.config'
import { ChainNetworks } from '@/utils/networks'
import { chains, isEthereumChain } from '@liquality/cryptoassets'
import extension from 'extensionizer'
import PortStream from 'extension-port-stream'
import LocalMessageDuplexStream from 'post-message-stream'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())
inject(nearProvider())
inject(solanaProvider())
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

async function setupStreams () {
  const pageStream = new LocalMessageDuplexStream({
    name: 'station:content',
    target: 'station:inpage'
  })

  const extensionPort = extension.runtime.connect({
    name: 'TerraStationExtension'
  })

  const extensionStream = new PortStream(extensionPort)

  extensionStream.pipe(pageStream)
  pageStream.pipe(extensionStream)
  console.log('Stream setup successfully')
}

function domIsReady () {
  // already loaded
  if (['interactive', 'complete'].includes(document.readyState)) {
    return Promise.resolve()
  }

  // wait for load
  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  )
}

async function start () {
  await setupStreams()
  await domIsReady()
}

start()
