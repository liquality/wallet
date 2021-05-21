<template>
  <v-popover offset="1" trigger="hover" :placement="'top'">
    <slot>
    </slot>
    <template slot="popover">
      <div class="tooltip-wrapper">
        <div class="color" :style="{ 'background-color': account.color }">
      </div>
      <div class="icon">
        <img :src="getAccountIcon(account.chain)"
                 class="asset-icon" />
      </div>
      <div class="content">
        <p class="my-0 text-left">{{ account.name }}</p>
        <p class="text-muted my-0 text-left">{{ address ? shortenAddress(address) : '' }}</p>
        <p class="text-muted my-0 text-left" v-if="isEthereumChain(asset)">
          Available Gas {{ nativeAssetBalance }} {{ nativeAsset }}
        </p>
      </div>
      </div>
    </template>
  </v-popover>
</template>

<script>
import { shortenAddress } from '@/utils/address'
import { getAccountIcon } from '@/utils/accounts'
import { isEthereumChain, getNativeAsset } from '@/utils/asset'
import { prettyBalance } from '@/utils/coinFormatter'

export default {
  props: {
    account: {
      type: Object
    },
    asset: {
      type: String
    }
  },
  computed: {
    address () {
      return (this.account?.addresses.length || 0) > 0 ? this.account?.addresses[0] : null
    },
    nativeAsset () {
      return this.getNativeAsset(this.asset)
    },
    nativeAssetBalance () {
      const balance = this.account.balances?.[this.nativeAsset] || 0
      return prettyBalance(balance, this.nativeAsset)
    }
  },
  methods: {
    shortenAddress,
    getAccountIcon,
    isEthereumChain,
    getNativeAsset
  }
}
</script>

<style lang="scss" scoped>
.tooltip-wrapper {
  display: flex;
  flex-direction: row;
  width: 200px;
}

.color {
  display: flex;
  height: 100%;
  width: 3px;
  position: absolute;
  top: 0;
  left: 0;
}
.icon {
  display: flex;
  height: 100%;
}
.content {
  display: flex;
  width: 100%;
  margin-left: 5px;
  flex-direction: column;
  justify-content: flex-start;
  font-weight: 300;
  font-size: 11px;
  line-height: 16px;
}
</style>
