import { version } from '../../package.json'

export const getWalletStateLogs = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['liquality-wallet'], (storage) => {
      const state = storage['liquality-wallet']

      // Remove key related properties
      delete state.encryptedWallets
      delete state.keySalt

      // TODO: Add more data such as recent errors
      const metadata = { version }

      const logs = { state, metadata }
      resolve(JSON.stringify(logs, null, 2))
    })
  })
}

export const downloadFile = ({ filename, type, content }) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  link.click()
  link.remove()
}
