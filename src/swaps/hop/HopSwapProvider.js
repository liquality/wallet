import BN from 'bignumber.js'
import { Hop } from '@hop-protocol/sdk'
import { chains, currencyToUnit, unitToCurrency } from '@liquality/cryptoassets'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from 'urql'
import { Wallet } from 'ethers'
import { SwapProvider } from '../SwapProvider'
import cryptoassets from '../../utils/cryptoassets'
import { prettyBalance } from '../../utils/coinFormatter'
import { withInterval, withLock } from '../../store/actions/performNextAction/utils'
import { isERC20 } from '../../utils/asset'

class HopSwapProvider extends SwapProvider {
  constructor(config) {
    super(config)
    this._apiCache = {}
  }
  /**
   * Get the supported pairs of this provider for this network
   * @param {{ network }} network
   */
  // eslint-disable-next-line no-unused-vars
  async getSupportedPairs() {
    return []
  }

  graphqlURLs = {
    url: 'https://api.thegraph.com/subgraphs/name/hop-protocol',
    ethereum: 'hop-mainnet',
    xdai: 'hop-xdai',
    arbitrum: 'hop-arbitrum',
    polygon: 'hop-polygon',
    optimism: 'hop-optimism'
  }

  confirmationsSendCount = {
    ethereum: 1,
    arbitrum: 20,
    polygon: 256
  }

  gasLimit = {
    arbitrum: {
      send: 900000,
      approve: 1000000
    },
    polygon: {
      send: 300000,
      approve: 300000
    },
    ethereum: {
      send: 150000,
      approve: 100000
    }
  }

  getChain = {
    [Hop.Chain.Ethereum.slug]: Hop.Chain.Ethereum,
    [Hop.Chain.Arbitrum.slug]: Hop.Chain.Arbitrum,
    [Hop.Chain.Gnosis.slug]: Hop.Chain.Gnosis,
    [Hop.Chain.Optimism.slug]: Hop.Chain.Optimism,
    [Hop.Chain.Polygon.slug]: Hop.Chain.Polygon
  }

  getToken = {
    [Hop.Token.DAI]: Hop.Token.DAI,
    [Hop.Token.ETH]: Hop.Token.ETH,
    [Hop.Token.WETH]: Hop.Token.ETH,
    [Hop.Token.MATIC]: Hop.Token.MATIC,
    [Hop.Token.WMATIC]: Hop.Token.MATIC,
    [Hop.Token.USDC]: Hop.Token.USDC,
    [Hop.Token.USDT]: Hop.Token.USDT,
    [Hop.Token.WBTC]: Hop.Token.WBTC,
    [Hop.Token.XDAI]: Hop.Token.XDAI,
    [Hop.Token.WXDAI]: Hop.Token.XDAI
  }

  // L2->L1 or L2->L2
  GQL_getDestinationTxHashFromL2Source(transferId) {
    return `query {
        withdrawalBondeds(
          where: {
            transferId: "${transferId}"
          }
        ) {
          timestamp
          amount
          transactionHash
          token
          timestamp
        }
      }
    `
  }
  // L1->L2
  GQL_getDestinationTxHashFromL1Source(recipient) {
    return `query {
        transferFromL1Completeds(
          where: {
            recipient: "${recipient}"
          },
          orderBy: timestamp,
          orderDirection: desc
        ) {
          timestamp
          amount
          transactionHash
          token
          timestamp
        }
      }
    `
  }

  GQL_getTransferIdByTxHash(txHash) {
    return `query {
        transferSents(
          where: {
            transactionHash: "${txHash}"
          }
        ) {
          timestamp
          transferId
          amount
          bonderFee
          transactionHash
          token
          timestamp
        }
      }
    `
  }

  _getDestinationTxGQL(transferId, recipient, isFromL1Source) {
    return isFromL1Source
      ? this.GQL_getDestinationTxHashFromL1Source(recipient)
      : this.GQL_getDestinationTxHashFromL2Source(transferId)
  }

  _getHop(network, signer = undefined) {
    if (!network) return null
    return new Hop(network === 'mainnet' ? 'mainnet' : 'kovan', signer)
  }

  _getAllTokens(hop) {
    const bridge = hop.bridge('ETH')
    const token = bridge.getCanonicalToken(hop.Chain.Ethereum)
    return token.addresses
  }

  _getClient(network, walletId, from, fromAccountId) {
    return this.getClient(network, walletId, from, fromAccountId)
  }

  async _getSigner(network, walletId, from, fromAccountId, provider = undefined) {
    const client = this._getClient(network, walletId, from, fromAccountId)
    const privKey = await client.wallet.exportPrivateKey()
    return new Wallet(privKey, provider)
  }

