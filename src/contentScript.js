import { inject } from './broker/utils'
import Script from './broker/Script'
import { buildConfig } from '@liquality/wallet-core'
import { getChain, getNativeAssetCode, isEvmChain } from '@liquality/cryptoassets'
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
}

function injectProviders(state) {
  const { injectEthereum, activeNetwork } = state
  const evmChains = buildConfig.chains
    .filter((chain) => isEvmChain(activeNetwork, chain))
    .map((chain) => {
      const network = getChain(activeNetwork, chain).network
      const asset = getNativeAssetCode(activeNetwork, chain)
      return { chain, asset, network }
    })

  const globalEthereum = {
    override: injectEthereum,
    ethereumChain: getGlobalEthereumChain(state)
  }

  const injectConfig = {
    evmChains,
    globalEthereum
  }

  setupTerraStreams()

  inject(`window.liquality = ${JSON.stringify(injectConfig)};`)
  inject('#PAGEPROVIDER#')
}

function getGlobalEthereumChain(state) {
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

  return ethereumChain
}

chrome.storage.local.get(['liquality-wallet'], (storage) => {
  const state = storage['liquality-wallet']
  injectProviders(state)
})
