import { PageProvider } from './pageProvider'

class PagementURIPageProvivder extends PageProvider {
  setup() {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        document.body.addEventListener('click', async (e) => {
          const element = e.target
          if (!element || !element.closest) return
          const uri =
            element.closest('[href^="bitcoin:"]') || element.closest('[href^="ethereum:"]')
          if (uri) {
            const href = uri.getAttribute('href')
            const includesAmount = href.includes('value=') || href.includes('amount=')
            if (includesAmount) {
              e.preventDefault()
              await this.window.providerManager.enable('near')
              this.window.providerManager.proxy('HANDLE_PAYMENT_URI', { uri: href })
            }
          }
        })
      },
      { once: true }
    )
  }
}

export { PagementURIPageProvivder }
