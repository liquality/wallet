<template>
  <div class="wallet-stats">
    <div>
      <div>
        <span
          class="wallet-stats_total"
          :style="{ fontSize: formatFontSize(total) }"
        >
          {{ total }}
        </span>
        <span>USD</span>
      </div>
      <span id="total_assets">
        {{ accountsData.length }} Asset{{
          accountsData.length === 1 ? "" : "s"
        }}
      </span>
      <div class="wallet-actions">
        <router-link
          to="/assets/send"
          class="wallet-actions-item send-action"
          id="send_action"
        >
          <SendIcon />
          Send
        </router-link>
        <router-link
          to="/assets/swap.send"
          class="wallet-actions-item swap-action"
          id="swap_action"
        >
          <SwapIcon />
          Swap
        </router-link>
        <router-link
          to="/assets/receive"
          class="wallet-actions-item receive-action"
          id="receive_action"
        >
          <ReceiveIcon />
          Receive
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SendIcon from '@/assets/icons/send_o.svg'
import ReceiveIcon from '@/assets/icons/receive_o.svg'
import SwapIcon from '@/assets/icons/swap_o.svg'
import { formatFiat } from '@/utils/coinFormatter'
import { formatFontSize } from '@/utils/fontSize'

export default {
  components: {
    SendIcon,
    ReceiveIcon,
    SwapIcon
  },
  computed: {
    ...mapGetters(['totalFiatBalance', 'accountsData']),
    total () {
      return formatFiat(this.totalFiatBalance)
    }
  },
  methods: {
    formatFontSize (value) {
      return formatFontSize(value)
    }
  }
}
</script>

<style lang="scss">
.wallet-stats {
  display: flex;
  height: 225px;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: $brand-gradient-primary;
  color: $color-text-secondary;
  font-size: $font-size-lg;

  &_total {
    font-size: 50px;
    line-height: 61px;
  }

  .wallet-actions {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-top: 10px;

    .wallet-actions-item {
      color: #ffffff;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 57px;

      svg {
        margin-bottom: 5px;
      }

      &.send-action {
        svg {
          width: 44px;
          height: 44px;
        }
        margin-right: 14px;
      }

      &.swap-action {
        svg {
          width: 57px;
          height: 57px;
        }
      }

      &.receive-action {
        margin-left: 14px;
        svg {
          width: 44px;
          height: 44px;
        }
      }
    }
  }
}
</style>
