<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title">
        {{ $t('pages.enable.connectRequest') }}
      </span>
    </NavBar>
    <div>
      <div class="d-flex justify-content-between">
        <h5>{{ $t('pages.enable.selectAccounts') }}</h5>
        <div v-if="isEthereumConnection" id="filter_by_chain">
          <ChainDropdown
            :chains="ethereumChains"
            :selected="selectedChain"
            @chain-changed="onChainSelected"
            :select-label="$t('pages.enable.filterByChain')"
            :right="true"
          />
        </div>
      </div>

      <div class="list-items">
        <NetworkAccounts
          @item-selected="onAccountSelected"
          :search="search"
          :account-id="selectedAccount ? selectedAccount.id : null"
          :accounts="accounts"
        />
      </div>
      <p><button @click="pair">Pair</button></p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import NavBar from '@/components/NavBar'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      uri: null
    }
  },
  computed: {
    ...mapState({
      wcSessions: (state) => state.app?.wcSessions,
      wcRequests: (state) => state.app?.wcRequests
    })
  },
  methods: {
    ...mapActions('app', ['initializeSignClient', 'pairSignClient']),
    async pair() {
      const uri = decodeURIComponent(this.uri)
      console.log('uri', uri)
      await this.pairSignClient({ uri })
    }
  },
  async created() {
    this.uri = encodeURIComponent(this.$route.query.uri)
    console.log('url', this.uri)
  }
}
</script>

<style lang="scss"></style>
