<template>
  <v-main class='highlight-page'>
    <v-row no-gutters class='fill-height'>
      <v-col cols='4' class='cards-container'>
        <div v-for='(i,index) in abstractList' :key='i.key' @click='setFocusKey(i.key)'>
          <AbstractPageCard :light-cnt='i.lightCnt' :page-key='i.key' :fetch-timeout='changedKey === i.key?0: (index>10?index*5000:(index-1)*40)'  />
        </div>
      </v-col>
      <v-col cols='8' class='fill-height'>
        <web-page-detail :page-key='focusKey' @changed='onDetailChange' />
      </v-col>
    </v-row>
  </v-main>
</template>

<script lang='ts'>
import Vue from 'vue'
import getCacheInstance from '@pagenote/shared/lib/library/cache'
import generateApi from '@pagenote/shared/lib/generateApi'
import { onVisibilityChange } from '@pagenote/shared/lib/utils/document'
import { lightpage } from '@pagenote/shared/lib/extApi'
import Keys = lightpage.Keys
const api = generateApi();
const cacheFocus = getCacheInstance<string>('last_focus')
export default Vue.extend({
  name: 'HighlightIndex',
  // layout:'empty',
  data():{
    items:{text: string,value:string}[],
    groupType: keyof Keys,
    abstractList: Keys[],
    focusKey: string,
    changedKey: string
  }{
    return {
      items: [{
        text: '按修改时间',
        value: 'updateAtDay'
      },{
        text: '按域名分组',
        value: 'domain'
      },{
        text: '按标签分组',
        value: 'domain'
      }],
      groupType: 'updateAtDay',
      abstractList: [],
      focusKey: '',
      changedKey: ''
    }
  },
  computed: {

  },
  mounted() {
    this.focusKey = cacheFocus.get();
    this.getAbstracts();
    onVisibilityChange(()=>{
      this.getAbstracts()
    })
  },
  methods: {
    setFocusKey(key:string) {
      this.focusKey = key
      cacheFocus.set(key)
    },
    onDetailChange(key:string){
      this.changedKey = key
    },
    getAbstracts(){
      api.lightpage.getLightPages({
        query:{
          deleted: false
        },
        sort:{
          [this.groupType]: -1,
        },
        limit: 500,
        ignoreDetail: true,
      }).then((result)=> {
        console.log('pages 摘要信息集合',result)
        if(result.success){
          const data = result.data.pages as Keys[];
          this.abstractList = data
        }
      })
      //
      // api.lightpage.groupPages({groupBy: this.groupType,query: {deleted: true}},).then((res=> {
      //   console.log('res',res)
      //   if(res.success){
      //     this.groupMap = res.data
      //   }
      // }));
      //
    }
  }
})
</script>

<style>
.highlight-page{
  position: relative;
  height: calc(100vh - 32px);
  display: flex;
  padding: 12px;
  overflow: hidden;
  background: #f7f7f7;
  box-shadow: 2px 2px 3px 0 #999;
  border-radius: 8px;
}

.cards-container{
  max-height: calc(100% - 0px);
  overflow: auto;
}
</style>
