<template>
  <div>
    <input
      :value="text"
      @input="(event) => (text = event.target.value)"
      v-on:keyup.enter="submit"
      placeholder="Message"
    />
    <div
      v-for="({ message, timestamp, recipient: _recipient, sender }, idx) in messageHistory"
      :key="idx"
    >
      <div class="message-wrapper">
        <p :class="{ active: _recipient === sender }">
          From: {{ sender.slice(0, 6) + '...' + sender.slice(-6) }} at:
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
      if (this.messages?.[this.recipient]) {
        return this.messages[this.recipient].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
      }
      return []
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

<style lang="scss">
.message-wrapper {
  display: flex;
  align-content: flex-start;
  flex-direction: column;

  .active {
    align-items: flex-end;
  }
}
</style>
