<template>
  <div class="connection-drawer">
    <div class="connection-drawer_settings p-3">
      <div class="connection-drawer_settings_item">
        <div class="mb-2"><strong>dApp Network</strong></div>
        <p class="text-muted">
          Find the connection button on the site. If you can’t connect try again after switching the
          network.
        </p>
        <ChainDropdown
          :chains="ethereumChains"
          :selected="injectEthereumChain"
          @chain-changed="updateInjectEthereumChain"
        />
      </div>
    </div>
    <div class="connection-drawer_connections p-3" v-if="dappConnected">
      <div><strong>Granted Connection</strong></div>
      <p class="text-muted">Connected sites can see your account address.</p>
      <div class="connection-drawer_connections_origin" id="granted-connection-list">
        <strong>{{ currentOrigin }}</strong>
      </div>
    </div>
    <div class="connection-drawer_accounts" v-if="dappConnected">
      <ul class="connection-drawer_accounts_list p-0 m-0">
        <li
          v-for="account in accounts"
          :key="account.id"
          class="m-0 p-3"
          :class="{ selected: selectedAccount.id === account.id }"
        >
          {{ formatAddress(account) }}
          <TickBlue class="float-right" v-if="selectedAccount.id === account.id" />
          <button v-else class="btn btn-option float-right" @click="switchAccount(account)">
            Switch account
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { isEthereumChain, chains } from '@liquality/cryptoassets'
import { shortenAddress } from '@/utils/address'
import buildConfig from '@/build.config'

import clickAway from '@/directives/clickAway'
import TickBlue from '@/assets/icons/tick_blue.svg'
import ChainDropdown from '@/components/ChainDropdown.vue'

export default {
  directives: {
    clickAway
  },
  components: {
    TickBlue,
    ChainDropdown
  },
  data() {
    return {
      currentOrigin: null
    }
  },
  computed: {
    ...mapState([
      'wallets',
      'activeWalletId',
      'activeNetwork',
      'externalConnections',
      'injectEthereumChain'
    ]),
    ...mapGetters(['accountItem', 'accountsData']),
    dappConnected() {
      if (!this.currentOrigin || !this.externalConnections[this.activeWalletId]) return false
      if (!(this.currentOrigin in this.externalConnections[this.activeWalletId])) {
        return false
      }
      const chains = Object.keys(this.externalConnections[this.activeWalletId][this.currentOrigin])
      return chains.length > 0
    },
    ethereumChains() {
      return buildConfig.chains.filter(isEthereumChain)
    },
    selectedAccount() {
      if (!this.dappConnected) {
        return null
      }
      const accountId =
        this.externalConnections[this.activeWalletId][this.currentOrigin].defaultEthereum
      return this.accountItem(accountId)
    },
    accounts() {
      if (!this.selectedAccount) {
        return []
      }

      return this.accountsData.filter((account) => account.chain === this.selectedAccount.chain)
    }
  },
  methods: {
    ...mapActions(['setEthereumInjectionChain', 'addExternalConnection', 'toggleInjection']),
    toggleManageDappConnection() {
      this.toggleInjection()
    },
    updateInjectEthereumChain(chain) {
      this.setEthereumInjectionChain({ chain })
      this.trackAnalytics({
        event: 'Web3 Network Update',
        properties: {
          category: 'Settings',
          action: 'Web3 Network Updated',
          label: `${chain}`
        }
      })
    },
    formatAddress(account) {
      return shortenAddress(
        chains[account.chain].formatAddress(account.addresses[0], this.activeNetwork)
      )
    },
    switchAccount(account) {
      this.addExternalConnection({
        origin: this.currentOrigin,
        chain: account.chain,
        accountId: account.id,
        setDefaultEthereum: true
      })
    }
  },
  created() {
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
.connection-drawer {
  background: white;

  &_settings {
  }

  &_connections {
    border-top: 1px solid $hr-border-color;
  }

  &_accounts {
    &_list {
      list-style-type: none;

      li {
        border-top: 1px solid $hr-border-color;
        &.selected {
          background: #f0f7f9;
        }
        svg {
          height: 12px;
        }
      }
    }
  }
}
</style>
