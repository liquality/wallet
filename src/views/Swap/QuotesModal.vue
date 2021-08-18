<template>
  <Modal @close="$emit('close')">
    <template #header>
        <h5 id="available_quotes_header">
          {{ quotes.length }} AVAILABLE QUOTES
        </h5>
    </template>
      <template>
        <div>
          <p>These quotes are from different swap providers.</p>
          <div class="quote-list">
            <div class="row quote-list_header pb-2">
              <div class="col-5">Rate</div>
              <div class="col-7">Provider</div>
            </div>
            <div class="row quote-list_quote" v-for="quote in sortedQuotes" :key="quote.provider" :id="`${quote.provider}_rate_provider`" :class="{ 'quote-list_quote_active': quote.provider === selectedProvider }" @click="setSelectedProvider(quote.provider)">
              <div class="col-5 quote-list_quote_rate d-flex align-items-center">{{ getProviderRate(quote) }}</div>
              <div class="col-5 quote-list_quote_provider d-flex align-items-center">
                <img :src="getProviderIcon(quote)" class="mr-2" />
                {{ getProviderName(quote) }}
              </div>
              <div class="col-2 d-flex align-items-center"><TickBlue v-if="quote.provider === selectedProvider" class="quote-list_tick" /></div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div>
          <button class="btn btn-primary btn-block btn-lg"
                  id="select_quote_button"
                  @click="selectQuote">
              Select Quote
          </button>
          <div class="mt-3"><a href="#" @click="$emit('click-learn-more')" class="text-muted">Learn about swap types</a></div>
        </div>
    </template>
  </Modal>
</template>

<script>
import { mapState } from 'vuex'
import Modal from '@/components/Modal'
import TickBlue from '@/assets/icons/tick_blue.svg'
import { getSwapProviderConfig, getSwapProviderIcon } from '@/utils/swaps'
import { calculateQuoteRate, sortQuotes } from '@/utils/quotes'
import { dpUI } from '@/utils/coinFormatter'

export default {
  components: {
    Modal,
    TickBlue
  },
  data () {
    return {
      selectedProvider: null
    }
  },
  props: ['quotes', 'presetProvider'],
  computed: {
    ...mapState(['activeNetwork']),
    sortedQuotes () {
      return sortQuotes(this.quotes, this.activeNetwork)
    }
  },
  methods: {
    getProviderName (quote) {
      const config = getSwapProviderConfig(this.activeNetwork, quote.provider)
      return config.name
    },
    getProviderIcon (quote) {
      return getSwapProviderIcon(this.activeNetwork, quote.provider)
    },
    getProviderRate (quote) {
      return dpUI(calculateQuoteRate(quote))
    },
    setSelectedProvider (provider) {
      this.selectedProvider = provider
    },
    selectQuote () {
      this.$emit('select-quote', this.selectedProvider)
    }
  },
  created () {
    this.selectedProvider = this.presetProvider
  }
}
</script>

<style lang="scss" scoped>
.quote-list {
  &_header {
    font-weight: bold;
    text-transform: uppercase;
    border-bottom: 1px solid $hr-border-color;
  }

  &_quote {
    cursor: pointer;
    height: 58px;
    border-bottom: 1px solid $hr-border-color;

    &_rate {
      font-weight: bold;
      font-size: $font-size-head-title;
    }

    &_active, &:hover {
      background: #F0F7F9;
    }

    &_provider {
      img {
        width: 14px;
        height: auto;
      }
    }
  }

  &_tick {
    height: 13px;
  }
}

.modal-footer {
  div {
    width: 100%;
    text-align: center;
  }
}
</style>
