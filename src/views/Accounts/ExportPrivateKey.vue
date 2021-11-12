<template>
  <div class="export-account">
    <NavBar>
      <span class="wallet_header">
        <strong>{{chainId}} private key</strong>
      </span>
    </NavBar>
    <main>
      <p class="account">
        <code v-if="account.addresses[0]">{{ shortenAddress(account.addresses[0]) }}</code>
        <img :src="getAccountIcon(account.chain)" class="asset-icon" />
      </p>
      <textarea readonly rows="3" @click="selectTextarea" v-model="privateKey" />
      <button type="button" class="btn btn-secondary" @click="goback">Done</button>
    </main>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { getAccountIcon } from '@/utils/accounts'
import { shortenAddress } from '@/utils/address'
import { mapActions, mapState } from 'vuex'
export default {
  components: {
    NavBar
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
