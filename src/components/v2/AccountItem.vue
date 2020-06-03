<template>
  <div class="account-item d-flex align-items-center">
    <img :src="'./img/' + asset.toLowerCase() + '.png'" class="account-item_icon" />
    <div class="account-item_name flex-fill">{{name}}</div>
    <div class="account-item_balance">{{prettyBalance(balance, asset)}} {{code}}</div>
    <ChevronRightIcon class="account-item_chevron" />
  </div>
</template>

<script>
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'
import { prettyBalance } from '@/utils/coinFormatter'
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'

export default {
  components: {
    ChevronRightIcon
  },
  props: {
    asset: String,
    balance: Number
  },
  computed: {
    code: function () {
      return cryptoassets[this.asset.toLowerCase()].code
    },
    name: function () {
      return cryptoassets[this.asset.toLowerCase()].name
    },
  },
  methods: {
    prettyBalance
  }
}
</script>
