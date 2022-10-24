<template>
  <div>
    <div class="liquality-timeline">
      <small id="start_time">{{ prettyTime(item.startTime) }}</small>
      <h3>{{ $t('common.started') }}</h3>
      <div class="liquality-timeline_inner">
        <div class="liquality-timeline_container left completed">
          <div class="content">
            <h3 :id="asset">
              {{ $t('common.from') }}:
              <a
                :href="addressLink(fromAddress, asset)"
                target="_blank"
                id="transaction_details_send_from_link"
                >{{ shortenAddress(addPrefix(fromAddress, asset)) }}</a
              >
              <CopyIcon @click="copy(addPrefix(fromAddress, asset))" />
            </h3>
          </div>
        </div>
        <div
          class="liquality-timeline_container right"
          :class="{ completed: item.status === 'SUCCESS' && tx && tx.confirmations > 0 }"
        >
          <div class="content">
            <h3 :id="item.to">
              {{ $t('common.to') }}:
              <a
                :href="addressLink(item.toAddress, item.to)"
                target="_blank"
                id="transaction_details_send_to_link"
                >{{ shortenAddress(addPrefix(item.toAddress, item.to)) }}</a
              >
              <CopyIcon @click="copy(addPrefix(item.toAddress, item.to))" />
            </h3>
          </div>
        </div>
      </div>
      <div v-if="item.status === 'SUCCESS' && tx && tx.confirmations > 0">
        <h3>{{ $t('common.completed') }}</h3>
        <small>{{ prettyTime(item.endTime) }}</small>
      </div>
    </div>
    <div class="text-center">
      <div class="advanced_button cursor-pointer" @click="advanced = !advanced">
        <div class="advanced_arrow">
          <ChevronRightIcon v-if="!advanced" />
          <ChevronDownIcon v-else />
        </div>
        <div>{{ $t('common.advanced') }}</div>
      </div>
    </div>
    <div class="table" v-if="advanced">
      <table class="table bg-white border-0 mb-1 mt-1">
        <tbody class="font-weight-normal">
          <tr id="transaction_id">
            <td class="text-muted text-left small-12">{{ $t('common.transactionId') }}</td>
            <td class="text-break text-primary">
              <span>
                <a :href="transactionLink" target="_blank" id="transactionLink">{{
                  shortenAddress(item.txHash)
                }}</a>
                <CopyIcon @click="copy(item.txHash)" class="copy-icon" />
              </span>
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12" id="your_token_id">
              {{ $t('common.tokenID') }}
            </td>
            <td class="text-break" v-if="item.nft.token_id">
              <span class="text-primary">
                {{ item.nft.token_id }}
                <CopyIcon @click="copy(item.nft.token_id)" class="copy-icon"
              /></span>
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">{{ $t('common.tokenStandard') }}</td>
            <td class="text-break" v-if="item.nft.standard">
              {{ item.nft.standard }}
            </td>
          </tr>
          <tr v-if="fromAddress" id="your_from_address">
            <td class="text-muted text-left small-12">
              {{ $t('components.nft.yourNFTFromAddress') }}
            </td>
            <td class="text-break text-primary">
              <span>
                {{ shortenAddress(addPrefix(fromAddress, asset)) }}
                <CopyIcon @click="copy(item.txHash)" class="copy-icon" />
              </span>
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12" id="your_to_address">
              {{ $t('components.nft.yourNFTToAddress') }}
            </td>
            <td class="text-break text-primary">
              <span>
                {{ shortenAddress(item.toAddress)
                }}<CopyIcon @click="copy(item.txHash)" class="copy-icon" />
              </span>
            </td>
          </tr>
          <tr v-if="fromAddress" id="transaction_id">
            <td class="text-muted text-left small-12">{{ $t('common.contractAddress') }}</td>
            <td class="text-break text-primary">
              <span>
                {{ shortenAddress(item.nft.asset_contract.address) }}
                <CopyIcon @click="copy(item.nft.asset_contract.address)" class="copy-icon" />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import moment from '@liquality/wallet-core/dist/src/utils/moment'

import { prettyBalance } from '@liquality/wallet-core/dist/src/utils/coinFormatter'
import {
  isChainEvmCompatible,
  getNativeAsset,
  getAddressExplorerLink,
  getTransactionExplorerLink
} from '@liquality/wallet-core/dist/src/utils/asset'

