<template>
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
<!--                            vlaue="read"-->
<!--                            label="仅读文件夹"-->
<!--                          ></v-radio>-->
<!--                          <v-radio-->
<!--                            value="write"-->
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
<!--                <v-toolbar-title>-->
<!--                  运行日志： 处理中： {{  }}/{{ files.length }}-->
<!--                </v-toolbar-title>-->
                <v-progress-linear
                  :value="importPercent"
                  color="amber"
                  height="25"
                ></v-progress-linear>
              </v-toolbar>
              <v-card-title>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-data-table
                dense
                :search='search'
                :headers="headers"
                :items="syncDetail"
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
                <template #[`item.operation`]>
                  <v-btn text x-small>
                    还原
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
  </v-main>
</template>

<script lang="ts">
import Vue from 'vue'
import localforage from 'localforage'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import { makeExportString } from '@pagenote/shared/lib/utils/data'
import { contentToFile } from '@pagenote/shared/lib/utils/document'
import LocalFileSystem from '../../lib/localFileSystem'
import { decodeTextToWebPage } from '~/utils'
import { Bridge } from '~/lib/bridge/0.20.21/bridge'
import { DiffType } from '~/utils/diff'

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

localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE], // 使用 WebSQL；也可以使用 setDriver()
  name: 'pagenote',
  version: 1.0,
  size: 4980736, // 数据库的大小，单位为字节。现仅 WebSQL 可用
  storeName: 'handlers', // 仅接受字母，数字和下划线
  description: 'pagenote handlers',
})

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

const lfsItem = new LocalFileSystem({});

enum StepStatus {
  notStart = 0,
  ing = 1,
  finished = 2
}

enum FileResolveStatus {
  fail=-1,
  successImport=1,
  empty=0,
  abort=-2,
  ing=3,
}

enum SyncAction {
  read='read',
  write='write',
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

    step3Lock: boolean

    files: string[]

    filePages: WebPage[]
    extPages: WebPage[]
    lfs: LocalFileSystem

    deleteUseless: boolean
    secretKey: string
    syncType: 'sync' | 'read' | 'write'
    resolveConflict: 'auto' | 'manual'

    syncDetail: SyncDetail[]

    tab: number,

    headers: {}[]
    search: string

  } {
    return {
      step: 1,
      step1ing: StepStatus.notStart,
      step2ing: StepStatus.notStart,
      step3ing: StepStatus.notStart,

      step3Lock: false,

      files: [],
      deleteUseless: true,
      filePages: [],
      extPages: [],
      secretKey: '',
      lfs:lfsItem,
      syncType: 'sync',
      resolveConflict: 'auto',

      syncDetail: [],

      tab:0,
      search: '',
      headers: [
        {
          text: '时间',
          align: 'start',
          value: 'time',
        },
        // {
        //   text: '操作',
        //   align: 'start',
        //   value: 'action',
        // },
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
      return this.syncDetail.filter(function(item) {
        return item.status === FileResolveStatus.ing
      }).length
    },
    importPercent():number{
      return (this.files.length - this.totalResolveFilesLength)/this.files.length * 100
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
    /** step1 */
    async setDir(e: { stopPropagation: () => void }, newDir = false) {
      this.step1ing = StepStatus.ing;
      e.stopPropagation()
      if (!newDir) {
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
        return
      }
      const that = this
      that.step = 2
      this.step1ing = StepStatus.finished;
      this.step2ing = StepStatus.ing
      this.filePages = [];
      this.lfs
        .readdir('/', { deep: true, fileFilter: /\.pagenote/ })
        .then((result) => {
          this.files = result
        })
        .finally(() => {
          if(autoNext === true){
            this.startSync()
          }
          this.getPagenoteListFromExt();
        })
    },

    /** step2 */
    getPagenoteListFromExt() {
      this.extPages = [];
      getBridge().sendMessage('LIST_LIGHT_PAGES',{
        query: {
          deleted: false,
        },
        limit: 999999,
        skip: 0,
        ignoreDetail: true
      },({data}:{data:{success: boolean,data: WebPage[]}})=> {
        this.step2ing = StepStatus.finished
        if(data.success){
          this.extPages = data.data || [];
        }
      },Math.random().toString())
    },

    /** step3 */
    async startSync() {
      this.syncDetail = [];
      console.log('清空')
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

      Promise.all(that.files.map((file)=>{
        return new Promise((resolve) => {
          this.lfs.readFile(file).then((text) => {
            console.log('read', file)
            if(that.step3Lock){
              this.syncDetail.push({
                filename: file,
                status: FileResolveStatus.abort,
                detail: '用户取消操作',
                action: SyncAction.read,
                time: Date.now(),
              })
              return Promise.resolve(null)
            }

            if(text.length < 100){
              this.syncDetail.push({
                filename: `${file}`,
                status: FileResolveStatus.empty,
                detail: '删除此文件',
                action: SyncAction.read,
                time: Date.now(),
              })
              this.lfs.unlink('/' + file)
            } else {
              const pageFromFile = decodeTextToWebPage(text, this.secretKey)
              const syncDetail:SyncDetail = {
                filename: file,
                status: FileResolveStatus.ing,
                action: SyncAction.read,
                time: Date.now(),
                detail: pageFromFile ? '' : `解析文件失败：此文件可能已加密，${this.secretKey?'当前秘钥（'+this.secretKey+'）无法成功解密：':'当前未设置秘钥'}，请在选中的文件夹根目录下新建文件 secret.txt，并将加密秘钥写入其中。`,
              }
              this.syncDetail.push(syncDetail);

              if (pageFromFile) {
                this.importPageToExt(pageFromFile,(result)=>{
                  if(result.imported){
                    syncDetail.status = FileResolveStatus.successImport;
                  } else{
                    syncDetail.status = FileResolveStatus.fail
                  }
                  syncDetail.diffType = result.diffType
                })
              } else {
                syncDetail.status = FileResolveStatus.empty
              }
            }
          }).finally(()=>{
            resolve(null)
          })
        })
      })).then(function () {
        that.step3ing = StepStatus.finished
      })
    },

    /** step3 */
    exportFile() {
      if (this.filePages.length === 0) {
        return alert('没有可导出的数据')
      }
      exportPages(this.filePages)
    },


    getDiffLabel(diffType: DiffType){
      const diffMap:Record<DiffType, string> = {
        [DiffType.equal]: '数据一致',
        [DiffType.ahead]: '文件数据落后',
        [DiffType.behand]: '文件数据优先'
      }
      return diffMap[diffType]
    },

    getActionLabel(action: SyncAction):string{
      const actionMap:Record<SyncAction, string> = {
        read: '读取',
        same: '数据一致',
        write: '版本落后于插件，不读取'
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
        }
      }
      return resolveMap[status]
    },

    importPageToExt(webpage: WebPage,callback:(result:{imported: boolean,webpage:WebPage|null,diffType:DiffType})=>void){
      // @ts-ignore
      getBridge().sendMessage('IMPORT_LIGHT_PAGES',[webpage],({ data })=>{
        callback( data.success ? data.data[0] :{
          webpage: null,
          imported: false
        });
      },Math.random().toString())
    },
  },
})
</script>

<style lang="scss">
//.v-card--reveal {
//  bottom: 0;
//  opacity: 1 !important;
//  position: absolute;
//  width: 100%;
//}

th{
  //white-space: nowrap;
}
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
