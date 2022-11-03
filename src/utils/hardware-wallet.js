import { LedgerDeviceConnectionError } from '@liquality/error-parser'

export const LEDGER_USB_VENDOR_ID = '0x2c97'

export async function tryConnectLedgerDevice() {
  const connectedDevices = await window.navigator.hid.requestDevice({
    filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
  })
  const userApprovedWebHidConnection = connectedDevices.some(
    (device) => device.vendorId === Number(LEDGER_USB_VENDOR_ID)
  )
  return !!userApprovedWebHidConnection
}

export const ledgerConnectMixin = {
  data() {
    return {
      ledgerConnected: false
    }
  },
  methods: {
    async connectLedger() {
      if (!this.ledgerConnected) {
        const connected = await tryConnectLedgerDevice()

        if (!connected) {
          throw new LedgerDeviceConnectionError()
        }
        this.ledgerConnected = connected
      }
    }
  }
}
