<template>
  <div>
    从文件夹中读取数据
    <v-button>选取文件夹</v-button>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'DirFiles',
  data() {
    return {
      dirHandle: null,
    }
  },
  methods: {
    async selectDir() {},
  },
})
</script>
