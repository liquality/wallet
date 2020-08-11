<template>
  <div class="head">
    <LogoIcon class="head_logo" />
    <div class="head_network" @click.stop="showNetworks = !showNetworks">
      {{activeNetwork}}
      <ChevronUpIcon v-if="showNetworks" />
      <ChevronDownIcon v-else />
    </div>
    <ul class="menu_list" v-if="showNetworks" v-click-away="hideNetworks">
      <li @click="switchNetwork('mainnet')">Mainnet</li>
      <li @click="switchNetwork('testnet')">Testnet</li>
    </ul>
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
    switchNetwork (network) {
      this.showNetworks = false
      this.changeActiveNetwork({ network })
    }
  }
}
</script>

<style lang="scss">
.head {
  position: relative;
  height: 36px;
  border-bottom: 1px solid $hr-border-color;

  &_logo {
    position: absolute;
    top: 10px;
    left: 20px;
    height: 12px;
  }

  &_network {
    width: 200px;
    height: 100%;
    margin: 0 auto;
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
