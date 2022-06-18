<template>
  <div class='filter-by-colors'>
    <ColorMap />
    <ul>
      <li v-for='i in values' :key='i'>
        {{i.tagName}}
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import api from '@pagenote/shared/lib/generateApi'
import { lightpage } from '@pagenote/shared/lib/extApi'
import ColorMap from '~/components/colormap/index.vue'
import Keys = lightpage.WebPageKeys


interface Data{
  values: {
    tagName: string,
    count: number
  }[]
}

export default Vue.extend({
  name: 'FilterByTags',
  components: { ColorMap },
  data():Data {
    return {
      values: []
    }
  },
  mounted() {
    this.countColorsData();
  },
  activated() {
    this.countColorsData()
  },
  methods: {
    countColorsData(){
      api.lightpage.groupPages({
        // @ts-ignore
        groupBy: 'colors'
      }).then((result)=> {
        debugger
        if(result.success){
          const values = []
          for(const day in result.data){
            values.push({
              tagName: day,
              count: result.data[day].filter(function(item:Keys) {
                return item.deleted !== true
              }).length
            })
          }
          this.values = values;
        }
      })
    },
  }
})
</script>

<style scoped>
.filter-by-colors{
  position: relative;
}
</style>
