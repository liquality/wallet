import { inject } from './broker/utils'
import Script from './broker/Script'
import {
  providerManager,
  ethereumProvider,
  globalEthereumProvider,
  bitcoinProvider,
  nearProvider,
  paymentUriHandler,
  solanaProvider,
  terraProvider
} from './inject'
import { buildConfig } from '@liquality/wallet-core'
import { ChainNetworks } from '@liquality/wallet-core/dist/src/utils/networks'
import { getNativeAssetCode, isEvmChain } from '@liquality/cryptoassets'
import PortStream from 'extension-port-stream'
import LocalMessageDuplexStream from 'post-message-stream'
new Script().start()

async function setupTerraStreams() {
  const pageStream = new LocalMessageDuplexStream({
    name: 'station:content',
    target: 'station:inpage'
  })

  const extensionPort = browser.extension.connect({
    name: 'TerraStationExtension'
  })

  const extensionStream = new PortStream(extensionPort)

  extensionStream.pipe(pageStream)
  pageStream.pipe(extensionStream)
  console.log('Stream setup successfully')
}

function injectEthereum(state, chain) {
  const { activeNetwork } = state
  const nativeAssetCode = getNativeAssetCode(activeNetwork, chain)

  const network = ChainNetworks[chain][activeNetwork]
  inject(
    ethereumProvider({
      chain,
      asset: nativeAssetCode,
      network
    })
  )
}

function injectProviders(state) {
  const { activeNetwork } = state

  inject(providerManager())
  inject(bitcoinProvider())
  inject(nearProvider())
  inject(solanaProvider())

  setupTerraStreams()
  inject(terraProvider())

  buildConfig.chains
    .filter((chainId) => isEvmChain(activeNetwork, chainId))
    .forEach((chain) => {
      injectEthereum(state, chain)
    })

  inject(paymentUriHandler())
}

function injectGlobalEthereum(state, override) {
  const { externalConnections, activeWalletId, activeNetwork } = state

  let ethereumChain = state.injectEthereumChain
  const defaultAccountId = (externalConnections[activeWalletId]?.[origin] || {}).defaultEthereum

  if (defaultAccountId) {
    const defaultAccount = state.accounts[activeWalletId][activeNetwork].find(
      (account) => account.id === defaultAccountId
    )
    if (defaultAccount) {
      const selectedEthereumChain = defaultAccount.chain
      ethereumChain = selectedEthereumChain
    }
  }

  inject(globalEthereumProvider(ethereumChain, override))
}

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']
  injectProviders(state)

  if (state.injectEthereumChain) {
    const override = Boolean(state.injectEthereum)
    injectGlobalEthereum(state, override)
  }
})
