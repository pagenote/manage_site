<template>
  <check-version need-version='0.20.21'>
    <v-main class="md12 ">
      <v-container class=''>
        <v-stepper v-model="step">
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">
              {{ lfs.rootName ? `已选 ${lfs.rootName}` : '选取一个文件夹' }}
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">
              设置同步方式
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">
              {{ingStep3 ? '同步中' : '执行同步'}}
            </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card class="mb-12 pa-4" color="grey lighten-4" height="200px">
                <v-card-text>
                  <p>
                    系统将自动扫描该文件夹{{
                      lfs.rootName ? `(${lfs.rootName})` : ''
                    }}下的 pagenote 文件
                  </p>
                  <div>
                    支持
                    <ul>
                      <li>本地文件夹产生的数据</li>
                      <li>云盘产生的数据</li>
                    </ul>
                  </div>
                </v-card-text>
              </v-card>

              <v-btn color="primary" @click="setDir">
                授权文件夹 {{ lfs.rootName ? lfs.rootName : '' }}
              </v-btn>
              <v-btn
                v-if="lfs.rootName"
                text
                color="secondary"
                @click="(e) => setDir(e, true)"
              >
                重新选择文件夹
              </v-btn>
            </v-stepper-content>

            <v-stepper-content step="2">
              <div class="mb-12 pa-4">
                <v-expansion-panels multiple :panel="[0, 1]">
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      <v-row no-gutters>
                        <v-col cols="4"> 当前状态 </v-col>
                        <v-col cols="8" class="text--secondary">
                          文件夹：{{ files.length }} 个； 插件内：{{ extPages.length }}
                          个
                        </v-col>
                      </v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <div class="text--secondary">
                        文件夹中当前有 {{ files.length }} 个文件
                      </div>
                      <div class="text--secondary">
                        插件中当前有 {{ extPages.length }} 个文件
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      <v-row no-gutters>
                        <v-col cols="4"> 同步策略 </v-col>
                        <v-col cols="8" class="text--secondary">
                          <v-row no-gutters style="width: 100%">
                            推荐使用默认设置
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-row>
                        <!--                      <v-col cols="4">-->
                        <!--                        <v-radio-group v-model="syncType" label="同步目的">-->
                        <!--                          <v-radio-->
                        <!--                            value="sync"-->
                        <!--                            label="双向读写"-->
                        <!--                            :disabled='disabledSync'-->
                        <!--                          ></v-radio>-->
                        <!--                          <v-radio-->
                        <!--                            vlaue="importToExt"-->
                        <!--                            label="仅读文件夹"-->
                        <!--                          ></v-radio>-->
                        <!--                          <v-radio-->
                        <!--                            value="exportFromExt"-->
                        <!--                            label="仅写文件夹"-->
                        <!--                          ></v-radio>-->
                        <!--                        </v-radio-group>-->
                        <!--                      </v-col>-->
                        <!--                      <v-col cols="4">-->
                        <!--                        <v-radio-group-->
                        <!--                          v-model="resolveConflict"-->
                        <!--                          label="冲突解决方式"-->
                        <!--                        >-->
                        <!--                          <v-radio value="auto" label="最后更新优先"></v-radio>-->
                        <!--                          <v-radio vlaue="manual" label="让我手动选择"></v-radio>-->
                        <!--                        </v-radio-group>-->
                        <!--                      </v-col>-->
                        <v-col cols="4">
                          <v-checkbox
                            v-model="deleteUseless"
                            label="自动删除空数据、失效文件"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                      <!--                  <div>-->
                      <!--                    <v-text-field-->
                      <!--                      v-model="secretKey"-->
                      <!--                      label="秘钥"-->
                      <!--                      placeholder="输入秘钥，注意不是云盘账号密码，是你在 PAGENOTE 绑定账号时候设置的数据加密秘钥。没有或错误的秘钥将无法读取数据。"-->
                      <!--                    >-->
                      <!--                    </v-text-field>-->
                      <!--                  </div>-->
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
              <v-flex>
                <v-btn text :disabled="ingStep2" @click="step = 1"> 上一步 </v-btn>
                <v-btn color="primary" :loading='ingStep2' @click="startSync">
                  执行同步
                </v-btn>
              </v-flex>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-card class='ma-1'>
                <v-toolbar
                  flat
                  color="primary"
                  dark
                >
                  <v-progress-linear
                    :value="importPercent"
                    color="amber"
                    height="25"
                  >
                    <template #default="{ value }">
                    <span v-if='files.length'>
                      从文件夹读取数据、写入插件内：
                      <strong>{{ Math.ceil(value) }}%</strong>
                    </span>
                      <span v-else>
                      无读取任务
                    </span>
                    </template>
                  </v-progress-linear>
                  <v-progress-linear
                    :value="exportPercent"
                    color="amber"
                    height="25"
                  >
                    <template #default="{ value }">
                    <span v-if='exportToDirLogs.length'>
                      将插件内数据写入文件夹中：
                      <strong>{{ Math.ceil(value) }}%</strong>
                    </span>
                      <span v-else>
                      无写入任务
                    </span>
                    </template>
                  </v-progress-linear>
                </v-toolbar>
                <v-data-table
                  dense
                  :search='search'
                  :headers="headers"
                  :items="[]"
                  fixed-header
                  item-key="filename"
                  sort-by='time'
                  :sort-desc='true'
                  hide-default-footer
                  disable-pagination
                  class="elevation-1"
                  height='400px'
                >
                  <template #[`item.action`]="{ item }">
                    <div>{{getActionLabel(item.action)}}</div>
                  </template>
                  <template #[`item.diffType`]="{ item }">
                    <div>{{getDiffLabel(item.diffType)}}</div>
                  </template>
                  <template #[`item.status`]="{ item }">
                    <v-chip
                      class="ma-2"
                      :color="getResolveInfo(item.status).color"
                    >
                      {{ getResolveInfo(item.status).label }}
                    </v-chip>
                  </template>
                  <template #[`item.filename`]="{ item }">
                    <div class='filename-td' :title='item.filename'>{{item.filename}}</div>
                  </template>
                  <template #[`item.time`]="{ item }">
                    {{new Date(item.time).toLocaleTimeString()}}
                  </template>
                  <template #[`item.operation`]='{item}'>
                    <v-btn text x-small @click='removeFile(item.filename)'>
                      删除此文件
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card>
              <div class='ma-1'>
                <v-btn :loading='ingStep3' @click="readDir"> 上一步 </v-btn>
                <v-btn v-if='ingStep3 && !step3Lock' color='red' @click='step3Lock=true'>
                  取消操作
                </v-btn>
              </div>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-container>
      <v-dialog
        v-model="dialog"
        persistent
        max-width="290"
      >
        <v-card>
          <v-card-title class="text-h5">
            该目录下没有发现名为 pages 的目录
          </v-card-title>
          <v-card-text>
            pagenote 只会读取 pages 下的文件，是否在当前根目录下创建新目录 pages
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green darken-1"
              text
              @click="dialog = false"
            >
              创建 pages 目录
            </v-btn>
            <v-btn
              color="green darken-1"
              text
              @click="dialog = false"
            >
              重新选择
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </check-version>
</template>

