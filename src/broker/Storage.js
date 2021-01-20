/* global chrome */
export default {
  async getItem (key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message)
        if (key in result) resolve(result[key])
        else resolve(null)
      })
    })
  },
  async setItem (key, data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message)
        resolve()
      })
    })
  }
}
