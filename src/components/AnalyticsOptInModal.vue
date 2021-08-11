<template>
   <Modal v-if="open" @close="close">
      <template #header>
         <h6>
           Help us to improve Liquality for you
         </h6>
      </template>
       <template>
         <div class="notification-content">
           Share where you click. There is no identifying data,
           this permission can be revoked any time.
         </div>
       </template>
       <template #footer>
         <button class="btn btn-outline-clear"
                @click="reject"
                :disabled="loading">
            No, ask me again
          </button>
          <button class="btn btn-outline-clear"
                  @click="accept"
                  :disabled="loading">
            Yes, I'll share
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
      loading: false
    }
  },
  computed: {
    ...mapState({
      analyticsOptInModalOpen: state => state.app.analyticsOptInModalOpen
    }),
    open () {
      return this.analyticsOptInModalOpen
    }
  },
  methods: {
    ...mapActions('app', [
      'setAnalyticsOptInModalOpen'
    ]),
    ...mapActions([
      'setAnalyticsResponse',
      'initializeAnalytics'
    ]),
    close () {
      this.setAnalyticsOptInModalOpen({ open: false })
    },
    async accept () {
      this.loading = true
      await this.setAnalyticsResponse({ accepted: true })
      await this.initializeAnalytics()
      this.loading = false
      this.close()
    },
    async reject () {
      this.loading = true
      await this.setAnalyticsResponse({ accepted: false })
      this.loading = false
      this.close()
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
