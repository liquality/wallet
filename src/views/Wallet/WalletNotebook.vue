<template>
  <div>
    <div class="input-data">
      <input
        :value="text"
        @input="(event) => (text = event.target.value)"
        placeholder="Paste address of recipient"
        v-on:keyup.enter="submit"
      />
    </div>
    <div v-for="(recipient, idx) in getNotebook" :key="idx">
      <p class="recipient" @click="() => startMessaging(recipient)">
        <strong>Recipient {{ idx + 1 }}: </strong> {{ recipient }}
      </p>
    </div>
  </div>
</template>

<script>
import ActivityFilter from '@/components/ActivityFilter'
import TransactionList from '@/components/TransactionList'
import { mapGetters, mapActions } from 'vuex'
import EmptyActivity from '@/components/EmptyActivity'

export default {
  props: ['accountId'],
  components: {
    ActivityFilter,
    TransactionList,
    EmptyActivity
  },
  data() {
    return {
      text: ''
    }
  },
  computed: {
    ...mapGetters(['getNotebook'])
  },
  methods: {
    ...mapActions(['updateNotebook']),
    onSubmit() {
      this.updateNotebook({ address: this.text })
    },
    startMessaging(recipient) {
      this.$router.push({
        name: 'WalletMessenger',
        params: {
          recipient
        }
      })
    }
  },
  created() {
    console.log(this.accountId)
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

.recipient {
  cursor: pointer;
  margin-bottom: 10px;
  padding: 0 15px;
}
</style>
