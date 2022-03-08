<template>
  <div class="account-details-container">
    <NavBar
      :showMenu="false"
      :showBack="false"
      :showBackButton="true"
      :backClick="back"
      backLabel="Back"
    >
      <span class="account-title">Account Details</span>
    </NavBar>
    <div class="account-details-content">
      <div class="account-details-top">
        <div class="account-info">
          <img :src="getAccountIcon(account.chain)" class="asset-icon" />
          <div class="account-name">
            <div class="input-group">
              {{ account.name }} -
              <input
                type="text"
                autocomplete="off"
                class="form-control form-control-sm account-name-text"
                v-model="accountAlias"
                placeholder="Choose name"
                id="choose-account-name"
                v-if="editingAccountAlias"
                required
                :class="{ 'is-invalid': accountAliasError }"
              />
              <span v-else class="account-name-text">{{ account.alias }}</span>
              <div class="input-group-append">
                <button
                  v-if="!editingAccountAlias"
                  class="btn btn-icon"
                  @click="setEditAccountAlias"
                >
                  <font-awesome-icon :icon="faPencilAlt" />
                </button>
                <button class="btn btn-icon" @click="updateAccountAlias" v-else>
                  <SpinnerIcon class="btn-loading" v-if="updatingAccount" />
                  <font-awesome-icon :icon="faSave" v-else />
                </button>
              </div>
            </div>
            <small class="text-danger form-text text-right" v-if="accountAliasError">
              {{ accountAliasError }}
            </small>
          </div>
        </div>
        <div class="account-address">
          <button
            class="btn btn-light btn-outline-primary"
            @click="copyAddress"
            v-tooltip.bottom="{
              content: addressCopied ? 'Copied!' : 'Click to copy',
              hideOnTargetClick: false
            }"
          >
            {{ address ? shortenAddress(address) : '' }}
          </button>
        </div>
        <div class="account-qr">
          <div v-html="qrcode" class="qr-code" id="qr-code"></div>
        </div>
      </div>
      <div class="details-tabs">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <router-link
              class="nav-link"
              id="details-options-tab"
              :to="{
                name: 'AccountDetailsOptions',
                params: {
                  accountId,
                  asset
                }
              }"
            >
              Options
            </router-link>
          </li>
          <!-- <li class="nav-item">
            <router-link
              class="nav-link"
              id="details-notes-tab"
              :to="{
                name: 'AccountDetailsNotes',
                params: {
                  accountId,
                  asset
                }
              }"
            >
              Notes
            </router-link>
          </li> -->
        </ul>
        <div class="details-tab-content">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'
import NavBar from '@/components/NavBar.vue'
import { shortenAddress } from '@/utils/address'
import { getAccountIcon } from '@/utils/accounts'
import QRCode from 'qrcode'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPencilAlt, faSave } from '@fortawesome/free-solid-svg-icons'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import _ from 'lodash'

