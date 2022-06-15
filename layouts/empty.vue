<template>
  <v-app>
    <Nuxt></Nuxt>
  </v-app>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'EmptyLayout',
  mounted() {
    console.log('this.$route',this.$route)
  }
})
</script>
