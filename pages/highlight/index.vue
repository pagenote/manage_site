<template>
  <v-main class='highlight-page'>
    <v-row no-gutters class='fill-height'>
      <v-col cols='4' class='middle-part'>
        <div class='cards-container'>
          <div v-for='(i,index) in abstractList' :key='i.key' @click='setFocusKey(i.key)'>
            <AbstractPageCard
              :active='focusKey===i.key'
              :checked='batchSelected.includes(i.key)'
              :light-cnt='i.lightCnt'
              :page-key='i.key'
              :fetch-timeout='changedKey === i.key?0: (index>10?index*10000:(index-1)*40)'
              @toggleCheck='onToggleChecked'  />
          </div>
        </div>
        <div class='abstract-list-footer'>
          <v-simple-checkbox
            color='primary'
            :value='batchSelectedAll'
            :label="`批量操作 ${batchSelected.length} 个笔记`"
            :indeterminate='batchSelected.length>0 && !batchSelectedAll'
            :ripple='false'
            @input='toggleAllChecked'>
          </v-simple-checkbox>
          <v-dialog
            v-if='batchSelected.length>0'
            v-model="showBatchDialog"
            scrollable
            max-width="300px"
          >
            <template #activator="{ on, attrs }">
<!--              <v-btn-->
<!--                color="primary"-->
<!--                dark-->
<!--                v-bind="attrs"-->
<!--                v-on="on"-->
<!--              >-->
<!--                批量操作 {{batchSelected.length}} 个笔记-->
<!--              </v-btn>-->
              <v-btn
                 x-small
                 text
                 v-bind="attrs"
                 v-on="on">{{`批量操作 ${batchSelected.length} 个笔记`}}</v-btn>
            </template>
            <v-card>
              <v-card-title>选择批量操作任务</v-card-title>
              <v-divider></v-divider>
              <v-card-text style="height: 300px;">
                <v-radio-group
                  v-model="batchAction"
                  column
                >
                  <v-radio
                    label="删除"
                    value="delete"
                  ></v-radio>
<!--                  <v-radio-->
<!--                    label="导出"-->
<!--                    value="export"-->
<!--                  ></v-radio>-->
                </v-radio-group>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="showBatchDialog = false"
                >
                  关闭
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="doBatchAction"
                >
                  执行
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>

      </v-col>
      <v-col cols='8' class='fill-height'>
        <web-page-detail :key='focusKey+changedKey' :page-key='focusKey' @changed='onDetailChange' />
      </v-col>
    </v-row>
  </v-main>
</template>

<script lang='ts'>
import Vue from 'vue'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import getCacheInstance from '@pagenote/shared/lib/library/cache'
import generateApi from '@pagenote/shared/lib/generateApi'
import { onVisibilityChange } from '@pagenote/shared/lib/utils/document'
import { lightpage } from '@pagenote/shared/lib/extApi'
import Keys = lightpage.Keys
import { ONE_MONTH_MILLION } from '~/const/time'
const api = generateApi();
const cacheFocus = getCacheInstance<string>('last_focus')
enum ACTIONS {
  DELETE = 'delete',
  EXPORT ='export'
}
export default Vue.extend({
  name: 'HighlightIndex',
  layout:'empty',
  data():{
    items:{text: string,value:string}[],
    groupType: keyof Keys,
    abstractList: Keys[],
    focusKey: string,
    changedKey: string
    batchSelected: string[]
    showBatchDialog: boolean
    batchAction: ACTIONS
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
      changedKey: '',
      batchSelected: [],
      showBatchDialog: false,
      batchAction: ACTIONS.DELETE
    }
  },
  computed: {
    batchSelectedAll():boolean{
      return this.batchSelected.length === this.abstractList.length
    }
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
    },

    saveWebpage(data:Partial<WebPage>){
      return api.lightpage.saveLightPage({
        ...data,
        updateAt: Date.now(),
      })
    },

    toggleAllChecked(){
      if(this.batchSelected.length>0){
        this.batchSelected = []
      }else{
        this.batchSelected = this.abstractList.map((item)=>{
          return item.key
        })
      }
    },
    onToggleChecked(key:string){
      const index = this.batchSelected.indexOf(key)
      if(index===-1){
        this.batchSelected.push(key)
      }else{
        this.batchSelected.splice(index,1)
      }
    },
    doBatchAction(){
      this.showBatchDialog = false
      switch (this.batchAction){
        case ACTIONS.DELETE:
          // eslint-disable-next-line no-case-declarations
          const tasks:Promise<any>[] = [];
          this.batchSelected.forEach((key)=>{
            tasks.push(this.saveWebpage({
              key,
              deleted: true,
              expiredAt: Date.now() + ONE_MONTH_MILLION
            }).then((result)=>{
              this.changedKey = key;
              return result
            }))
            Promise.all(tasks).then(()=>{
              this.getAbstracts()
              this.batchSelected = []
            })
          })
          break;
        case ACTIONS.EXPORT:
          break;
      }
    }
  }
})
</script>

<style lang='scss'>
@import "assets/variables.scss";
.highlight-page{
  position: relative;
  margin: 16px;
  height: calc(100vh - 32px);
  display: flex;
  padding: 12px;
  overflow: hidden;
  background: #f7f7f7;
  box-shadow: 2px 2px 3px 0 #999;
  border-radius: 8px;
}

.middle-part{
  position: relative;
  max-height: calc(100% - 0px);
}
.cards-container{
  position: relative;
  overflow: auto;
  max-height: 100%;
  padding-bottom: 60px;
}

.abstract-header{
  background: #fff;
  position: absolute;
  top:0;
  width: 100%;
}

.abstract-list-footer{
  position: absolute;
  z-index: $abstract-list-footer-index;
  bottom: 0;
  width: 100%;
  background: #fff;
  font-size: 12px;
  padding: 12px;
}
</style>