export default {
  components: {
    NavBar,
    SpinnerIcon,
    FontAwesomeIcon
  },
  data() {
    return {
      addressCopied: false,
      address: null,
      qrcode: null,
      accountAlias: '',
      accountAliasError: false,
      editingAccountAlias: false,
      updatingAccount: false,
      faPencilAlt,
      faSave
    }
  },
  props: ['accountId', 'asset'],
  computed: {
    ...mapGetters(['accountItem']),
    ...mapState(['activeWalletId', 'activeNetwork']),
    account() {
      return this.accountItem(this.accountId)
    },
    chainName() {
      return {
        bitcoin: 'bitcoin',
        ethereum: 'ethereum',
        near: 'near',
        solana: 'solana',
        rsk: 'ethereum',
        bsc: 'ethereum',
        polyon: 'ethereum',
        terra: 'terra'
      }[cryptoassets[this.asset].chain]
    }
  },
  methods: {
    ...mapActions(['getUnusedAddresses', 'updateAccount', 'validateAccountAlias']),
    getAccountIcon,
    shortenAddress,
    async copyAddress() {
      await navigator.clipboard.writeText(this.address)
      this.addressCopied = true
      setTimeout(() => {
        this.addressCopied = false
      }, 2000)
    },
    back() {
      const { accountId, asset } = this.$route.params
      this.$router.push({ name: 'AccountAsset', params: { accountId, asset } })
    },
    setEditAccountAlias() {
      this.editingAccountAlias = true
    },
    async updateAccountAlias() {
      if (!this.accountAliasError && this.account?.alias !== this.accountAlias) {
        this.updatingAccount = true
        const account = {
          ...this.account,
          alias: this.accountAlias
        }
        await this.updateAccount({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          account
        })

        this.updatingAccount = false
      }

      this.editingAccountAlias = false
    },
    async checkAccountAlias() {
      if (this.editingAccountAlias) {
        this.accountAliasError = await this.validateAccountAlias({
          accountAlias: this.accountAlias
        })
      } else {
        this.accountAliasError = null
      }
    }
  },
  async created() {
    if (this.account?.type.includes('ledger')) {
      this.address = chains[cryptoassets[this.asset]?.chain]?.formatAddress(
        this.account.addresses[0],
        this.activeNetwork
      )
    } else {
      const addresses = await this.getUnusedAddresses({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.asset],
        accountId: this.accountId
      })
      const chainId = cryptoassets[this.asset]?.chain
      this.address = chains[chainId]?.formatAddress(addresses[0], this.activeNetwork)
    }

    this.debouncedCheckAccountAlias = _.debounce(this.checkAccountAlias, 500)
    this.checkAccountAlias()

    this.accountAlias = this.account?.alias || ''

    const uri = this.chainName === 'terra' ? this.address : [this.chainName, this.address].join(':')

    QRCode.toString(
      uri,
      {
        type: 'svg',
        margin: 0
      },
      (err, svg) => {
        if (err) throw err

        this.qrcode = svg
      }
    )
  }
}
</script>

<style lang="scss">
.account-details-container {
  overflow-y: auto;
  overflow-x: hidden;
  .account-details-content {
    .account-details-top {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0 0 20px 0;
      background: #ffffff !important;
      color: $color-text-primary !important;
      text-align: center;
      position: relative;

      .account-info {
        padding: 15px 0;
        display: flex;
        flex-direction: column;
        align-items: center;

        .account-name {
          max-width: 280px;
          .account-name-text {
            text-align: left;
            min-width: 15px;
            margin-left: 5px;
          }
        }

        .account-name,
        .account-name > .input-group {
          display: flex;
          align-items: center;
        }
      }

      .qr-code {
        margin: 15px auto 0 auto;
        width: 75px;
      }
    }

    &_actions {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;

      &_button {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 70px;
        border: 0;
        cursor: pointer;
        color: $color-text-secondary;
        background: none;
        font-weight: 600;
        font-size: 13px;

        &.disabled {
          opacity: 0.5;
          cursor: auto;
        }

        &_wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 44px;
          background: #ffffff;
          border-radius: 50%;
          margin-bottom: 4px;
        }

        &_icon {
          width: 16px;
          height: 16px;
        }

        &_swap {
          height: 30px;
        }
      }
    }

    &_address {
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      button {
        font-size: $h4-font-size;
        font-weight: normal;
        color: $color-text-secondary;
        border: 0;
        background: none;
        outline: none;
      }

      .eye-btn {
        position: absolute;
        right: 60px;
        height: 40px;
        width: 35px;
        background-color: transparent;
        display: flex;
        align-items: center;

        svg {
          width: 20px;
        }

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}

.details-tabs {
  margin: 0;
  padding: 0;
}
.nav-tabs {
  height: 48px;
  border-bottom: none !important;

  .nav-item {
    width: 50%;
    height: 100%;
    margin-bottom: none !important;

    .nav-link {
      height: 100%;
      font-size: $font-size-sm;
      font-weight: 500;
      text-transform: uppercase;
      color: #646f85;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none !important;
      border-bottom: 1px solid $hr-border-color !important;
      padding: 0 !important;
    }

    .nav-link:hover,
    .router-link-active {
      color: #000d35;
      font-weight: 600;
      border: none !important;
      border-bottom: 1px solid #1d1e21 !important;
    }
  }
}

.details-tab-content {
  a {
    color: $color-text-primary;
  }
  a:hover {
    text-decoration: none;
  }
}
</style>
