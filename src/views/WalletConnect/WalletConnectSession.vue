<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="d-flex justify-content-between">
        <h5>{{ $t('pages.enable.selectAccounts') }}</h5>
      </div>

      <div class="list-items">
        <NetworkAccounts
          @item-selected="onAccountSelected"
          :search="search"
          :account-id="selectedAccount ? selectedAccount.id : null"
          :accounts="accounts"
        />
      </div>
    </div>
    <div class="wrapper_sub">
      <SpinnerIcon class="btn-loading" v-if="!session" />
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" id="cancel-button" @click="cancel">
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary btn-lg btn-icon"
          id="wc-pair-button"
          @click="approve"
          :disabled="loading || error || !session"
        >
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>Approve</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import NetworkAccounts from '@/components/NetworkAccounts'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { mapState, mapGetters, mapActions } from 'vuex'
import { ChainId } from '@liquality/cryptoassets'

let sessionSubscription = null

export default {
  components: {
    NetworkAccounts,
    SpinnerIcon
  },
  data() {
    return {
      loading: false,
      error: null,
      search: '',
      session: null,
      selectedAccount: null
    }
  },
  computed: {
    ...mapState(['activeNetwork']),
    ...mapGetters(['accountsData']),
    accounts() {
      return this.accountsData.filter((account) => account.chain === ChainId.Ethereum)
    }
  },
  methods: {
    ...mapActions('app', ['approveSession']),
    onAccountSelected({ account }) {
      this.selectedAccount = account
    },
    async approve() {
      if (this.session) {
        await this.approveSession({
          session: this.session,
          accounts: [this.selectedAccount.addresses]
        })
      }
    },
    cancel() {
      chrome.tabs.getCurrent((tab) => {
        if (tab !== undefined) {
          chrome.tabs.remove([tab.id])
        }
      })
    }
  },
  async created() {
    sessionSubscription = this.$store.subscribe((mutation) => {
      const { type, payload } = mutation

      if (type === '##BACKGROUND##app/ADD_WALLET_CONNNECT_SESSION_PROPOSAL') {
        this.session = payload.session
      }
    })
  },
  beforeDestroy() {
    if (sessionSubscription) {
      sessionSubscription()
    }
  }
}
</script>

<style lang="scss"></style>
