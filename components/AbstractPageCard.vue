<template>
  <div ref='root' class='abstract-card'>
    <div v-if='webpage || loading'>
      <div v-if='webpage && webpage.deleted'>
        已删除
      </div>
      <div v-else>
        <div class='card-title'>
          <v-skeleton-loader
            v-if='loading'
            type="table-heading"
            :boilerplate='true'
          ></v-skeleton-loader>
          <div v-else-if='webpage'>
            <v-avatar :size='16'>
              <img
                :src='webpage?webpage.icon:""'
                alt=""
              >
            </v-avatar>
            <span>
              {{webpage.title || webpage.url || webpage.key}}
            </span>
          </div>
        </div>
        <div class='steps'>
          <div v-if='loading'>
            <v-skeleton-loader
              v-for='(i,index) in new Array(lightCnt).fill(1)'
              :key='index'
              type="list-item"
              elevation='24px'
              height='36px'
              :boilerplate='true'
            ></v-skeleton-loader>
          </div>
          <div v-else-if='webpage'>
            <step-line v-for='(step,index) in ahead4lights' :key='index' :light='step'>
            </step-line>

            <div v-if='left4Lights.length>0'>
              <v-btn v-if='showAll===false' color='secondary' x-small text @click='showAll = true'>
                展开剩余 {{left4Lights.length}} 条标记
              </v-btn>
              <div v-else>
                <step-line v-for='(step,index) in left4Lights' :key='index' :light='step'>
                </step-line>
                <v-btn x-small color='secondary' text @click='showAll = false'>
                  折叠
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      获取此页详情失败。<v-btn @click='getDetail'>点击重试</v-btn>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue, { PropType } from 'vue'
import { Step, WebPage } from '@pagenote/shared/lib/@types/data'
import generateApi from '@pagenote/shared/lib/generateApi'
import { onElementViewChange } from '@pagenote/shared/lib/utils/document'
const api = generateApi();
let changeListener:()=>void;
export default Vue.extend({
  name: 'AbstractPageCard',
  props: {
    pageKey: {
      type: String,
      default: '',
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    fetchTimeout:{
      type: Number,
      default: 10,
    },
    title: {
      type: String,
      default: '',
    },
    lightCnt:{
      type: Number as PropType<number>,
      default: 0,
      required: true,
    }
  },
  data():{
    webpage?: WebPage,
    fetchTimes: number,
    loading: boolean,
    showAll: boolean,
  } {
    return {
      webpage: undefined,
      fetchTimes:0,
      loading: true,
      showAll: false
    }
  },
  computed: {
    ahead4lights():Step[] {
      return this.webpage?.plainData.steps.slice(0,4) || []
    },
    left4Lights(): Step[]{
      return this.webpage?.plainData.steps.slice(4) || []
    }
  },
  watch: {
    fetchTimeout() {
      this.getDetail()
    }
  },
  created() {

  },
  mounted() {
    setTimeout(()=>{
      this.loading = true;
      if(!this.webpage){
        console.log(this.fetchTimes,this.pageKey)
        if(this.fetchTimes===0){
          this.getDetail()
        }else{
          console.log('防止请求')
        }

      }
    },this.fetchTimeout)
    // @ts-ignore
    const rootEl: Element = this.$refs.root;
    if(rootEl){
      changeListener = onElementViewChange(rootEl,{threshold:[0,1]},(_ratio,visible)=>{
        if(visible){
          this.getDetail();
        }
      })
    }
  },
  destroyed() {
    // 注销
    changeListener && changeListener()
  },
  methods: {
    getDetail() {
      if(this.fetchTimes===0){
        this.loading = true
      }
      this.fetchTimes++
      const label = Math.random()+this.pageKey
      console.time(label)
      // 字段过滤，避免返回不需要的内容占用内存，如 snapshot
      api.lightpage.getLightPages({query:{key:this.pageKey},limit:1,ignoreDetail:false,projection:{deleted:1,icon:1,title:1,url:1,'plainData.steps':1,key:1}}).then((res)=>{
        console.timeEnd(label)
        if(res.success){
          const data = res.data.pages[0] as WebPage;
          this.webpage = data
          this.loading = false;
        }
      })
      // api.lightpage.getLightPageDetail({key:this.pageKey}).then((res)=>{
      //     console.timeEnd(label)
      //     if(res.success){
      //       const data = res.data;
      //       this.webpage = data
      //     }
      // })
    }
  }
})
</script>

<style scoped lang='scss'>
.abstract-card{
  user-select: none;
  width: 100%;
  color: #444;
  padding: 12px 32px;
  font-size: 14px;
  min-height: 64px;
  border-bottom: 1px solid #eae6e6;
  .card-title{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
