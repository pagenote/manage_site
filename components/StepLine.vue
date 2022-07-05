<template>
  <div class="step-line" :style="`--color:${light.bg}`" :class='{"dense":dense}'>
    <div class="light-content" :class='{"show-context":showContext}'>
      <aside class="light-aside"></aside>
      <span v-if='showContext'>{{light.pre}}</span>
      <span class="text">
          {{light.text}}
        </span>
      <span v-if='showContext'>{{light.suffix}}</span>
    </div>
    <div v-if='showTip' class='annotation' contenteditable='true' @input='onInput' v-html='light.tip'></div>
  </div>
</template>

<script lang='ts'>
import Vue,{PropType} from 'vue'
import { Step } from '@pagenote/shared/lib/@types/data'
import debounce from 'lodash/debounce'

export default Vue.extend({
  name: 'StepLine',
  props:{
    showContext:{
      type: Boolean,
      default: false,
    },
    light:{
      type: Object as PropType<Step>,
      required: true
    },
    showTip:{
      type: Boolean,
      default: false,
    },
    // 紧凑模式，摘要卡片显示
    dense:{
      type: Boolean,
      default: true,
    }
  },
  methods: {
    onInput:debounce(function(e:InputEvent) {
      // @ts-ignore
      const value = e?.target?.innerHTML;
      // @ts-ignore
      this.$emit('edit',{
        // @ts-ignore
        ...this.light,
        tip: value
      })
    },100)
  }
})
</script>

<style scoped lang='scss'>
.step-line {
  position: relative;
  margin: 12px 0;
  &:hover{
    .light-content{
      background: #ededed;
    }
  }
  &.dense{
    margin: 6px 0;
    .light-content{
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .text{

    }
  }
}

.light-aside {
  top: 0;
  fill: var(--color);
  left: 0px;
  width: 5px;
  cursor: move;
  height: 100%;
  position: absolute;
  background: var(--color);
  border-radius: 12px;
}

.light-content {
  color: rgba(0, 0, 0, 0.7);
  font-weight: bold;
  position: relative;
  padding-left: 14px;
  &.show-context{
    white-space: normal;
    overflow: unset;
    .text{
      background-color: var(--color);
    }
  }
}
.annotation{
  font-size: 14px;
  color: #666;
  line-height: 1.4em;
  outline: none;
  padding: 12px;
  &:hover{
    background: #f3f3f3;
  }
}
</style>
