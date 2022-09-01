import { inject } from './broker/utils'
import Script from './broker/Script'
import { buildConfig } from '@liquality/wallet-core'
import { ChainNetworks } from '@liquality/wallet-core/dist/src/utils/networks'
import { chains, isEthereumChain } from '@liquality/cryptoassets'
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

function injectProviders(state) {
  const evmChains = buildConfig.chains.filter(isEthereumChain).map((chain) => {
    const network = ChainNetworks[chain][state.activeNetwork]
    const asset = chains[chain].nativeAsset
    return { chain, asset, network }
  })

  let globalEthereum = {
    inject: !!state.injectEthereumChain
  }
  if (globalEthereum.inject) {
    globalEthereum = {
      ...globalEthereum,
      ...injectGlobalEthereum(state, true)
    }
  }

  const injectConfig = {
    evmChains,
    globalEthereum
  }

  setupTerraStreams()

  inject(`window.liquality = ${JSON.stringify(injectConfig)};`)
  inject('#PAGEPROVIDER#')
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

  return { override, ethereumChain }
}

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']
  injectProviders(state)
})
