<template>
  <div>
    <Cover title="Enable" />

    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="card card-up">
            <div class="card-body">
              <h1 class="h4 text-center text-primary">{{origin}}</h1>

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
  computed: {
    origin () {
      return this.$route.query.origin
    }
  },
  methods: {
    ...mapActions(['replyOriginAccess']),
    reply (allowed) {
      this.replyOriginAccess({
        origin: this.origin,
        allowed
      })

      this.replied = true

      window.close()
    }
  },
  beforeDestroy () {
    if (this.replied) return

    this.reply(false)
  }
}
</script>
