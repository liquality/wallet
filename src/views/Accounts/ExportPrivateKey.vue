<template>
  <div class="export-account">
    <NavBar>
      <span class="wallet_header">
        <strong>{{chainId}} Private Key</strong>
      </span>
    </NavBar>
    <div class="export-account_top login-wrapper">
      <Eye class="export-account_eye" />
      <p class="mt-3">Keep this away from prying eyes!</p>
    </div>
    <main>
      <p class="account">
        <code v-if="account.addresses[0]">{{ shortenAddress(account.addresses[0]) }}</code>
        <img :src="getAccountIcon(account.chain)" class="asset-icon" />
      </p>
      <textarea readonly rows="3" @click="selectTextarea" id="private-key-textarea" v-model="privateKey" />
    </main>
    <div class="p-3 pb-1">
      <button id="done_button" class="btn btn-primary btn-lg btn-block" @click="goback">Done</button>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { getAccountIcon } from '@/utils/accounts'
import { shortenAddress } from '@/utils/address'
import { mapActions, mapState } from 'vuex'
import Eye from '../../assets/icons/eye.svg'

export default {
  components: {
    NavBar,
    Eye
  },
  data () {
    return {
      chainId: '',
      privateKey: 'n/a'
    }
  },
  props: ['accountId'],
  computed: {
    ...mapState([
      'accounts',
      'activeNetwork',
      'activeWalletId'
    ]),
    account () {
      return this.$store.getters.accountItem(this.accountId)
    }
  },
  watch: {
    activeNetwork: 'goback'
  },
  created () {
    const { activeWalletId, activeNetwork, accountId } = this
    const chainId = this.account?.chain

    if (!chainId) {
      return this.goback()
    }
    this.exportPrivateKey({
      walletId: activeWalletId,
      network: activeNetwork,
      chainId,
      accountId
    }).then(key => {
      this.chainId = chainId
      this.privateKey = key
    })
  },
  updated () {
    this.$nextTick(this.selectTextarea)
  },
  methods: {
    getAccountIcon,
    shortenAddress,
    ...mapActions([
      'exportPrivateKey'
    ]),
    goback () {
      this.$router.replace('/wallet/assets')
    },
    selectTextarea () {
      this.$el.querySelector('textarea')?.select()
    }
  }
}
</script>
<style lang="scss">
.export-account {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &_top {
    align-items: center;
  }
  &_eye {
    width: 115px;
  }

  main {
    flex: 1;
    overflow: auto;
    padding: $wrapper-padding;

    p.account {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    textarea {
      font-family: monospace;
      width: 100%;
    }
  }
}
</style>
