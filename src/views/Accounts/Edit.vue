<template>
  <div class="account-container">
    <NavBar :showMenu="false" :showBack="false">
      <span class="account-title">{{ $t('pages.accounts.editAccount') }}</span>
    </NavBar>
    <div class="wrapper">
      <div class="wrapper_top">
        <div class="create-item-row">
          <div class="create-item-row-title">{{ $t('pages.accounts.chooseAccountName') }}</div>
          <div class="form">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text account-name">
                  {{ accountName }}
                </span>
              </div>
              <input
                type="text"
                autocomplete="off"
                class="form-control form-control-sm"
                v-model="accountAlias"
                :placeholder="$t('pages.accounts.chooseAccountName')"
                id="choose-account-name"
                required
                :class="{ 'is-invalid': accountAliasError }"
              />
            </div>
            <small class="text-danger form-text text-right" v-if="accountAliasError">
              {{ accountAliasError }}
            </small>
          </div>
        </div>
        <div class="create-item-row">
          <div class="create-item-row-title">{{ $t('pages.accounts.chooseTheColor') }}</div>
          <div class="form">
            <div class="input-group">
              <input
                type="color"
                id="choose-color"
                v-model="accountColor"
                placeholder="Choose color"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            id="cancel-button"
            @click="cancel"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            id="create-account-button"
            @click="edit"
            :disabled="loading || !inputsValidated"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>{{ $t('common.edit') }}</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import clickAway from '@/directives/clickAway'
import { mapActions, mapGetters, mapState } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'

import _ from 'lodash'

export default {
  directives: {
    clickAway
  },
  components: {
    NavBar,
    SpinnerIcon
  },
  props: {
    accountId: String
  },
  data() {
    return {
      loading: false,
      accountAlias: '',
      accountColor: '',
      accountAliasError: null
    }
  },
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork']),
    ...mapGetters(['accountItem']),
    inputsValidated() {
      return !this.accountAliasError && this.accountColor && this.accountColor.length > 5
    },
    account() {
      return this.accountItem(this.accountId)
    },
    accountName() {
      return this.account?.name
    }
  },
  created() {
    this.accountAlias = this.account?.alias
    this.accountColor = this.account?.color
    this.debouncedCheckAccountAlias = _.debounce(this.checkAccountAlias, 500)
    this.checkAccountAlias()
  },
  methods: {
    ...mapActions(['updateAccount']),
    cancel() {
      this.$router.replace({ name: 'ManageAccounts' })
    },
    async edit() {
      this.loading = true
      const account = {
        ...this.account,
        alias: this.accountAlias,
        color: this.accountColor
      }

      await this.updateAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        account
      })

      this.loading = false

      this.cancel()
    },
    checkAccountAlias() {
      if (
        !this.accountAlias ||
        this.accountAlias.length < 5 ||
        (this.accountAlias.match(/^[^\s]+(\s+[^\s]+)*$/) || []).length <= 0
      ) {
        this.accountAliasError = this.$t('pages.accounts.accountAliasErrorFiveChars')
      } else if (this.accountAlias.length > 20) {
        this.accountAliasError = this.$t('pages.accounts.accountAliasErrorTwentyChars')
      } else {
        this.accountAliasError = null
      }
    }
  },
  watch: {
    accountAlias(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.debouncedCheckAccountAlias()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  text-transform: none !important;
  .input-group-text {
    font-weight: 300 !important;
    font-size: 12px !important;
    line-height: 150% !important;
    margin-left: 5px;
  }
}

.custom-dropdown-menu {
  max-width: 100% !important;
  max-height: 250px !important;
  min-width: 11rem;

  .dropdown-item {
    padding: 0.3rem 1em;
  }
}

.wrapper {
  padding-top: 0 !important;

  .wrapper_top {
    position: absolute;
    width: 100%;
    left: 0;
  }

  .create-item-row {
    padding: 26px 20px;
    border-bottom: 1px solid $hr-border-color;

    input[type='color'] {
      height: 40px;
      border: none;
      border-radius: 20px;
      max-width: 40px !important;
      cursor: pointer;
    }

    input[type='color']::-webkit-color-swatch {
      border: none;
      border-radius: 50%;
      padding: 0;
    }

    input[type='color']::-webkit-color-swatch-wrapper {
      border: none;
      border-radius: 50%;
      padding: 0;
    }

    .create-item-row-title,
    .account-name {
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
      color: #3d4767;
      display: flex;
    }

    .create-item-row-title {
      text-transform: uppercase;
    }
    .account-name {
      margin-right: 8px;
    }
  }
}
</style>
