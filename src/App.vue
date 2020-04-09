<template>
  <div id="app">
    <div class="cover">
      <nav class="navbar navbar-expand-lg navbar-dark mb-3">
        <div class="container">
          <router-link class="navbar-brand" to="/">p2p Exchange <sup>testnet &alpha;</sup></router-link>
        </div>
      </nav>
      <div class="container">
        <p class="mb-0 font-weight-light text-white">Welcome to 2020 &mdash; Your keys, your coins &mdash; Trade securely without middleman, thanks to Atomic Swaps!</p>
      </div>
    </div>
    <router-view class="container mt-4 mb-5" />
  </div>
</template>

<style lang="scss">
.cover {
  background: linear-gradient(180deg,hsl(232, 47%, 58%),hsl(232, 47%, 55%));
  min-height: 190px;
  margin-bottom: -90px;

  @media (max-width: 768px) {
    min-height: 210px;
  }

  @media (max-width: 375px) {
    min-height: 220px;
  }
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
</style>
