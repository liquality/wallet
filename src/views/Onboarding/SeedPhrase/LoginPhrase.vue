<template>
  <div class="login-wrapper login-phrase h-100">
    <div class="login-phrase_logo-wrap mx-auto">
      <img :src="logo" />
    </div>
    <div class="login-phrase_middle-text mx-auto mt-1">
      <h2 class="mt-4 px-4">{{ title }}</h2>
      <form class="form d-flex flex-column h-100" autocomplete="off" @submit.prevent="unlock">
        <div class="form-group mt-2">
          <label for="password">{{ $t('common.password') }}</label>
          <div class="input-group">
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              autocomplete="off"
              required
              :readonly="loading"
            />
          </div>
          <p v-if="error" class="mt-3" id="password_error">
            {{ error }}
          </p>
        </div>
      </form>
    </div>
    <div class="footer-container">
      <div class="form-group d-flex mt-5 mb-3 ml-1">
        <div class="form-check phrase-check my-auto">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            v-model="checkbox"
            id="checkbox"
          />
          <label class="form-check-label mt-1" for="checkbox">
            {{ $t('pages.onboarding.seedlogin.understandTheRisk') }}
          </label>
        </div>
      </div>
      <div class="button-group">
        <router-link to="/wallet">
          <button class="btn btn-outline-primary btn-lg">
            {{ $t('common.cancel') }}
          </button>
        </router-link>
        <button
          class="btn btn-primary btn-lg"
          id="continue_button_to_see_seed_phrase"
          @click="unlock"
          :disabled="!checkbox || !password"
        >
          {{ $t('common.continue') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import { version as walletVersion } from '../../../../package.json'
import { errorToLiqualityErrorString } from '@liquality/error-parser/dist/src/utils'
import { reportLiqualityError } from '@liquality/error-parser'
export default {
  props: {
    titleKey: {
      type: String,
      default: 'seed'
    },
    nextPath: {
      type: String,
      default: '/seedreveal'
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      password: null,
      checkbox: false,
      title: ''
    }
  },
  computed: {
    logo() {
      return LogoWallet
    }
  },
  created() {
    this.title = this.$t(`pages.onboarding.seedlogin.title.${this.titleKey}`)
  },
  methods: {
    ...mapActions('app', ['trackAnalytics']),
    ...mapActions(['unlockWallet']),
    async unlock() {
      this.error = null
      this.loading = true
      try {
        if (this.checkbox === true) {
          await this.unlockWallet({ key: this.password })
          this.$router.push(this.nextPath)
        } else {
          this.error = this.$t('pages.onboarding.seedlogin.pleaseAcceptTerms')
        }
      } catch (e) {
        reportLiqualityError(e)
        this.error = this.$tle(errorToLiqualityErrorString(e))
        this.trackAnalytics({
          event: 'User Backup Seed failed',
          properties: {
            walletVersion,
            action: 'Backup Seed Phrase failed'
          }
        })
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
