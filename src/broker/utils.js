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

export const connectToBackground = name => browser.runtime.connect({ name })

export const handleConnection = callback => browser.runtime.onConnect.addListener(callback)

export const newConnectId = () => `##${Math.random().toString(36).substring(2)}##`

export const checkConnectId = id => /^##[0-9a-zA-Z]+##/.test(id)

export const removeConnectId = id => id.replace(/^##[0-9a-zA-Z]+##/, '')
