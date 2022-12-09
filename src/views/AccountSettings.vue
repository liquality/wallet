<template>
  <div>
    <div
      v-for="(account, idx) in chains"
      :key="`account-${idx}`"
      class="overview-screen-chain-section"
      :id="idx"
    >
      <ListItem @item-selected="toggleExpandedAccounts(idx)">
        <template #prefix>
          <div class="account-color" :style="{ 'background-color': 'white' }"></div>
          <div class="prefix-icon-container">
            <MinusIcon v-if="shouldExpandAccount(idx)" class="prefix-icon" />
            <PlusIcon v-else class="prefix-icon" />
          </div>
        </template>
        <template #icon>
          <img :src="getAccountIcon(account.chain)" class="asset-icon" />
        </template>
        {{ account.chain }}
      </ListItem>
      <div class="account-assets" :class="{ active: shouldExpandAccount(idx) }">
        <CustomRpcSettingsForm :account="account" />
      </div>
    </div>
  </div>
</template>
<script>
import ListItem from '@/components/ListItem'
import { buildConfig } from '@liquality/wallet-core'
import { getChain, getNativeAssetCode, isEvmChain } from '@liquality/cryptoassets'
import { mapState, mapGetters } from 'vuex'
import { getAccountIcon } from '@/utils/accounts'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import {
  prettyBalance,
  formatFiat,
  formatFiatUI
} from '@liquality/wallet-core/dist/src/utils/coinFormatter'
import PlusIcon from '@/assets/icons/plus_icon.svg'
import MinusIcon from '@/assets/icons/minus_icon.svg'
import CustomRpcSettingsForm from '@/components/CustomRpcSettingsForm.vue'

export default {
  name: 'AccountSettings',
  components: {
    ListItem,
    PlusIcon,
    MinusIcon,
    CustomRpcSettingsForm
  },
  data() {
    return {
      expandedAccounts: []
    }
  },
  computed: {
    ...mapState(['activeNetwork']),
    ...mapGetters(['accountsData']),

    chains() {
      return buildConfig.chains
        .filter((chain) => isEvmChain(this.activeNetwork, chain))
        .map((chain) => {
          const network = getChain(this.activeNetwork, chain).network
          const asset = getNativeAssetCode(this.activeNetwork, chain)
          return { chain, asset, network }
        })
    }
  },
  methods: {
    getAccountIcon,
    shortenAddress,
    formatFiatUI,
    formatFiat,
    prettyBalance,

    toggleExpandedAccounts(id) {
      console.log('Add id', id)
      const idx = this.expandedAccounts.findIndex((chainId) => chainId === id)
      console.log('idx', idx, ...this.expandedAccounts)
      if (idx >= 0) {
        this.expandedAccounts.splice(idx, 1)
      } else {
        this.expandedAccounts.push(id)
      }
    },
    shouldExpandAccount(chainId) {
      return this.expandedAccounts.includes(chainId)
    }
  }
}
</script>
<style lang="scss">
.ledger-tag {
  color: #4763cd;
}
.detail-content {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.account-assets {
  margin: 0;
  height: auto;
  width: 100%;
  display: none;

  &.active {
    display: block;
  }

  .account-asset-item {
    padding-left: 30px;
  }

  .list-item-icon {
    margin-left: 33px !important;
  }
}

.prefix-icon-container {
  display: flex;
  align-items: center;
  margin-left: 12px;
  .prefix-icon {
    width: 12px;
  }
}

.account-color {
  width: 5px;
  height: 60px;
  position: absolute;
  left: 0;
  margin-right: 5px;
}

.link {
  color: $color-primary !important;
  font-weight: 600;
}
</style>
