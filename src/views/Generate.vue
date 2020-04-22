<template>
  <div>
    <Cover v-if="id" title="Backup your wallet" />
    <Cover v-else title="Generate your wallet" subtitle="Encrypted using AES-256" />

    <div class="container">
      <div class="row balance-box">
        <div class="col-md-4 col-sm-6 mx-auto">
          <div class="card card-up">
            <div class="card-body text-center" v-if="id">
              <h1 class="h4 text-primary mb-4">{{name}}</h1>

              <p>{{wallet}}</p>

              <p class="small mt-4">This seed phrase will not be displayed again. Back it up at a secure location.</p>

              <router-link class="btn btn-primary btn-lg btn-block mt-4" to="/">Continue &rsaquo;</router-link>
            </div>
            <div class="card-body" v-else>
              <form autocomplete="off" v-on:submit.prevent="go">
                <div>
                  <label class="bold-label text-primary mb-0">Name</label>
                  <input type="text" class="form-control form-control-lg" v-model="name" autocomplete="off" required>
                </div>

                <div class="mt-4">
                  <label class="bold-label text-primary mb-0">Password</label>
                  <input type="password" class="form-control form-control-lg" v-model="password" autocomplete="off" required>
                </div>

                <p class="small mt-4">This password encrypts your mnemonic. This does not act as a seed to generate your keys. You will need this password to unlock your wallet.</p>

                <button class="btn btn-primary btn-lg btn-block mt-4" type="submit">Generate &rsaquo;</button>
              </form>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center" style="min-height: 240px" v-if="false">
              <Pacman class="d-inline-block mr-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cover from '@/components/Cover'
import Pacman from '@/components/Pacman'
import client from '@/utils/client'

export default {
  components: {
    Cover,
    Pacman
  },
  data () {
    return {
      id: null,
      wallet: null,
      name: null,
      password: null
    }
  },
  methods: {
    async go () {
      const { id, name, wallet } = await client('wallet')('generate')(this.name, this.password)

      this.password = null
      this.id = id
      this.name = name
      this.wallet = wallet
    }
  },
  async created () {
    this.unlockedWalletId = await client('wallet')('getUnlockedWalletId')()
  }
}
</script>

<style lang="scss">
</style>
