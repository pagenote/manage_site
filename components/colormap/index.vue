<template>
  <div class='base-bg-map'>

  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'ColorMap'
})
</script>

<style scoped lang='scss'>
.base-bg-map{
  width: 100%;
  height: 480px;
  background: linear-gradient(to bottom, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%);}
</style>
