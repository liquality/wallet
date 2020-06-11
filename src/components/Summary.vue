<template>
  <div class="table-responsive mb-4">
    <table class="table bg-white border mb-0">
      <thead>
        <tr>
          <td scope="col" class="text-muted">#</td>
          <td scope="col" class="text-muted">Asset</td>
          <td scope="col" class="text-muted text-right">Balance</td>
          <td scope="col" class="text-muted text-right cursor-pointer" @click="toggleBase">Rate</td>
          <td scope="col" class="text-muted text-center">Trade</td>
        </tr>
      </thead>
      <tbody class="font-weight-normal" v-if="networkWalletBalances">
        <tr v-for="(balance, asset, idx) in networkWalletBalances" :key="asset">
          <td scope="row" class="text-muted font-weight-light">{{idx + 1}}</td>
          <td class="cursor-pointer nowrap" @click="$emit('show', asset)">
            <span class="asset-icon" :style="'background-image: url(./img/' + asset.toLowerCase() + '.png)'"> </span>
            <span>{{asset}}</span>
          </td>
          <td class="text-right cursor-pointer" @click="$emit('show', asset)">
            <span>{{prettyBalance(balance, asset)}} <small class="text-muted">{{asset}}</small></span>
          </td>
          <td class="text-right">
            <span v-if="networkMarketData">
              <span v-if="base === asset">1 <small class="text-muted">{{asset}}</small></span>
              <span v-else>{{dpUI(networkMarketData[asset][base].buyRate, asset)}} <small class="text-muted">{{base}}</small></span>
            </span>
          </td>
          <td class="nowrap">
            <span v-if="networkMarketData">
              <button class="btn btn-lg btn-primary" @click="$emit('buy', asset)" :disabled="!networkMarketData[asset]">Buy</button>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { dpUI, prettyBalance } from '@/utils/coinFormatter'
import { NetworkAssets } from '@/store/factory/client'

export default {
  data () {
    return {
      base: 'BTC'
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'marketData', 'balances', 'activeWalletId']),
    walletOrders () {
      return this.orders.filter(order => order.walletId === this.activeWalletId)
    },
    networkAssets () {
      return NetworkAssets[this.activeNetwork]
    },
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      if (!this.balances[this.activeNetwork]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId]) return false

      return this.balances[this.activeNetwork][this.activeWalletId]
    }
  },
  methods: {
    ...mapActions(['updateBalances', 'getUnusedAddresses']),
    prettyBalance,
    dpUI,
    toggleBase () {
      this.base = this.networkAssets.find(asset => asset !== this.base)
    }
  },
  created () {
    this.updateBalances({ network: this.activeNetwork, walletId: this.activeWalletId })
    this.getUnusedAddresses({ network: this.activeNetwork, walletId: this.activeWalletId, assets: this.networkAssets })
  }
}
</script>
