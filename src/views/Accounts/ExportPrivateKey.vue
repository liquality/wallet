<template>
  <div class="export-account">
    <NavBar
      backLabel="Cancel"
      :showBack="!keyVisible"
      :backPath="backPath"
    >
      <span class="wallet_header">
        <strong>{{chainId}} private key</strong>
      </span>
    </NavBar>
    <main>
      <div v-if="!keyVisible">
        <h1>Are you sure?</h1>
        <ul>
          <li>account: <code>{{accountId}}</code>
          <li>chain: <code>{{chainId}}</code></li>
          <li>network: <code>{{activeNetwork}}</code></li>
        </ul>
      </div>
      <p>The private key is a string that can be copied and used to seed another wallet.</p>
      <div v-if="keyVisible">
        <textarea readonly rows="10" @click="selectTextarea" v-model="privateKey" />
        <button type="button" class="btn btn-secondary" @click="goback">Done</button>
      </div>
      <div v-else>
        <button type="button" class="btn btn-warning" @click="keyVisible = true">Yes, show it</button>
      </div>
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
      privateKey: 'n/a',
      keyVisible: false
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

    console.log('setChainIdAndPrivateKey', activeNetwork, chainId)
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
