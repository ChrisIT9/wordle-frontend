<script setup lang="ts">
</script>

<template>
  <div class="login-view mt-5">
    <div class="container">
      <form class="row align-items-center justify-content-center">
        <h1 class="text-center">Login</h1>
        <div class="col-6">
          <div class="d-flex flex-column justify-content-center">
            <label for="">E-mail</label>
            <input type="email">
            <div class="d-flex flex-column justify-content-center">
              <label for="">Password</label>
              <input type="password">
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">

.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>