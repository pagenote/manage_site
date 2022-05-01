<template>
  <check-version need-version='0.20.21'>
    <v-main class='md12 '>
      <v-container class=''>
        <v-card class='mb-12 pa-4' color='grey lighten-4'>
          <v-card-text>
            <p>
              系统将自动扫描该文件夹{{
                lfs.rootName ? `(${lfs.rootName})` : ''
              }}下的 pages 目录内的文件。
            </p>
          </v-card-text>

          <v-expansion-panels multiple :panel='[0, 1]'>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-row no-gutters>
                  <v-col cols='4'>插件、文件夹信息</v-col>
                  <v-col cols='8' class='text--secondary'>
                      <span>
                        文件夹
                        <span v-if='lfs.rootName'>({{ lfs.rootName }})</span>：
                        <span v-if='lfs.hasPermission'>
                          {{ files.length }} 个
                          <span v-if='errorFiles.length'>
                            无法解析文件有：{{errorFiles.length}} 个
                          </span>
                        </span>
                        <span v-else> ?(授权后可统计) </span>。
                      </span>
                    <span>
                        插件内：{{ extPages.length }} 个
                      </span>
                  </v-col>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class='text--secondary'>
                  授权后将自动同步文件夹、插件内的数据，保证两个数据源保持一致。
                  <div v-if='errorFiles.length'>
                    无效文件，请检查：
                    <ul>
                      <li v-for='i in errorFiles' :key='i'>
                        {{i}}
                        <v-btn @click='lfs.unlink(i).then(()=>{readDirFiles()})'>删除</v-btn>
                      </li>
                    </ul>
                  </div>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-row no-gutters>
                  <v-col cols='4'>同步进度</v-col>
                  <v-col cols='8'>
                    <v-progress-linear
                      :value='taskPercent'
                      :color='progressColor'
                      height='25'
                    >
                      <template #default='{ value }'>
                        <div v-if='lfs.hasPermission'>
                          <span v-if='isFinished'>
                          已同步
                        </span>
                          <span v-else-if='taskPercent || totalTask'>
                        共有 {{ totalTask }} 个同步任务。已完成
                        <strong>{{ Math.ceil(value) }}%</strong>
                        </span>
                          <span v-else>
                          无同步任务，等待「开始同步」
                        </span>
                        </div>
                        <div v-else>
                          <v-btn text x-small @click='setDir'>请授权后同步</v-btn>
                        </div>
                      </template>
                    </v-progress-linear>
                  </v-col>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>

              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
        <v-flex align-self-center>
          <v-btn v-if='!lfs.rootName || !lfs.hasPermission' color='primary' @click='setDir'>
            {{ lfs.rootName ? `授权 ${lfs.rootName}` : '授权文件夹' }}
          </v-btn>
          <v-btn v-else :disabled='isResolving' :loading='isResolving' @click='startSync'>
            开始同步
          </v-btn>
          <v-btn
            v-if='lfs.rootName'
            text
            small
            color='secondary'
            @click='(e) => setDir(e, true)'
          >
            重新选择文件夹
          </v-btn>
        </v-flex>
      </v-container>
      <v-dialog
        v-model='dialog'
        persistent
        max-width='290'
      >
        <v-card>
          <v-card-title class='text-h5'>
            该目录下没有发现名为 pages 的目录
          </v-card-title>
          <v-card-text>
            pagenote 只会读取 pages 下的文件，是否在当前根目录下创建新目录 pages
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color='green darken-1'
              text
              @click='dialog = false'
            >
              创建 pages 目录
            </v-btn>
            <v-btn
              color='green darken-1'
              text
              @click='dialog = false'
            >
              重新选择
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </check-version>
</template>

<script lang='ts'>
import Vue from 'vue'
import localforage from 'localforage'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import { FILE_ACTION, TaskState } from '@pagenote/shared/lib/@types/webdav'
import { onVisibilityChange } from '@pagenote/shared/lib/utils/document'
import { WebPageItem } from '@pagenote/shared/lib/models/WebPageItem'
import LocalFileSystem, { concatPaths } from '../../lib/localFileSystem'
import { DiffType, diffWebPages } from '~/utils/diff'
import getSessionBridge from '~/lib/bridge/0.20.21/getSessionBridge'
import {
  AbstractInfo,
  computeSyncTask,
  createSnapshot,
  diffSnapshot,
  resolveSyncTask,
  SyncTaskMap
} from '~/lib/syncStrategy'
import { getWebpageFromExt, removeWebpage } from '~/service/ext'
import file from '~/service/file'

