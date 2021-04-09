<template>
  <div class="asset-list">
    <div class="main-content">
      <div class="form asset-list-header">
        <div class="input-group">
              <SearchIcon/>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="search"
                placeholder="Search for a Currency"
                autocomplete="off"
              />
        </div>
      </div>
      <div class="list-items">
        <WalletAccounts @item-selected="onAccountSelected"
                        :search="search"
                        :accounts="accountsData"/>
      </div>
    </div>
  </div>
</template>

<script>
import SearchIcon from '@/assets/icons/search.svg'
import WalletAccounts from '@/components/WalletAccounts'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['accountsData']),
    accounts () {
      if (this.excludeAsset) {
        return this.accountsData.filter(a => {
          const assets = a.assets.filter(
            asset => {
              if (this.assetSelection === 'to') {
                if (this.selectedMarket[asset] &&
                    asset !== this.excludeAsset) {
                  return true
                }
                return false
              }
              return asset !== this.excludeAsset
            }
          )
          return {
            ...a,
            assets
          }
        })
      }
      return this.accountsData
    }
  },
  components: {
    WalletAccounts,
    SearchIcon
  },
  props: [
    'excludeAsset',
    'selectedMarket',
    'assetSelection'
  ],
  data () {
    return {
      search: '',
      filteredItems: []
    }
  },
  methods: {
    onAccountSelected ({ account, asset }) {
      const _asset = asset || account.assets[0]
      this.$emit('asset-selected', {
        accountId: account.id,
        asset: _asset
      })
    }
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
