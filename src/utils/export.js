import { version } from '../../package.json'

/* global chrome */
export const downloadFile = ({ filename, type, content }) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  link.click()
  link.remove()
}

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

export const getCSVContent = (data, headers) => {
  if (!data == null || !data.length) {
    return null
  }

  const columnDelimiter = ','
  const lineDelimiter = '\n'

  let result = `${headers.map(h => (h.label)).join(columnDelimiter)}${lineDelimiter}`

  data.forEach((item) => {
    let ctr = 0
    headers.forEach((header) => {
      if (ctr > 0) result += columnDelimiter

      result += item[header.key]
      ctr++
    })
    result += lineDelimiter
  })

  return result
}
