<template>
  <div class='version-check'>
    <template v-if='needInstall'>
      请先安装后使用
    </template>
    <template v-else-if='needUpgrade'>
      请先升级后使用，当前版本 {{currentVersion}}，需要版本 {{needVersion}}
    </template>
    <slot v-else></slot>
  </div>
</template>

<script lang='ts'>
import Vue,{PropType} from 'vue'
import { isLow } from '@pagenote/shared/lib/utils/compare'
import getBridge from '~/utils/getDomBridge'

interface Data {
  currentVersion: string
  // [key:string]: any,
}

const NOT_INSTALL_VERSION = '0.0.0'

export default Vue.extend({
  name: 'CheckVersion',
  props: {
    needVersion: {
      type: String as PropType<string>,
      default: '0.0.1'
    },
  },
  data():Data {
    return {
      currentVersion: NOT_INSTALL_VERSION,
    }
  },

  computed: {
    needUpgrade():boolean {
      return isLow(this.currentVersion,this.needVersion)
    },
    needInstall():boolean {
      return this.currentVersion === NOT_INSTALL_VERSION
    }
  },
  beforeMount() {
    getBridge().sendMessage<{version:string}>('WHOAMI',null,({data})=>{
      // @ts-ignore
      this.currentVersion = data.version || data.data.version;
    })
  }
})
</script>

<style scoped>
.version-check{
  font-size: inherit;
}
</style>