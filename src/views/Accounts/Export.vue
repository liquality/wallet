<template>
  <div class="export-account">
    <NavBar
      showBack="true"
      backLabel="Back"
      :backPath="backPath"
    >
      <span class="wallet_header">
        <strong>Export private key</strong>
      </span>
    </NavBar>
    <main>
      <div v-if="!keyVisible">
        <h1>Are you sure?</h1>
        <p>{{chainId}} <code>{{accountId}}</code></p>
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
      backPath: '/accounts/management',
      privateKey: '',
      keyVisible: false
    }
  },
  props: ['accountId', 'chainId'],
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId'
    ])
  },
  created () {
    const { chainId, accountId, activeNetwork, activeWalletId } = this
    this.exportPrivateKey({
      walletId: activeWalletId,
      network: activeNetwork,
      chainId,
      accountId
    }).then(key => {
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
