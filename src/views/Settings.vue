<template>
  <div class="view-container">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="wallet_header"><strong>Settings</strong></span>
    </NavBar>
    <div class="settings">
      <div class="setting-item">
        <div class="setting-item_title flex-fill mb-2">Default Web3 Wallet
          <span class="setting-item_sub">Set Liquality as the default dapp wallet. Other wallets cannot interact with dapps while this is enabled.</span>
        </div>
        <div class="setting-item_control">
          <toggle-button  :css-colors="true" :value="injectEthereum" @change="e => toggleInjectEthereum(e.value)" />
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item_title flex-fill">Web3 Network
          <span class="setting-item_sub">Select which ethereum based network should be used for dapps.</span>
        </div>
        <div class="setting-item_control">
          <ChainDropdown :chains="ethereumChains"
                         :selected="injectEthereumChain"
                         @chain-changed="updateInjectEthereumChain" />
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item_title flex-fill mb-2">Wallet Logs
          <span class="setting-item_sub">The wallet logs contain your public information such as addresses and transactions.</span>
        </div>
        <div class="setting-item_control">
          <button class="btn btn-outline-primary" @click="downloadLogs">Download Logs</button>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item_title flex-fill mb-2">Use Ledger Live
          <span class="setting-item_sub">The Ledger Live brige allows to use your Ledger easily.</span>
        </div>
        <div class="setting-item_control">
          <toggle-button  :css-colors="true" :value="useLedgerLive" @change="e => toogleUseLedgerLive(e.value)" />
        </div>
      </div>
      <div class="settings-footer">
         <div class="text-muted">Version {{ appVersion }}</div>
        </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
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
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'injectEthereum',
      'injectEthereumChain',
      'useLedgerLive'
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
      'setUseLedgerLive'
    ]),
    toggleInjectEthereum (enable) {
      if (enable) this.enableEthereumInjection()
      else this.disableEthereumInjection()
    },
    async toogleUseLedgerLive (use) {
      await this.setUseLedgerLive({ use })
    },
    updateInjectEthereumChain (chain) {
      this.setEthereumInjectionChain({ chain })
    },
    async downloadLogs () {
      const logs = await getWalletStateLogs()
      downloadFile({ filename: 'Liquality Wallet Logs.json', type: 'application/javascript;charset=utf-8;', content: logs })
    }
  }
}
</script>

<style lang="scss">
.settings {
  overflow-y: auto;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  padding-bottom: 40px;

  .setting-item {
    width: 100%;
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
    width: 100%;
    bottom: 0;
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>
