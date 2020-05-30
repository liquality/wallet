<template>
  <div>
    <Cover v-if="id" title="Backup your wallet" />
    <Cover v-else title="Generate your wallet" subtitle="Encrypted using AES-256" />

    <div class="container">
      <div class="row">
        <div class="col-md-4 col-sm-6 mx-auto">
          <div class="card card-up">
            <div class="card-body text-center" v-if="id">
              <h1 class="h4 text-primary mb-4">{{name}}</h1>

              <p>{{mnemonic}}</p>

              <p class="small mt-4">Back it up at a secure location.</p>

              <router-link class="btn btn-primary btn-lg btn-block mt-4" to="/">Continue &rsaquo;</router-link>
            </div>
            <div class="card-body" v-else>
              <form autocomplete="off" v-on:submit.prevent="go">
                <div>
                  <label class="bold-label text-primary mb-0">Name</label>
                  <input type="text" class="form-control form-control-lg" v-model="name" autocomplete="off" required>
                </div>

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
import { mapActions } from 'vuex'

import Cover from '@/components/Cover.vue'
import Pacman from '@/components/Pacman.vue'

export default {
  components: {
    Cover,
    Pacman
  },
  data () {
    return {
      id: null,
      mnemonic: null,
      name: null
    }
  },
  methods: {
    ...mapActions(['generateWallet']),
    async go () {
      const { id, name, mnemonic } = await this.generateWallet({ name: this.name })

      this.id = id
      this.name = name
      this.mnemonic = mnemonic
    }
  }
}
</script>

<style lang="scss">
</style>
