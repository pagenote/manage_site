<template>
  <ul class='developer-page'>
    <li v-for='webpage in webpages' :key='webpage.url'>
      url: {{webpage.url}}
      标记：
      <ul>
        <li v-for='(light,index) in webpage.plainData.steps' :key='index'>
          {{light.text}}
        </li>
      </ul>
    </li>
  </ul>
</template>

<script lang='ts'>
import Vue from 'vue'
import api from '@pagenote/shared/lib/generateApi'
import { WebPage } from '@pagenote/shared/lib/@types/data'

export default Vue.extend({
  name: 'YouNickname',
  data():{
    webpages: WebPage[],
  }{
    return {
      webpages: []
    }
  },
  mounted() {
    // 查询网页笔记
    api.lightpage.getLightPages({
      query:{
        deleted: false,
      },
      sort:{
        'createAt': -1,
      },
      limit: 9999,
      ignoreDetail: false,
    }).then((result)=> {
      if(result.success){
        this.webpages = result.data.pages as WebPage[];
      }
    })
  }
})
</script>
<style lang='scss' scoped>
.developer-page{
  min-height: 660px;
}
</style>
