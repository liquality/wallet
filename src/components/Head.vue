<template>
  <div class="head">
    <router-link to="/wallet" class="head_logo ml-3" id="wallet_header_logo"
      ><LogoIcon
    /></router-link>
    <div id="head_network" class="head_network" @click.stop="toggleShowNetworks">
      {{ activeNetwork }}
      <ChevronUpIcon v-if="showNetworks" />
      <ChevronDownIcon v-else />
      <ul class="menu_list" id="list_of_networks" v-if="showNetworks" v-click-away="hideNetworks">
        <li id="mainnet_network" @click="switchNetwork('mainnet')">Mainnet</li>
        <li id="testnet_network" @click="switchNetwork('testnet')">Testnet</li>
      </ul>
    </div>
    <div
      id="connect_dapp_main_option"
      class="head_connection float-right mr-3"
      v-if="showDappConnections"
      @click.stop="toggleShowConnectionDrawer"
    >
      <template v-if="dappConnected"
        ><ConnectionConnected class="mr-1 connection-icon" id="dappConnected" /> dApp
        Connected</template
      >
      <template v-else
        ><ConnectionDisconnected class="mr-1 connection-icon" id="connect_dapp" /> Connect
        dApp</template
      >
      <ChevronUpIcon class="ml-1" v-if="showConnectionDrawer" />
      <ChevronDownIcon class="ml-1" v-else />
    </div>
    <ConnectionDrawer
      v-if="showConnectionDrawer"
      class="head_connection-drawer"
      v-click-away="hideConnectionDrawer"
    />
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
import ConnectionDrawer from '@/components/ConnectionDrawer.vue'

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
    ConnectionDrawer
  },
  props: ['showDappConnections'],
  data() {
    return {
      showNetworks: false,
      showConnectionDrawer: false,
      currentOrigin: null
    }
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId', 'activeNetwork', 'externalConnections']),
    wallet: function () {
      return this.wallets.find((wallet) => wallet.id === this.activeWalletId)
    },
    dappConnected() {
      if (!this.currentOrigin || !this.externalConnections[this.activeWalletId]) return false
      if (!(this.currentOrigin in this.externalConnections[this.activeWalletId])) return false
      const chains = Object.keys(this.externalConnections[this.activeWalletId][this.currentOrigin])
      return chains.length > 0
    }
  },
  methods: {
    ...mapActions(['changeActiveNetwork']),
    ...mapActions('app', ['settingsModalOpen']),
    toggleShowNetworks() {
      this.showNetworks = !this.showNetworks
      if (this.showNetworks) {
        this.showConnectionDrawer = false
      }
    },
    hideNetworks() {
      this.showNetworks = false
    },
    toggleShowConnectionDrawer() {
      this.showConnectionDrawer = !this.showConnectionDrawer
      if (this.showConnectionDrawer) {
        this.showNetworks = false
      }
      this.settingsModalOpen(false)
    },
    hideConnectionDrawer() {
      this.showConnectionDrawer = false
    },
    async switchNetwork(network) {
      await this.changeActiveNetwork({ network })
      this.showNetworks = false
    }
  },
  created() {
    if (this.showDappConnections) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const { origin } = new URL(tabs[0].url)
          this.currentOrigin = origin
        }
      })
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
    left: 0;
  }

  &_logo,
  &_logo svg {
    height: 12px;
  }

  &_network {
    height: 36px;
    display: flex;
    font-size: $font-size-tiny;
    font-weight: $font-weight-base;
    justify-content: center;
    align-items: center;
    text-transform: capitalize;
    cursor: pointer;

    svg {
      height: 6px;
      margin-left: 4px;
    }
  }

  &_connection {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    cursor: pointer;
    right: 0;

    svg {
      height: 5px;
      width: 8px;
    }

    svg.connection-icon {
      height: 8px;
    }
  }

  &_connection-drawer {
    position: absolute;
    z-index: 3;
    width: 100%;
    top: 36px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  }
}
</style>
