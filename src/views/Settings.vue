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
        <div class="setting-item_toggle">
          <toggle-button color="#9d4dfa" :value="injectEthereum" @change="e => toggleInjectEthereum(e.value)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'injectEthereum'])
  },
  methods: {
    ...mapActions(['enableEthereumInjection', 'disableEthereumInjection']),
    toggleInjectEthereum (enable) {
      if (enable) this.enableEthereumInjection()
      else this.disableEthereumInjection()
    }
  }
}
</script>

<style lang="scss">
.settings {
  overflow-y: auto;

  .setting-item {
    width: 100%;
    border-bottom: 1px solid $hr-border-color;
    padding: 16px 30px;

    &_toggle {
      text-align: right;
    }

    &_sub {
      display: block;
      font-size: $font-size-tiny;
      color: $text-muted;
    }
  }
}
</style>
