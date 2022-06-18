<template>
  <calendar-heatmap :selected-days='selectedDays' :show-legend='false' :max='100' :end-date="Date.now()" :vertical="true" :values="values" @day-click='onSelect' />
</template>

<script>
import Vue from 'vue'
import api from '@pagenote/shared/lib/generateApi'

export default Vue.extend({
  name: 'ListDayHeatMap',
  props:{
    selectedDays:{
      type: Array,
      default() {
        return []
      }
    }
  },
  data(){
    return {
      values:[]
    }
  },
  activated() {
    this.countDaysData()
  },
  mounted() {
    this.countDaysData()
  },
  methods: {
    onSelect(day){
      this.$emit('onDayRangeChange',[day])
    },
    countDaysData(){
      api.lightpage.groupPages({
        groupBy: 'updateAtDay'
      }).then((result)=> {
        if(result.success){
          const values = []
          for(const day in result.data){
            values.push({
              date: day,
              count: result.data[day].filter(function(item) {
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

<!--<style scoped>-->

<!--</style>-->
