<template>
  <div>
    <div v-if="walletState !== 'UNLOCKED'">
      <div class="row balance-box">
        <div class="col-md-4 col-sm-6 mx-auto">
          <div class="card card-up cursor-pointer">
            <div class="card-body" v-if="['LOCKED', 'NOWALLET'].includes(walletState)">
              <form autocomplete="off" v-on:submit.prevent="go">
                <h1 class="h4 text-center mb-1 text-primary">{{title}}</h1>
                <h2 class="h6 text-center font-weight-normal text-muted mb-4">{{subtitle}}</h2>

                <label class="bold-label text-primary mb-0">Password</label>
                <input type="password" class="form-control form-control-lg" v-model="password" autocomplete="off" required>

                <button class="btn btn-primary btn-lg btn-block mt-4" @click="go">{{action}}</button>
              </form>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center" style="min-height: 240px" v-else>
              <Pacman class="d-inline-block mr-3" />
            </div>
          </div>
          <p v-if="isTestnet" class="text-center font-weight-normal mt-3 cursor-pointer" @click="demo">Experiment with a demo wallet &rsaquo;</p>
        </div>
      </div>
    </div>
    <Wallet v-else />
  </div>
</template>

<script>
import { isTestnet } from '@/utils/network'

import Pacman from '@/components/Pacman'
import Wallet from '@/components/Wallet'
import client from '@/utils/client'

export default {
  components: {
    Wallet,
    Pacman
  },
  data () {
    return {
      walletState: null,
      password: null
    }
  },
  computed: {
    isTestnet () {
      return isTestnet
    },
    title () {
      if (this.walletState === 'NOWALLET') {
        return 'Create a wallet'
      }

      return 'Unlock your wallet'
    },
    subtitle () {
      if (this.walletState === 'NOWALLET') {
        return 'Encrypted in-browser with AES-256'
      }

      return 'Decrypted in-browser with AES-256'
    },
    action () {
      if (this.walletState === 'NOWALLET') {
        return 'Create'
      }

      return 'Unlock'
    }
  },
  methods: {
    async demo () {
      this.walletState = await client('wallet')('demo')()
    },
    async go () {
      try {
        if (this.walletState === 'NOWALLET') {
          this.walletState = await client('wallet')('create')(this.password)
          return
        }

        this.walletState = await client('wallet')('unlock')(this.password)
      } catch (e) {
        this.password = null
      }
    }
  },
  async created () {
    this.walletState = await client('wallet')('getState')()
  }
}
</script>

<style lang="scss">
</style>
