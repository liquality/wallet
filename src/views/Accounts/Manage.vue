<template>
  <div class="manage-accounts">
    <NavBar
      showMenu="false"
      showBack="true"
      backPath="/wallet"
      backLabel="Back"
    >
      <span class="wallet_header">
        <strong>Manage Accounts</strong>
      </span>
    </NavBar>
    <div class="chain-list">
      <ChainAccounts
        v-for="chain in chains"
        :chain="chain"
        :key="chain.id"
      />
  </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import NavBar from '@/components/NavBar.vue'
import buildConfig from '@/build.config'
import { chains } from '@liquality/cryptoassets'
import { formatFiat } from '@/utils/coinFormatter'
import { getAccountIcon } from '@/utils/accounts'
import ChainAccounts from './ChainAccounts.vue'

export default {
  components: {
    NavBar,
    ChainAccounts
  },
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'accounts'
    ]),
    chains () {
      return buildConfig.chains.map((chainId) => {
        const { name, code, nativeAsset } = chains[chainId]
        return {
          id: chainId,
          name,
          code,
          nativeAsset,
          accounts: this.getChainAccounts(chainId)
        }
      })
    }
  },
  methods: {
    getAccountIcon,
    formatFiat,
    getAssetName (asset) {
      return cryptoassets[asset]?.name || asset
    },
    getChainAccounts (chainId) {
      return this.accounts[this.activeWalletId]
        ?.[this.activeNetwork]
        .filter(a => a.chain === chainId)
    }
  }
}
</script>

<style lang="scss">
.account-search {
  border-bottom: 1px solid $hr-border-color;
  input {
    margin-right: 8px;
    padding-left: 20px;
  }

  a {
    padding-top: 20px;
  }

  .input-group {
    align-items: center;
    svg {
      position: absolute;
      left: 0;
      top: 5px;
    }
  }

  svg {
    width: 16px;
    margin-right: 8px;
  }
}

.manage-accounts {
  display: flex;
  flex-direction: column;
  min-height: 0;

  .chain-list {
    overflow-y: auto;
  }
}

.chain-item {
  display: flex;
  flex-direction: column;

  .list-item-icon {
    margin-left: 30px !important;
  }

  .chain-item-content {
    border-top: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 10px;
    width: 100%;

    .chain-item-icon {
      margin-right: 8px;
      margin-left: 8px;
    }

    .chain-item-name {
       width: 100%;
        color: $color-text-primary;
        font-weight: 400;
      }

      .chain-item-accounts-len {
          font-size: $font-size-tiny !important;
          color: $text-muted !important;
      }

      .chain-item-balance {
        display: block;
        font-size: $font-size-tiny;
        color: $text-muted;
      }

    .create-link {
      width: 20px;
      height: 20px;
      margin-right: 20px;
      svg {
        width: 20px;
      }
    }
  }
}

.account-color {
  width: 5px;
  height: 60px;
  position: absolute;
  left: 0;
  margin-right: 5px;
}

.custom-item {
  &:hover,
  &.active {
    background-color: #ffffff;
    color: $color-text-primary;
    cursor: default;
  }
}
</style>
