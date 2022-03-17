import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import { Debug } from '@liquality/debug'
const debug = Debug('ledger-transport')

let transport = null
let onDisconnectCallbacks = []

export const createLedgerTransport = async (onDisconnect) => {
  if (!transport) {
    transport = await TransportWebHID.create()
    transport.on('disconnect', () => {
      onDisconnectCallbacks.forEach((cb) => {
        console.log('on disconnect')
        cb()
      })
      transport.close()
    })
  }

  if (onDisconnect) {
    onDisconnectCallbacks.push(onDisconnect)
  }
  return transport
}

export const openLedgerApp = async (name) => {
  if (transport) {
    await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'))
  }
}

export const createTransportMixin = {
  async createTransport() {
    if (!this._transport) {
      debug('creating ledger transport')
      this._transport = await createLedgerTransport(() => {
        debug('ledger disconnected')
        this._appInstance = null
        this._transport = null
      })
      debug('ledger transport created')
    }
  }
}
