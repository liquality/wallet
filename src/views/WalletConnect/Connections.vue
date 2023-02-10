<template>
  <div class="wrapper">
    <Modal v-if="modalConnection" type="modal-lg" @close="closeModalConnection">
      <template #title>
        <h6 class="modal-header mt-4 text-uppercase">Connection details</h6>
      </template>
      <!-- <div class="list-items">
        <ul class="list-group" v-if="modalPairing.peerMetadata && modalPairing.active">
          <li class="list-group-item">Name: {{ modalPairing.peerMetadata.name }}</li>
          <li class="list-group-item">Active: {{ modalPairing.active }}</li>
          <li class="list-group-item">Description: {{ modalPairing.peerMetadata.description }}</li>
          <li class="list-group-item">
            Url:
            <a :href="modalPairing.peerMetadata.url" target="_blank">{{
              modalPairing.peerMetadata.url
            }}</a>
          </li>
          <li
            class="list-group-item"
            v-if="modalPairing.peerMetadata.icons && modalPairing.peerMetadata.icons.length > 0"
          >
            <img :src="modalPairing.peerMetadata.icons[0]" />
          </li>
        </ul>
      </div> -->
      <textarea
        name="modalConnection"
        id="modalConnection"
        cols="30"
        rows="10"
        :value="JSON.stringify(modalConnection)"
      ></textarea>
      <template> </template>
      <template #footer>
        <button class="btn btn-primary btn-block" @click="onRemoveModalConnection">
          Remove Connection
        </button>
      </template>
    </Modal>
    <div class="wrapper_top">
      <div class="row">
        <div class="col text-muted">Connect your wallet with WalletConnect</div>
      </div>
      <div class="row" v-if="showUriInput">
        <div class="col">
          <form novalidate>
            <div class="form-group">
              <label for="raw-uri">Uri</label>
              <textarea
                class="form-control"
                name="raw-uri"
                v-model="uri"
                rows="8"
                cols="50"
                :disabled="isPairing"
              ></textarea>
              <small class="form-text text-muted">
                Please open your dapp and copy the WalletConnect uri.
              </small>
              <small class="form-text text-danger" v-if="error">
                {{ error }}
              </small>
            </div>
          </form>
          <button
            class="btn btn-primary btn-block"
            @click="pair"
            :disabled="isPairing || error || !uri"
          >
            <SpinnerIcon class="btn-loading" v-if="isPairing" />
            <template v-else>Connect</template>
          </button>
          <button
            class="btn btn-light btn-outline-primary btn-block"
            @click="cancelNewConnection"
            :disabled="isPairing"
          >
            Cancel
          </button>
        </div>
      </div>
      <div class="row" v-else>
        <div class="col">
          <div class="row mt-2">
            <div class="col">
              <button class="btn btn-primary btn-block" @click="startNewConnection">
                New Connection
              </button>
            </div>
          </div>
          <div class="row mt-5">
            <div class="col">
              <div class="d-flex justify-content-between">
                <h5>Connections</h5>
              </div>
              <div class="list-items">
                <ul class="list-group" v-for="(connection, key) in dappConnections" :key="key">
                  <li
                    class="list-group-item list-group-item-action"
                    @click="showModalConnection(connection)"
                  >
                    Url: {{ key }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { parseUri } from '@walletconnect/utils'
import Modal from '@/components/Modal'

export default {
  components: {
    SpinnerIcon,
    Modal
  },
  props: {
    pairRequest: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    ...mapGetters('app', ['dappConnections'])
  },
  data() {
    return {
      showUriInput: false,
      uri: null,
      error: null,
      isPairing: false,
      modalConnection: null
    }
  },
  methods: {
    startNewConnection() {
      this.showUriInput = true
    },
    cancelNewConnection() {
      this.showUriInput = false
      this.url = null
    },
    ...mapActions('app', ['pairSignClient', 'removeConnection']),
    async pair() {
      if (this.uri) {
        try {
          this.isPairing = true
          await this.pairSignClient({ uri: this.uri })
          const { topic } = parseUri(this.uri)
          this.url = null
          this.$emit('paired', { topic })
        } catch (err) {
          console.error(err)
          this.error = 'Error when trying to pair the Wallet Connect Connection'
        }
        this.isPairing = false
      } else {
        this.error = 'Please paste the Wallet Connect Uri'
      }
    },
    async onRemoveModalConnection() {
      if (this.modalConnection) {
        await this.removeConnection({ connection: this.modalConnection })
      }

      this.modalConnection = null
    },
    showModalConnection(conection) {
      this.modalConnection = conection
    },
    closeModalConnection() {
      this.modalConnection = null
    }
  },
  created() {
    if (this.pairRequest) {
      this.uri = decodeURIComponent(this.pairRequest)
    }
  }
}
</script>

<style lang="scss" scoped>
.form-control {
  border: 1px solid #d9dfe5;
  font-size: 0.8rem;
  font-weight: normal;
}
</style>
