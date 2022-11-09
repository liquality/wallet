<template>
  <div class="permission-screen">
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="wrapper text-center">
      <div class="wrapper_top">
        <h2>{{ $t('pages.permission.signTransaction') }}</h2>
        <p class="text-muted">{{ $route.query.origin }}</p>
        <img :src="getAssetIcon(asset)" class="permission-screen_icon mb-2" />
        <div class="permission-screen_tx">
          <div
            v-for="(instruction, i) in instructions"
            :key="i"
            class="permission-screen_tx_output bg-light p-2 mb-2 border rounded"
          >
            <div>{{ instruction.address }}</div>
            <div class="row">
              <div class="col text-primary align-text-bottom">
                {{ prettyBalance(instruction.value, asset, 8) }} {{ asset }}
              </div>
            </div>
          </div>
          <div class="text-muted">Fee: {{ prettyBalance(fee, asset, 8) }} {{ asset }}</div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            @click.stop="reply(true)"
            :disabled="loading"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>{{ $t('common.sign') }}</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { getAssetIcon } from '@/utils/asset'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { prettyBalance } from '@liquality/wallet-core/dist/src/utils/coinFormatter'

export default {
  components: { SpinnerIcon },
  data() {
    return { loading: false, replied: false }
  },
  methods: {
    ...mapActions('app', ['replyPermission']),
    prettyBalance,
    getAssetIcon,
    async reply(allowed) {
      if (this.loading) {
        return
      }
      this.loading = true

      try {
        await this.replyPermission({ request: this.request, allowed })
        this.replied = true
        window.close()
      } finally {
        this.loading = false
      }
    }
  },
  computed: {
    ...mapGetters(['client', 'accountItem']),
    ...mapState(['activeNetwork', 'activeWalletId']),
    logo() {
      return LogoWallet
    },
    accountId() {
      return this.request.accountId
    },
    account() {
      return this.accountItem(this.request?.accountId)
    },
    asset() {
      return this.request.asset
    },
    instructions() {
      return this.request.args[0]
    },
    request() {
      console.log('Request: ', {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      })
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    },
    method() {
      return this.request.method
    }
  }
}
</script>

<style lang="scss">
.permission-screen {
  padding-bottom: 90px;
  overflow-y: auto;
  height: 100%;

  &_icon {
    width: 40px;
    height: 40px;
  }

  &_tx {
    text-align: left;

    svg {
      height: 16px;
      circle {
        stroke: #dedede;
      }
    }
  }
}
</style>
