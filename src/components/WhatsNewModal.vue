<template>
  <Modal v-if="open" @close="close" body-class="">
    <template #header>
      <h6>{{ $t('components.whatsNew.title') }}</h6>
    </template>
    <template>
      <div class="items">
        <div class="item">
          <div class="item-icon">
            <ChartIcon />
          </div>
          <div class="item-content">
            <h3>RC 0.73.0</h3>
            <pre class="text-wrap">
- Send, receive and swap tokens in your brand new OP address</pre
            >
            <h3>Unstoppable Domains integration</h3>
            <pre class="text-wrap">
- Now you can send tokens to a human-readable address like liquality.crypto</pre
            >
            <pre class="text-wrap">
- This integration works on Bitcoin, Ethereum, Arbitrum, Avalanche, Polygon and Solana blockchains</pre
            >
            <h3>NFT bug fixes</h3>
          </div>
        </div>
      </div>
    </template>
    <template>
      <h6 class="subHeader">Did you know you can…</h6>
    </template>
    <template>
      <div class="items">
        <div class="item">
          <div class="item-icon">
            <ChartIcon />
          </div>
          <div class="item-content">
            <pre class="text-wrap">
Use Optimism to access a dApp like Aave or Curve Finance and pay only a few cents for every transaction?</pre
            >
            <pre class="text-wrap">
Send your ETH assets there using our built-in cross-chain swap feature.</pre
            >
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="footer">
        <div class="text-muted">{{ $t('common.version') }} {{ appVersion }}</div>
        <button class="btn btn-outline-clear" id="wats_new_close_btn" @click="close">Close</button>
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
    ...mapState(['whatsNewModalVersion', 'termsAcceptedAt', 'unlockedAt']),
    appVersion() {
      return version
    }
  },
  methods: {
    ...mapActions(['setWhatsNewModalVersion']),
    close() {
      this.open = false
    }
  },
  created() {
    if (this.whatsNewModalVersion !== this.appVersion) {
      this.open = true
      this.setWhatsNewModalVersion({ version: this.appVersion })
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

h3 {
  font-style: normal;
  font-weight: 300;
  font-size: 10px;
  line-height: 20px;
  text-transform: uppercase;
}

.subHeader {
  padding-left: 20px;
}

.items {
  overflow-y: auto;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
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

.header {
  display: flex;
  width: 100%;
  align-items: center;
}
</style>
