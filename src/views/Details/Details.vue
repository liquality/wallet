<template>
  <div class="details-wrapper">
    <NavBar :showBackButton="true" :backClick="goBack" :backLabel="'Back'">
      {{ title }}
    </NavBar>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  data () {
    return {
      advanced: false,
      secretHidden: true,
      timeline: [],
      showFeeSelector: false,
      feeSelectorLoading: false,
      feeSelectorAsset: null,
      newFeePrice: null
    }
  },
  props: ['id'],
  computed: {
    ...mapGetters(['activity']),
    item () {
      return this.activity.find((item) => item.id === this.id)
    },
    title () {
      if (this.item.type === 'SWAP') {
        return `Swap ${this.item.from} to ${this.item.to}`
      }

      return 'Transaction Detail'
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss">
.details-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
