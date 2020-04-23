/* global chrome */

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'dist/index.html' })
})
