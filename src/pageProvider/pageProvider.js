class PageProvider {
  window
  constructor(window) {
    this.window = window
  }
  setup() {
    throw new Error('not implemented')
  }
}

export { PageProvider }
