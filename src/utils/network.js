function getHostname () {
  try {
    return window.location.hostname
  } catch (e) {
    return self.location.hostname
  }
}

function getProtocol () {
  try {
    return window.location.protocol
  } catch (e) {
    return self.location.protocol
  }
}

export const hostname = getHostname()

export const isApp = getProtocol().includes('file')

export const isExtension = getProtocol().includes('chrome')

export const isAppOrExtension = isExtension || isApp
