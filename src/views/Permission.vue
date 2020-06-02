<template>
  <div>
    <Cover title="Permission" />

    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="card card-up">
            <div class="card-body">
              <h1 class="h4 text-center text-primary">{{$route.query.method}} <small><em>for</em></small> {{$route.query.asset}}</h1>

              <pre v-if="args"><code>{{args}}</code></pre>

              <a class="btn btn-primary btn-lg btn-block mt-4" href="#" @click="reply(true)">Allow &rsaquo;</a>
              <a class="btn btn-link btn-block mt-2" href="#" @click="reply(false)">Deny &rsaquo;</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import Cover from '@/components/Cover.vue'

export default {
  data () {
    return {
      replied: false
    }
  },
  components: {
    Cover
  },
  methods: {
    ...mapActions(['replyPremission']),
    reply (allowed) {
      this.replyPremission({
        id: this.$route.query.id,
        allowed
      })

      this.replied = true

      window.close()
    }
  },
  computed: {
    args () {
      try {
        return JSON.parse(this.$route.query.args)
      } catch (e) {
        return ''
      }
    }
  },
  beforeDestroy () {
    if (this.replied) return

    this.reply(false)
  }
}
</script>
