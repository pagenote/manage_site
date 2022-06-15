<template>
  <div class='filters'>
    <tabs
      :tabs="tabs"
      :current-tab="currentTab"
      :wrapper-class="'default-tabs'"
      :tab-class="'default-tabs__item'"
      :tab-active-class="'default-tabs__item_active'"
      :line-class="'default-tabs__active-line'"
      @onClick="handleClick"
    />
    <div class="tab-content">
      <keep-alive>
        <div v-if="currentTab === 'recent'" class='day-heatmap'>
          <list-day-heat-map :selected-days='dateRange' @onDayRangeChange='onDayRangeChange' />
        </div>
      </keep-alive>
      <keep-alive>
        <filter-by-tags v-if="currentTab === 'tags'" :selected-tags='tags' @onTagsChange='onTagsChange' />
      </keep-alive>
      <keep-alive>
        <filter-by-colors v-if="currentTab === 'colors'" />
      </keep-alive>
    </div>
  </div>
</template>

<script lang='ts'>
// @ts-ignore
import Tabs from 'vue-tabs-with-active-line';
import Vue, { PropType } from 'vue'
import dayjs from 'dayjs'
import getCacheInstance from '@pagenote/shared/lib/library/cache'
import { Query } from '@pagenote/shared/lib/@types/database';
import { lightpage } from '@pagenote/shared/lib/extApi'
import { parse }  from 'query-string'
import Keys = lightpage.WebPageKeys

enum CurrentType {
  recent='recent',
  tags='tags',
  color='color'
}
const TABS = [CurrentType.color,CurrentType.tags,CurrentType.color]
type Filter = {
  currentTab: string
  dateRange: (string|null)[],
  tags: (string|null)[],
}

type Data = {
  available: boolean
  tabs: { title: string, value: string }[],
} & Filter

const filterCache = getCacheInstance<Filter>('filter-cache')

/** create at 2022/5/16 */

export default Vue.extend({
  name: 'FiltersSection',
  components:{
    Tabs
  },
  props: {
    propName: {
      type: Number as PropType<number>,
      default: 0
    }
  },
  data(): Data {
    return {
      dateRange: [],
      tags: [],
      available: false,
      currentTab: CurrentType.recent,
      tabs: [{
        title: '最近',
        value: CurrentType.recent,
      }, {
        title: '标签',
        value: CurrentType.tags,
      }, {
        title: '颜色',
        value: CurrentType.color,
      }, {
        title: '搜索',
        value: 'search',
      }]
    }
  },
  mounted() {
    const defaultData = {currentTab:CurrentType.recent,tags:[],dateRange:[]};
    const {dataRange,tags,currentTab} = parse(window.location.search);
    const currentFilter = filterCache.get(defaultData) || defaultData;
    if(dataRange){
      currentFilter.dateRange = typeof dataRange === 'string' ? [dataRange] : dataRange;
    }
    if(tags){
      currentFilter.tags = typeof tags === 'string' ? [tags] : tags;
    }
    if(currentTab && TABS.includes(currentTab?.toString() as CurrentType)){
      currentFilter.currentTab = currentTab.toString()
    }
    filterCache.set(currentFilter);

    const cacheFilter = filterCache.get(defaultData) || defaultData;
    this.dateRange = cacheFilter.dateRange;
    this.tags = cacheFilter.tags;
    this.currentTab = cacheFilter.currentTab;
    this.triggerFilter();
  },
  methods: {
    onDayRangeChange(days: {
      colorIndex: number,
      count: number,
      date: Date }[]){
      const filterDays = days.filter(function(item) {
        return item.count > 0
      })
      if(filterDays.length===0){
        return
      }
      const dayStr = dayjs(filterDays[0].date).format('YYYY/MM/DD');
      const index = this.dateRange.indexOf(dayStr);
      const result = index>-1 ? [] : [dayStr];
      this.dateRange = result;
      this.triggerFilter()
    },

    onTagsChange(tag:string){
      const index = this.tags.indexOf(tag);
      const result = index===-1 ? [tag] : [];
      this.tags = result;
      this.triggerFilter()
    },

    triggerFilter(){
      const query: Query<Keys> = {
        deleted: false,
      }
      if(this.currentTab === 'recent' && this.dateRange.length){
        query.updateAtDay = {
          $in: this.dateRange
        }
      }
      if(this.currentTab === 'tags' && this.tags.length){
        query.categories = {
          $in: this.tags
        }
      }

      const storeQuery = {
        currentTab: this.currentTab,
        dateRange: this.dateRange,
        tags: this.tags,
      }
      filterCache.set(storeQuery)

      // const queryString = stringify(storeQuery);
      // debugger
      this.$router.push({
        path: this.$route.path,
        query: storeQuery
      })

      this.$emit('onFilterChange',query)
    },

    handleClick(newTab:string) {
      this.currentTab = newTab;
      this.triggerFilter();
    },
    onClose (id:string) {
      console.log('Callback function that gets evaluated while closing the tab', id)
    },
    onBefore (id:string, tab:any) {
      console.log('Callback function that gets evaluated before a tab is activated', id, tab)
    },
    onAfter (id:string, tab:any) {
      console.log('Callback function that gets evaluated after a tab is activated', id, tab)
    }
  },
})
</script>

<style scoped lang='scss'>
.filters {
  font-size: inherit;
  .tab-content{
    width: 100%;
    height: 100%;
  }
  .day-heatmap{
    //max-height: 600px;
    //overflow: auto;
  }
}
</style>

<style lang='scss'>
.default-tabs {
  position: relative;
  margin: 0 auto;
  &__item {
    display: inline-block;
    margin: 0 5px;
    padding: 10px 8px;
    font-size: 14px;
    letter-spacing: 0.8px;
    color: gray;
    text-decoration: none;
    border: none;
    background-color: transparent;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.25s;
    &_active {
      color: black;
    }
    &:hover {
      border-bottom: 2px solid gray;
      color: black;
    }
    &:focus {
      outline: none;
      border-bottom: 2px solid gray;
      color: black;
    }
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
  &__active-line {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background-color: black;
    transition: transform 0.4s ease, width 0.4s ease;
  }
}
</style>
