<template>
  <div class="full-tab-container">
    <NavBar :showMenu="false">
      <span class="full-tab-container-title"> Wallet Connect</span>
    </NavBar>
    <div class="full-tab-container-content">
      <Connections @paired="onPair" :pair-request="pairRequest"></Connections>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'
import Connections from './Connections'

export default {
  components: {
    NavBar,
    Connections
  },
  props: {
    sessionRequest: {
      type: String,
      required: false,
      default: null
    },
    pairRequest: {
      type: String,
      required: false,
      default: null
    },
    methodRequest: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      rawUri: null,
      currentView: ''
    }
  },
  computed: {
    currentViewFromProps() {
      if (this.pairRequest) {
        return 'connections'
      } else if (this.sessionRequest) {
        return 'session-request'
      } else if (this.methodRequest) {
        return 'method-request'
      } else {
        return 'connections'
      }
    }
  },
  methods: {
    async onPair({ topic }) {
      this.pairTopic = topic
      this.currentView = 'session-request'
    }
  },
  async created() {
    this.currentView = this.currentViewFromProps
    // if (this.$route.query.uri) {
    //   const uri = encodeURIComponent(this.$route.query.uri)
    //   await this.$router.replace({ name: 'WalletConnectPair', query: { uri } })
    // }
  }
}
</script>

<style lang="scss"></style>
