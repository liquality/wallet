import { PageProvider } from './pageProvider'
import { COMMON_REQUEST_MAP } from './utils'
import { SystemInstruction, Keypair } from '@solana/web3.js'


/*
 TODO's:
  1. Replace pk and Keypair with getSigner() which is coming from chainify
  2. Format data that is coming from dapps before displaying to the UI
 */

const pk = [6,
  156,
  217,
  190,
  96,
  152,
  144,
  147,
  95,
  212,
  39,
  36,
  138,
  228,
  121,
  28,
  91,
  45,
  141,
  33,
  114,
  233,
  139,
  71,
  200,
  124,
  210,
  177,
  215,
  3,
  76,
  111,
  174,
  138,
  178,
  242,
  155,
  43,
  25,
  71,
  150,
  117,
  91,
  225,
  14,
  91,
  19,
  95,
  25,
  78,
  147,
  187,
  217,
  29,
  148,
  135,
  141,
  141,
  22,
  205,
  235,
  149,
  125,
  100
]

const acc = Keypair.fromSecretKey(Uint8Array.from(pk))



class SolanaPageProvider extends PageProvider {
  async handleRequest(req) {
    const solana = this.window.providerManager.getProviderFor('SOL')
    const method = COMMON_REQUEST_MAP[req.method] || req.method
    return solana.getMethod(method)(...req.params)
  }
  setup() {
    this.window.bitkeep = {
      solana: {
        isBitKeep: true,
        connect: async () => {
          const { accepted } = await this.window.providerManager.enable('solana')
          const solana = this.window.providerManager.getProviderFor('SOL')
          const addresses = await solana.getMethod('wallet.getAddresses')()
          const [address] = addresses;
          const { publicKey } = address;

          return publicKey;
        },
        getAccount: async () => {
          const { accepted } = await this.window.providerManager.enable('solana')
          const solana = this.window.providerManager.getProviderFor('SOL')
          const addresses = await solana.getMethod('wallet.getAddresses')()
          const [address] = addresses;
          const { publicKey } = address;
          return publicKey;
        },
        signTransaction: async (payload) => {
          const solana = this.window.providerManager.getProviderFor('SOL')
          let from, to, value, data
          console.log('WALLET: signTransaction ', payload)

          payload.instructions.forEach(instruction => {
            try {
              const decoded = SystemInstruction.decodeTransfer(instruction)
              if (decoded) {
                console.log(decoded)
                from = decoded.fromPubkey.toString()
                to = decoded.toPubkey.toString()
                value = 2
              }
            } catch (err) {
              console.log(err)
            }
          })
          const result = await solana.getMethod('wallet.sendTransaction')({ from, to, value, data: [payload] })
          const signed = payload.sign(acc)

          return signed
        },
        signAllTransactions: async (payload) => {
          const solana = this.window.providerManager.getProviderFor('SOL')
          const addr = 'CkLc7yb34KcQn3LdpMt3zNexbFEtqvaHXwBLBkxULjjq'
          try {
            await solana.getMethod('wallet.sendTransaction')({ from: addr, to: addr, value: 2, data: payload })

            payload.forEach(tx => tx.sign(acc))

            return payload
          } catch (err) {
            console.log(err)
          }

        },
        signMessage: async (payload) => {
          console.log('signMessage', payload)
        }
      }

    }
  }
}

export { SolanaPageProvider }
