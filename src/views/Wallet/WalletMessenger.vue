<template>
  <div>
    <div class="input-data">
      <input
        :value="text"
        @input="(event) => (text = event.target.value)"
        v-on:keyup.enter="submit"
        placeholder="Enter a message"
      />
    </div>
    <div
      v-for="({ message, timestamp, recipient: _recipient, sender }, idx) in messageHistory"
      :key="idx"
    >
      <div class="message-wrapper">
        <p :class="{ active: _recipient === sender }">
          From: <strong>{{ sender.slice(0, 6) + '...' + sender.slice(-6) }}</strong> at:
          {{ convertToNow(timestamp) }}
        </p>
        <p :class="{ active: _recipient === sender }">{{ message }}</p>
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
      this.text = ''
    },
    convertToNow(timestamp) {
      return moment(timestamp * 1000).format('HH:mm:ss')
    }
  }
}
</script>

<style lang="scss">
.input-data {
  display: flex;
  align-items: center;
  width: 100%;

  display: flex;
  justify-content: center;

  input {
    border: none;
    padding-left: 10px;
    margin: 8px 0;
    border-bottom: 1px solid black;
    padding: 15px;
    font-size: 15px;
    line-height: 1;
    width: 88%;
  }
}

.message-wrapper {
  display: flex;
  align-content: flex-start;
  flex-direction: column;
  padding: 0 20px;
  margin-bottom: 15px;

  .active {
    align-self: flex-end;
  }

  p {
    margin-bottom: 0.2rem;
  }
}
</style>
