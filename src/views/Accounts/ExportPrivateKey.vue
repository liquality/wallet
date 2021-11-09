<template>
  <div class="export-account">
    <NavBar>
      <span class="wallet_header">
        <strong>{{chainId}} private key</strong>
      </span>
    </NavBar>
    <main>
      <ul>
        <li>account: <code>{{accountId}}</code>
        <li>chain: <code>{{chainId}}</code></li>
        <li>network: <code>{{activeNetwork}}</code></li>
      </ul>
      <textarea readonly rows="10" @click="selectTextarea" v-model="privateKey" />
      <button type="button" class="btn btn-secondary" @click="goback">Done</button>
    </main>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { mapActions, mapState } from 'vuex'
export default {
  components: {
    NavBar
  },
  data () {
    return {
      backPath: '/wallet/assets',
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
    ])
  },
  watch: {
    activeNetwork: 'goback'
  },
  created () {
    const { activeWalletId, activeNetwork, accountId } = this
    const chainId = this.accounts[activeWalletId][activeNetwork]
      .find(a => a.id === accountId)?.chain

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
    ...mapActions([
      'exportPrivateKey'
    ]),
    goback () {
      this.$router.replace(this.backPath)
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
    textarea {
      font-family: monospace;
      width: 100%;
    }
  }
}
</style>
