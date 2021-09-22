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
        class="chain-item d-flex align-items-center"
        :id="'chain-item-' + chain.code"
      >
        <div class="chain-item-content">
          <div class="chain-item-row">
            <div class="chain-item-toggle" :id="'chain-item-toggle-' + chain.code">
          <toggle-button
            :css-colors="true"
            :value="isChainEnabled(chain.id)"
            @change="(e) => toggleChain(chain.code, e.value)"
          />
        </div>
        <img :src="getAssetIcon(chain.nativeAsset)" class="asset-icon chain-item-icon" />
        <div class="chain-item-name flex-fill" :id="'chain-item-name-' + chain.code">
          {{ chain.name }}
        </div>
          </div>
          <div class="chain-item-row">
            ----
          </div>
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

export default {
  components: {
    NavBar
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapGetters(['accountsData']),
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'enabledChains'
    ]),
    chains () {
      return buildConfig.chains.map(chainId => {
        const {
          name,
          code,
          nativeAsset
        } = chains[chainId]
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
    ...mapActions(['toogleEnabledChain']),
    getAssetIcon,
    getAssetName (asset) {
      return cryptoassets[asset]?.name || asset
    },
    isChainEnabled (chainId) {
      return this.enabledChains[this.activeWalletId]?.[this.activeNetwork]?.includes(chainId)
    },
    toggleChain (chainId, enable) {
      this.toogleEnabledChain({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId,
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
  height: 60px;
  padding: 16px 20px;

  .chain-item-content {
    display: flex;
    width: 100%;
    flex-direction: column;

    .chain-item-row {
      display: flex;
      width: 100%;

      .chain-item-icon {
        margin-right: 8px;
      }

      .chain-item-toggle {
        text-align: right;
        margin-right: 8px;
      }

      .chain-item-name {
        //
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
