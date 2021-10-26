<template>
  <div>
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="permission-screen wrapper text-center">
      <div class="wrapper_top">
        <h2>Request</h2>
        <p class="text-muted">{{$route.query.origin}}</p>
        <img :src="getAssetIcon(asset)" class="permission-screen_icon mb-2" />
        <p>{{ method }}</p>
        <div class="permission-screen_args">
          <div v-for="(arg, index) in args" :key="arg" class="permission-screen_arg"><span class="arg_index">{{index}}</span><span class="arg_value ml-2">{{arg}}</span></div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Cancel</button>
          <button class="btn btn-primary btn-lg btn-icon" @click.stop="reply(true)" :disabled="loading">
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Sign</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getAssetIcon } from '@/utils/asset'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    SpinnerIcon
  },
  data () {
    return {
      loading: false,
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyPermission']),
    getAssetIcon,
    async reply (allowed) {
      if (this.loading) return
      this.loading = true

      try {
        await this.replyPermission({
          request: this.request,
          allowed
        })
        this.replied = true
        window.close()
      } finally {
        this.loading = false
      }
    }
  },
  computed: {
    logo () {
      return LogoWallet
    },
    asset () {
      return this.request.asset
    },
    request () {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    },
    method () {
      return this.request.method
    },
    args () {
      return this.request.args.map(a => typeof a !== 'string' ? JSON.stringify(a) : a)
    }
  }
}
</script>

<style lang="scss">
.permission-screen {
  &_icon {
    width: 40px;
    height: 40px;
  }

  &_args {
    padding: 10px;
    border: 1px solid $hr-border-color;
    max-height: 120px;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      -webkit-appearance: none;
      width: 7px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: rgba(0,0,0,.5);
      -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
    }
  }

  &_arg {
    text-align: left;
    display: flex;
    flex-direction: row;

    .arg_index {
      font-size: $font-size-tiny;
      flex: 0 0 18px;
      border-radius: 5px;
      height: 16px;
      text-align: center;
      line-height: 16px;
      margin-top: 2px;
      background: #e6e6e6;
    }

    .arg_value {
      font-size: $font-size-sm;
      word-break: break-all;
    }
  }
}
</style>
