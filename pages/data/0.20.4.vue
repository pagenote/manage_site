<template>
  <div>
    <div>当前页适用于 0.20.4 导出数据</div>
    <v-btn @click="exportData">
      导出数据(导出数据可用于 0.20.11 及其以上版本)
    </v-btn>
  </div>
</template>

<script>
import Vue from 'vue'
import { makeExportString } from '@pagenote/shared/lib/utils/data'
import { BackupVersion } from '@pagenote/shared/lib/@types/data'
import { contentToFile } from '@pagenote/shared/lib/utils/document'
import { Bridge } from '@/lib/bridge/0.20.4/bridge'
let getBridge = function () {
  const element = document.getElementById('messenger')
  const bridgeCli = new Bridge(element, 'page', 'extension')
  if (element) {
    getBridge = function () {
      return bridgeCli
    }
  }
  return bridgeCli
}
export default Vue.extend({
  name: 'SafariData',
  layout: 'data',
  methods: {
    exportData() {
      getBridge().sendMessage(
        'LIST_LIGHT_PAGES',
        {
          query: {
            deleted: false,
          },
          limit: 99999,
          skip: 0,
          ignoreDetail: false,
        },
        function ({ data }) {
          if (data.success) {
            if (data.data?.length) {
              const str = makeExportString({
                pages: data.data,
                version: BackupVersion.version1,
                extension_version: '0.20.4',
                backup_at: Date.now(),
              })
              contentToFile(str, `0.20.4.${data.data.length}.pagenote`)
            } else {
              alert('没有发现任何有效数据')
            }
          } else {
            alert('导出失败了，请检查' + data.error)
          }
        }
      )
    },
  },
})
</script>
