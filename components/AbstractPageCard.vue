<template>
  <div ref='root' class='abstract-card' :class='{"active":active}' @click='getDetail' @mouseenter='getDetail'>
    <div v-if='webpage || loading'>
      <div v-if='webpage && webpage.deleted'>
        已删除
      </div>
      <div v-else>
        <div class='card-title'>
          <v-skeleton-loader
            v-if='loading'
            type='table-heading'
            :boilerplate='true'
          ></v-skeleton-loader>
          <div v-else-if='webpage'>
            <div class='aside-icon'>
              <v-simple-checkbox
                color='primary'
                :ripple='false'
                :value='checked'
                class='page-checkbox'
                :class='{checked: checked}'
                @input='toggleCheck' />
              <v-avatar :size='16'>
                <img
                  :src='webpage?webpage.icon:""'
                >
              </v-avatar>
            </div>
            <div class='page-title'>
              {{ webpage.title || webpage.plainData.title || webpage.description || webpage.plainData.description || webpage.url || webpage.key
              }}
            </div>
            <a
              class='domain-link' target='_blank' :title='webpage.url || webpage.key'
              :href='webpage.url || webpage.key'>
              {{ (webpage.url || webpage.key) | domain }}
            </a>
            <!--            <div>-->
            <!--              <a :href='webpage.url' target='_blank'>打开</a>-->
            <!--            </div>-->
          </div>
        </div>
        <div v-if='loading'>
          <v-skeleton-loader
            v-for='(i,index) in new Array(Math.min(lightCnt,3)).fill(1)'
            :key='index'
            type='list-item'
            elevation='24px'
            height='32px'
            :boilerplate='true'
          ></v-skeleton-loader>
        </div>
        <div v-else-if='webpage' class='abstract-detail'>
          <div class='lights' :class='{mini: !!webpage.thumb}'>
            <step-line v-for='(step,index) in ahead4lights' :key='index' :light='step'>
            </step-line>
            <div v-if='left4Lights.length>0'>
              <v-btn v-if='showAll===false' color='secondary' x-small text @click='showAll = true'>
                展开剩余 {{ left4Lights.length }} 条标记
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
          <div v-if='webpage.thumb' class='thumb'>
            <img :src='webpage.thumb' alt=''>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      获取此页详情失败。
      <v-btn @click='getDetail'>点击重试</v-btn>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue, { PropType } from 'vue'
import { Step, WebPage } from '@pagenote/shared/lib/@types/data'
import api from '@pagenote/shared/lib/generateApi'
import { onElementViewChange } from '@pagenote/shared/lib/utils/document'

let changeListener: () => void
let fetchTimer: NodeJS.Timeout
export default Vue.extend({
  name: 'AbstractPageCard',
  components: {
    // LabelEdit
    // InputContenteditable,
  },
  props: {
    pageKey: {
      type: String,
      default: '',
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    fetchTimeout: {
      type: Number,
      default: 10
    },
    lightCnt: {
      type: Number as PropType<number>,
      default: 0,
      required: true
    },
    checked: {
      type: Boolean as PropType<boolean>,
      default: false,
      required: true
    },
    active: {
      type: Boolean as PropType<boolean>,
      default: false,
      required: true
    }
  },
  data(): {
    webpage?: WebPage,
    fetchTimes: number,
    loading: boolean,
    showAll: boolean,
  } {
    return {
      webpage: undefined,
      fetchTimes: 0,
      loading: true,
      showAll: false
    }
  },
  computed: {
    ahead4lights(): Step[] {
      return this.webpage?.plainData.steps.slice(0, 3) || []
    },
    left4Lights(): Step[] {
      return this.webpage?.plainData.steps.slice(3) || []
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
    fetchTimer = setTimeout(() => {
      if (!this.webpage) {
        // console.log(this.fetchTimes, this.pageKey)
        if (this.fetchTimes === 0) {
          this.getDetail()
        } else {
          console.log('防止请求')
        }
      }
    }, this.fetchTimeout)
    // @ts-ignore
    const rootEl: Element = this.$refs.root
    if (rootEl) {
      // const lastFetchAt = Date.now()
      changeListener = onElementViewChange(rootEl, { threshold: [0, 0.2, 0.5, 1] }, (_ratio, visible) => {
        // const diff = Date.now() - lastFetchAt
        if (visible) {
          this.getDetail()
          // lastFetchAt = Date.now()
        }
      })
    }
  },
  destroyed() {
    // 注销
    changeListener && changeListener()
    clearTimeout(fetchTimer)
  },
  methods: {
    getDetail() {
      if (this.fetchTimes === 0) {
        this.loading = true
      }
      // 字段过滤，避免返回不需要的内容占用内存，如 snapshot
      api.lightpage.getLightPages({
        query: { key: this.pageKey },
        limit: 1,
        ignoreDetail: false,
        projection: { deleted: 1, icon: 1, title: 1, url: 1, 'plainData.steps': 1, key: 1, 'thumb': 1 }
      }).then((res) => {
        if (res.success) {
          const data = res.data.pages[0] as WebPage
          this.webpage = data
          this.fetchTimes++
        }
      }).finally(() => {
        this.loading = false
      })
      // api.lightpage.getLightPageDetail({key:this.pageKey}).then((res)=>{
      //     console.timeEnd(label)
      //     if(res.success){
      //       const data = res.data;
      //       this.webpage = data
      //     }
      // })
    },
    toggleCheck() {
      this.$emit('toggleCheck', this.pageKey)
    }
  }
})
</script>
<style>
.vlabeledit {
  display: inline-block;
}
</style>
<style scoped lang='scss'>
@import "assets/variables.scss";

.abstract-card {
  position: relative;
  user-select: none;
  width: 100%;
  color: #444;
  padding: 12px 24px;
  font-size: 14px;
  min-height: 64px;
  border-bottom: 1px solid #eae6e6;

  &.active {
    background: #ffedbd;
  }

  .card-title {
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .v-input--selection-controls__input {
    margin: 0;
  }

  .aside-icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 24px;
    height: 24px;
  }

  .page-checkbox {
    position: absolute;
    z-index: $abstract-checkbox-index;
    left: -3px;
    display: none;
    //background: #fff;

    &.checked {
      display: inline-block;
    }
  }

  &:hover {
    .page-checkbox {
      display: inline-block;
    }
  }

  .page-title {
    display: inline-block;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 24px;
  }

  .domain-link {
    position: absolute;
    right: 0;
    font-size: 12px;
    color: #82b1ff;
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.abstract-detail {
  display: flex;
  justify-content: space-between;

  .lights {
    flex-shrink: 1;
    max-width: 100%;

    &.mini {
      width: calc(100% - 100px);
    }
  }

  .thumb {
    width: 80px;
    flex-shrink: 0;

    img {
      width: 80px;
      height: 50px;
    }
  }
}
</style>
