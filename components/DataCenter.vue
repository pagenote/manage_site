<template>
  <div class='data-center'>
    <v-dialog
      v-model='dialog'
      persistent
      max-width='290'
    >
      <v-card>
        <v-card-title class='text-h5'>
          数据备份/还原
        </v-card-title>

        <v-card-text>
          <ul>
            <li>
              <div>
                通过单个备份文件（.bak）
              </div>
              <div>
                <v-tooltip top>
                  <template #activator='{ on, attrs }'>
                    <v-btn
                      elevation='2'
                      x-small
                      color='#82b1ff'
                      v-bind='attrs'
                      v-on='on'
                      @click='exportData'
                    >
                      导出
                      <v-icon size='small'>mdi-download-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>导出备份</span>
                </v-tooltip>

                <input
id='import-data' ref='fileinput' type='file' style='display: none' @input='importAllNotes'
                       @change={importAllNotes} />
                <label for='import-data'>
                  <v-tooltip top>
                    <template #activator='{ on, attrs }'>
                      <v-btn
                        elevation='2'
                        x-small
                        color='#82b1ff'
                        v-bind='attrs'
                        v-on='on'
                        @click='triggerFile'
                      >
                        导入
                        <v-icon size='small'>mdi-backup-restore</v-icon>
                      </v-btn>
                    </template>
                    <span>导入还原</span>
                  </v-tooltip>
                </label>
              </div>
            </li>
<!--            <li>-->
            <!--              通过文件夹交换数据-->
            <!--              <div>-->
            <!--                <v-btn-->
            <!--                  elevation='2'-->
            <!--                  small>-->
            <!--                  选择文件夹-->
            <!--                </v-btn>-->
            <!--              </div>-->
            <!--            </li>-->
          </ul>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='green darken-1'
            text
            @click='dialog = false'
          >
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn
      elevation='2'
      icon
      x-small
      color='#82b1ff'
      @click='dialog = true'
    >
      <v-icon>mdi-database</v-icon>
    </v-btn>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import api from '@pagenote/shared/lib/generateApi'
import { resolveImportString } from '@pagenote/shared/lib/utils/data'
import { BaseMessageResponse } from '@pagenote/shared/lib/communication/base'

const onImportData = (e: { target: { files: any[]; }; }, callback: (res: BaseMessageResponse<number>) => void) => {
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
  data() {
    return {
      dialog: false
    }
  },
  methods: {
    exportData() {
      api.lightpage.exportPages(true).then(function(res) {
        console.log(res, 'export data')
      })
    },
    importAllNotes(e: any) {
      onImportData(e, function({ data }) {
        alert('成功导入' + data + '个网页笔记')
        console.log(data, 'adta')
        window.location.reload()
      })
    },
    triggerFile() {
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
