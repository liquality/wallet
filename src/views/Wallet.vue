<template>
  <div>
    <Cover :title="titleName" :subtitle="unlockedWalletId ? null : 'Unlock your wallet'">
      <div v-if="unlockedWalletId" class="cover-element">
        <button class="btn btn-link text-white" @click="lock">Lock your wallet</button>
      </div>
    </Cover>
    <div class="container" v-if="name">
      <div v-if="!unlockedWalletId">
        <div class="row balance-box">
          <div class="col-md-4 col-sm-6 mx-auto">
            <div class="card card-up">
              <div class="card-body" v-if="true">
                <form autocomplete="off" v-on:submit.prevent="unlock">
                  <label class="bold-label text-primary mb-0">Password</label>
                  <input type="password" class="form-control form-control-lg" v-model="password" autocomplete="off" required>

                  <p class="small mt-4">This password decrypts your mnemonic.</p>

                  <button class="btn btn-primary btn-lg btn-block mt-4" type="submit">Unlock</button>
                </form>
              </div>
              <div class="card-body d-flex justify-content-center align-items-center" style="min-height: 240px" v-else>
                <Pacman class="d-inline-block mr-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Wallet v-else />
    </div>
    <div class="container" v-else>
      <div class="row justify-content-center">
        <div class="col-md-4 col-sm-6">
          <div class="card card-up">
            <div class="card-body d-flex justify-content-center align-items-center" style="min-height: 240px">
              <Pacman class="d-inline-block mr-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Cover from '@/components/Cover.vue'
import Pacman from '@/components/Pacman.vue'
import Wallet from '@/components/Wallet.vue'

export default {
  components: {
    Wallet,
    Pacman,
    Cover
  },
  data () {
    return {
      unlockedWalletId: null,
      password: null,
      name: null
    }
  },
  computed: {
    ...mapGetters(['client']),
    titleName () {
      return this.name || '...'
    },
    walletId () {
      return this.$route.params.walletId
    }
  },
  methods: {
    async demo () {
      const { id, name } = await this.client('wallet')('demo')()
      this.password = null
      this.name = name
      this.unlockedWalletId = id
    },
    async unlock () {
      if (this.walletId === 'demo') {
        this.demo()
      } else {
        try {
          const { id, name } = await this.client('wallet')('unlock')(this.walletId, this.password)
          this.password = null
          this.name = name
          this.unlockedWalletId = id
        } catch (e) {
          this.password = null
        }
      }
    },
    async lock () {
      this.unlockedWalletId = null

      await this.client('wallet')('lock')()
    }
  },
  async created () {
    if (this.walletId === 'demo') {
      this.demo()
    } else {
      const { name } = await this.client('wallet')('getWallet')(this.walletId)
      this.name = name
    }
  },
  beforeDestroy () {
    this.lock()
  }
}
</script>
