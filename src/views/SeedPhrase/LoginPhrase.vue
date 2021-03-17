<template>
    <div class="login-wrapper no-outer-pad login-phrase">
        <div class="login-phrase_logo-wrap mt-1 mx-auto">
            <Logo />
        </div>
        <div class="login-phrase_middle-text mx-auto mt-2">
            <h2 class="mt-4 px-8">Sign in to See Seed Phrase</h2>
        <div class="login-phrase_sign-in mx-auto">
        </div>
            <form class="form d-flex flex-column h-100" autocomplete="off" @submit.prevent="unlock">
                <div class="form-group mb-8">
                    <label for="password">Password</label>
                    <div class="input-group">
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
        <div class="form-group">
        <div class="form-check phrase-check my-auto mt-5">
          <input class="form-check-input" type="checkbox" value="" v-model="checkbox" id="checkbox">
          <label class="form-check-label" for="checkbox">
            I understand the risk and have privacy
          </label>
        </div>
        </div>
          <div class="button-group">
                <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg">Cancel</button></router-link>
                <button class="btn btn-primary btn-lg" @click="unlock">Continue</button>
          </div>
    </div>
</template>

<script>

import { mapActions } from 'vuex'
import Logo from '../../assets/icons/logo_wallet.svg'

export default {
  components: {
    Logo
  },
  data () {
    return {
      loading: false,
      errors: [],
      password: null,
      checkbox: false
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
  &_middle-text {
      h2 {
          font-family: Montserrat;
          font-style: normal;
          font-weight: normal;
          font-size: 28px;
          line-height: 32px;
          align-items: center;
          text-align: center;
          letter-spacing: -0.16px;
          color: #FFFFFF;
    }
  }
}

</style>