import CopyIcon from '@/assets/icons/copy.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'

export default {
  components: {
    CopyIcon,
    ChevronDownIcon,
    ChevronRightIcon
  },
  data() {
    return {
      advanced: false,
      secretHidden: true,
      showFeeSelector: false,
      feeSelectorLoading: false,
      newFeePrice: null
    }
  },
  props: ['id', 'tx', 'asset'],
  computed: {
    ...mapGetters(['client', 'accountItem']),
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history', 'fees']),
    item() {
      return this.history[this.activeNetwork][this.activeWalletId].find(
        (item) => item.id === this.id
      )
    },
    fromAddress() {
      return this.accountItem(this.accountId)?.addresses[0]
    },
    accountId() {
      return this.item.nft.accountId || this.item.accountId
    },
    transactionLink() {
      return getTransactionExplorerLink(this.item.txHash, this.asset, this.activeNetwork)
    }
  },
  methods: {
    ...mapActions(['updateTransactionFee', 'updateFees', 'checkPendingActions']),
    getNativeAsset,
    prettyBalance,
    shortenAddress,
    isChainEvmCompatible,
    getAddressExplorerLink,
    prettyTime(timestamp) {
      return moment(timestamp).format('L, LT')
    },
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    addressLink(address, asset) {
      if (asset && address) {
        return getAddressExplorerLink(address, asset, this.activeNetwork)
      }

      return '#'
    },
    addPrefix(address, asset) {
      return !address.startsWith('0x') && isChainEvmCompatible(asset, this.activeNetwork)
        ? '0x' + address
        : address
    }
  }
}
</script>

<style lang="scss">
.liquality-timeline {
  padding-bottom: 20px;
  text-align: center;

  &_inner {
    position: relative;
    width: 100%;
    margin: 8px 0;

    &::after {
      content: '';
      position: absolute;
      width: 0px;
      border-right: 1px dashed $color-secondary;
      top: 0;
      bottom: 0;
      left: 50%;
    }
  }

  h3 {
    margin: 2px 0;
    font-size: $font-size-base;
  }

  /* Container around content */
  &_container {
    min-height: 50px;
    position: relative;
    width: 50%;

    &::after {
      content: '';
      position: absolute;
      width: 11px;
      height: 11px;
      border: 1px solid $color-secondary;
      background: white;
      top: 0;
      border-radius: 50%;
      z-index: 1;
    }

    &.completed::after,
    &.pending::after {
      background-color: $color-secondary;
      border: 1px solid $hr-border-color;
    }

    &.completed:first-child::after,
    &.completed:last-child::after {
      background-color: $color-secondary;
      border: 0;
    }

    &:last-child {
      height: 0;
      min-height: 10px;
    }

    .content {
      position: relative;
      top: -3px;

      h3 svg {
        cursor: pointer;
        width: 14px;
        margin-left: 6px;
      }

      p {
        font-size: $font-size-sm;
        margin: 0;
      }
    }
  }

  /* Place the container to the left */
  .left {
    left: 0;
    padding-right: 14px;

    .content {
      text-align: right;
    }
  }

  /* Place the container to the right */
  .right {
    left: 50%;
    padding-left: 14px;

    .content {
      text-align: left;
    }
  }

  /* Fix the circle for containers on the right side */
  .right::after {
    left: -5px;
  }

  .left::after {
    right: -6px;
  }
}

.border-0 {
  box-shadow: none !important;

  tr:first-child {
    td {
      border-top: 0;
    }
  }

  tr:last-child {
    td {
      border-bottom: 0;
    }
  }
}

.advanced_button {
  padding: 19px 20px;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  gap: 6.5px;
  border-top: 1px solid #d9dfe5;

  .advanced_arrow {
    display: flex;
    align-items: center;

    svg {
      height: 10px !important;
      width: 10px !important;
    }
  }
}

.fee-update {
  padding-left: 10px;

  .btn-primary {
    margin-left: 10px;
    min-width: 60px;
  }

  &_fees {
    font-size: $font-size-tiny;
    margin: 6px 0;
  }
}
</style>
