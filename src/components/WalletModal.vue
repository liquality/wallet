<template>
  <Modal type="modal-sm" @close="$emit('close')">
    <ul class="list-group list-group-flush mt-1 mb-1 text-center">
      <li class="list-group-item h4 mb-0">
        {{wallet.toUpperCase()}}

        <div v-if="qrcode" v-html="qrcode" />

        <p class="h5">{{balance}} {{wallet.toUpperCase()}}</p>
      </li>
      <li class="list-group-item font-weight-normal cursor-pointer" @click="$emit('refresh')">Refresh balance</li>
    </ul>
  </Modal>
</template>

<script>
import QRCode from 'qrcode'

import Modal from '@/components/Modal'

export default {
  data () {
    return {
      qrcode: null
    }
  },
  components: {
    Modal
  },
  props: {
    wallet: String,
    address: String,
    balance: [String, Number]
  },
  created () {
    const uri = [
      // this.wallet.toLowerCase(),
      this.address
    ].join(':')

    QRCode.toString(uri, {
      type: 'svg'
    }, (err, svg) => {
      if (err) throw err

      this.qrcode = svg
    })
  }
}
</script>

<style lang="scss">
.list-group-flush {
  a {
    margin: 0;
  }

  > a:first-child {
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;
  }

  > a:last-child {
    border-bottom-left-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
  }
}
</style>
