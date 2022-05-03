<template>
  <div class='web-page-detail'>
    <div v-if='webpage'>
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
        <step-line v-for='(light,index) in webpage.plainData.steps' :key='light.id+index' :dense='false' :show-tip='true' :show-context='true' :light='light' />
      </div>
      <div class='footer'>
        <v-flex>
          <div v-for='(snapshot,index) in webpage.plainData.snapshots' :key='index'>
            <v-img sizes='24' :src='snapshot' :alt='index' />
          </div>
        </v-flex>
      </div>
    </div>
    <div v-else>

    </div>
  </div>
</template>

<script lang='ts'>
import Vue, { PropType } from 'vue'
import generateApi from '@pagenote/shared/lib/generateApi'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import { onVisibilityChange } from '@pagenote/shared/lib/utils/document'
const api = generateApi();


/** create at 2022/5/2 */

interface Data {
  webpage?: WebPage
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
      webpage: undefined
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
    getDetail() {
      api.lightpage.getLightPageDetail({key:this.pageKey}).then((res)=>{
        if(res.success){
          this.webpage = res.data
        }
      })
    },

    save(data:Partial<WebPage>){
      api.lightpage.saveLightPage({
        key: this.pageKey,
        ...data
      }).then(()=> {
        this.getDetail()
        this.$emit('changed',this.pageKey)
      })
    },

    deletePage(){
      this.save({
        deleted: true,
        expiredAt: Date.now() + 3600 * 1000 * 24 * 14
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
  position: relative;
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
</style>
