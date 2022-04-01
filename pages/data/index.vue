<template>
  <div>
    <!--    格式化处理数据-->
    <!--    <v-text-field-->
    <!--      v-model="secretKey"-->
    <!--      label="秘钥"-->
    <!--      placeholder="输入秘钥，可选"-->
    <!--    ></v-text-field>-->
    <!--    <v-textarea-->
    <!--      v-model="input"-->
    <!--      solo-->
    <!--      name="input-7-4"-->
    <!--      label="Solo textarea"-->
    <!--    ></v-textarea>-->
    <!--    <v-sheet color="white" elevation="1">-->
    <!--      {{ result }}-->
    <!--    </v-sheet>-->
    <p>生成备份文件：对历史生成的数据，按规范格式导出为备份文件。</p>

    <!--    <v-btn @click="setDir"> 本地文件夹读取数据（适用于本地文件夹授权产生的同步数据） </v-btn>-->
    <div>
      <v-text-field
        v-model="secretKey"
        label="秘钥"
        placeholder="输入秘钥，注意不是云盘账号密码，是你在 PAGENOTE 绑定账号时候设置的数据加密秘钥。没有或错误的秘钥将无法读取数据。"
      ></v-text-field>
      <v-checkbox
        v-model="deleteUseless"
        label="自动删除空数据文件"
      ></v-checkbox>
      <v-btn @click="setDir">
        通过云盘数据生成备份文件（适用与通过 webdav 同步产生的数据，数据根目录为
        pages）
      </v-btn>
      <v-sheet>
        运行日志： 处理中： {{ logs.length }}/{{ files.length }}
        <v-btn @click="exportFile">
          导出 {{ pages.length }} 个笔记为单个文件
        </v-btn>
        <v-list-item v-for="i in logs" :key="i">
          {{ i }}
        </v-list-item>
      </v-sheet>
    </div>
    <!--    <div>-->
    <!--      <div v-for="i in files" :key="i">-->
    <!--        {{ i }}-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { makeExportString } from '@pagenote/shared/lib/utils/data'
import { contentToFile } from '@pagenote/shared/lib/utils/document'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import { decodeTextToWebPage } from '@/utils'
import LocalFileSystem from '@/lib/localFileSystem'

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

const lfs = new LocalFileSystem({
  rootname: 'read',
})

export default Vue.extend({
  name: 'DataResolver',
  data(): {
    input: string
    secretKey: string
    files: string[]
    logs: string[]
    deleteUseless: boolean
    pages: WebPage[]
  } {
    return {
      input:
        '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',
      secretKey: '',
      files: [],
      logs: [],
      deleteUseless: false,
      pages: [],
    }
  },
  computed: {
    result(): string {
      return this.input
        ? decodeTextToWebPage(this.input, this.secretKey)
          ? ''
          : '解密失败了'
        : '请填入加密数据'
    },
  },
  methods: {
    setDir() {
      if (!this.secretKey) {
        alert('请输入加密密钥，用于解密云盘数据')
        return
      }
      lfs.setRoot().then((result) => {
        if (result) {
          lfs.readdir('/').then((result) => {
            this.files = result
            const pages: WebPage[] = []
            const tasks = []

            for (let i = 0; i < result.length; i++) {
              const file = result[i]
              tasks.push(
                new Promise((resolve) => {
                  lfs.readFile('/' + file).then((text) => {
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
              const checkConfirm = confirm(
                `成功解析到 ${pages.length} 个文件，确定导出吗？`
              )
              if (checkConfirm) {
                exportPages(pages)
              }
            })
          })
        }
      })
    },
    exportFile() {
      if (this.pages.length === 0) {
        alert('没有可导出的数据')
        return
      }
      exportPages(this.pages)
    },
  },
})
</script>