<script lang="ts">
import Vue from 'vue'
import localforage from 'localforage'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import Schedule from '../../lib/schedule'
import LocalFileSystem, { concatPaths } from '../../lib/localFileSystem'
import { decodeTextToWebPage } from '~/utils'
import { DiffType } from '~/utils/diff'
import getSessionBridge from '~/lib/bridge/0.20.21/getSessionBridge'
const md5 = require('md5');

localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE], // 使用 WebSQL；也可以使用 setDriver()
  name: 'pagenote',
  version: 1.0,
  size: 4980736, // 数据库的大小，单位为字节。现仅 WebSQL 可用
  storeName: 'handlers', // 仅接受字母，数字和下划线
  description: 'pagenote handlers',
})

const lfsItem = new LocalFileSystem({});

enum StepStatus {
  notStart = 0,
  ing = 1,
  finished = 2
}

enum FileResolveStatus {
  fail=-1,
  successImport=1,
  successExport=2,
  notImport=0.5,
  empty=0,
  abort=-2,
  ing=3,
}

enum SyncAction {
  importToExt='importToExt',
  exportFromExt='exportFromExt',
  same='same'
}

type SyncDetail = {
  filename:string,
  status: FileResolveStatus,
  detail?: string
  action: SyncAction
  time: number,
  diffType?: DiffType
}


