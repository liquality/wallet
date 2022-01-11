<template>
  <div class="account-notes-container">
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  components: {
  },
  data () {
    return {
      notes: null
    }
  },
  props: ['accountId', 'asset'],
  computed: {
    ...mapGetters(['accountItem']),
    ...mapState([
      'activeWalletId',
      'activeNetwork'
    ]),
    account () {
      return this.accountItem(this.accountId)
    }
  },
  methods: {
    ...mapActions([
      'getUnusedAddresses'
    ])
  },
  async created () {
    this.notes = this.account?.notes || ''
  }
}
</script>

<style lang="scss">
.account-notes-container {
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
