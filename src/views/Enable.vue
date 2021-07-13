<template>
  <div>
    <div class="popup-logo">
      <img :src="logo"/>
    </div>
    <div class="enable-screen wrapper text-center">
      <h2>Connect Request</h2>

      <div class="enable-screen_icon mt-4">{{originShort}}</div>
      <p class="mt-1 mb-4">{{originDomain}}</p>

      <p class="mb-4">By granting permission to <strong>{{origin}}</strong>, they can read your public account addresses.</p>

      <p class="text-primary text-center">Make sure you trust this site</p>

      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Deny</button>
          <button class="btn btn-primary btn-lg btn-icon" @click="reply(true)" :disabled="loading">
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Connect</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'

export default {
  data () {
    return {
      replied: false,
      loading: false
    }
  },
  computed: {
    logo () {
      return LogoWallet
    },
    origin () {
      return this.$route.query.origin
    },
    originShort () {
      return this.originDomain[0].toUpperCase()
    },
    originDomain () {
      return (new URL(this.origin)).hostname
    },
    originIcon () {
      return `https://s2.googleusercontent.com/s2/favicons?domain_url=${this.origin}`
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
.enable-screen {
  &_icon {
    font-size: 40px;
    line-height: 74px;
    margin: 0 auto;
    color: white;
    width: 74px;
    height: 74px;
    background: #b6b6b6;
    border-radius: 50%;
  }
}
</style>
