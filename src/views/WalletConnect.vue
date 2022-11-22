<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title">
        {{ $t('pages.accounts.addLedgerAccounts') }}
      </span>
    </NavBar>
    <div>
      <p><button @click="pair">Pair</button></p>
    </div>
  </div>
</template>

<script>
// import { mapActions, mapState, mapGetters } from 'vuex'
import NavBar from '@/components/NavBar'
import SignClient from '@walletconnect/sign-client'

let signClient

export default {
  components: {
    NavBar
  },
  data() {
    return {
      uri: null
    }
  },
  computed: {},
  methods: {
    async pair() {
      const uri = decodeURIComponent(this.uri)
      console.log('uri', uri)
      await signClient.pair({ uri })
    }
  },
  async created() {
    this.uri = encodeURIComponent(this.$route.query.uri)
    console.log('url', this.uri)
    signClient = await SignClient.init({
      projectId: 'ac71dc7e81867486cf788f934ef30369',
      // optional parameters
      relayUrl: 'wss://relay.walletconnect.com',
      metadata: {
        name: 'Liquality',
        description: 'One Wallet all Chains',
        url: 'https://liquality.io',
        icons: [
          'https://assets.website-files.com/61ae51cb7959d04801e85bc7/61ae51cb7959d04127e85c52_Liquality_logo.svg'
        ]
      }
    })

    signClient.on('session_proposal', async (event) => {
      console.log('session_proposal', event)
      const { id, params } = event
      const { requiredNamespaces } = params
      const { eip155 } = requiredNamespaces
      const { chains, methods, events } = eip155
      // Approve session proposal, use id from session proposal event and respond with namespace(s) that satisfy dapps request and contain approved accounts
      const req = {
        id,
        namespaces: {
          eip155: {
            accounts: [`${chains[0]}:0x2De315AE6abAfE5ee6101DD13802736977E4f700`],
            methods,
            events
          }
        }
      }
      console.log('req', req)
      const { topic, acknowledged } = await signClient.approve(req)
      console.log('topic', topic)
      // Optionally await acknowledgement from dapp
      const session = await acknowledged()
      console.log('session', topic)
      console.log('session', session)
    })
    signClient.on('session_event', (event) => {
      console.log('session_event', event)
    })
    signClient.on('session_request', (event) => {
      console.log('session_request', event)
    })
    signClient.on('session_ping', (event) => {
      console.log('session_ping', event)
    })
  }
}
</script>

<style lang="scss"></style>
