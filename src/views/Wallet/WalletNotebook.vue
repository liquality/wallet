<template>
  <div>
    <div class="wallet-activity">
      <input
        :value="text"
        @input="(event) => (text = event.target.value)"
        placeholder="Paste address of recipient"
      />
      <button @click="onSubmit">Submit</button>
    </div>
    <div v-for="(recipient, idx) in getNotebook" :key="idx">
      <p @click="() => startMessaging(recipient)">Recipient {{ idx + 1 }}: {{ recipient }}</p>
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

<style lang="scss"></style>
