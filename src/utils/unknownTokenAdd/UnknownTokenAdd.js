import { UnknownTokenConfig } from './UnknownTokenConfig'

export class UnknownTokenAdd extends UnknownTokenConfig {
  addCustomToken
  enableAssets

  constructor(request, addCustomToken, enableAssets) {
    super(request)
    this.addCustomToken = addCustomToken
    this.enableAssets = enableAssets
  }

  getDestinationTokenAddress() {
    return this.config[this.origin].getDestinationTokenAddress()
  }

  async fetchTokenDetails(contractAddress) {
    return await this.config[this.origin].fetchTokenDetails(contractAddress)
  }

  async addToken() {
    console.log('addToken() start')
    if (!this.origin || !this.isValidMethod() || !this.isValidFunctionSignature()) {
      return
    }
    console.log('after !this.origin || !this.isValidMethod() || !this.isValidFunctionSignature()')
    const destinationTokenAddress = this.getDestinationTokenAddress()
    console.log('after this.getDestinationTokenAddress()')
    if (!destinationTokenAddress) {
      return
    }
    console.log('after destinationTokenAddress')
    const { decimals, name, symbol } = await this.fetchTokenDetails(destinationTokenAddress)
    const _symbol = this.chain === 'ethereum' ? symbol : this.chain.substring(0, 3) + symbol
    console.log('decimals, name, symbol, _symbol', decimals, name, symbol, _symbol)
    await this.addCustomToken({
      network: this.request.network,
      walletId: this.request.walletId,
      chain: this.chain,
      contractAddress: destinationTokenAddress,
      name: name,
      symbol: _symbol,
      decimals: Number(decimals)
    })
    await this.enableAssets({
      network: this.request.network,
      walletId: this.request.walletId,
      assets: [_symbol]
    })
    console.log('after enableAssets()')
  }
}
