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
    <div class="rpc-form-control">
      <label>{{ $t(`pages.settings.customRpcForm.blockExplorerUrl`) }}</label>
      <input type="text" v-model="formData.blockexplorerUrl" placeholder="block explorer url" />
    </div>
    <div class="rpc-form-control">
      <div class="handlers">
        <button @click="formSubmitHandler" :disabled="!canSubmit">
          {{ $t(`pages.settings.customRpcForm.save`) }}
        </button>
        <button @click="resetDefault">
          {{ $t(`pages.settings.customRpcForm.default`) }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CustomRpcSettingsForm',
  props: ['account'],
  data() {
    return {
      formData: {
        networkName: '',
        newRpcUrl: '',
        chainId: '',
        currencySymbol: '',
        blockexplorerUrl: ''
      }
    }
  },
  computed: {
    canSubmit() {
      const { networkName, newRpcUrl, chainId, currencySymbol } = this.formData
      return !!(networkName && newRpcUrl && chainId && currencySymbol)
    }
  },
  methods: {
    formSubmitHandler() {
      // TODO :: Handle functionality from vuex (inside wallet-core)
      console.log('Save changes', this.formData)
    },
    getBaseUrl(url) {
      const pathArray = url.split('/'),
        protocol = pathArray[0],
        host = pathArray[2]
      return protocol + '//' + host
    },
    resetDefault() {
      const { chain, network, asset } = this.account
      const { chainId, rpcUrls } = network // More:: coinType, isTestnet, name, networkId

      this.formData.networkName = chain
      this.formData.chainId = chainId
      this.formData.currencySymbol = asset
      this.formData.newRpcUrl = this.getBaseUrl(rpcUrls[0])
    }
  },
  created() {
    console.log('Account info', this.account)
    this.resetDefault()
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

      button {
        font-size: 0.875rem;
        font-family: inherit;
        line-height: 140%;
        font-style: normal;
        font-weight: normal;
        font-weight: 500;
        padding: 0.55rem 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        border-radius: 6px;
        width: 100%;
      }
    }
  }
}
</style>
