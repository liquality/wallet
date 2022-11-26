<template>
  <Modal body-class="" type="modal-lg" isFullHeight :show-close="false">
    <template #header>
      <h6 class="modal-header mt-4 text-uppercase">Wallet Connect</h6>
    </template>

    <template>
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
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import Connections from './Connections'
import SessionRequest from './SessionRequest'

export default {
  components: {
    Modal,
    Connections,
    SessionRequest
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
      pairingTopic: null
    }
  },
  computed: {
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
    },
    onSessionCancel() {
      this.currentView = 'connections'
    },
    onSessionApproved() {
      this.currentView = 'connections'
    }
  },
  async created() {
    this.currentView = this.currentViewFromProps
  }
}
</script>

<style lang="scss"></style>
