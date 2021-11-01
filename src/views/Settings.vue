<template>
  <div class="view-container">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="wallet_header"><strong>Settings</strong></span>
    </NavBar>
    <div class="settings">
      <div class="setting-item" id="settings_item_default_wallet">
        <div class="setting-item_title flex-fill mb-2">Default Web3 Wallet
          <span class="setting-item_sub">Set Liquality as the default dapp wallet. Other wallets cannot interact with dapps while this is enabled.</span>
        </div>
        <div class="setting-item_control" id="default_web3_wallet_toggle_button">
          <toggle-button :css-colors="true" :value="injectEthereum" @change="e => toggleInjectEthereum(e.value)"/>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item_title flex-fill" id="settings_item_web_network">Web3 Network
          <span class="setting-item_sub">Select which Web3 network should be used for dapps.</span>
        </div>
        <div class="setting-item_control">
          <ChainDropdown :chains="ethereumChains"
                         :selected="injectEthereumChain"
                         @chain-changed="updateInjectEthereumChain"/>
        </div>
      </div>
      <div class="setting-item" id="forgetAllDappsDone">
        <div class="setting-item_title flex-fill mb-2">Dapp Connections
          <span class="setting-item_sub">Forget all of the dapps connected.</span>
        </div>
        <div class="setting-item_control">
          <button class="btn btn-outline-primary"
                  id="forget_all_connections_button"
                  @click="forgetAllDappConnections"
                  v-tooltip="{
                    trigger: 'manual',
                    content: 'Done!',
                    hideOnTargetClick: false,
                    show: forgetAllDappsDone
                  }">
                  Forget all connections
          </button>
        </div>
      </div>
      <div class="setting-item" id="settings_item_default_wallet_analytics">
        <div class="setting-item_title flex-fill mb-2">Analytics
          <span class="setting-item_sub">Share where you click. No identifying data is collected.</span>
        </div>
        <div class="setting-item_control" id="analytics_toggle_button">
          <toggle-button :css-colors="true" :value="analyticsEnabled" @change="e => setAnalyticsEnable(e.value)"/>
        </div>
      </div>
      <div class="setting-item" id="settings_item_wallet_logs">
        <div class="setting-item_title flex-fill mb-2">Wallet Logs
          <span class="setting-item_sub">The wallet logs contain your public information such as addresses and transactions.</span>
        </div>
        <div class="setting-item_control">
          <button class="btn btn-outline-primary" id="download_logs_button" @click="downloadLogs">Download Logs</button>
        </div>
      </div>
      <div class="settings-footer">
        <div id="settings_app_version">
          <router-link to="/settings/experiments">
            <span class="text-muted">
              Version {{ appVersion }}
            </span>
          </router-link>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { version } from '../../package.json'
import { isEthereumChain } from '@liquality/cryptoassets'
import buildConfig from '@/build.config'
import { downloadFile, getWalletStateLogs } from '@/utils/export'
import NavBar from '@/components/NavBar.vue'
import ChainDropdown from '@/components/ChainDropdown'

export default {
  components: {
    NavBar,
    ChainDropdown
  },
  data: function () {
    return {
      forgetAllDappsDone: false
    }
  },
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'injectEthereum',
      'injectEthereumChain'
    ]),
    ...mapGetters([
      'analyticsEnabled'
    ]),
    ethereumChains () {
      return buildConfig.chains.filter(isEthereumChain)
    },
    appVersion () {
      return version
    }
  },
  methods: {
    ...mapActions([
      'enableEthereumInjection',
      'disableEthereumInjection',
      'setEthereumInjectionChain',
      'setAnalyticsResponse',
      'initializeAnalytics',
      'trackAnalytics',
      'forgetDappConnections'
    ]),
    toggleInjectEthereum (enable) {
      if (enable) {
        this.enableEthereumInjection()
      } else {
        this.disableEthereumInjection()
      }
      this.trackAnalytics({
        event: 'Settings',
        properties: {
          category: 'Settings',
          action: 'Default Web3 Wallet Updated',
          label: `${enable}`
        }
      })
    },
    updateInjectEthereumChain (chain) {
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
    async setAnalyticsEnable (enable) {
      await this.setAnalyticsResponse({ accepted: enable })
      if (enable) {
        await this.initializeAnalytics()
      }
      this.trackAnalytics({
        event: 'Analytics Updated',
        properties: {
          category: 'Settings',
          action: 'Analytics toggle button on/off',
          label: `${enable}`
        }
      })
    },
    async downloadLogs () {
      const logs = await getWalletStateLogs()
      downloadFile({
        filename: 'Liquality Wallet Logs.json',
        type: 'application/javascript;charset=utf-8;',
        content: logs
      })
      this.trackAnalytics({
        event: 'Download logs',
        properties: {
          category: 'Settings',
          action: 'Wallet Logs Accessed'
        }
      })
    },
    async forgetAllDappConnections () {
      this.trackAnalytics({
        event: 'Forgot all Dapp Connections',
        properties: {
          category: 'Settings',
          action: 'Forgot all Dapp Connections'
        }
      })
      this.forgetAllDappsDone = false
      await this.forgetDappConnections()
      this.forgetAllDappsDone = true
      setTimeout(() => {
        this.forgetAllDappsDone = false
      }, 4000)
    }
  },
  created () {
    this.forgetAllDappsDone = false
  }
}
</script>

<style lang="scss">
.settings {
  overflow-y: auto;

  .setting-item {
    border-bottom: 1px solid $hr-border-color;
    padding: 16px 20px;

    &_control {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    &_sub {
      display: block;
      font-size: $font-size-tiny;
      color: $text-muted;
    }
  }

  .settings-footer {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>
