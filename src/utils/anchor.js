import { AnchorEarn, CHAINS, NETWORKS, DENOMS } from '@anchor-protocol/anchor-earn'
import store from '../store'

let anchorEarn

export const createAnchor = () => {
  const { mnemonic } = store.state.wallets[0]

  anchorEarn = new AnchorEarn({
    chain: CHAINS.TERRA,
    network: NETWORKS.COLUMBUS_5,
    mnemonic
  })
}

export const getApy = async () => {
  const marketInfo = await anchorEarn.market({
    currencies: [
      DENOMS.UST
    ],
  })

  const { APY } = marketInfo.markets[0]

  const percentage = APY.split('.')[1]

  const formatted = percentage.slice(0, 2) + '.' + percentage.slice(2, 4)

  return formatted
}

export const getDepositedAmount = async () => {
  const balanceInfo = await anchorEarn.balance({
    currencies: [
      DENOMS.UST
    ],
  })

  return Number(balanceInfo.balances[0].deposit_balance)
}

export const makeDeposit = async (amount = '0.1') => {
  const deposit = await anchorEarn.deposit({
    currency: DENOMS.UST,
    amount
  });
}

export const makeWithdraw = async (amount = '0.1') => {
  const withdraw = await anchorEarn.withdraw({
    currency: DENOMS.UST,
    amount
  })
}