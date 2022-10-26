<template>
  <Modal v-if="open" @close="close">
    <!-- <div class="analytics-optin"> -->
    <template #header>
      <!-- <h6>Help us to improve Liquality for you</h6> -->
      <div class="analytics-optin-title">
        {{ $t('components.analyticsOptinModal.title') }}
      </div>
    </template>
    <template>
      <div class="analytics-optin-message">
        {{ $t('components.analyticsOptinModal.message') }}
      </div>
    </template>
    <template #footer>
      <div class="analytics-optin-options">
        <div class="custom-control custom-radio">
          <input
            class="custom-control-input"
            type="radio"
            name="optin_anaylitics_option"
            id="optin_anaylitics_accept"
            autocomplete="off"
            :checked="accepted === true"
            @click="accept"
            :disabled="loading"
          />
          <label class="custom-control-label" for="optin_anaylitics_accept">
            {{ $t('components.analyticsOptinModal.analitycsAccept') }}
          </label>
        </div>
        <div class="custom-control custom-radio">
          <input
            class="custom-control-input"
            type="radio"
            name="optin_anaylitics_option"
            id="optin_anaylitics_reject"
            autocomplete="off"
            :checked="accepted === false"
            @click="reject"
            :disabled="loading"
          />
          <label class="custom-control-label" for="optin_anaylitics_reject">
            {{ $t('components.analyticsOptinModal.analitycsReject') }}
          </label>
        </div>
      </div>
      <button
        id="analytics-ok-close-button"
        class="btn btn-primary btn-lg btn-block btn-icon mt-3"
        @click="close('nextStep')"
        :disabled="loading || accepted === null"
      >
        {{ $t('common.ok') }}
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import { mapActions, mapState } from 'vuex'
export default {
  components: {
    Modal
  },
  data: function () {
    return {
      loading: false,
      accepted: true
    }
  },
  computed: {
    ...mapState({
      analyticsOptInModalOpen: (state) => state.app.analyticsOptInModalOpen,
      analyticsAccepted: (state) => state.analytics?.acceptedDate
    }),
    open() {
      return this.analyticsOptInModalOpen
    }
  },
  methods: {
    ...mapActions('app', ['setAnalyticsOptInModalOpen', 'initializeAnalytics']),
    ...mapActions(['setAnalyticsResponse']),
    close(payload) {
      this.accepted = null
      this.setAnalyticsOptInModalOpen({ open: false })
      if (payload === 'nextStep') {
        this.$emit('goToSetup')
      }
    },
    async accept() {
      this.loading = true
      this.accepted = true
      await this.setAnalyticsResponse({ accepted: this.accepted })
      await this.initializeAnalytics()
      this.loading = false
    },
    async reject() {
      this.loading = true
      this.accepted = false
      await this.setAnalyticsResponse({ accepted: this.accepted })
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .notification-text {
    font-size: $font-size-head-title;
    font-weight: 600;
    width: 200px;
  }
}
.btn {
  flex: 1;
}
</style>
