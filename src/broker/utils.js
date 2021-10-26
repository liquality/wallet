/* global browser */
let isBgScr

export const BG_PREFIX = '##BACKGROUND##'

export const isBackgroundScript = context => {
  if (isBgScr !== undefined) return isBgScr

  try {
    isBgScr = context === browser.extension.getBackgroundPage()
  } catch (e) {
    isBgScr = false
  }

  return isBgScr
}

export const getAppId = () => browser.runtime.id

export const getRootURL = () => browser.runtime.getURL('/')

export const createPopup = (url, closeCallback = undefined) => {
  const options = {
    url: `./index.html#${url}`,
    type: 'popup',
    height: 620,
    width: 360
  }

  if (!getRootURL().startsWith('moz-')) {
    options.focused = true
  }

  const creation = browser.windows.create(options)
  if (closeCallback) {
    creation.then(popupWindow => chrome.windows.onRemoved.addListener(windowId => {
      if (windowId === popupWindow.id) closeCallback()
    }))
  }
}

export const connectToBackground = name => browser.runtime.connect({ name })

export const handleConnection = callback => browser.runtime.onConnect.addListener(callback)

export const newConnectId = () => `##${Math.random().toString(36).substring(2)}##`

export const checkConnectId = id => /^##[0-9a-zA-Z]+##/.test(id)

export const removeConnectId = id => id.replace(/^##[0-9a-zA-Z]+##/, '')

export const inject = content => {
  const container = document.head || document.documentElement
  const scriptTag = document.createElement('script')
  scriptTag.setAttribute('async', 'false')
  scriptTag.textContent = `(() => {${content}})()`
  container.insertBefore(scriptTag, container.children[0])
}