export default Vue.extend({
  name: 'LocalFiles',
  layout: 'empty',
  data(): {
    step: number
    step1ing: StepStatus
    step2ing: StepStatus
    step3ing: StepStatus

    dialog: boolean

    step3Lock: boolean

    files: string[]

    filePages: WebPage[]
    extPages: WebPage[]
    lfs: LocalFileSystem

    deleteUseless: boolean
    secretKey: string
    syncType: 'sync' | 'read' | 'write'
    resolveConflict: 'auto' | 'manual'

    importToExtLogs: SyncDetail[]
    exportToDirLogs: SyncDetail[]

    importSuccess: string[],
    exportSuccess: string[],
    importFail: string[],

    tab: number,

    headers: {}[]
    search: string

  } {
    return {
      step: 1,
      step1ing: StepStatus.notStart,
      step2ing: StepStatus.notStart,
      step3ing: StepStatus.notStart,

      dialog: false,

      step3Lock: false,

      files: [],
      deleteUseless: true,
      filePages: [],
      extPages: [],
      secretKey: '',
      lfs:lfsItem,
      syncType: 'sync',
      resolveConflict: 'auto',

      importToExtLogs: [],
      exportToDirLogs: [],
      importSuccess: [],
      importFail: [],
      exportSuccess: [],

      tab:0,
      search: '',
      headers: [
        {
          text: '时间',
          align: 'start',
          value: 'time',
        },
        { text: '进度', value: 'status' },
        { text: '版本比较', value: 'diffType' },
        { text: '文件', value: 'filename', sortable: false, },
        { text: '操作', value: 'operation', sortable: false, },
        { text: '备注', value: 'detail', sortable: false, },
      ],
    }
  },
  head() {
    return {
      title: '通过文件夹交换数据',
    }
  },
  computed: {
    disabledSync():boolean {
      return this.lfs.rootName !== 'pages'
    },
    ingStep1():boolean{
      return this.step1ing === StepStatus.ing
    },
    ingStep2():boolean{
      return this.step2ing === StepStatus.ing
    },
    ingStep3():boolean{
      return this.step3ing === StepStatus.ing
    },
    totalResolveFilesLength():number{
      return this.importToExtLogs.filter(function(item) {
        return item.status === FileResolveStatus.ing
      }).length
    },
    importPercent():number{
      return (this.importSuccess.length + this.importFail.length)/this.files.length * 100
    },

    totalExportFileLength():number{
      return this.exportToDirLogs.filter(function(item) {
        return item.status === FileResolveStatus.ing
      }).length
    },
    exportPercent():number{
      if(this.exportToDirLogs.length===0){
        return 0
      }
      return (this.extPages.length - this.totalExportFileLength) / this.extPages.length * 100
    }
  },
  mounted() {
    const that = this
    localforage
      .getItem<FileSystemDirectoryHandle>('handler')
      .then(function (item) {
        if (item) {
          that.lfs.setRootHandle(item);
          that.readDir(true)
        }
      })
  },
  methods: {
    removeFile(file:string):Promise<any>{
      return this.lfs.unlink(file);
    },

    /** step1 */
    async setDir(e: { stopPropagation: () => void }, newDir = false) {
      this.step1ing = StepStatus.ing;
      e.stopPropagation()
      if (!newDir && this.lfs.rootName) {
        await this.readDir(true)
        return
      }

      this.lfs
        .setRoot()
        .then((result) => {
          if (result) {
            localforage.setItem('handler', result)
            this.readDir(false)
          } else {
            alert('设置失败')
          }
        }).finally(()=>{
          this.step1ing = StepStatus.finished
        })
    },

    /** step2 */
    async readDir(autoNext: boolean) {
      const verify = await this.lfs.requestPermission('readwrite')
      if (!verify) {
        console.log('无权限')
        return
      }
      if(this.lfs.rootName==='pages'){
        alert('不可选择文件夹 pages 作为授权目录，请重新选择 pages 上一级文件夹')
        return;
      }
      const that = this
      that.step = 2
      this.step1ing = StepStatus.finished;
      this.lfs.stats('/pages').then((result)=> {
        if(!result){
          this.dialog = true
          return;
        }
        this.step2ing = StepStatus.ing
        this.filePages = [];
        this.lfs
          .readdir('/pages', { deep: true, fileFilter: /(\.pagenote|\.pagenote\.html)$/ })
          .then((result) => {
            this.files = result
          })
          .finally(() => {
            if(autoNext === true){
              this.startSync()
            }
            this.getPagenoteListFromExt();
          })
      }).catch((e)=>{
          console.error(e)
          alert('未发现名为 pages 的文件夹')
      })
    },

    /** step2 */
    getPagenoteListFromExt() {
      this.extPages = [];
      return getSessionBridge().requestMessage<WebPage[]>('LIST_LIGHT_PAGES',{
        query: {
          deleted: false,
        },
        limit: 999999,
        skip: 0,
        ignoreDetail: true
      }).then((result)=>{
        this.step2ing = StepStatus.finished
        if(result.success){
          this.extPages = result.data || [];
        }
      })
    },

    /** step3 */
    async startSync() {
      this.importToExtLogs = [];
      this.exportToDirLogs = [];
      const permission = await this.lfs.requestPermission('readwrite');
      if(!permission){
        return
      }
      let secret = '';
      try{
        secret = await this.lfs.readFile('/secret.txt')
      }catch (e) {
        
      }
      if(secret){
        this.secretKey = secret;
      }

      const that = this
      that.step2ing = StepStatus.finished
      that.step3ing = StepStatus.ing;
      that.step = 3
      that.step3Lock = false;

      const schedule = new Schedule({
        duration: 60*1000,
        limit: 1000,
        parallel: 10,
        parallelDuration: 100,
      })

      const tasks = that.files.map((file):Promise<any>=>{
        const task: SyncDetail = {
          filename: file,
          status: FileResolveStatus.ing,
          detail: '等待执行',
          action: SyncAction.importToExt,
          time: Date.now(),
        }
        // taskLogs.push(task)
        return schedule.addFun( ()=>{
          if(that.step3Lock){
            task.detail = '取消操作'
            task.status = FileResolveStatus.abort
            // task.time = Date.now();
            schedule.frequency.limit = 1000;
            schedule.frequency.parallel = 1000;
            return Promise.resolve();
          }

          return this.lfs.readFile(file).then((text)=>{
            if(text.length < 100){
              task.detail = '删除此文件'
              task.status = FileResolveStatus.empty;
              // task.time = Date.now();
              return this.removeFile(file)
            } else {
              task.status = FileResolveStatus.ing;
              const pageFromFile = decodeTextToWebPage(text, this.secretKey)
              task.detail = pageFromFile ? '' : `解析文件失败：此文件可能已加密，${this.secretKey ? '当前秘钥（' + this.secretKey + '）无法成功解密：' : '当前未设置秘钥'}，请在选中的文件夹根目录下新建文件 secret.txt，并将加密秘钥写入其中。`;
              // task.time = Date.now();

              if (!pageFromFile) {
                task.status = FileResolveStatus.empty
                return Promise.resolve()
              } else {
                return getSessionBridge().requestMessage<{ imported: boolean, diffType: DiffType }[]>('IMPORT_LIGHT_PAGES', [pageFromFile]).then((result) => {
                  if (result.success) {
                    this.importSuccess.push(file);
                    // const data = result.data[0].webpage;
                    if(result.data[0].diffType !== DiffType.equal){
                      this.removeFile(file).then((result)=> {
                        console.log(result,'已删除',file)
                        // this.writeWebpageToDir(data);
                      })
                    }
                    if(result.data[0].imported){
                      task.status = FileResolveStatus.successImport;
                    } else{
                      task.status = FileResolveStatus.notImport
                    }
                    task.diffType = result.data[0].diffType
                  } else {
                    console.error('exchange 失败',result)
                    this.importFail.push(file)
                    task.status = FileResolveStatus.fail
                  }
                })
              }
            }
          })
        },{
          taskId: file+'import'
        });
      })
      // that.importToExtLogs = taskLogs;

      console.time('imported')
      Promise.all(tasks).then(function () {
        console.timeEnd('imported')
        that.exportExtPagesToDir();
        that.step3ing = StepStatus.finished
      })
    },

    /** step3 */
    exportExtPagesToDir() {
      this.getPagenoteListFromExt().then(()=>{
        const files = this.extPages;
        const task = files.map((item)=>{
          const exportTask:SyncDetail = {
            action: SyncAction.exportFromExt,
            detail: '写入文件夹',
            diffType: DiffType.ahead,
            filename: item.key,
            status: FileResolveStatus.ing,
            time: Date.now()
          }
          this.exportToDirLogs.push(exportTask)
          return getSessionBridge().requestMessage<WebPage>('GET_LIGHT_PAGE_DETAIL',{key: item.key}).then((result)=>{
            if(result.success && result.data){
              exportTask.status = FileResolveStatus.successExport
              this.writeWebpageToDir(result.data);
            } else{
              exportTask.status = FileResolveStatus.fail;
            }
          })
        })
        console.time('写入完成')
        Promise.all(task).then(()=>{
          console.timeEnd('写入完成')
        })
      })
    },

    writeWebpageToDir(data: WebPage){
      const key = data.key || data.url || data.title;
      let file = md5(key) + '.pagenote.html'
      if(this.lfs.rootName!=='pages'){
        file = concatPaths(['pages',file])
      }
      this.lfs.writeFile(file,JSON.stringify(data))
    },

    getDiffLabel(diffType: DiffType){
      const diffMap:Record<DiffType, string> = {
        [DiffType.equal]: '数据一致',
        [DiffType.ahead]: '文件数据落后',
        [DiffType.behand]: '文件数据优先'
      }
      return diffMap[diffType] || diffType || '未知状态'
    },

    getActionLabel(action: SyncAction):string{
      const actionMap:Record<SyncAction, string> = {
        exportFromExt: '从插件导出',
        importToExt: '导入至插件',
        same: '数据一致',
      }
      return actionMap[action]
    },

    getResolveInfo(status:FileResolveStatus):{label: string, color: string} {
      const resolveMap = {
        [FileResolveStatus.successImport]: {
          label: '成功导入至插件',
          color: 'primary'
        },
        [FileResolveStatus.fail]:{
          label: '未同步',
          color: 'red'
        },
        [FileResolveStatus.empty]:{
          label: '无效文件',
          color: 'yellow'
        },
        [FileResolveStatus.abort]:{
          label: '取消操作',
          color: 'red'
        },
        [FileResolveStatus.ing]:{
          label: '正在执行中',
          color: 'yellow'
        },
        [FileResolveStatus.notImport]:{
          label: '未写入插件',
          color: 'yellow'
        },
        [FileResolveStatus.successExport]:{
          label: '成功写入文件夹',
          color: 'green'
        }
      }
      return resolveMap[status]
    },
  },
})
</script>

<style lang="scss">

td{
  max-width: 200px;
}
.filename-td{
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
