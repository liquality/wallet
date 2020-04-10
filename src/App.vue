<template>
  <div id="app">
    <div class="cover">
      <nav class="navbar navbar-expand-lg navbar-dark mb-3">
        <div class="container">
          <router-link class="navbar-brand" to="/">p2p Exchange <sup>testnet &alpha;</sup></router-link>
        </div>
      </nav>
      <div class="container text-center">
        <h1 class="display-4 text-white">Your keys, your coins</h1>
        <h2 class="mb-0 h5 font-weight-light text-white">Trade securely without middlemen, thanks to Atomic Swaps!</h2>
      </div>
    </div>
    <router-view class="container mt-4 mb-5" />
    <p class="text-center text-muted" v-if="footer">connected to {{count}} peers ~ last message {{message || 'null'}}</p>
  </div>
</template>

<script>
import createTorrent from 'create-torrent'
// import parseTorrent from 'parse-torrent'
import WebTorrent from 'webtorrent'

export default {
  data () {
    return {
      count: 0,
      message: null,
      footer: false
    }
  },
  created () {
    const { query } = this.$route
    const { handshake } = query
    if (!handshake) return

    this.footer = true
    const ref = this
    const client = new WebTorrent()

    createTorrent(Buffer.from('Chancellor on Brink of Second Bailout for Banks'), {
      name: 'Bitcoin',
      createdBy: 'Satoshi',
      announceList: [
        'wss://tracker.btorrent.xyz',
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.fastcast.nz',
        'wss://tracker.openwebtorrent.com'
      ]
    }, (err, file) => {
      if (err) {
        console.log(err)
        return
      }

      client.seed(file, function (torrent) {
        torrent.on('wire', function (wire, addr) {
          console.log('connected to a peer', wire)
          ref.count++

          wire.on('unknownmessage', buffer => {
            ref.message = buffer.toString().trim()
          })

          wire._message(21, [], handshake)
        })
      })

      client.add(file, function (torrent) {
        torrent.on('wire', function (wire, addr) {
          console.log('connected to a peer', wire)
          ref.count++

          wire.on('unknownmessage', buffer => {
            ref.message = buffer.toString().trim()
          })

          wire._message(21, [], handshake)
        })
      })
    })
  }
}
</script>

<style lang="scss">
.cover {
  background: linear-gradient(180deg,hsl(232, 47%, 58%),hsl(232, 47%, 55%));
  min-height: 490px;
  margin-bottom: -290px;

  .display-4 {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    min-height: 610px;
    margin-bottom: -460px;

    .display-4 {
      font-size: 2rem;
    }
  }

  @media (max-width: 375px) {
    .display-4 {
      font-size: 1.6rem;
    }
  }
}

.modal {
  overflow-x: hidden!important;
  overflow-y: auto!important;
}

.modal-content, .card, .table {
  box-shadow: 0 1px 0 0 rgba(22,29,37,.05), 0 0 0 0 transparent!important;
}

.table {
  border-radius: 0.25rem!important;
  border-collapse: separate!important;
  border-spacing: 0!important;
}

.btn-primary {
  box-shadow: inset 0 1px 0 0 #6774c8, 0 1px 0 0 rgba(22,29,37,.05), 0 0 0 0 transparent!important;
  background: linear-gradient(180deg,hsl(232, 47%, 58%),hsl(232, 47%, 55%))!important;
}

.navbar-brand {
  margin: 0 auto!important;
}
</style>
