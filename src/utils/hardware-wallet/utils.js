import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import { Debug } from '@liquality/debug'
import { WalletError } from '@liquality/errors'
const debug = Debug('ledger-transport')

let transport = null
let onDisconnectCallbacks = []
export const LEDGER_USB_VENDOR_ID = '0x2c97'

export const createLedgerTransport = async (onDisconnect) => {
  if (!transport || !transport?.device?.opened) {
    transport = await TransportWebHID.create()
    transport.on('disconnect', () => {
      onDisconnectCallbacks.forEach((cb) => {
        console.log('on disconnect')
        cb()
      })
      transport.close()
      transport = null
    })
  }

  if (onDisconnect) {
    onDisconnectCallbacks.push(onDisconnect)
  }
  return transport
}

export const openLedgerApp = async (_transport, name) => {
  await _transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'))
}

export const getAppName = (app) => {
  console.log('get appName', app)
  return {
    Btc: 'Bitcoin',
    Eth: 'Ethereum'
  }[app]
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
  },
  async getApp() {
    try {
      await this.createTransport()
    } catch (e) {
      // eslint-disable-next-line no-unused-vars
      const { name, ...errorNoName } = e
      throw new WalletError(e.toString(), errorNoName)
    }
    if (!this._appInstance) {
      // // eslint-disable-next-line no-unused-vars
      // const appName = getAppName(this._App.name)
      // if (appName) {
      //   await openLedgerApp(this._transport, appName)
      // }
      this._appInstance = new Proxy(new this._App(this._transport), {
        get: this.errorProxy.bind(this)
      })
    }
    return this._appInstance
  }
}

export async function connectLedgerDevice() {
  const connectedDevices = await window.navigator.hid.requestDevice({
    filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
  })
  const userApprovedWebHidConnection = connectedDevices.some(
    (device) => device.vendorId === Number(LEDGER_USB_VENDOR_ID)
  )
  return !!userApprovedWebHidConnection
}
