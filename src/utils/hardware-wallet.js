// import { LedgerDeviceConnectionError } from '@liquality/error-parser'

export const LEDGER_USB_VENDOR_ID = '0x2c97'

export const ledgerConnectMixin = {
  data() {
    return {
      ledgerConnected: false
    }
  },
  methods: {
    async connectLedger() {
      if (!this.ledgerConnected) {
        if ('hid' in navigator) {
          let alreadyAssignedDevices = await navigator.hid.getDevices()
          const alreadyAssignedDevice = alreadyAssignedDevices.filter(
            (d) => d.vendorId === Number(LEDGER_USB_VENDOR_ID)
          )
          if (alreadyAssignedDevice.length > 0) {
            this.ledgerConnected = true
          } else {
            const [device] = await navigator.hid.requestDevice({
              filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
            })
            this.ledgerConnected = !!device
          }
        }
      }
    }
  }
}
