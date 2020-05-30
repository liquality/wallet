<template>
  <div>
    <Cover v-if="changed" title="Your password was changed successfully" />
    <Cover v-else title="Change your password" subtitle="Encrypted using AES-256" />

    <div class="container">
      <div class="row">
        <div class="col-md-4 col-sm-6 mx-auto">
          <div class="card card-up">
            <div class="card-body text-center" v-if="changed">
              <router-link class="btn btn-primary btn-lg btn-block" to="/">Continue &rsaquo;</router-link>
            </div>
            <div class="card-body" v-else>
              <form autocomplete="off" v-on:submit.prevent="go">
                <div>
                  <label class="bold-label text-primary mb-0">New password</label>
                  <input type="password" class="form-control form-control-lg" v-model="password" autocomplete="off" required>
                </div>

                <p class="small mt-4">This password encrypts your mnemonic. You will need this password to unlock your wallet.</p>

                <button class="btn btn-primary btn-lg btn-block mt-4" type="submit">Change password &rsaquo;</button>
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
      changed: false,
      password: null
    }
  },
  methods: {
    ...mapActions(['changePassword']),
    async go () {
      await this.changePassword({ key: this.password })

      this.changed = true
      this.password = null
    }
  }
}
</script>
