<template>
  <div class="connection-drawer">
    <div class="connection-drawer_settings p-3">
      <div class="connection-drawer_settings_item">
        <div class="mb-2">
          <strong>
            {{ $t('components.connectionDrawer.dappNetwork') }}
          </strong>
        </div>
        <p class="text-muted">
          {{ $t('components.connectionDrawer.instructions') }}
        </p>
        <ChainDropdown
          :chains="ethereumChains"
          :selected="injectEthereumChain"
          @chain-changed="updateInjectEthereumChain"
        />
      </div>
    </div>
    <div class="connection-drawer_connections p-3" v-if="dappConnected">
      <div>
        <strong>
          {{ $t('components.connectionDrawer.grantedConnection') }}
        </strong>
      </div>
      <p class="text-muted">
        {{ $t('components.connectionDrawer.connectedSites') }}
      </p>
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
            {{ $t('components.connectionDrawer.switchAccount') }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { getChain, isEvmChain } from '@liquality/cryptoassets'
import { version as walletVersion } from '../../package.json'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import { buildConfig } from '@liquality/wallet-core'

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
      return buildConfig.chains.filter((chainId) => isEvmChain(this.activeNetwork, chainId))
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
    ...mapActions('app', ['trackAnalytics']),
    ...mapActions(['setEthereumInjectionChain', 'addExternalConnection']),
    updateInjectEthereumChain(chain) {
      this.setEthereumInjectionChain({ chain })
      this.trackAnalytics({
        event: 'Web3 Network Update',
        properties: {
          walletVersion,
          category: 'Settings',
          action: 'Web3 Network Updated',
          label: `${chain}`
        }
      })
    },
    formatAddress(account) {
      return shortenAddress(
        getChain(this.activeNetwork, account.chain).formatAddressUI(account.addresses[0])
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
  async created() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab) {
      const { origin } = new URL(tab.url)
      this.currentOrigin = origin
    }
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
