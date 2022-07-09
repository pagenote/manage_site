<template>
  <div class='deleted-highlight'>
    <div v-for='(item, index) in deletedPages' :key='item.key'>
      {{index}}--{{item.key}}
    </div>
    <button @click='remove'>彻底删除</button>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import api from '@pagenote/shared/lib/generateApi'

interface Data{
  deletedPages: WebPage[];
}

export default Vue.extend({
  name: 'DeletedPage',
  data(): Data{
    return {
      deletedPages: []
    }
  },
  created() {
    this.getDeletedPages();
  },
  methods: {
    remove(){
      const keys = this.deletedPages.map(function(item) {
        return item.key;
      })
      api.lightpage.removeLightPages(keys).then(()=> {
        this.getDeletedPages();
      })
    },
    getDeletedPages() {
      api.lightpage.getLightPages({
        query:{
          deleted: true
        },
        limit: 0,
        projection: undefined,
        sort: {
          createAt: -1
        }
      }).then((res)=> {
        if(res.success){
          this.deletedPages = res.data.pages as WebPage[];
        }
      })
    }
  }
})
</script>

<style scoped>
.deleted-highlight{
  font-size: 14px;
}
</style>
