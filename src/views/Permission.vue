<template>
  <div>
    <div class="popup-logo">
      <LogoWallet />
    </div>
    <div class="permission-screen">
      <h1 class="h5 text-center mb-4">Request</h1>

      <h1 class="h4 text-center text-primary mb-4">{{$route.query.origin}}</h1>

      <pre class="text-center"><code>{{funcCall}}</code></pre>

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
  components: {
    LogoWallet
  },
  data () {
    return {
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyPremission']),
    reply (allowed) {
      this.replyPremission({
        id: this.$route.query.id,
        allowed
      })

      this.replied = true

      window.close()
    }
  },
  computed: {
    args () {
      try {
        let args = JSON.parse(this.$route.query.args)

        args = args.map(a => JSON.stringify(a))

        return args.join(', ')
      } catch (e) {
        return ''
      }
    },
    funcCall () {
      const arr = []

      arr.push(this.$route.query.asset)
      arr.push('.')
      arr.push(this.$route.query.method)
      arr.push('(')
      arr.push(this.args)
      arr.push(')')

      return arr.join('')
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
}

.permission-screen {
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
