<template>
  <Modal v-if="open" @close="close" body-class="">
    <template #header>
      <h6>
        What's New
      </h6>
    </template>
    <template>
      <div class="items">
        <div class="item">
          <div class="item-icon">
            <ChartIcon />
          </div>
          <div class="item-content">
            <pre>Ability to export private keys</pre>
            <pre>Terra integration</pre>
            <pre>Bug fixes and improvements</pre>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
     <div class="footer">
       <div class="text-muted">Version {{ appVersion }}</div>
        <button class="btn btn-outline-clear"
                id="wats_new_close_btn"
                @click="close">
        Close
      </button>
     </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import ChartIcon from '@/assets/icons/chart_icon.svg'
import { version } from '../../package.json'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    Modal,
    ChartIcon
  },
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    ...mapState(['watsNewModalVersion', 'termsAcceptedAt', 'unlockedAt']),
    appVersion () {
      return version
    }
  },
  methods: {
    ...mapActions(['setWatsNewModalShowed']),
    close () {
      this.open = false
    }
  },
  created () {
    if (this.watsNewModalVersion !== this.appVersion) {
      this.open = true
      this.setWatsNewModalShowed({ version: this.appVersion })
    }
  }
}
</script>

<style lang="scss" scoped>
h6 {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
}

.items {
  overflow-y: auto;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100% auto;
  padding: 0px 0px 40px 0px;

  .item {
    display: flex;
    border-bottom: 1px solid $hr-border-color;
    align-items: flex-start;
    padding: 20px 0px;

    .item-icon {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      height: 35px;
      padding: 0px 0px 0px 20px;
      svg {
        height: 100%;
      }
    }

    .item-content {
      padding: 0px 20px;
    }
  }
}

.footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;

    .btn {
      margin-top: 20px;
    }
}
</style>
