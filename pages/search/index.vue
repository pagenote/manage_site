<template>
  <div class='search-in-pagenote'>
    <client-only>
      <vue-search-panel
        ref="searchPanel"
        v-model="value"
        :fetch-suggestions="getSuggestions"
        @select="onSelect"
      >
      </vue-search-panel>
    </client-only>
    <input v-model='keywords' type='text' placeholder='搜索' />
    <abstract-page-list :webpage-list='pages' />
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import generateApi from '@pagenote/shared/lib/generateApi'
// import addUrlChangeListener from '@pagenote/shared/lib/utils/history'
import {parse} from 'query-string'
import { lightpage } from '@pagenote/shared/lib/extApi'
import Keys = lightpage.WebPageKeys

const api = generateApi();

const testData = [
  { key: 'test-data-1', value: 'test data 1' },
  { key: 'test-data-2', value: 'test data 2' },
  { key: 'test-data-3', value: 'test data 3' }
]

export default Vue.extend({
  name: 'SearchIndex',
  components:{
    // VueSearchPanel
  },
  layout: 'empty',
  data():{
    keywords:string,
    pages: Keys[],
    value: string,
    selected: string
  } {
    return {
      keywords: '',
      pages: [],
      value: '',
      selected: ''
    }
  },
  watch: {
    keywords() {
      this.searchInPagenote()
    }
  },
  mounted() {
    // @ts-ignore
    this.$modal.show('example')
    this.initKeywords()
    // addUrlChangeListener(()=> {
    //   this.initKeywords()
    // })
  },
  methods: {
    initKeywords(){
      const search = parse(window.location.search);
      const { keywords, keyword, _keyword } = search;
      const searchKey = _keyword || keyword || keywords;
      if(searchKey){
        this.keywords = searchKey.toString();
      }
    },
    searchInPagenote():void {
      const keys = this.keywords.split(/\s+/).filter(function(item) {
        return !!item
      });
      const key = keys.length>1 ? keys.join('|').toString() : keys.toString();
      api.lightpage.getLightPages({
        query:{
          deleted: false,
          // @ts-ignore
          $or:[
            {
              title: {
                $like: key
              },
            },
            {
              tip:{
                $like: key
              },
            },
            {
              context:{
                $like: key
              },
            },
            {
              text:{
                $like: key
              },
            },
            {
              key:{
                $like: key
              },
            },
          ],
        },
        limit: 99,
        sort: {
          updateAt: -1
        },
        ignoreDetail:true,
      }).then((res)=>{
        console.log(key,'res', res)
        if(res.success){
          this.pages = res.data.pages as Keys[];
        }
      })
    },

    onOpen ():void {
      // @ts-ignore
      this.$refs?.searchPanel?.show()
    },
    onSelect (item: { value:string }) {
      this.selected = item.value
    },
    getSuggestions (query:string, cb:(input:any[])=>void):void {
      cb(query ? testData.filter(item => { return item.value.includes(query) }) : testData)
    }
  }
})
</script>

<style scoped>
.search-in-pagenote{
  position: relative;
  width: 375px;
  margin: 0 auto;
}
</style>
