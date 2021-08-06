<template>
  <Modal @close="$emit('close')">
    <template #header>
      <h5 id="learn_about_swaps_types_header">
        Learn about swap providers
      </h5>
    </template>
    <template>
      <div class="swap-providers-info">
        <p>There are tradeoffs different swap providers make across factors like convenience, security, liquidity, and fees. At a glance:</p>
        <div class="swap-providers-info_links mb-4 border-bottom">
          <ul>
            <li v-for="provider in providers" :key="provider.id" class="py-1 px-2">
              <span class="d-flex align-items-center"><img :src="getProviderIcon(provider.id)" class="mr-2" /> {{ provider.name }}</span>
            </li>
          </ul>
        </div>
        <div v-for="provider in providers" :key="provider" class="swap-providers-info_list border-bottom mb-4">
          <SwapProviderLabel :network="activeNetwork" :provider="provider.id" class="mb-2" />
          <h6>{{ provider.title }}</h6>
          <p>{{ provider.description }}</p>
          <div class="row">
            <div class="col">
              <h6>Pros</h6>
              <ul><li v-for="pro in provider.pros" :key="pro">{{ pro }}</li></ul>
            </div>
            <div class="col">
              <h6>Cons</h6>
              <ul><li v-for="con in provider.cons" :key="con">{{ con }}</li></ul>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <h6>Fee Structure</h6>
              <ul><li v-for="fee in provider.fees" :key="fee">{{ fee }}</li></ul>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapState } from 'vuex'
import Modal from '@/components/Modal'
import SwapProviderLabel from '@/components/SwapProviderLabel.vue'
import { getSwapProviderConfig, getSwapProviderIcon, getSwapProviderInfo } from '@/utils/swaps'
import buildConfig from '@/build.config'

export default {
  components: {
    Modal,
    SwapProviderLabel
  },
  computed: {
    ...mapState(['activeNetwork']),
    providers () {
      return Object.entries(buildConfig.swapProviders[this.activeNetwork])
        .map(([provider, providerConfig]) => {
          return {
            id: provider,
            name: providerConfig.name,
            ...getSwapProviderInfo(this.activeNetwork, provider)
          }
        })
    }
  },
  methods: {
    getProviderName (provider) {
      const config = getSwapProviderConfig(this.activeNetwork, provider)
      return config.name
    },
    getProviderIcon (provider) {
      return getSwapProviderIcon(this.activeNetwork, provider)
    },
    getProviderInfo (provider) {
      return getSwapProviderInfo(this.activeNetwork, provider)
    }
  }
}
</script>

<style lang="scss" scoped>
.swap-providers-info {
  &_links {
    ul {
      list-style-type: none;
      text-align: center;
      padding: 0;

      li {
        display: inline-block;
      }
    }

    img {
      height: 24px;
      width: auto;
      max-width: 20px;
    }
  }

  &_list {
    ul {
      list-style-position: inside;
      padding: 0;
    }
  }
}
</style>
