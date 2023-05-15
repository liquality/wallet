<template>
  <div>
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="permission-sign wrapper text-center">
      <LedgerSignRequestModal :open="signRequestModalOpen" @close="closeSignRequestModal" />
      <Modal v-if="showErrorModal" :show-close="false">
        <template>
          <h5 class="modal-title text-danger">
            {{ $t('common.warning') }}
          </h5>
          <div class="row" v-if="error">
            <div class="col">
              {{ error }}
            </div>
          </div>
          <template v-else>
            <div class="row mt-2">
              <div class="col">
                <p>
                  {{
                    $t('pages.permission.chainIdErrorNetwork', {
                      network: requestedChain ? requestedChain.name : 'UNKNOWN',
                      origin: request.origin
                    })
                  }}
                </p>
                <p>
                  {{
                    $t('pages.permission.chainIdErrorApprovedChain', {
                      network: approvedChainName
                    })
                  }}
                </p>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col">
                <p>
                  {{
                    $t('pages.permission.chainIdErrorRequestedChainId', {
                      chainId: requestedChainId
                    })
                  }}
                </p>
                <p>
                  {{
                    $t('pages.permission.chainIdErrorRequestedAsset', {
                      asset
                    })
                  }}
                </p>
              </div>
            </div>
          </template>
        </template>
        <template #footer>
          <button class="btn btn-light btn-outline-primary btn-lg" @click="closeErrorModal">
            {{ $t('common.ok') }}
          </button>
        </template>
      </Modal>
      <div class="wrapper_top form">
        <h2>{{ $t('pages.permission.requestToSign') }}</h2>
        <img :src="getAssetIcon(asset)" class="permission-sign_icon mt-4 mb-2" />
        <p class="permission-sign_address">{{ shortenAddress(address) }}</p>
        <div class="permission-sign_message mt-4">
          <p class="text-left mb-1 font-bold">{{ $t('common.message') }}:</p>
          <div class="legacy-message" v-if="typeof messageToDisplay === 'string'">
            <pre>{{ messageToDisplay }}</pre>
          </div>

          <div class="signed-typed-data-message" v-else>
            <div v-for="[key, value] in messageToDisplay" :key="key">
              <span>[{{ key }}]</span>
              <div>{{ value }}</div>
            </div>
          </div>
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
            :disabled="loading || error"
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
import { mapState, mapActions, mapGetters } from 'vuex'
import { getAssetColorStyle } from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { isAddress } from 'ethers/lib/utils'
import LedgerSignRequestModal from '@/components/LedgerSignRequestModal'
import Modal from '@/components/Modal'
import { ledgerConnectMixin } from '@/utils/hardware-wallet'
import { getChain, getAllSupportedChains } from '@liquality/cryptoassets'

const signTypedDataMethodToVersion = {
  eth_signTypedData: 'V1',
  eth_signTypedData_v3: 'V3',
  eth_signTypedData_v4: 'V4'
}

