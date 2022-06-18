<template>
  <div class='web-page-detail'>
    <template v-if='webpage'>
      <v-overlay
        v-if='webpage.deleted'
        absolute
        class='delete-mask'
        :opacity='0.8'
      >
        <v-alert>
          已删除该网页笔记。 <span>{{webpage.expiredAt | countdown}} 彻底删除</span>。
        </v-alert>
        <v-btn
          color="success"
          @click='revert'
        >
          点击恢复
        </v-btn>
      </v-overlay>
      <div class='title'>
        <label-edit
          :text='title'
          placeholder='点击添加标题'
          @text-updated='textUpdated'
          @text-updated-blur='textUpdated'
          @text-updated-enter='textUpdated'></label-edit>
        <span> <a :href='webpage.url || webpage.key' target='_blank'>{{webpage.title || webpage.url || webpage.key}}</a> </span>
        <div class='actions'>
          <v-btn
            elevation="2"
            icon
            x-small
            color='red'
            @click='deletePage'
          ><v-icon>mdi-delete</v-icon></v-btn>
        </div>
      </div>

      <div class='abstract'>
        <step-line
         v-for='(light,index) in webpage.plainData.steps'
         :key='light.id+index'
         :dense='false'
         :show-tip='true'
         :show-context='true'
         :light='light'
         @edit='(step)=>onEditLight(step,index)'
        />
      </div>
      <div class='snapshots'>
        <v-flex>
          <div v-for='(snapshot,index) in webpage.plainData.snapshots' :key='index'>
            <v-img sizes='24' :src='snapshot' :alt='index' />
          </div>
        </v-flex>
      </div>
      <aside class='footer'>
        <span>修改于 {{webpage.updateAt | past}}</span>
      </aside>
    </template>
    <div v-else>

    </div>
  </div>
</template>

<script lang='ts'>
import Vue, { PropType } from 'vue'
import api from '@pagenote/shared/lib/generateApi'
import { Step, WebPage } from '@pagenote/shared/lib/@types/data'
import { onVisibilityChange } from '@pagenote/shared/lib/utils/document'
import { ONE_MONTH_MILLION } from '~/const/time'


/** create at 2022/5/2 */

interface Data {
  webpage?: WebPage
  title: string
  // [key:string]: any,
}

export default Vue.extend({
  name: 'WebPageDetail',
  props: {
    pageKey: {
      type: String as PropType<string>,
      default: ''
    }
  },
  data(): Data {
    return {
      webpage: undefined,
      title: ''
    }
  },
  watch: {
    pageKey() {
      this.getDetail()
    }
  },
  mounted() {
    this.getDetail();
    onVisibilityChange(()=>{
      this.getDetail()
    })
  },
  methods: {
    textUpdated(text: string) {
      this.title = text
    },
    getDetail() {
      api.lightpage.getLightPageDetail({key:this.pageKey}).then((res)=>{
        if(res.success){
          this.webpage = res.data
        }
      })
    },

    onEditLight(step:Step,index:number){
      console.log(step,index,'修改')
      const page = this.webpage;
      if(!page){
        return
      }
      if(step){
        page.plainData.steps[index] = step;
      }else{
        page.plainData.steps.splice(index,1)
      }
      this.save(page,false)
    },

    save(data:Partial<WebPage>,refresh=true){
      api.lightpage.saveLightPage({
        ...this.webpage,
        ...data,
        key: this.pageKey,
        updateAt: Date.now(),
      }).then(()=> {
        if(refresh){
          this.getDetail()
          this.$emit('changed',this.pageKey)
        }
      })
    },

    deletePage(){
      this.save({
        deleted: true,
        expiredAt: Date.now() + ONE_MONTH_MILLION
      })
    },
    revert(){
      this.save({
        deleted: false,
        expiredAt: 0,
      })
    }
  }
})
</script>

<style scoped lang='scss'>
.web-page-detail {
  font-size: 14px;
  background: rgb(249 249 249);
  border-radius: 8px;
  background-size: 100px;
  width: 100%;
  height: 100%;
  overflow: auto;
  box-shadow: 0 0 3px 1px #eae6e6;
  line-height: 1.4em;
  vertical-align: top;
  .title{
    top: 0;
    padding: 6px 4px;
    z-index: 1;
    position: sticky;
    font-size: 14px;
    background: rgba(255,255,255,0.95);
    white-space: nowrap;
    border-bottom: 1px dotted #dddddd;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .actions{
    position: absolute;
    right: 12px;
    top:4px;
  }
  .abstract{
    padding:12px;
  }
}

aside.footer{
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 12px;
  font-size: 12px;
  color: #999;
}
</style>
