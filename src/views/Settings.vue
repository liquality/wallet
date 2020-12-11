<template>
  <div>
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="wallet_header"><strong>Settings</strong></span>
    </NavBar>
    <div class="settings">
      <div class="setting-item">
        <div class="setting-item_title flex-fill">Default Web3 Wallet
          <span class="setting-item_sub">Set Liquality as the default dapp wallet. Other wallets cannot interact with dapps while this is enabled.</span>
        </div>
        <div class="setting-item_control">
          <toggle-button  :css-colors="true" :value="injectEthereum" @change="e => toggleInjectEthereum(e.value)" />
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item_title flex-fill">Web3 Asset
          <span class="setting-item_sub">Select which ethereum based asset should be used for dapps.</span>
        </div>
        <div class="setting-item_control">
          <select class="custom-select" @change="e => updateInjectEthereumAsset(e.target.value)">
            <option v-for="asset in ethereumAssets" :key="asset" :selected="injectEthereumAsset === asset">{{ asset }}</option>
          </select>
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
import cryptoassets from '@/utils/cryptoassets'
import NavBar from '@/components/NavBar.vue'
import { isEthereumChain } from '@/utils/asset'
import { version } from '../../package.json'

export default {
  components: {
    NavBar
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'injectEthereum', 'injectEthereumAsset']),
    ethereumAssets () {
      return Object.keys(cryptoassets).filter(isEthereumChain)
    },
    appVersion () {
      return version
    }
  },
  methods: {
    ...mapActions(['enableEthereumInjection', 'disableEthereumInjection', 'setEthereumInjectionAsset']),
    toggleInjectEthereum (enable) {
      if (enable) this.enableEthereumInjection()
      else this.disableEthereumInjection()
    },
    updateInjectEthereumAsset (asset) {
      this.setEthereumInjectionAsset({ asset })
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
  height: 600px;

  .setting-item {
    width: 100%;
    border-bottom: 1px solid $hr-border-color;
    padding: 16px 20px;

    &_control {
      text-align: right;

      .custom-select {
        width: auto;
        border-bottom: 1px solid $primary;
      }
    }

    &_sub {
      display: block;
      font-size: $font-size-tiny;
      color: $text-muted;
    }
  }

  .settings-footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>
