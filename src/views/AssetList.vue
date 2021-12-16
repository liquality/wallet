<template>
  <div class="asset-list">
    <NavBar showMenu="true"
            showBack="true"
            backPath="/wallet"
            backLabel="Overview">
      <span class="asset-list-nav">
        <strong>Select Asset</strong>
      </span>
    </NavBar>
    <div v-if="!accounts.length">
      <p class="no-funds-msg">
        No funds in the wallet
      </p>
    </div>
    <div v-else class="main-content">
      <div class="form asset-list-header">
        <div class="input-group">
              <SearchIcon/>
              <input
                type="text"
                ref="search"
                class="form-control form-control-sm"
                id="search_for_a_currency_search"
                v-model="search"
                placeholder="Search for a Currency"
                autocomplete="off"
              />
        </div>
      </div>
      <div class="list-items">
        <WalletAccounts @item-selected="onAccountSelected"
                        :search="search"
                        :accounts="accounts"/>
      </div>
    </div>
  </div>
</template>

<script>
import SearchIcon from '@/assets/icons/search.svg'
import WalletAccounts from '@/components/WalletAccounts'
import NavBar from '@/components/NavBar'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['accountsData', 'accountsWithBalance']),
    accounts () {
      return this.accountsData
    }
  },
  components: {
    NavBar,
    WalletAccounts,
    SearchIcon
  },
  props: [
    'action'
  ],
  data () {
    return {
      search: ''
    }
  },
  methods: {
    onAccountSelected ({ account, asset }) {
      const _asset = asset || account.assets[0]
      const _action = this.action === 'swap.send' ? 'swap' : this.action
      this.$router.push(`/accounts/${account.id}/${_asset}/${_action}?source=assets`)
    }
  },
  created () {
    this.$nextTick(() => this.$refs.search?.focus())
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

  .no-funds-msg {
    text-align: center;
    font-size: 0.8125rem;
    margin-top: 20px;
    font-weight: bold;
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
