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
    if (!this.origin || !this.isValidMethod() || !this.isValidFunctionSignature()) {
      return
    }
    const destinationTokenAddress = this.getDestinationTokenAddress()
    if (!destinationTokenAddress) {
      return
    }
    const { decimals, name, symbol } = await this.fetchTokenDetails(destinationTokenAddress)
    const _symbol = this.chain === 'ethereum' ? symbol : this.chain.substring(0, 3) + symbol
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
  }
}
