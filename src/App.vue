<template>
  <div id="app" :class="{
    'app-extension': isExtension,
    'mb-5': true
  }">
    <router-view />
  </div>
</template>

<script>
import { isExtension } from '@/utils/network'

export default {
  computed: {
    isExtension () {
      return isExtension
    }
  }
}
</script>

<style lang="scss">
.app-extension {
  min-width: 768px;
}

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
</style>
