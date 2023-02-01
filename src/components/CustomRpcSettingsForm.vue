<template>
  <div class="rpc-form">
    <div class="rpc-form-control">
      <label>{{ $t(`pages.settings.customRpcForm.networkName`) }}</label>
      <input
        :disabled="true"
        type="text"
        v-model="formData.networkName"
        placeholder="network name"
      />
    </div>
    <div class="rpc-form-control">
      <label>{{ $t(`pages.settings.customRpcForm.newRpcURL`) }}</label>
      <input type="text" v-model="formData.newRpcUrl" placeholder="new rpc url" />
    </div>
    <div class="rpc-form-control">
      <label>{{ $t(`pages.settings.customRpcForm.chainId`) }}</label>
      <input type="text" :disabled="true" v-model="formData.chainId" placeholder="chain ID" />
    </div>
    <div class="rpc-form-control">
      <label>{{ $t(`pages.settings.customRpcForm.currencySymbol`) }}</label>
      <input
        type="text"
        :disabled="true"
        v-model="formData.currencySymbol"
        placeholder="currency synbol"
      />
    </div>
    <!-- <div class="rpc-form-control">
      <label>{{ $t(`pages.settings.customRpcForm.blockExplorerUrl`) }}</label>
      <input type="text" v-model="formData.explorerUrl" placeholder="block explorer url" />
    </div> -->
    <div class="rpc-form-control mt-3">
      <div class="button-group">
        <button
          class="btn btn-primary btn-lg btn-icon"
          @click="formSubmitHandler"
          :disabled="!canSubmit"
        >
          {{ $t(`pages.settings.customRpcForm.save`) }}
        </button>
        <button class="btn btn-light btn-outline-primary btn-lg ml-2" @click="resetDefault">
          {{ $t(`pages.settings.customRpcForm.default`) }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  name: 'CustomRpcSettingsForm',
  props: ['settings'],
  data() {
    return {
      formData: {
        networkName: '',
        newRpcUrl: '',
        chainId: '',
        currencySymbol: '',
        explorerUrl: ''
      }
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
    canSubmit() {
      const { networkName, newRpcUrl, chainId, currencySymbol } = this.formData
      const { network } = this.settings
      const { custom } = network
      if (
        networkName &&
        newRpcUrl &&
        chainId &&
        currencySymbol &&
        newRpcUrl !== this.getBaseUrl(network?.rpcUrl, custom)
      ) {
        return true
      }

      return false
    }
  },
  methods: {
    ...mapActions(['saveCustomChainSettings', 'removeCustomChainSettings']),
    async formSubmitHandler() {
      const { network } = this.settings
      const { chainId } = network

      const payload = {
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId,
        chanifyNetwork: {
          ...network,
          custom: true,
          explorerUrl: this.formData.explorerUrl,
          rpcUrl: this.formData.newRpcUrl
        }
      }

      await this.saveCustomChainSettings(payload)
    },
    getBaseUrl(url, custom = true) {
      if (custom) return url

      const pathArray = url.split('/'),
        protocol = pathArray[0],
        host = pathArray[2]
      return protocol + '//' + host
    },
    async resetDefault() {
      const { chain } = this.settings
      await this.removeCustomChainSettings({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId: chain
      })
    },
    setSettings() {
      const { chain, network, asset, chainId } = this.settings
      const { rpcUrl, explorerUrl, custom } = network
      this.formData.networkName = chain
      this.formData.chainId = chainId
      this.formData.currencySymbol = asset
      this.formData.newRpcUrl = this.getBaseUrl(rpcUrl, custom)
      this.formData.explorerUrl = explorerUrl
    }
  },
  created() {
    console.log('this.settings', this.settings)
    this.setSettings()
  },
  watch: {
    settings: {
      handler() {
        this.setSettings()
      },
      deep: true
    }
  }
}
</script>
<style scoped lang="scss">
.rpc-form {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  color: #1d1e21;
  text-align: left;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  height: auto;
  margin: 0.5rem 0;
  border: inherit;
  padding: 1rem 2rem;

  .rpc-form-control {
    label {
      font-weight: bold;
      display: block;
      margin: 0.5rem 0;
    }

    input {
      display: block;
      width: 100%;
      border: 1px solid #ccc;
      font: inherit;
      line-height: 1.5rem;
      padding: 0 0.25rem;
      height: 2rem;
      align-items: center;
    }

    input:focus {
      outline: none;
      background: transparent;
      border-color: #3d3d3d;
    }

    .handlers {
      display: flex;
      flex-flow: row;
      gap: 10px;
      padding: 12px 0;
      width: 100%;
    }
  }
}
</style>
