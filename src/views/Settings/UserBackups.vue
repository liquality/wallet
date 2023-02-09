<template>
  <div class="user-backups">
    <InfoNotification v-if="downloaded">
      <div class="notify">
        Downloaded! Please check your downloads folder for {{ downloadFileName }}
      </div>
    </InfoNotification>
    <div class="setting-item">
      <div class="setting-item_title flex-fill mb-2">
        {{ $t('pages.settings.backupUserData') }}
        <span class="setting-item_sub">
          {{ $t('pages.settings.backupUserDataSub') }}
        </span>
      </div>
      <div class="setting-item_control">
        <button class="btn btn-outline-clear mr-1">
          {{ $t('pages.settings.upload') }}
        </button>
        <button class="btn btn-outline-clear ml-1" :disabled="downloaded" @click="download">
          {{ $t('pages.settings.download') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { getChain, isEvmChain } from '@liquality/cryptoassets'
import InfoNotification from '@/components/InfoNotification'

export default {
  name: 'UserBackups',

  components: {
    InfoNotification
  },

  data: () => {
    return {
      exportObj: {
        preferences: {
          frequentRpcListDetail: [],
          useBlockie: false,
          useNonceField: true,
          usePhishDetect: true,
          dismissSeedBackUpReminder: false,
          useMultiAccountBalanceChecker: false,
          useTokenDetection: false,
          useNftDetection: false,
          useCurrencyRateCheck: true,
          openSeaEnabled: false,
          advancedGasFee: null,
          featureFlags: {
            advancedInlineGas: true,
            showIncomingTransactions: true
          },
          knownMethodData: { '0x3ce33bff': {} },
          currentLocale: 'en',
          forgottenPassword: false,
          preferences: {
            hideZeroBalanceTokens: false,
            showFiatInTestnets: false,
            showTestNetworks: true,
            useNativeCurrencyAsPrimaryCurrency: true
          },
          ipfsGateway: 'dweb.link',
          infuraBlocked: false,
          ledgerTransportType: 'webhid',
          theme: 'light',
          improvedTokenAllowanceEnabled: false,
          transactionSecurityCheckEnabled: false,
          customNetworkListEnabled: true,
          eip1559V2Enabled: true,
          textDirection: 'auto',
          useCollectibleDetection: false,
          useStaticTokenList: false
        },
        addressBook: {
          addressBook: {
            '0x89': {
              '0x0f2D719407FdBeFF09D87557AbB7232601FD9F29': {
                address: '0x0f2D719407FdBeFF09D87557AbB7232601FD9F29',
                chainId: '0x89',
                isEns: false,
                memo: '',
                name: 'SYN Contract Address'
              }
            },
            '0x1': {
              '0x68c929e7b8FB06c58494a369f6f088Fff28F7C77': {
                address: '0x68c929e7b8FB06c58494a369f6f088Fff28F7C77',
                chainId: '0x1',
                isEns: false,
                memo: '',
                name: '0Bets Polygon'
              }
            }
          }
        },
        customTokens: [
          {
            chainId: '0x89',
            tokenContractAddress: '0x111111',
            nickname: 'My Custom Token',
            tokenSymbol: 'MYTKN',
            decimalSpaces: '18'
          },
          {
            chainId: '0x89',
            tokenContractAddress: '0x22222',
            nickname: 'My Custom Token 2',
            tokenSymbol: 'MYTKN2',
            decimalSpaces: '6'
          }
        ]
      },
      downloadFileName: 'custom_rpc_settings.json',
      downloaded: false
    }
  },

  computed: {
    ...mapState(['activeNetwork']),
    ...mapGetters(['chainSettings']),
    settingsList() {
      return this.chainSettings
        .map((s) => ({
          ...s,
          chainId: getChain(this.activeNetwork, s.chain)?.network.chainId
        }))
        .filter(({ chain, network }) => isEvmChain(this.activeNetwork, chain) && network.custom)
    }
  },

  methods: {
    download() {
      const customRpcs = this.settingsList.map((setting) => {
        const { asset, network } = setting // chain, chainId
        const { name, rpcUrl, chainId } = network // custom, coinType, isTestnet

        return {
          chainId,
          nickname: name,
          rpcPrefs: {
            blockExplorerUrl: ''
          },
          rpcUrl,
          ticker: asset
        }
      })

      const downloadPreset = { ...this.exportObj }
      downloadPreset['preferences']['frequentRpcListDetail'] = [
        {
          chainId: '0x539',
          nickname: 'Localhost 8545',
          rpcPrefs: {},
          rpcUrl: 'http://localhost:8545',
          ticker: 'ETH'
        },
        ...customRpcs
      ]
      downloadPreset['customTokens'] = customRpcs

      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(downloadPreset))
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute('href', dataStr)
      downloadAnchorNode.setAttribute('download', this.downloadFileName)
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
      this.$nextTick(() => {
        this.downloaded = true
        setTimeout(() => {
          this.downloaded = false
        }, 5000)
      })
    }
  }
}
</script>
