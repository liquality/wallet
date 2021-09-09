/* global chrome */
import { inject } from './broker/utils'
import Script from './broker/Script'
import { providerManager, ethereumProvider, overrideEthereum, bitcoinProvider, nearProvider, terraProvider, paymentUriHandler } from './inject'
import buildConfig from './build.config'
import { ChainNetworks } from './store/utils'
import { chains, isEthereumChain } from '@liquality/cryptoassets'
import extension from 'extensionizer'
import PortStream from 'extension-port-stream'
import LocalMessageDuplexStream from 'post-message-stream'

;(new Script()).start()

inject(providerManager())
inject(bitcoinProvider())
inject(nearProvider())
// inject(terraProvider())

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



if (shouldInjectProvider()) {
  injectScript()
  start()
}

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript() {
  try {
    const container = document.head || document.documentElement
    const scriptTag = document.createElement('script')
    scriptTag.setAttribute('async', 'false')
    scriptTag.setAttribute('src', extension.runtime.getURL('inpage.js'))
    console.log('script tag', scriptTag.attributes)
    console.log('container', container.children[0].attributes)
    container.insertBefore(scriptTag, container.children[0])
    container.removeChild(scriptTag)
  } catch (e) {
    console.error('MsgDemo provider injection failed.', e)
  }
}

/**
 * Sets up the stream communication and submits site metadata
 *
 */
async function start() {
  await setupStreams()
  await domIsReady()
}

/**
 * Determines if the provider should be injected
 *
 * @returns {boolean} {@code true} - if the provider should be injected
 */
function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck()
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} - if the doctype is html or if none exists
 */
function doctypeCheck() {
  const { doctype } = window.document
  if (doctype) {
    return doctype.name === 'html'
  }
  return true
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * @returns {boolean} - whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/, /\.pdf$/]
  const currentUrl = window.location.pathname
  for (let i = 0;i < prohibitedTypes.length;i += 1) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false
    }
  }
  return true
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} - if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName
  if (documentElement) {
    return documentElement.toLowerCase() === 'html'
  }
  return true
}

/**
 * Sets up two-way communication streams between the
 * browser extension and local per-page browser context.
 */
async function setupStreams() {
  const pageStream = new LocalMessageDuplexStream({
    name: 'station:content',
    target: 'station:inpage',
  })

  const extensionPort = extension.runtime.connect({
    name: 'TerraStationExtension',
  })

  const extensionStream = new PortStream(extensionPort)

  extensionStream.pipe(pageStream)
  pageStream.pipe(extensionStream)
  console.log('success')
}

/**
 * Returns a promise that resolves when the DOM is loaded (does not wait for images to load)
 */
function domIsReady() {
  // already loaded
  if (['interactive', 'complete'].includes(document.readyState)) {
    return Promise.resolve()
  }

  // wait for load
  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  )
}
