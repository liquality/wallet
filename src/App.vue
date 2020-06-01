<template>
  <div id="app" :class="{
    'mb-5': true,
    'popup': $route.path.startsWith('/enable') || $route.path.startsWith('/permission')
  }">
    <Cover title="Unlock your wallet" subtitle="Your keys, your coins" v-if="!unlockedAt" />

    <div v-if="brokerReady">
      <router-view v-if="unlockedAt" />
      <div v-else>
        <div class="container">
          <div class="row">
            <div class="col-md-4 col-sm-6 mx-auto">
              <div class="card card-up">
                <div class="card-body">
                  <form autocomplete="off" v-on:submit.prevent="unlock">
                    <label class="bold-label text-primary mb-0">Password</label>
                    <input type="password" class="form-control form-control-lg" v-model="password" autocomplete="off" required>

                    <p class="small mt-4">This password decrypts your mnemonic.</p>

                    <button class="btn btn-primary btn-lg btn-block mt-4" type="submit">Unlock</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container" v-else>
      <div class="row justify-content-center">
        <div class="col-md-4 col-sm-6">
          <div class="card card-up">
            <div class="card-body d-flex justify-content-center align-items-center" style="min-height: 240px">
              <Pacman class="d-inline-block mr-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Cover from '@/components/Cover.vue'
import Pacman from '@/components/Pacman.vue'

export default {
  computed: mapState(['brokerReady', 'unlockedAt']),
  components: {
    Pacman,
    Cover
  },
  data () {
    return {
      password: null
    }
  },
  methods: {
    ...mapActions(['unlockWallet']),
    async unlock () {
      await this.unlockWallet({ key: this.password })
    }
  }
}
</script>

<style lang="scss">
.navbar {
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }

  @media (max-width: 375px) {
    margin-bottom: 0.9rem;
  }
}

.cover {
  background: linear-gradient(180deg, hsl(232, 47%, 58%), hsl(232, 47%, 55%));
  margin-bottom: -90px;

  .cover-element:last-child {
    padding-bottom: 150px;
  }

  &.cover-app {
    .container {
      padding-top: 40px;
    }
  }

  .display-4 {
    font-size: 2.6rem;
  }

  .h5 {
    opacity: 0.75;
  }

  @media (max-width: 768px) {
    min-height: 300px;

    &.cover-app {
      min-height: 240px;

      .container {
        padding-top: 30px;
      }
    }

    .display-4 {
      font-size: 2rem;
    }

    .h5 {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 375px) {
    .display-4 {
      font-size: 1.6rem;
    }

    .h5 {
      font-size: 0.85rem;
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
  border: 1px solid hsl(232, 47%, 46%);
  font-weight: 400!important;
}

.btn-secondary {
  background: linear-gradient(180deg,hsl(0, 0%, 100%),hsl(210, 20%, 98%))!important;
  border: 1px solid hsl(208, 17%, 80%)!important;
  box-shadow: 0 1px 0 0 rgba(22,29,37,.05)!important;
  color: hsl(211, 24%, 17%)!important;
  font-weight: 400!important;
}

.navbar-brand {
  margin: 0 auto!important;
  position: relative;

  sup {
    position: absolute;
    top: 10px;
    margin-left: 4px;
  }
}

.agent-status {
  p {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 500;
  }
}
</style>
