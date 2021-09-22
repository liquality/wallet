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
      <div
        v-for="chain in chains"
        :key="chain.code"
        class="chain-item"
        :id="'chain-item-' + chain.code"
      >
        <div class="chain-item-toggle" :id="'chain-item-toggle-' + chain.code">
          <toggle-button
            :css-colors="true"
            :value="isChainEnabled(chain.id)"
            @change="(e) => toogleBlockchain(chain.id, e.value)"
          />
        </div>
        <div class="chain-item-content">
          <img
              :src="getAssetIcon(chain.nativeAsset)"
              class="asset-icon chain-item-icon"
            />
           <div class="chain-item-details">
              <div
              class="chain-item-name"
              :id="'chain-item-name-' + chain.id"
            >
              {{ chain.name }}
            </div>
             <div
              class="chain-item-balance"
              :id="'chain-item-balance-' + chain.id"
            >
              {{ '$00.00' }}
            </div>
           </div>
            <router-link to="/accounts/create"
                         class="create-link"
                         v-tooltip="'Create Account'">
              <CreateIcon />
            </router-link>
        </div>
        <div class="chain-item-accounts">

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import { getAssetIcon } from '@/utils/asset'
import NavBar from '@/components/NavBar.vue'
import buildConfig from '@/build.config'
import { chains } from '@liquality/cryptoassets'
import CreateIcon from '@/assets/icons/create_icon.svg'

export default {
  components: {
    NavBar,
    CreateIcon
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['accountsData']),
    ...mapState(['activeNetwork', 'activeWalletId', 'enabledChains']),
    chains () {
      return buildConfig.chains.map((chainId) => {
        const { name, code, nativeAsset } = chains[chainId]
        return {
          id: chainId,
          name,
          code,
          nativeAsset
        }
      })
    }
  },
  methods: {
    ...mapActions({
      _toogleBlockchain: 'toogleBlockchain',
      _toogleAccount: 'toogleAccount'
    }),
    getAssetIcon,
    getAssetName (asset) {
      return cryptoassets[asset]?.name || asset
    },
    isChainEnabled (chainId) {
      return this.enabledChains[this.activeWalletId]?.[
        this.activeNetwork
      ]?.includes(chainId)
    },
    toogleBlockchain (chainId, enable) {
      this._toogleBlockchain({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId,
        enable
      })
    },
    toogleAccount (accountId, enable) {
      this._toogleAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        accountId,
        enable
      })
    }
  }
}
</script>

<style lang="scss">
.manage-accounts {
  display: flex;
  flex-direction: column;
  min-height: 0;

  .remove-btn {
    margin-left: 5px;
  }

  &_customText {
    font-size: $font-size-lg;
  }

  &_bottomSection {
    width: 100%;
    position: absolute;
    bottom: 0;
  }

  .chain-list {
    overflow-y: auto;
  }
}

.chain-item {
  width: 100%;
  border-bottom: 1px solid $hr-border-color;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 16px;

  .chain-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    width: 100%;

     .chain-item-icon {
        margin-right: 8px;
      }

      .create-link {
        width: 20px;
        svg {
          width: 10px;
        }
      }

    .chain-item-details {
      display: flex;
      flex-direction: column;
      width: 100%;

      .chain-item-name {
        color: $color-text-primary;
        font-weight: 400;
      }

      .chain-item-balance {
        display: block;
        font-size: $font-size-tiny;
        color: $text-muted;
      }

    }
  }
}
</style>