const md5 = require('md5')
enum StepStatus {
  notStart = 0,
  ing = 1,
  finished = 2
}

localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE], // 使用 WebSQL；也可以使用 setDriver()
  name: 'pagenote',
  version: 1.0,
  size: 4980736, // 数据库的大小，单位为字节。现仅 WebSQL 可用
  storeName: 'handlers', // 仅接受字母，数字和下划线
  description: 'pagenote handlers'
})
const lfsItem = new LocalFileSystem({})

export default Vue.extend({
  name: 'LocalFiles',
  layout: 'empty',
  data(): {
    lfs: LocalFileSystem // 文件操作句柄

    files: string[] // 文件清单
    extPages: WebPage[] // 插件数据摘要
    errorFiles: string[]

    // 同步策略配置
    deleteUseless: boolean

    // 运行时
    dialog: boolean

    // 同步状态
    status: StepStatus,
    syncTask: SyncTaskMap, // 同步任务
  } {
    return {
      syncTask: {},
      status: StepStatus.notStart,
      dialog: false,
      files: [],
      deleteUseless: true,
      extPages: [],
      errorFiles: [],
      lfs: lfsItem,
    }
  },
  head() {
    return {
      title: '通过文件夹交换数据'
    }
  },
  computed: {
    progressColor():string{
      if(this.taskPercent >= 100){
        return 'green'
      } else{
        return 'amber'
      }
    },
    isFinished(): boolean {
      return this.status === StepStatus.finished
    },
    isResolving():boolean{
      return this.status === StepStatus.ing
    },

    totalTask(): number {
      const { success, fail, resolving } = this.progress
      return success + fail + resolving
    },

    taskPercent(): number {
      if (this.totalTask === 0) {
        if(this.isFinished){
          return 100
        }else{
          return 0
        }
      }
      const { success, fail } = this.progress
      return (success + fail) / this.totalTask * 100
    },

    progress(): {
      success: number,
      fail: number,
      resolving: number,
    } {
      const progress = {
        success: 0,
        fail: 0,
        resolving: 0
      }
      for (const i in this.syncTask) {
        const state = this.syncTask[i].state
        if (state === TaskState.success) {
          progress.success++
        } else if ([TaskState.resolving, TaskState.pending].includes(state)) {
          progress.resolving++
        } else {
          progress.fail++
        }
      }
      return progress
    }
  },
  mounted() {
    const that = this
    localforage
      .getItem<FileSystemDirectoryHandle>('handler')
      .then(function(item) {
        if (item) {
          that.lfs.setRootHandle(item)
        }
      }).finally(() => {
        this.startSync()
      })

    onVisibilityChange((hidden)=> {
      if(!hidden){
        this.computeFileSyncTask().then(()=>{
          this.startSync()
        })
      }
    })
  },
  methods: {
    getWebpageListFromExt(): Promise<WebPage[]> {
      return getSessionBridge().requestMessage<WebPage[]>('LIST_LIGHT_PAGES', {
        query: {},
        limit: 999999,
        skip: 0,
        ignoreDetail: true
      }).then((result) => {
        if (result.success) {
          const pages = result.data || [];
          this.extPages = pages;
          return pages
        } else {
          throw new Error('读取异常')
        }
      })
    },
    writeWebpageToDir(key: string): Promise<boolean> {
      return getWebpageFromExt(key).then((result) => {
        if (result) {
          let path = md5(key) + '.pagenote.html'
          if (this.lfs.rootName !== 'pages') {
            path = concatPaths(['pages', path])
          }
          return file(this.lfs).writeToDir(path,result)
        } else {
          return false
        }
      })
    },
    async writeFileToExt(path: string): Promise<boolean> {
      const data = await file(this.lfs).getWebpage(path)
      if (data) {
        const webpageItem = new WebPageItem(data);
        if(webpageItem.isValid()){
          return getSessionBridge().requestMessage<{ imported: boolean, diffType: DiffType }[]>('IMPORT_LIGHT_PAGES', [data]).then(function(result) {
            return result.success && result.data[0].imported
          })
        }else{
          return file(this.lfs).removeFile(path)
        }
      } else {
        return false
      }
    },
    async readDirFiles(): Promise<string[]> {
      this.errorFiles = []
      const verify = await this.lfs.requestPermission('readwrite')
      if (!verify) {
        throw new Error('无权限')
      }
      if (!/pagenote/.test(this.lfs.rootName)) {
        alert('根文件夹名称需含有字母： pagenote')
        throw new Error('error rootname ' + this.lfs.rootName)
      }
      const pagesDir = await this.lfs.exists('/pages')
      if (!pagesDir) {
        // this.dialog = true
        await this.lfs.mkdir('/pages')
      }
      const syncInfos = await this.lfs.exists('/.sync_infos')
      if (!syncInfos) {
        // this.dialog = true
        await this.lfs.mkdir('/.sync_infos')
      }
      const files = await file(this.lfs).listPagenoteFiles()
      this.files = files
      return files;
    },

    /** step1 授权文件夹 */
    setDir(_e: any, reselect = false) {
      this.status = StepStatus.notStart
      if (this.lfs.rootName && !reselect) {
        this.startSync();
        return
      }

      this.lfs
        .setRoot()
        .then((result) => {
          if (result) {
            localforage.setItem('handler', result)
            this.startSync();
          } else {
            alert('未授权成功')
          }
        })
    },

    /** step2 计算同步任务 */
    async computeFileSyncTask() {
      this.errorFiles = []
      this.syncTask = {}
      const pages = await this.getWebpageListFromExt()
      const files = await this.readDirFiles()

      const readTask: Promise<WebPage|undefined>[] = []
      files.forEach((path) => {
        readTask.push(file(this.lfs).getWebpage(path).then((item)=> {
          if(!item){
            // 无效文件提示
            this.errorFiles.push(path)
            return
          }
          return item;
        }))
      })
      const filesSnapshot = await Promise.all(readTask).then((webpages) => {
        const list: AbstractInfo[] = []
        for (let i = 0; i < webpages.length; i++) {
          const webpage = webpages[i]
          if(webpage && (webpage.key || webpage.url)){
            list.push({
              ...webpage,
              basename: webpage.key,
              fullFilepath: this.files[i]
            })
          }else{
            console.warn('无效文件',webpage)
          }
        }
        return createSnapshot(list)
      })
      const fileChange = diffSnapshot(filesSnapshot.snapshot, {})
      filesSnapshot.multiData.forEach((abstract)=> {
        console.warn('删除重复数据',abstract)
        file(this.lfs).removeFile(abstract.fullFilepath)
      })


      const extSnapshot = createSnapshot(pages.map(function(item) {
        return {
          ...item,
          basename: item.key,
          fullFilepath: ''
        }
      }))
      const extChange = diffSnapshot(extSnapshot.snapshot, {})

      const syncTask = computeSyncTask({
        changeMap: extChange,
        diffSnapShot: extSnapshot.snapshot
      }, {
        changeMap: fileChange,
        diffSnapShot: filesSnapshot.snapshot
      })

      this.syncTask = syncTask
      return syncTask
    },

    /** step3 开始同步 */
    async startSync() {
      this.status = StepStatus.ing
      // if (this.totalTask === 0) {
      //   this.status = StepStatus.finished
      // }
      let task = this.syncTask;
      if(Object.keys(task).length===0){
        task = await this.computeFileSyncTask()
      }

      resolveSyncTask(task, {
        [FILE_ACTION.conflict]: async (key, taskDetail): Promise<boolean> => {
          const extPage = await getWebpageFromExt(key)
          const dirPage = await file(this.lfs).getWebpage(taskDetail.cloudFullFilepath)
          const result = diffWebPages(extPage, dirPage)
          switch (result.diffType) {
            case DiffType.ahead:
              return this.writeWebpageToDir(key)
            case DiffType.behand:
              return this.writeFileToExt(taskDetail.cloudFullFilepath)
            case DiffType.equal:
              return true
          }
          return Promise.resolve(false)
        },
        [FILE_ACTION.clientDownload]: (_key, taskDetail): Promise<boolean> => {
          return this.writeFileToExt(taskDetail.cloudFullFilepath)
        },
        [FILE_ACTION.clientUpload]: (key): Promise<boolean> => {
          return this.writeWebpageToDir(key)
        },
        [FILE_ACTION.clientDelete]: (key): Promise<boolean> => {
          return removeWebpage(key)
        },
        [FILE_ACTION.serverDelete]: (_key, taskDetail): Promise<boolean> => {
          return file(this.lfs).removeFile(taskDetail.cloudFullFilepath)
        },
        [FILE_ACTION.overrideUpload]: (key): Promise<boolean> => {
          return this.writeWebpageToDir(key)
        },
        [FILE_ACTION.overrideDownload]: (_key, taskDetail): Promise<boolean> => {
          return this.writeFileToExt(taskDetail.cloudFullFilepath)
        }
      }).then(() => {
        this.status = StepStatus.finished
        this.computeFileSyncTask()
      })
    }
  }
})
</script>

<style lang='scss'>

td {
  max-width: 200px;
}

.filename-td {
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
