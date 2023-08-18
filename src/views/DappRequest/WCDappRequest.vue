<template>
  <div class="wrapper">
    <div class="wrapper_top form">
      <div v-if="error" class="mt-4 text-danger"><strong>Error:</strong> {{ error }}</div>

      <template v-else>
        <div class="form-group">
          <label>To</label>
          <p class="confirm-value">{{ 'to' }}</p>
        </div>
        <div class="form-group">
          <label>Request</label>
          <pre class="request-payload">
            <code>{{ request }}</code>
        </pre>
        </div>
      </template>
    </div>

    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="reject">
          {{ $t('common.cancel') }}
        </button>
        <button class="btn btn-primary btn-lg btn-icon" @click.stop="approve" :disabled="loading">
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>{{ $t('common.confirm') }}</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    SpinnerIcon
  },
  data() {
    return {
      error: null,
      loading: false
    }
  },
  methods: {
    ...mapActions('app', ['respondSessionRequest']),
    async approve() {
      const resp = await this.respondSessionRequest({ payload: this.request, accept: true })
      console.log('reject', resp)
      window.close()
    },
    async reject() {
        const resp = await this.respondSessionRequest({ payload: this.request, accept: false })
        console.log('reject', resp)
        window.close()
    }
  },
  computed: {
    ...mapState('app', ['wcSessionRequests']),
    request() {
      const index = this.wcSessionRequests?.findIndex(
        (r) => r.id == parseInt(this.$route.query.id) && r.topic === this.$route.query.topic
      )
      if (index >= 0) {
        return this.wcSessionRequests[index]
      }
      return null
    }
  }
}
</script>
<style lang="scss" scoped>
.request-payload {
  background: #f4f4f4;
  border: 1px solid #ddd;
  border-left: 3px solid #4866d3;
  color: #666;
  page-break-inside: avoid;
  font-family: monospace;
  font-size: smaller;
  margin-bottom: 1.6em;
  max-width: 100%;
  overflow: auto;
  display: block;
  word-wrap: break-word;
  height: 25rem;
}
</style>
