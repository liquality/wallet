<template>
  <div>
    <Cover v-if="id" title="Your wallet was imported successfully" />
    <Cover v-else title="Import your wallet" subtitle="Encrypted using AES-256" />

    <div class="container">
      <div class="row">
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
                  <label class="bold-label text-primary mb-0">Mnemonic</label>
                  <textarea class="form-control form-control-lg" rows="3" v-model="mnemonic" autocomplete="off" required />
                </div>

                <p class="small mt-4">This password encrypts your mnemonic. You will need this password to unlock your wallet.</p>

                <button class="btn btn-primary btn-lg btn-block mt-4" type="submit">Import &rsaquo;</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import Cover from '@/components/Cover.vue'

export default {
  components: {
    Cover
  },
  data () {
    return {
      id: null,
      mnemonic: null,
      name: null
    }
  },
  methods: {
    ...mapActions(['importWallet']),
    async go () {
      const { id, name } = await this.importWallet({ name: this.name, mnemonic: this.mnemonic })

      this.mnemonic = null
      this.id = id
      this.name = name
    }
  }
}
</script>
