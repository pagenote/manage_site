<template>
  <div class='data-center'>
    <v-tooltip top>
      <template #activator='{ on, attrs }'>
        <v-btn
          elevation='2'
          icon
          x-small
          color='#82b1ff'
          v-bind='attrs'
          v-on='on'
          @click='exportData'
        >
          <v-icon>mdi-download-circle-outline</v-icon>
        </v-btn>
      </template>
      <span>导出备份</span>
    </v-tooltip>

    <input id='import-data' ref='fileinput' type='file' style='display: none' @input='importAllNotes' @change={importAllNotes} />
    <label for='import-data'>
      <v-tooltip top>
        <template #activator='{ on, attrs }'>
          <v-btn
            elevation='2'
            icon
            x-small
            color='#82b1ff'
            v-bind='attrs'
            v-on='on'
            @click='triggerFile'
          >
            <v-icon>mdi-backup-restore</v-icon>
          </v-btn>
        </template>
        <span>导入还原</span>
      </v-tooltip>
    </label>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import api from '@pagenote/shared/lib/generateApi'
import { resolveImportString } from '@pagenote/shared/lib/utils/data'
import { BaseMessageResponse } from '@pagenote/shared/lib/communication/base'

const onImportData = (e: { target: { files: any[]; }; }, callback: (res:  BaseMessageResponse<number>)=>void) => {
  const selectedFile = e.target.files[0]
  const reader = new FileReader()// 这是核心,读取操作就是由它完成.
  reader.readAsText(selectedFile)// 读取文件的内容,也可以读取文件的URL
  reader.onload = function() {
    if (typeof this.result === 'string') {
      const backupData = resolveImportString(this.result)
      if (backupData) {
        const result = window.confirm('确认导入？导入数据与当前数据存在冲突时，将使用最新版本')
        if (result) {
          console.log(backupData)
          api.lightpage.importPages(backupData).then(function(importResult) {
            callback(importResult)
          })
        }
      }
    }
  }
}

export default Vue.extend({
  name: 'DataCenter',
  methods: {
    exportData() {
      api.lightpage.exportPages(true).then(function(res) {
        console.log(res, 'export data')
      })
    },
    importAllNotes(e:any) {
      onImportData(e, function({ data }) {
        alert('成功导入'+data+'个网页笔记')
        console.log(data, 'adta')
        window.location.reload()
      })
    },
    triggerFile(){
      // @ts-ignore
      this.$refs?.fileinput?.click()
    }
  }
})
</script>

<style scoped>
.data-center {
  font-size: 14px;
}
</style>
