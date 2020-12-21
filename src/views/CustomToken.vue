<template>
  <div class="custom-token">
    <NavBar showMenu="true" showBack="true" backPath="/settings/manage-assets" backLabel="Back">
      <span class="wallet_header"><strong>Add Custom Token</strong></span>
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="form-group">
          <label for="contractAddress">Token Contract Address</label>
          <input type="text" v-model="contractAddress" @change="contractAddressChange" class="form-control form-control-sm" id="contractAddress" placeholder="Address" autocomplete="off" required>
        </div>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" v-model="name" class="form-control form-control-sm" id="name" placeholder="Name" autocomplete="off" required :disabled="autofilled">
        </div>
        <div class="form-group">
          <label for="tokenSymbol">Token Symbol</label>
          <input type="text" v-model="symbol" class="form-control form-control-sm" id="tokenSymbol" placeholder="ABC" autocomplete="off" required :disabled="autofilled">
          <small v-if="symbol && symbolError" class="text-danger form-text text-right">{{ symbolError }}</small>
        </div>
        <div class="form-group">
          <label for="decimals">Decimals</label>
          <input type="text" v-model="decimals" class="form-control form-control-sm" id="decimals" autocomplete="off" required :disabled="autofilled">
        </div>
        <div class="form-group">
          <label for="network">Network</label>
          <select v-model="network" class="form-control form-control-sm" id="network" autocomplete="off" required :disabled="autofilled">
            <option value="ethereum">Ethereum</option>
            <option value="rsk">RSK</option>
          </select>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link :to="`/settings/manage-assets`"><button class="btn btn-light btn-outline-primary btn-lg">Cancel</button></router-link>
          <button class="btn btn-primary btn-lg" @click="addToken" :disabled="!canAdd">Add Token</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  data () {
    return {
      contractAddress: '',
      name: null,
      symbol: null,
      decimals: null,
      network: 'ethereum',
      autofilled: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
    symbolError () {
      if (!this.autofilled && Object.keys(cryptoassets).includes(this.symbol)) {
        return 'Token with this symbol exists.'
      }
      return null
    },
    canAdd () {
      if (!this.symbol || !this.name || !this.network || !this.contractAddress || !this.decimals) return false
      if (this.symbolError) return false

      return true
    },
    existingAsset () {
      const existingAsset = Object.values(cryptoassets).find(asset =>
        asset.type === 'erc20' && asset.contractAddress.toLowerCase() === this.contractAddress.toLowerCase())
      return existingAsset ? { ...existingAsset, symbol: existingAsset.code } : null
    }
  },
  methods: {
    ...mapActions(['enableAssets', 'addCustomToken']),
    async addToken () {
      if (!this.existingAsset) { // Add only if it does not already exist
        await this.addCustomToken({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          erc20Network: this.network,
          contractAddress: this.contractAddress,
          name: this.name,
          symbol: this.symbol,
          decimals: this.decimals
        })
      }
      await this.enableAssets({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.symbol]
      })
      this.$router.replace('/settings/manage-assets')
    },
    async contractAddressChange () {
      this.symbol = null
      this.name = null
      this.decimals = null
      this.assetExists = false
      this.autofilled = false

      let customToken

      if (this.existingAsset) {
        customToken = this.existingAsset
      } else if (this.activeNetwork === 'mainnet') {
        try {
          const result = await axios.get(`https://api.ethplorer.io/getTokenInfo/${this.contractAddress}?apiKey=freekey`)
          const { symbol, name, decimals } = result.data
          customToken = { symbol, name, decimals: parseInt(decimals), network: 'ethereum' }
        } catch (e) {}
      }

      if (customToken) {
        this.symbol = customToken.symbol
        this.name = customToken.name
        this.network = customToken.network
        this.decimals = customToken.decimals
        this.autofilled = true
      }
    }
  }
}
</script>

<style lang="scss">
.custom-token {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
