<template>
  <div class='empty-container'>
    <img src='/empty.png' alt='空数据'>
    <div class='tip'>
      <h3 class='title'>没有发现笔记</h3>
      <div class='content'>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'EmptyData'
})
</script>

<style scoped lang='scss'>
.empty-container{
  max-width: 80%;
  margin: 0 auto;
  padding: 24px;
  img{
    max-width: 100%;
  }

  .title{
    margin: 1em;
    font-size: 22px;
    color: #3A3A3A;
    text-align: center;
  }
}
</style>