  async _getBridgeWithSigner(hopAsset, hopChainFrom, network, walletId, from, fromAccountId) {
    const chainFrom = this.getChain[hopChainFrom.slug]
    const client = this._getClient(network, walletId, from, fromAccountId)
    const privKey = await client.wallet.exportPrivateKey()
    const hop = this._getHop(network)
    const signer = new Wallet(privKey, hop.getChainProvider(chainFrom))
    const bridge = hop.connect(signer).bridge(hopAsset)
    return bridge
  }

  _findAsset(asset, chain, tokens, tokenName) {
    if (asset.type === 'native') {
      // native asset
      if (
        this.getToken[asset.code] === tokenName ||
        this.getToken[asset.matchingAsset] === tokenName
      ) {
        return tokenName
      }
    } else {
      // erc20 asset
      if (
        tokens[chain]?.l1CanonicalToken?.toLowerCase() === asset?.contractAddress.toLowerCase() ||
        tokens[chain]?.l2CanonicalToken?.toLowerCase() === asset?.contractAddress.toLowerCase()
      ) {
        return tokenName
      }
    }
  }

  _getSendInfo(assetFrom, assetTo, hop) {
    if (!assetFrom || !assetTo) return null
    const _chainFrom = this.getChain[assetFrom.chain]
    const _chainTo = this.getChain[assetTo.chain]
    if (!_chainFrom || !_chainTo) return null
    const availableToken = this._getAllTokens(hop)
    let _from, _to
    for (const token in availableToken) {
      if (!_from) _from = this._findAsset(assetFrom, _chainFrom.slug, availableToken[token], token)
      if (!_to) _to = this._findAsset(assetTo, _chainTo.slug, availableToken[token], token)
    }
    if (!_from || !_to || _from !== _to) return null
    const supportedAssetsFrom = hop.getSupportedAssetsForChain(_chainFrom.slug)
    const supportedAssetsTo = hop.getSupportedAssetsForChain(_chainTo.slug)
    if (!supportedAssetsFrom[_from] || !supportedAssetsTo[_to]) return null
    return { bridgeAsset: _from, chainFrom: _chainFrom, chainTo: _chainTo }
  }

  // eslint-disable-next-line no-unused-vars
  async getQuote({ network, from, to, amount }) {
    if (amount <= 0) return null
    const assetFrom = cryptoassets[from]
    const assetTo = cryptoassets[to]
    const fromAmountInUnit = currencyToUnit(cryptoassets[from], BN(amount))
    const hop = this._getHop(network)
    if (!hop || !hop.isValidChain(assetFrom.chain) || !hop.isValidChain(assetTo.chain)) return null
    const info = this._getSendInfo(assetFrom, assetTo, hop)
    if (!info?.bridgeAsset || !info?.chainFrom || !info?.chainTo) return null
    const { bridgeAsset, chainFrom, chainTo } = info
    const bridge = hop.bridge(bridgeAsset)
    const sendData = await bridge.getSendData(fromAmountInUnit.toString(), chainFrom, chainTo)
    if (!sendData) return null
    return {
      from,
      to,
      // Amounts should be in BigNumber to prevent loss of precision
      fromAmount: fromAmountInUnit,
      toAmount: sendData.amountOut.toString(),
      hopAsset: bridgeAsset,
      hopChainFrom: chainFrom,
      hopChainTo: chainTo,
      receiveFee: BN(sendData.adjustedBonderFee.toString())
        .plus(BN(sendData.adjustedDestinationTxFee.toString()))
        .toString()
    }
  }

  async _approveToken(bridge, chainFrom, fromAmount, signer, fee) {
    const txData = await bridge.populateSendApprovalTx(fromAmount, chainFrom)
    const approveTx = await signer.sendTransaction({
      ...txData,
      gasPrice:
        '0x' +
        BN(fee.suggestedBaseFeePerGas ?? fee)
          .times(1e9)
          .toString(16)
    })
    approveTx.hash = approveTx?.hash?.substring(2)
    return {
      status: 'WAITING_FOR_APPROVE_CONFIRMATIONS',
      approveTx,
      approveTxHash: approveTx?.hash
    }
  }

