<template>
  <Modal v-if="open" @close="close">
    <!-- <div class="analytics-optin"> -->
    <template #header>
      <!-- <h6>Help us to improve Liquality for you</h6> -->
      <div class="analytics-optin-title">Help us improve Liquality to better serve you</div>
    </template>
    <template>
      <div class="analytics-optin-message">
        Share where you click. There is no identifying data. This permission can be revoked any
        time.
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
            Sure, I will share my clicks
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
            Not today, ask me again
          </label>
        </div>
      </div>
      <button
        id="analytics-ok-close-button"
        class="btn btn-primary btn-lg btn-block btn-icon mt-3"
        @click="close('nextStep')"
        :disabled="loading || accepted === null"
      >
        Ok
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
      accepted: null
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
    font-weight: bold;
    width: 200px;
  }
}
.btn {
  flex: 1;
}
</style>
