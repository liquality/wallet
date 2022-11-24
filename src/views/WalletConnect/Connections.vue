<template>
  <div class="wrapper">
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
                v-model="rawUri"
                rows="8"
                cols="50"
                :disabled="paring"
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
            :disabled="paring || error || !rawUri"
          >
            <SpinnerIcon class="btn-loading" v-if="paring" />
            <template v-else>Connect</template>
          </button>
          <button
            class="btn btn-light btn-outline-primary btn-block"
            @click="cancelNewConnection"
            :disabled="paring"
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
              <h6>Connections</h6>
              <ul>
                <li v-for="(session, key) in sessions" :key="key">
                  {{ key }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="wrapper_bottom"></div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { parseUri } from '@walletconnect/utils'

export default {
  components: {
    SpinnerIcon
  },
  props: {
    pairRequest: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      showUriInput: false,
      uri: null,
      error: null,
      paring: false
    }
  },
  computed: {
    ...mapState({
      sessions: (state) => state.app?.walletConnectSessions || []
    })
  },
  methods: {
    startNewConnection() {
      this.showUriInput = true
    },
    cancelNewConnection() {
      this.showUriInput = false
    },
    ...mapActions('app', ['pairSignClient']),
    async pair() {
      if (this.uri) {
        try {
          await this.pairSignClient({ uri: this.uri })
          const { topic } = parseUri(this.uri)
          this.$emit('paired', { topic })
        } catch (err) {
          console.error(err)
          this.error = 'Error when trying to pair the Wallet Connect Connection'
        }
      } else {
        this.error = 'Please paste the Wallet Connect Uri'
      }
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