  async sendSwap({ network, walletId, quote }) {
    const { hopAsset, hopChainFrom, hopChainTo, from, fromAccountId, fromAmount } = quote
    const chainFrom = this.getChain[hopChainFrom.slug]
    const chainTo = this.getChain[hopChainTo.slug]
    const bridge = await this._getBridgeWithSigner(
      hopAsset,
      hopChainFrom,
      network,
      walletId,
      from,
      fromAccountId
    )
    const hop = this._getHop(network)
    const signer = await this._getSigner(
      network,
      walletId,
      from,
      fromAccountId,
      hop.getChainProvider(chainFrom)
    )
    const txData = await bridge.populateSendTx(fromAmount, chainFrom, chainTo)
    const fromFundTx = await signer.sendTransaction({
      ...txData,
      gasPrice:
        '0x' +
        BN(quote.fee.suggestedBaseFeePerGas ?? quote.fee)
          .times(1e9)
          .toString(16)
    })
    fromFundTx.hash = fromFundTx?.hash?.substring(2)
    return {
      status: 'WAITING_FOR_SEND_SWAP_CONFIRMATIONS',
      fromFundTx,
      fromFundHash: fromFundTx.hash
    }
  }

  /**
   * Create a new swap for the given quote
   * @param {{ network, walletId, quote }} options
   */
  // eslint-disable-next-line no-unused-vars
  async newSwap(options) {
    const { network, walletId, quote } = options
    const { hopAsset, hopChainFrom, hopChainTo, from, fromAccountId, fromAmount } = quote
    const chainFrom = this.getChain[hopChainFrom.slug]
    const chainTo = this.getChain[hopChainTo.slug]
    const bridge = await this._getBridgeWithSigner(
      hopAsset,
      hopChainFrom,
      network,
      walletId,
      from,
      fromAccountId
    )
    const hop = this._getHop(network)
    const signer = await this._getSigner(
      network,
      walletId,
      from,
      fromAccountId,
      hop.getChainProvider(chainFrom)
    )
    let updates
    if (isERC20(quote.from)) {
      updates = await this._approveToken(bridge, chainFrom, fromAmount, signer, quote.fee)
    } else {
      updates = {
        endTime: Date.now(),
        status: 'APPROVE_CONFIRMED'
      }
    }
    return {
      id: uuidv4(),
      fee: quote.fee,
      slippage: 50,
      hopAsset: hopAsset,
      hopChainFrom: chainFrom,
      hopChainTo: chainTo,
      ...updates
    }
  }

  /**
   * Estimate the fees for the given parameters
   * @param {{ network, walletId, asset, fromAccountId, toAccountId, txType, amount, feePrices[], max }} options
   * @return Object of key feePrice and value fee
   */
  // eslint-disable-next-line no-unused-vars
  async estimateFees({ network, walletId, txType, quote, feePrices }) {
    const chain = cryptoassets[quote.from].chain
    const nativeAsset = chains[chain].nativeAsset
    let gasLimit = this.gasLimit[quote.hopChainFrom.slug].send
    if (isERC20(quote.from)) {
      gasLimit += this.gasLimit[quote.hopChainFrom.slug].approve
    }
    if (txType in HopSwapProvider.txTypes) {
      const fees = {}
      for (const feePrice of feePrices) {
        const gasPrice = BN(feePrice).times(1e9) // ETH fee price is in gwei
        const fee = BN(gasLimit).times(1.1).times(gasPrice)
        fees[feePrice] = unitToCurrency(cryptoassets[nativeAsset], fee)
      }
      return fees
    }
  }

  async waitForApproveConfirmations({ swap, network, walletId }) {
    const client = this._getClient(network, walletId, swap.from, swap.fromAccountId)
    try {
      const tx = await client.chain.getTransactionByHash(swap.approveTxHash)
      if (tx && tx.confirmations >= 1) {
        return {
          endTime: Date.now(),
          status: 'APPROVE_CONFIRMED'
        }
      }
    } catch (e) {
      if (e.name === 'TxNotFoundError') console.warn(e)
      else throw e
    }
  }

  async waitForSendSwapConfirmations({ swap, network, walletId }) {
    const client = this._getClient(network, walletId, swap.from, swap.fromAccountId)
    try {
      const tx = await client.chain.getTransactionByHash(swap.fromFundHash)
      if (tx && tx.confirmations >= this.confirmationsSendCount[swap.hopChainFrom.slug]) {
        this.updateBalances(network, walletId, [swap.from])
        return {
          endTime: Date.now(),
          status:
            tx.status === 'SUCCESS' || Number(tx.status) === 1
              ? 'WAITING_FOR_RECIEVE_SWAP_CONFIRMATIONS'
              : 'FAILED'
        }
      }
    } catch (e) {
      if (e.name === 'TxNotFoundError') console.warn(e)
      else throw e
    }
  }