export default {
  components: {
    SpinnerIcon,
    Modal,
    LedgerSignRequestModal
  },
  mixins: [ledgerConnectMixin],
  data() {
    return {
      loading: false,
      replied: false,
      error: null,
      messageToDisplay: '',
      messageToSign: '',
      signRequestModalOpen: false,
      showErrorModal: false,
      requestedChainId: null,
      requestedChain: null,
      approvedChainName: ''
    }
  },
  methods: {
    ...mapActions('app', ['replyPermission']),
    getAssetIcon,
    getAssetColorStyle,
    shortenAddress,
    closeSignRequestModal() {
      this.signRequestModalOpen = false
      this.loading = false
    },
    async reply(allowed) {
      if (this.loading) {
        return
      }
      this.loading = true

      try {
        if (this.account?.type.includes('ledger')) {
          this.signRequestModalOpen = true
          await this.connectLedger()
        }
        await this.replyPermission({
          request: {
            ...this.request,
            args: [this.messageToSign, this.request.args[1]]
          },
          allowed
        })
        this.replied = true
        window.close()
      } finally {
        this.signRequestModalOpen = false
        this.loading = false
      }
    },
    closeErrorModal() {
      this.showErrorModal = false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'externalConnections']),
    ...mapGetters(['accountItem']),
    logo() {
      return LogoWallet
    },
    asset() {
      return this.request.asset
    },
    address() {
      return this.messageToSign?.from || ''
    },
    request() {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    },
    account() {
      return this.accountItem(this.request?.accountId)
    },
    dappConnections() {
      return this.externalConnections[this.activeWalletId] || {}
    }
  },
  created() {
    if (this.request.method === 'wallet.signTypedData') {
      const { method, params } = this.request.args[0]
      const first = params[0]
      const second = params[1]
      const msgParams = {
        version: signTypedDataMethodToVersion[method],
        from: null,
        data: {}
      }

      const extra = params[2] || {}
      try {
        if (isAddress(first)) {
          msgParams.from = first
          msgParams.data = JSON.parse(second)
        } else {
          msgParams.from = second
          msgParams.data = JSON.parse(first)
        }
      } catch (err) {
        this.error = `Invalid JSON: ${err}`
        console.error(err)
      }
      this.messageToDisplay = Object.entries(msgParams.data)
      this.messageToSign = { ...msgParams, ...extra }

      /**
       ***** Validations for EIP-712
       **/
      this.requestedChainId = `${msgParams.data?.domain?.chainId}`.trim()
      // the requested chainId can be an integer, string or hex so we should convert it to int if we get an hex
      const chainIdToValidate = this.requestedChainId.match(/^0[xX][0-9a-fA-F]+/i)
        ? parseInt(this.requestedChainId, 16)
        : this.requestedChainId

      debugger
      // We shuold try to get the chain details from the requested chainId if it's valid
      const supportedChains = getAllSupportedChains()[this.activeNetwork] || {}

      const requestedChainName = Object.keys(supportedChains).find(
        (chain) => supportedChains[chain]?.network?.chainId == chainIdToValidate
      )
      if (requestedChainName) {
        this.requestedChain = supportedChains[requestedChainName]
      }
      // We get the chains inside the dapp permissions, the chain name should be inside the list
      const chains = Object.keys(this.dappConnections[this.request.origin] || {})
        .map((chainName) => getChain(this.activeNetwork, chainName))
        .filter((i) => i)
      const index = chains.findIndex((chain) => chain.network.chainId == chainIdToValidate)
      if (chains.length > 0) {
        this.approvedChainName = chains[0].name
      }
      if (index < 0) {
        console.error(
          `The request chainId is not matching with the asset chainId and stored permissions, RequestChainId: ${msgParams.data?.domain?.chainId}`,
          this.request
        )
        this.showErrorModal = true
      }
    }
    // Handle wallet.signMessage
    else {
      this.messageToDisplay = this.request.args[0] //hexToAscii(this.request.args[0])
      this.messageToSign = this.request.args[0] //hexToAscii(this.request.args[0])
    }
  }
}
</script>

<style lang="scss">
.permission-sign {
  &_icon {
    width: 40px;
    height: 40px;
  }

  &_address {
    font-weight: 600;
  }

  &_message {
    textarea {
      width: 100%;
      height: 120px;
      resize: none;
    }
  }

  .legacy-message {
    text-align: start;
    height: 176px;
    overflow-y: auto;
    font-size: 14px;
    pre {
      white-space: pre-wrap;
      font-family: 'Montserrat', sans-serif;
    }
  }

  .signed-typed-data-message {
    height: 176px;
    overflow-y: auto;

    div {
      text-align: start;

      span {
        &:first-child {
          font-weight: 600;
          margin-right: 5px;
        }
      }

      div {
        overflow-wrap: break-word;
      }
    }
  }
}
</style>
