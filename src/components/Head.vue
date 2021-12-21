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
    <div class="head_connection float-right">
      <template v-if="dappConnected"><ConnectionConnected class="mr-1 connection-icon" /> dApp Connected</template>
      <template v-else><ConnectionDisconnected class="mr-1 connection-icon" /> Connect dApp</template>
      <ChevronDownIcon class="ml-1" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import clickAway from '@/directives/clickAway'
import LogoIcon from '@/assets/icons/logo_icon.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ConnectionDisconnected from '@/assets/icons/connection_disconnected.svg'
import ConnectionConnected from '@/assets/icons/connection_connected.svg'

export default {
  directives: {
    clickAway
  },
  components: {
    ChevronUpIcon,
    ChevronDownIcon,
    LogoIcon,
    ConnectionDisconnected,
    ConnectionConnected,
  },
  data () {
    return {
      showNetworks: false,
      currentOrigin: null
    }
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId', 'activeNetwork', 'externalConnections']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    },
    dappConnected () {
      if (!this.currentOrigin) return false
      if (!(this.currentOrigin in this.externalConnections[this.activeWalletId])) return false
      const chains = Object.keys(this.externalConnections[this.activeWalletId][this.currentOrigin])
      return chains.length > 0
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
  },
  created () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const { origin } = new URL(tabs[0].url)
        this.currentOrigin = origin
      }
    })
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

  &_connection {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 10px;


    svg {
      height: 5px;
      width: 8px;
    }

    svg.connection-icon {
      height: 8px;
    }
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
