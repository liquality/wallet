<template>
  <div class="asset-list">
    <div class="main-content">
      <div class="form asset-list-header">
        <div class="input-group">
          <SearchIcon />
          <input
            type="text"
            ref="search"
            class="form-control form-control-sm"
            id="search_for_a_currency"
            v-model="search"
            :placeholder="$t('common.searchForCurrency')"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="list-items">
        <WalletAccounts
          @item-selected="onAccountSelected"
          :search="search"
          :accounts="accounts"
          :isAssetList="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SearchIcon from '@/assets/icons/search.svg'
import WalletAccounts from '@/components/WalletAccounts'
import { mapGetters, mapState } from 'vuex'
import { isEvmChain } from '@liquality/cryptoassets'

export default {
  computed: {
    ...mapState(['activeNetwork']),
    ...mapGetters(['accountsData', 'accountsWithBalance', 'chainAssets']),
    accounts() {
      return (this.assetSelection === 'from' ? this.accountsWithBalance : this.accountsData)
        .filter((acc) => {
          if (
            isEvmChain(this.activeNetwork, this.account.chain) && // from
            isEvmChain(this.activeNetwork, acc.chain) && // to
            this.assetSelection === 'to'
          ) {
            return this.account.addresses[0] === acc.addresses[0]
          }
          return true
        })
        .map((acc) => {
          const assets = this.chainAssets[acc.chain].filter((asset) => asset !== this.excludeAsset)
          return {
            ...acc,
            assets
          }
        })
        .filter((acc) => {
          return acc.assets?.length > 0
        })
    }
  },
  components: {
    WalletAccounts,
    SearchIcon
  },
  props: {
    account: Object,
    toAccount: Object,
    assetSelection: String,
    excludeAsset: String
  },
  data() {
    return {
      search: ''
    }
  },
  methods: {
    onAccountSelected({ account, asset }) {
      const _asset = asset || account.assets[0]
      this.$emit('asset-selected', {
        accountId: account.id,
        asset: _asset
      })
    }
  },
  created() {
    this.$nextTick(() => this.$refs.search.focus())
  }
}
</script>

<style lang="scss">
.asset-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  .asset-list-nav {
    font-weight: normal;
    text-transform: uppercase;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .asset-list-header {
      display: flex;
      align-items: center;
      padding-left: 15px;
      padding-right: 15px;
      height: 70px;

      .input-group {
        align-items: center;
        height: 30px;

        input {
          padding-left: 20px;
        }

        svg {
          position: absolute;
          left: 0;
          top: 5px;
          width: 16px;
          margin-right: 8px;
        }
      }
    }

    .list-items {
      overflow-y: auto;
    }
  }
}
</style>
