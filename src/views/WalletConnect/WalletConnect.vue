<template>
  <div class="full-tab-container">
    <div class="full-tab-content full-height">
      <div class="full-tab-header">
        <Logo class="logo" />
      </div>
      <div class="full-tab-body">
        <h4 class="modal-header mt-4 mb-3 text-uppercase text-center">Wallet Connect</h4>
        <Connections
          v-if="currentView === 'connections'"
          @paired="onPair"
          :pair-request="pairRequest"
        />
        <SessionRequest
          :pairing-topic="pairingTopic"
          @cancel="onSessionCancel"
          @approved="onSessionApproved"
          v-if="currentView === 'session-request'"
        />
      </div>
    </div>
    <Modal v-if="modalProposal" type="modal-lg" @close="onCancelNewProposal">
      <template #title>
        <h6 class="modal-header mt-4 text-uppercase">New Session Proposal</h6>
      </template>
      <div class="list-items">
        {{ modalProposal.proposer.metadata.url }}
      </div>
      <template #footer>
        <button class="btn btn-light btn-outline-primary btn-block" @click="onCancelNewProposal">
          Cancel
        </button>
        <button
          class="btn btn-primary btn-block"
          @click="onPair({ topic: modalProposal.pairingTopic })"
        >
          Ok
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import Connections from './Connections'
import SessionRequest from './SessionRequest'
import Modal from '@/components/Modal'
import Logo from '@/assets/icons/logo_left.svg'
import { mapState } from 'vuex'

export default {
  components: {
    Logo,
    Connections,
    SessionRequest,
    Modal
  },
  props: {
    sessionRequest: {
      type: String,
      required: false,
      default: null
    },
    pairRequest: {
      type: String,
      required: false,
      default: null
    },
    methodRequest: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      rawUri: null,
      currentView: '',
      pairingTopic: null,
      modalProposal: null
    }
  },
  computed: {
    ...mapState({
      proposals: (state) => state.app.wcSessionProposals
    }),
    currentViewFromProps() {
      if (this.pairRequest) {
        return 'connections'
      } else if (this.sessionRequest) {
        return 'session-request'
      } else if (this.methodRequest) {
        return 'method-request'
      } else {
        return 'connections'
      }
    }
  },
  methods: {
    async onPair({ topic }) {
      this.pairingTopic = topic
      this.currentView = 'session-request'
      this.modalProposal = null
    },
    onSessionCancel() {
      this.currentView = 'connections'
    },
    onSessionApproved() {
      this.currentView = 'connections'
    },
    onCancelNewProposal() {
      this.modalProposal = null
    }
  },
  async created() {
    this.currentView = this.currentViewFromProps
  },
  watch: {
    proposals() {
      if (this.proposals && this.proposals.length > 0) {
        const reversed = [...this.proposals].reverse()
        this.modalProposal = reversed[0]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  width: 10em;
}
</style>
