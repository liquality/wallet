<template>
  <div class="account-options-container">
    <ListItem :to="{ name: 'ManageAssets' }" :item-class="'h-padding'"> Manage Assets </ListItem>
    <ListItem :to="{ name: 'ManageAccounts' }" :item-class="'h-padding'">
      Hide/Show Accounts
    </ListItem>

    <ListItem
      :item-class="'h-padding no-pointer'"
      :item-styles="{
        height: exportEnabled ? '125px' : '155px'
      }"
    >
      Private Key
      <template #sub-title v-if="exportEnabled">
        <InfoNotification>
          We can’t access your private keys on ledger. It’s designed like that to keep them safe.
        </InfoNotification>
      </template>
      <template #sub-title v-else>
        <div class="account-options-section">
          <div>
            Everone with your private key will have full access to your account. Be prepared.
          </div>
          <router-link
            class="btn btn-light btn-outline-primary"
            :to="{
              name: 'ExportPrivateKeyWarning',
              params: { accountId }
            }"
          >
            Export private key
          </router-link>
        </div>
      </template>
    </ListItem>
    <ListItem
      v-if="isLedgerAccount"
      :item-class="'h-padding no-pointer'"
      :item-styles="{ height: '165px' }"
    >
      Remove Ledger Account from view
      <template #sub-title>
        <div class="account-options-section">
          <div>
            You can remove a disconnected ledger from the wallet at any time. It will automatically
            appear again the next time you’ll use it.
          </div>
          <button class="btn btn-light btn-outline-primary" @click="tryToRemoveLedgerAccount">
            Remove Ledger account from View
          </button>
        </div>
      </template>
    </ListItem>
    <ListItem
      :item-class="'h-padding no-pointer'"
      :item-styles="{ height: '155px', 'pointer-events': 'none' }"
    >
      History of Transactions (Activities)
      <template #sub-title>
        <div class="account-options-section">
          <div>
            See all account related transactions and history on the Explorer. Remember, everone can
            see it.
          </div>
          <a target="_blank" class="btn btn-light btn-outline-primary" :href="explorerLink">
            Go to the Explorer
          </a>
        </div>
      </template>
    </ListItem>
    <Modal v-if="removeLedgerAccountModalOpen" @close="closeRemoveLedgerModal">
      <template #header>
        <h6>REMOVE Ledger Account?</h6>
      </template>
      <template>
        You can use this account again by connecting the Ledger with this wallet .Your funds will be
        safe.
      </template>
      <template #footer>
        <button class="btn btn-primary btn-lg" @click="removeLedgerAccount">Remove</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import { chains, ChainId } from '@liquality/cryptoassets'
import { getAddressExplorerLink } from '@/utils/asset'
import ListItem from '@/components/ListItem'
import InfoNotification from '@/components/InfoNotification'
import Modal from '@/components/Modal'

export default {
  components: {
    ListItem,
    InfoNotification,
    Modal
  },
  data() {
    return {
      exportEnabled: true,
      address: null,
      removeLedgerAccountModalOpen: false
    }
  },
  props: ['accountId', 'asset'],
  computed: {
    ...mapGetters(['accountItem']),
    ...mapState(['activeWalletId', 'activeNetwork']),
    account() {
      return this.accountItem(this.accountId)
    },
    explorerLink() {
      if (this.account) {
        return getAddressExplorerLink(this.address, this.asset, this.activeNetwork)
      }

      return '#'
    }
  },
  methods: {
    ...mapActions(['getUnusedAddresses', 'removeAccount']),
    closeRemoveLedgerModal() {
      this.removeLedgerAccountModalOpen = false
    },
    tryToRemoveLedgerAccount() {
      this.removeLedgerAccountModalOpen = true
    },
    async removeLedgerAccount() {
      await this.removeAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        id: this.accountId
      })

      this.$router.replace('/wallet')
    }
  },
  async created() {
    if (this.account?.type.includes('ledger')) {
      this.exportEnabled = false
      this.address = chains[cryptoassets[this.asset]?.chain]?.formatAddress(
        this.account.addresses[0],
        this.activeNetwork
      )
    } else {
      const chainId = cryptoassets[this.asset]?.chain
      if (chainId === ChainId.Bitcoin) {
        this.exportEnabled = false
      } else {
        this.exportEnabled = true
      }
      const addresses = await this.getUnusedAddresses({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.asset],
        accountId: this.accountId
      })
      this.address = chains[chainId]?.formatAddress(addresses[0], this.activeNetwork)
    }
  }
}
</script>

<style lang="scss">
.account-options-container {
  margin: 0;
  padding: 0;
  overflow: auto;
  .account-options-section {
    a {
      pointer-events: all !important;
      color: $color-primary !important;
    }
    div {
      margin: 15px 0;
    }
  }
}
</style>
