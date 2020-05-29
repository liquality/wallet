import EventEmitter from 'events'
import { newConnectId, connectToBackground } from './utils'

class Script {
  constructor () {
    this.name = newConnectId()
    this.connection = null

    this.emitter = new EventEmitter()

    this.connection = connectToBackground(this.name)
    this.connection.onMessage.addListener(message => this.onMessage(message))
  }

  onMessage ({ id, type, data }) {
    console.log('onMessage', { id, type, data })

    switch (type) {
      case 'CAL_RESPONSE':
        this.emitter.emit(id, data)
        break

      default:
        console.error(`Received an invalid message type: ${type}`)
    }
  }

  proxy (asset) {
    return method => (...args) => new Promise((resolve, reject) => {
      const id = Date.now() + '.' + Math.random()

      // wait for the result
      this.emitter.once(id, result => {
        if (result.error) reject(new Error(result.error))
        else resolve(result.result)
      })

      this.connection.postMessage({
        id,
        type: 'CAL_REQUEST',
        data: {
          payload: { asset, method, args }
        }
      })
    })
  }
}

export default Script
