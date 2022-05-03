<template>
  <div class="step-line" :style="`--color:${light.bg}`" :class='{"dense":dense}'>
    <div class="jss4221">
      <aside class="jss4224"></aside>
      <div class="light-content" :class='{"show-context":showContext}'>
        <span v-if='showContext'>{{light.pre}}</span>
        <span class="text">
          {{light.text}}
        </span>
        <span v-if='showContext'>{{light.suffix}}</span>
      </div>
      <div v-if='showTip' class='annotation' contenteditable='true' v-html='light.tip'></div>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue,{PropType} from 'vue'
import { Step } from '@pagenote/shared/lib/@types/data'

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
    dense:{
      type: Boolean,
      default: true,
    }
  }
})
</script>

<style scoped lang='scss'>
.step-line {
  margin: 12px 0;
  position: relative;
  word-break: break-word;
  white-space: pre-line;
  padding-left: 16px;
  &.dense{
    margin: 6px 0;
  }
}
.jss4221 {
  position: relative;
}
.jss4224 {
  top: 0;
  fill: var(--color);
  left: -14px;
  width: 5px;
  cursor: move;
  height: 100%;
  position: absolute;
  background: var(--color);
  border-radius: 12px;
}
.light-content {
  color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  &.show-context{
    white-space: normal;
    overflow: auto;
    .text{
      font-weight: bold;
      background-color: var(--color);
    }
  }
}
.annotation{
  font-size: 14px;
  color: #666;
  line-height: 1.4em;
}
</style>
