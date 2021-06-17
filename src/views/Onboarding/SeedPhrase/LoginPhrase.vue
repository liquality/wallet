<template>
    <div class="login-wrapper login-phrase h-100">
        <div class="login-phrase_logo-wrap mx-auto">
            <img :src="logo"/>
        </div>
        <div class="login-phrase_middle-text mx-auto mt-1">
            <h2 class="mt-4 px-5">Sign in to See Seed Phrase</h2>
            <form class="form d-flex flex-column h-100" autocomplete="off" @submit.prevent="unlock">
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-group mb-5">
                    <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required :readonly="loading">
                    </div>
                    <p v-if="errors.length">
                    <b>Please correct the following error(s):</b>
                    <ul>
                        <li v-for="error in errors" :key="error">{{ error }}</li>
                    </ul>
                    </p>
                </div>
            </form>
        </div>
        <div class="footer-container">
            <div class="form-group mt-5 ml-1">
              <div class="form-check phrase-check my-auto">
                <input class="form-check-input" type="checkbox" value="" v-model="checkbox" id="checkbox">
                <label class="form-check-label mt-1" for="checkbox">
                  I understand the risk and have privacy
                </label>
              </div>
            </div>
          <div class="button-group">
                <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg">Cancel</button></router-link>
                <button id="cookie_continue" class="btn btn-primary btn-lg" @click="unlock">Continue</button>
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
      loading: false,
      errors: [],
      password: null,
      checkbox: false
    }
  },
  computed: {
    logo () {
      return LogoWallet
    }
  },
  methods: {
    ...mapActions(['unlockWallet']),
    async unlock () {
      this.errors = []
      this.loading = true
      try {
        if (this.checkbox === true) {
          await this.unlockWallet({ key: this.password })
          this.$router.push('/seedreveal')
        } else {
          this.errors.push('Please Accept Terms')
        }
      } catch (e) {
        console.log(e)
        this.errors.push(e.message)
      } finally {
        this.loading = false
      }
    }
  }
}

</script>

<style lang="scss">
.login-phrase {
  &_logo-wrap {
    height: 100px;
    width: 100px;
  }
}
</style>
