<template>
  <div class="head">
    <router-link to="/wallet" class="head_logo" id="wallet_header_logo"><LogoIcon /></router-link>
    <div id="head_network" class="head_network" @click.stop="showNetworks = !showNetworks">
      {{ activeNetwork }}
      <ChevronUpIcon v-if="showNetworks" />
      <ChevronDownIcon v-else />
      <ul class="menu_list" id="list_of_networks" v-if="showNetworks" v-click-away="hideNetworks">
        <li id="mainnet_network" @click="switchNetwork('mainnet')">Mainnet</li>
        <li id="testnet_network" @click="switchNetwork('testnet')">Testnet</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import clickAway from '@/directives/clickAway'
import LogoIcon from '@/assets/icons/logo_icon.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
  directives: {
    clickAway
  },
  components: {
    ChevronUpIcon,
    ChevronDownIcon,
    LogoIcon
  },
  data () {
    return {
      showNetworks: false
    }
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId', 'activeNetwork']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    }
  },
  methods: {
    ...mapActions(['changeActiveNetwork']),
    hideNetworks () {
      this.showNetworks = false
    },
    async switchNetwork (network) {
      await this.changeActiveNetwork({ network })
      this.showNetworks = false
    }
  }
}
</script>

<style lang="scss">
.head {
  position: relative;
  height: 36px;
  border-bottom: 1px solid $hr-border-color;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;

   &_logo {
    position: absolute;
    left: 10px;
  }

  &_logo, &_logo svg {
    height: 12px;

  }

  &_network {
    height: 36px;
    display: flex;
    font-size: $font-size-tiny;
    justify-content: center;
    align-items: center;
    text-transform: capitalize;
    cursor: pointer;

    svg {
      height: 6px;
      margin-left: 4px;
    }
  }
}
</style>
