<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="form">
        <div class="input-group">
          <p>
            <span class="input-group-text"> URI </span>
          </p>
          <input
            type="text"
            autocomplete="off"
            class="form-control form-control-sm"
            v-model="rawUri"
            placeholder="Paste the WC Uri"
            required
            :class="{ 'is-invalid': error }"
          />
        </div>
        <small class="text-danger form-text text-right" v-if="error">
          {{ error }}
        </small>
      </div>
    </div>
    <div class="wrapper_sub">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" id="cancel-button" @click="cancel">
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary btn-lg btn-icon"
          id="wc-pair-button"
          @click="pair"
          :disabled="loading || error || !rawUri"
        >
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>Connect</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    SpinnerIcon
  },
  data() {
    return {
      rawUri: null,
      loading: false,
      error: null
    }
  },
  computed: {},
  methods: {
    ...mapActions('app', ['pairSignClient']),
    async pair() {
      if (this.rawUri) {
        try {
          await this.pairSignClient({ uri: this.rawUri })
          this.$router.push({ name: 'WalletConnectSession' })
        } catch (err) {
          console.error(err)
          this.error = 'Error when trying to pair the Wallet Connect Connection'
        }
      } else {
        this.error = 'Please paste the Wallet Connect Uri'
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
    if (this.$route.query.uri) {
      this.rawUri = decodeURIComponent(this.$route.query.uri)
    }
  }
}
</script>

<style lang="scss"></style>
