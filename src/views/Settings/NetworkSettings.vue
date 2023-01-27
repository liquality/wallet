<template>
  <div>
    <div
      v-for="settings in settingsList"
      :key="`chain-${settings.chain}`"
      class="overview-screen-chain-section"
    >
      <ListItem @item-selected="toggleExpandedChain(settings.chain)">
        <template #prefix>
          <div class="account-color" :style="{ 'background-color': 'white' }"></div>
          <div class="prefix-icon-container">
            <MinusIcon v-if="shouldExpandChain(settings.chain)" class="prefix-icon" />
            <PlusIcon v-else class="prefix-icon" />
          </div>
        </template>
        <template #icon>
          <img :src="getAccountIcon(settings.chain)" class="asset-icon" />
        </template>
        {{ settings.chain }}
      </ListItem>
      <div class="account-assets" :class="{ active: shouldExpandChain(settings.chain) }">
        <CustomRpcSettingsForm :settings="settings" />
      </div>
    </div>
  </div>
</template>
<script>
import ListItem from '@/components/ListItem'
import { mapGetters, mapState } from 'vuex'
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
import { getChain, isEvmChain } from '@liquality/cryptoassets'

export default {
  name: 'NetworkSettings',
  components: {
    ListItem,
    PlusIcon,
    MinusIcon,
    CustomRpcSettingsForm
  },
  data() {
    return {
      expandedChains: []
    }
  },
  computed: {
    ...mapState(['activeNetwork']),
    ...mapGetters(['chainSettings']),
    settingsList() {
      return this.chainSettings
        .map((s) => ({
          ...s,
          chainId: getChain(this.activeNetwork, s.chain)?.network.chainId
        }))
        .filter(({ chain }) => isEvmChain(this.activeNetwork, chain))
    }
  },
  methods: {
    getAccountIcon,
    shortenAddress,
    formatFiatUI,
    formatFiat,
    prettyBalance,

    toggleExpandedChain(id) {
      const idx = this.expandedChains.findIndex((chainId) => chainId === id)
      if (idx >= 0) {
        this.expandedChains.splice(idx, 1)
      } else {
        this.expandedChains.push(id)
      }
    },
    shouldExpandChain(chainId) {
      return this.expandedChains.includes(chainId)
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
