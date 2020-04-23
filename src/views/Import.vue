<template>
  <div>
    <Cover v-if="id" title="Your wallet was imported successfully" />
    <Cover v-else title="Import your wallet" subtitle="Encrypted using AES-256" />

    <div class="container">
      <div class="row balance-box">
        <div class="col-md-4 col-sm-6 mx-auto">
          <div class="card card-up">
            <div class="card-body text-center" v-if="id">
              <h1 class="h4">{{name}}</h1>

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

                <div class="mt-4">
                  <label class="bold-label text-primary mb-0">Mnemonic</label>
                  <textarea class="form-control form-control-lg" rows="3" v-model="wallet" autocomplete="off" required />
                </div>

                <p class="small mt-4">This password encrypts your mnemonic. You will need this password to unlock your wallet.</p>

                <button class="btn btn-primary btn-lg btn-block mt-4" type="submit">Import &rsaquo;</button>
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
import { mapGetters } from 'vuex'

import Cover from '@/components/Cover.vue'
import Pacman from '@/components/Pacman.vue'

export default {
  components: {
    Pacman,
    Cover
  },
  data () {
    return {
      id: null,
      wallet: null,
      name: null,
      password: null
    }
  },
  computed: {
    ...mapGetters(['client'])
  },
  methods: {
    async go () {
      const { id, name } = await this.client('wallet')('import')(this.name, this.wallet, this.password)

      this.wallet = null
      this.id = id
      this.name = name
    }
  }
}
</script>