  async waitForRecieveSwapConfirmations({ swap, network, walletId }) {
    const { hopChainFrom, hopChainTo, fromFundHash, from, to, fromAccountId } = swap
    const client = this._getClient(network, walletId, from, fromAccountId)
    const privKey = await client.wallet.exportPrivateKey()
    const signer = new Wallet(privKey)
    const chainFrom = this.getChain[hopChainFrom.slug]
    const chainTo = this.getChain[hopChainTo.slug]
    const isFromL1Source = chainFrom.isL1 && !chainTo.isL1
    try {
      let clientGQL
      let transferId = ''
      if (!isFromL1Source) {
        clientGQL = createClient({
          url: `${this.graphqlURLs.url}/${this.graphqlURLs[chainFrom.slug]}`
        })
        const { data } = await clientGQL
          .query(this.GQL_getTransferIdByTxHash('0x' + fromFundHash))
          .toPromise()
        transferId = data.transferSents?.[0]?.transferId
        if (!transferId) return
      }
      clientGQL = createClient({
        url: `${this.graphqlURLs.url}/${this.graphqlURLs[chainTo.slug]}`
      })
      const { data } = await clientGQL
        .query(this._getDestinationTxGQL(transferId, signer.address.toLowerCase(), isFromL1Source))
        .toPromise()
      const methodName = !isFromL1Source ? 'withdrawalBondeds' : 'transferFromL1Completeds'
      const destinationTxHash = data[methodName]?.[0]?.transactionHash

      if (!destinationTxHash) return
      const client = this._getClient(network, walletId, to, fromAccountId)
      const tx = await client.chain.getTransactionByHash(data[methodName]?.[0]?.transactionHash)
      if (tx && tx.confirmations >= 1) {
        return {
          receiveTxHash: tx.hash,
          receiveTx: tx,
          endTime: Date.now(),
          status: tx.status === 'SUCCESS' || Number(tx.status) === 1 ? 'SUCCESS' : 'FAILED'
        }
      }
    } catch (e) {
      if (e.name === 'TxNotFoundError') console.warn(e)
      else throw e
    }
  }

  /**
   * This hook is called when state updates are required
   * @param {object} store
   * @param {{ network, walletId, swap }}
   * @return updates An object representing updates to the current swap in the history
   */
  // eslint-disable-next-line no-unused-vars
  async performNextSwapAction(store, { network, walletId, swap }) {
    let updates

    switch (swap.status) {
      case 'WAITING_FOR_APPROVE_CONFIRMATIONS':
        updates = await withInterval(async () =>
          this.waitForApproveConfirmations({ swap, network, walletId })
        )
        break
      case 'APPROVE_CONFIRMED':
        updates = await withLock(
          store,
          { item: swap, network, walletId, asset: swap.from },
          async () => this.sendSwap({ quote: swap, network, walletId })
        )
        break
      case 'WAITING_FOR_SEND_SWAP_CONFIRMATIONS':
        updates = await withInterval(async () =>
          this.waitForSendSwapConfirmations({ swap, network, walletId })
        )
        break
      case 'WAITING_FOR_RECIEVE_SWAP_CONFIRMATIONS':
        updates = await withInterval(async () =>
          this.waitForRecieveSwapConfirmations({ swap, network, walletId })
        )
        break
    }
    return updates
  }

  static txTypes = {
    SWAP: 'SWAP'
  }

  static statuses = {
    WAITING_FOR_APPROVE_CONFIRMATIONS: {
      step: 0,
      label: 'Approving {from}',
      filterStatus: 'PENDING',
      notification(swap) {
        return {
          message: `Approving ${swap.from}`
        }
      }
    },
    APPROVE_CONFIRMED: {
      step: 1,
      label: 'Swapping {from}',
      filterStatus: 'PENDING'
    },
    WAITING_FOR_SEND_SWAP_CONFIRMATIONS: {
      step: 1,
      label: 'Swapping {from}',
      filterStatus: 'PENDING',
      notification() {
        return {
          message: 'Engaging the hop.exchange'
        }
      }
    },
    WAITING_FOR_RECIEVE_SWAP_CONFIRMATIONS: {
      step: 2,
      label: 'Swapping {to}',
      filterStatus: 'PENDING',
      notification() {
        return {
          message: 'Engaging the hop.exchange'
        }
      }
    },
    SUCCESS: {
      step: 3,
      label: 'Completed',
      filterStatus: 'COMPLETED',
      notification(swap) {
        return {
          message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${
            swap.to
          } ready to use`
        }
      }
    },
    FAILED: {
      step: 3,
      label: 'Swap Failed',
      filterStatus: 'REFUNDED',
      notification() {
        return {
          message: 'Swap failed'
        }
      }
    }
  }

  static fromTxType = HopSwapProvider.txTypes.SWAP
  static toTxType = null

  static timelineDiagramSteps = ['APPROVE', 'INITIATION', 'RECEIVE']

  static totalSteps = 4
}

export { HopSwapProvider }
