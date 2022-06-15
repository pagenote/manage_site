<template>
  <div class='filter-by-tags'>
    <div v-for='i in values' :key='i.tagName' class='tag' :class='{active: selectedTags.includes(i.tagName)}' @click='()=>onToggleTag(i.tagName)'>
      <span class='tag-name'>#{{i.tagName}}</span> <span class='count'>{{i.count}}</span>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import generateApi from '@pagenote/shared/lib/generateApi'
import { lightpage } from '@pagenote/shared/lib/extApi'
import Keys = lightpage.WebPageKeys
const api = generateApi();

interface Data{
  values: {
    tagName: string,
    count: number
  }[]
}

export default Vue.extend({
  name: 'FilterByTags',
  props: {
    selectedTags: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data():Data {
    return {
      values: []
    }
  },
  mounted() {
    this.countTagsData();
  },
  activated() {
    this.countTagsData()
  },
  methods: {
    countTagsData(){
      api.lightpage.groupPages({
        groupBy: 'categories'
      }).then((result)=> {
        if(result.success){
          const values = []
          for(const day in result.data){
            const count = result.data[day].filter(function(item:Keys) {
              return item.deleted !== true
            }).length;
            if(count){
              values.push({
                tagName: day,
                count
              })
            }
          }
          this.values = values.sort(function(pre,next) {
            return pre.count > next.count ? -1 : 1
          });
        }
      })
    },
    onToggleTag(tag:string){
      this.$emit('onTagsChange',tag)
    }
  }
})
</script>

<style scoped lang='scss'>
.filter-by-tags{
  position: relative;
  padding: 12px;
  max-height: calc(100vh - 104px);
  overflow: auto;
  .tag{
    display: flex;
    justify-content: space-between;
    background: #999999;
    border-radius: 4px;
    margin-bottom: 6px;
    padding: 4px;
    color: #fff;

    &.active{
      background: #9be9a8;
    }

    .count{

    }
  }
}
</style>
