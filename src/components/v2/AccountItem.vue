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
    }
  },
  methods: {
    prettyBalance
  }
}
</script>

<style lang="scss">
.account-item {
  width: 100%;
  border-bottom: 1px solid $hr-border-color;
  height: 60px;
  padding: 16px 30px;
  &:hover {
    cursor: pointer;
    text-decoration: none;
  }
  &_icon {
    width: 28px;
    height: 28px;
    margin-right: 8px;
  }
  &_balance {
    width: 120px;
    text-align: right;
    margin-right: 20px;
  }
  &_chevron {
    margin-bottom: 2px;
  }
}
</style>
