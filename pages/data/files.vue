<template>
  <div>
    <v-stepper v-model="e1">
      <v-stepper-header>
        <v-stepper-step :complete="e1 > 1" step="1">
          选取一个文件夹
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="e1 > 2" step="2">
          读取文件 - {{ pages.length }}
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3"> 确定导入至插件 </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card class="mb-12 pa-4" color="grey lighten-3" height="200px">
            <v-card-text>
              <p>
                选取一个文件夹后，PAGENOTE 将自动扫描该文件夹下的 PAGENOTE
                文件，整理出有效文件，供你选择导入或导出。
              </p>
            </v-card-text>
          </v-card>

          <v-btn color="primary" @click="setDir"> 选择文件夹 </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-12 pa-4 scroll-y-transition" color="grey lighten-3">
            <v-row>
              <v-col cols="2">
                <v-text-field
                  v-model="secretKey"
                  label="秘钥"
                  placeholder="输入秘钥，注意不是云盘账号密码，是你在 PAGENOTE 绑定账号时候设置的数据加密秘钥。没有或错误的秘钥将无法读取数据。"
                >
                </v-text-field>
              </v-col>
              <v-col cols="4">
                <v-checkbox
                  v-model="deleteUseless"
                  label="自动删除空数据文件"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-sheet max-height="400" style="overflow: auto">
              运行日志： 处理中： {{ logs.length }}/{{ files.length }}
              <v-list-item v-for="i in logs" :key="i">
                {{ i }}
              </v-list-item>
            </v-sheet>
          </v-card>
          <v-btn color="primary" :disabled="resolving" @click="readDir">
            {{ resolving ? '重新读取' : '开始读取' }}
          </v-btn>
          <v-btn text :disabled="resolving" @click="e1 = 1"> 上一步 </v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card class="mb-12 pa-4" color="grey lighten-3" height="200px">
            已读取到
            {{ pages.length }} 个有效文件。可导出为单个文件或导入插件内。
          </v-card>
          <v-btn color="primary" @click="importToPagenote">
            将{{ pages.length }}个文件导入至插件
          </v-btn>

          <v-btn color="primary" @click="exportFile">
            合并{{ pages.length }}个文件为单个备份文件
          </v-btn>

          <v-btn text @click="e1 = 2"> 上一步 </v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import { makeExportString } from '@pagenote/shared/lib/utils/data'
import { contentToFile } from '@pagenote/shared/lib/utils/document'
import LocalFileSystem from '../../lib/localFileSystem'
import { decodeTextToWebPage } from '~/utils'
const lfs = new LocalFileSystem({})

const exportPages = (pages: WebPage[]) => {
  const version = '0.20.14'
  const dataString = makeExportString({
    pages,
    version: 2,
    extension_version: version,
    backup_at: Date.now(),
  })
  contentToFile(dataString, `${version}_${pages.length}.pagenote`)
}

export default Vue.extend({
  name: 'LocalFiles',
  data(): {
    e1: number
    files: string[]
    logs: string[]
    deleteUseless: boolean
    pages: WebPage[]
    secretKey: string
    resolving: boolean
  } {
    return {
      e1: 1,
      files: [],
      logs: [],
      deleteUseless: false,
      pages: [],
      secretKey: '',
      resolving: false,
    }
  },
  methods: {
    setDir() {
      lfs
        .setRoot()
        .then((result) => {
          if (result) {
            this.e1 = 2
            this.readDir()
          } else {
            alert('设置失败')
          }
        })
        .catch(function () {
          alert('设置异常')
        })
    },
    readDir() {
      const that = this
      this.logs = []
      this.pages = []
      this.resolving = true
      lfs
        .readdir('/', { deep: true, fileFilter: /\.pagenote\.html$/ })
        .then((result) => {
          this.files = result
          const pages: WebPage[] = []
          const tasks = []

          for (let i = 0; i < result.length; i++) {
            const file = result[i]
            tasks.push(
              new Promise((resolve) => {
                lfs.readFile(file).then((text) => {
                  if (text.length > 100) {
                    const page = decodeTextToWebPage(text, this.secretKey)
                    if (page) {
                      pages.push(page)
                      this.pages = pages
                      this.logs.push(`${file} : 解密成功`)
                    } else {
                      this.logs.push(`${file}: 解密失败或无效文件，请检查`)
                    }
                  } else {
                    this.logs.push(
                      `${file}: 这是一个空数据文件 ${
                        this.deleteUseless
                          ? '已经将其自动删除'
                          : '建议你将其删除'
                      }`
                    )
                    lfs.unlink('/' + file)
                  }
                  resolve(null)
                })
              })
            )
          }

          Promise.all(tasks).then(function () {
            that.resolving = false
            that.e1 = 3
          })
        })
    },
    exportFile() {
      if (this.pages.length === 0) {
        return alert('没有可导出的数据')
      }
      exportPages(this.pages)
    },
    importToPagenote() {},
  },
})
</script>

<style lang="scss">
.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}
</style>
