<template>
  <input :value="text" @input="(event) => (text = event.target.value)" v-on:keyup.enter="submit" />
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  props: ['recipient'],
  data() {
    return {
      text: ''
    }
  },
  computed: {
    ...mapState(['activeWalletId', 'addresses'])
  },
  methods: {
    ...mapActions(['updateMessages']),
    submit() {
      const message = {
        recipient: this.recipient,
        timestamp: Math.floor(Date.now() / 1000),
        message: this.text
      }

      this.updateMessages(message)
    }
  }
}
</script>

<style lang="scss"></style>
