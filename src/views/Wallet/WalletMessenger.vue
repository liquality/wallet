<template>
  <div>
    <input
      :value="text"
      @input="(event) => (text = event.target.value)"
      v-on:keyup.enter="submit"
      placeholder="Message"
    />
    <div v-for="{ message, timestamp, recipient } in messageHistory" :key="timestamp">
      <div>
        <p>
          From: {{ recipient.slice(0, 6) + '...' + recipient.slice(-6) }} at:
          {{ convertToNow(timestamp) }}
        </p>
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapActions, mapState } from 'vuex'
export default {
  props: ['recipient'],
  data() {
    return {
      text: ''
    }
  },
  computed: {
    ...mapState(['messages', 'addresses']),

    messageHistory() {
      return this.messages[this.recipient].reverse()
    }
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
    },
    convertToNow(timestamp) {
      return moment(timestamp * 1000).format('HH:mm:ss')
    }
  }
}
</script>

<style lang="scss"></style>
