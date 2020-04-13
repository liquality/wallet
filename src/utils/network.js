function getHostname () {
  try {
    return window.location.hostname
  } catch (e) {
    return self.location.hostname
  }
}

const hostname = getHostname()

export const isTestnet = false // hostname.includes('testnet') || hostname === 'localhost'

export const network = isTestnet ? 'testnet' : 'mainnet'
