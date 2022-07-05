<template>
  <div>
         <span class="weui-switch" :class="{'weui-switch-on' : isChecked}" :value="value" style="position:relative" @click="toggle">
             <div v-if="isChecked && direction.length > 0" style="font-size:12px;width: 100%;height:100%;position:absolute;padding:0 5px;line-height:22px;color:#FFF;user-select:none">
                 {{direction[0]}}
             </div>
             <div v-if="!isChecked && direction.length > 0" style="font-size:12px;width: 100%;height:100%;position:absolute;padding:0 5px;right:2px;line-height:22px;color:#FFF;text-align:right;user-select:none">
                 {{direction[1]}}
             </div>
         </span>
  </div>
</template>
<script>
export default {
  name: 'MSwitch',
  props: {
    value: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: '显示上下文|隐藏上下文'
    }
  },
  data () {
    return {
      isChecked: this.value
    }
  },
  computed: {
    direction () {
      if (this.text) {
        return this.text.split('|')
      } else {
        return []
      }
    }
  },
  watch: {
    value (val) {
      this.isChecked = val
    },
    isChecked(val) {
      this.$emit('input', val);
    }
  },
  methods: {
    toggle() {
      this.isChecked = !this.isChecked;
    }
  }
}
</script>
<style lang='scss'>
$WIDTH: 90px;
.weui-switch {
  display: block;
  position: relative;
  width: $WIDTH;
  height: 24px;
  border: 1px solid #DFDFDF;
  outline: 0;
  border-radius: 16px;
  box-sizing: border-box;
  background-color: #b9b9b9;
  transition: background-color 0.1s, border 0.1s;
  cursor: pointer;
}
.weui-switch:before {
  content: " ";
  position: absolute;
  top: 0;
  left: 0;
  width: $WIDTH;
  height: 22px;
  border-radius: 15px;
  background-color: rgb(124, 124, 124);
  transition: all 0.35s cubic-bezier(0.45, 1, 0.4, 1);
}
.weui-switch:after {
  content: " ";
  position: absolute;
  top: 1px;
  left: 1px;
  width: 20px;
  height: 20px;
  border-radius: 15px;
  background-color: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  transition: all 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
}
.weui-switch-on {
  /*border-color: #6F6F6F;*/
  background-color: rgb(124, 124, 124);
}
.weui-switch-on:before {
  /*border-color: #1AAD19;*/
  background-color: rgb(74, 204, 255);
}
.weui-switch-on:after {
  left: calc(100% - 20px);
}
</style>
