<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="row" v-if="sessionProposal">
        <div class="col">
          <div class="row">
            <div class="col">
              <div class="d-flex justify-content-between">
                <h5>Proposer</h5>
              </div>
              <div class="list-items">
                <ul class="list-group">
                  <li class="list-group-item">Name: {{ proposerInfo.name }}</li>
                  <li class="list-group-item">Description: {{ proposerInfo.description }}</li>
                  <li class="list-group-item">
                    Url: <a :href="proposerInfo.url" target="_blank">{{ proposerInfo.url }}</a>
                  </li>
                  <li
                    class="list-group-item"
                    v-if="proposerInfo.icons && proposerInfo.icons.length > 0"
                  >
                    <img :src="proposerInfo.icons[0]" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col">
              <div class="d-flex justify-content-between">
                <h5>Required Namespaces</h5>
              </div>
              <div class="list-items" v-for="(ns, key) in namespaces" :key="key">
                <h6>{{ key }}</h6>
                <ul class="list-group">
                  <li class="list-group-item">Chains: {{ ns.chains.join(', ') }}</li>
                  <li class="list-group-item">Events: {{ ns.events.join(', ') }}</li>
                  <li class="list-group-item">Methods: {{ ns.methods.join(', ') }}</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col">
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
          </div>
        </div>
      </div>
      <div class="text-center" v-else>
        <SpinnerIcon class="btn-loading" v-if="!sessionProposal" />
      </div>
    </div>
    <div class="button-group mt-4">
      <button class="btn btn-light btn-outline-primary block" id="cancel-button" @click="cancel">
        {{ $t('common.cancel') }}
      </button>
      <button
        class="btn btn-primary btn-block btn-icon"
        id="wc-pair-button"
        @click="approve"
        :disabled="!selectedAccount || loading || error || !sessionProposal"
      >
        <SpinnerIcon class="btn-loading" v-if="loading" />
        <template v-else>Approve</template>
      </button>
    </div>
  </div>
</template>

<script>
import NetworkAccounts from '@/components/NetworkAccounts'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { mapState, mapGetters, mapActions } from 'vuex'
import { ChainId } from '@liquality/cryptoassets'

export default {
  props: {
    pairingTopic: {
      type: String
    }
  },
  components: {
    NetworkAccounts,
    SpinnerIcon
  },
  data() {
    return {
      loading: false,
      error: null,
      search: '',
      selectedAccount: null
    }
  },
  computed: {
    ...mapState({
      proposals: (state) => state.app.wcSessionProposals
    }),
    ...mapState(['activeNetwork']),
    ...mapGetters(['accountsData']),
    accounts() {
      return this.accountsData.filter((account) => account.chain === ChainId.Ethereum)
    },
    sessionProposal() {
      if (this.pairingTopic) {
        const index = this.proposals.findIndex((s) => s.pairingTopic === this.pairingTopic)
        if (index >= 0) {
          return this.proposals[index]
        }
      }
      return null
    },
    proposerInfo() {
      return this.sessionProposal?.proposer.metadata || {}
    },
    namespaces() {
      return this.sessionProposal?.requiredNamespaces || {}
    }
  },
  methods: {
    ...mapActions('app', ['approveSession', 'rejectSession']),
    onAccountSelected({ account }) {
      this.selectedAccount = account
    },
    async approve() {
      if (this.selectedAccount && this.sessionProposal) {
        await this.approveSession({
          proposal: this.sessionProposal,
          accounts: [this.selectedAccount.addresses]
        })
        this.$emit('approved')
      }
    },
    async cancel() {
      this.rejectSession({ propsal: this.sessionProposal })
      this.$emit('cancel')
    }
  },
  created() {
    console.log('pairingTopic', this.pairingTopic)
  }
}
</script>

<style lang="scss"></style>
