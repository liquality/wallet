import {
  BRIDGE_IFRAME_NAME
} from './config'

export const setupBridgeIframe = (bridgeUrl) => {
  if (!document.getElementById(BRIDGE_IFRAME_NAME)) {
    const frame = document.createElement('iframe')
    frame.src = bridgeUrl
    frame.setAttribute('name', BRIDGE_IFRAME_NAME)
    frame.setAttribute('id', BRIDGE_IFRAME_NAME)
    const head = document.head || document.getElementsByTagName('head')[0]
    head.appendChild(frame)
  }
}
