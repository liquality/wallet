<template>
  <div>
    <div class="popup-logo">
      <LogoWallet />
    </div>
    <div class="enable-screen">
      <h1 class="h5 text-center mb-4">Request</h1>

      <h1 class="h5 text-center text-primary">{{origin}}</h1>
      <h2 class="h5 text-center mb-4">would like to connect to your wallet</h2>

      <p class="text-primary text-center">Make sure you trust this site</p>

      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Deny</button>
          <button class="btn btn-primary btn-lg btn-icon" @click="reply(true)">Allow</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  data () {
    return {
      replied: false
    }
  },
  components: {
    LogoWallet
  },
  computed: {
    origin () {
      return this.$route.query.origin
    }
  },
  methods: {
    ...mapActions(['replyOriginAccess']),
    reply (allowed) {
      this.replyOriginAccess({
        origin: this.origin,
        allowed
      })

      this.replied = true

      window.close()
    }
  },
  beforeDestroy () {
    if (this.replied) return

    this.reply(false)
  }
}
</script>

<style lang="scss">
.popup-logo {
  padding: 40px 20px;
  background: #302E78;
  text-align: center;

  svg {
    height: 75px;
  }
}

.enable-screen {
  padding: 20px;
}

.wrapper_bottom {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 20px;
}
</style>
