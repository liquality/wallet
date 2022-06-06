export const LEDGER_USB_VENDOR_ID = '0x2c97'

export async function connectLedgerDevice() {
  const connectedDevices = await window.navigator.hid.requestDevice({
    filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
  })
  const userApprovedWebHidConnection = connectedDevices.some(
    (device) => device.vendorId === Number(LEDGER_USB_VENDOR_ID)
  )
  return !!userApprovedWebHidConnection
}
