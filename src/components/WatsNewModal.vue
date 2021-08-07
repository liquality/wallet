<template>
   <Modal v-if="open" @close="close">
      <template #header>
         <h6>
           Wat's New
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
            Close
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
      open: false
    }
  },
  computed: {
    ...mapState([
      'watsNewModalShowed'
    ])
  },
  methods: {
    ...mapActions([
      'setWatsNewModalShowed'
    ]),
    close () {
      this.open = false
    }
  },
  created () {
    if (!this.watsNewModalShowed) {
      this.open = true
      this.setWatsNewModalShowed({ showed: true })
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
