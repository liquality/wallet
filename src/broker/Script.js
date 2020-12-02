/* global CustomEvent */

import EventEmitter from 'events'
import { connectToBackground } from './utils'

class Script {
  constructor () {
    this.emitter = new EventEmitter()
    this.background = connectToBackground()
    this.background.onMessage.addListener(message => this.onMessage(message))
  }

  start () {
    window.addEventListener('message', event => {
      if (event.source !== window) return
      if (!event.data) return

      const { id, type, data } = event.data
      if (!id || !type) return

      this.emitter.once(id, result => window.dispatchEvent(new CustomEvent(id, { detail: JSON.stringify(result) })))

      this.background.postMessage({
        id,
        type,
        data
      })
    }, false)
  }

  onMessage ({ id, data }) {
    this.emitter.emit(id, data)
  }
}

export default Script
