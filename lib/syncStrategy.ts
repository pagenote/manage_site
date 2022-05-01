import {
  FILE_ACTION,
  TaskDetail,
  TaskState,
} from '@pagenote/shared/lib/@types/webdav'

/** 一条数据的摘要信息 */
export type AbstractInfo = {
  // 文件相关指标
  etag?: string // etag hash标识，webdav 使用
  lastmod?: string // 文件的最后修改时间 GTM 格式，webdav 使用

  // 数据相关指标
  updateAt?: number // 数据的最后更新时间

  // key值，数据比较标识
  basename: string // 比较key

  /** 非比较信息 */
  fullFilepath: string // 文件系统中的完整路径地址
}
export type Snapshot = Record<string, AbstractInfo>

export enum ChangeFlag {
  nochange = '0',
  changed = '1',
  deleted = '2',
  created = '3',
}

// 冲突
export const CONFLICT_FLAT = [
  `${ChangeFlag.nochange}${ChangeFlag.nochange}`, // 本地无变化、远程无变化
  `${ChangeFlag.changed}${ChangeFlag.changed}`, // 本地有变化、远程有变化
  `${ChangeFlag.changed}${ChangeFlag.created}`, // 本地有变化、远程有新建
  `${ChangeFlag.created}${ChangeFlag.changed}`, // 本地有新建、远程有变化
  `${ChangeFlag.created}${ChangeFlag.created}`, // 本地有新建、远程有新建
]

// 下载
export const DOWNLOAD_FLAG = [
  `${ChangeFlag.nochange}${ChangeFlag.changed}`, // 本地无变化、远程有变化
  `${ChangeFlag.nochange}${ChangeFlag.created}`, // 本地无变化、远程有新建
]

// 本地删除
export const CLIENT_DELETE_FLAG = [
  `${ChangeFlag.nochange}${ChangeFlag.deleted}`, // 本地无变化、远程已删除
  `${ChangeFlag.changed}${ChangeFlag.deleted}`, // 本地有变化、远程已删除
  `${ChangeFlag.created}${ChangeFlag.deleted}`, // 本地有新增、远程已删除
]

// 上传服务端
export const CLIENT_UPLOAD_FLAG = [
  `${ChangeFlag.changed}${ChangeFlag.nochange}`, // 本地有变化、远程无变化
  `${ChangeFlag.created}${ChangeFlag.nochange}`, // 本地已创建、远程无变化
]

// 服务端删除
export const SERVER_DELETE_FLAG = [
  `${ChangeFlag.deleted}${ChangeFlag.nochange}`, // 本地已删除、远程无变化
  `${ChangeFlag.deleted}${ChangeFlag.changed}`, // 本地已删除、远程已修改
  `${ChangeFlag.deleted}${ChangeFlag.created}`, // 本地已删除、远程已创建
]

// 无需操作
export const NO_ACTION = [`${ChangeFlag.deleted}${ChangeFlag.deleted}`]

// 比较两个摘要是否相同
export function isSame(
  temCurrent: AbstractInfo,
  temOld: AbstractInfo
): boolean {
  temCurrent = temCurrent || { basename: '' }
  temOld = temOld || { basename: '' }

  // 有此标识的情况下，按业务字段为准。例如文件夹同插件比较时，可以取到该值，最为准确
  if (temCurrent.updateAt && temOld.updateAt) {
    return temCurrent.updateAt === temOld.updateAt
  }
  // 无法取到业务标识的情况下，如云盘，只能拿到文件的摘要信息
  else {
    // 按 文件的基本信息来比较
    const etagSame = temCurrent.etag && temCurrent.etag === temOld.etag
    const lastmodSame =
      temCurrent.lastmod && temCurrent.lastmod === temOld.lastmod
    if (etagSame || lastmodSame) {
      return true
    }

    // 远程信息和本地数据比较时，webdav 返回的lastmod为GTM字符串，本地存储的可能不是，需要格式化为时间再比较
    if (temCurrent.lastmod && temOld.lastmod) {
      const currentLastMod = new Date(temCurrent.lastmod).getTime()
      const oldLastMod = new Date(temOld.lastmod).getTime()
      if (currentLastMod === oldLastMod) {
        return true
      }
    }
  }

  return false
}

// 基于摘要信息创建快照
export function createSnapshot(abstracts: AbstractInfo[]): {
  snapshot: Snapshot
  multiData: AbstractInfo[]
} {
  const dataMap: Snapshot = {}
  const multiData = []
  for (let i = 0; i < abstracts.length; i++) {
    const tempItem = abstracts[i]
    if (dataMap[tempItem.basename]) {
      if (
        (tempItem?.updateAt || 0) < (dataMap[tempItem.basename]?.updateAt || 1)
      ) {
        console.warn('落后已存在', tempItem)
        multiData.push(tempItem)
        continue
      } else {
        multiData.push(dataMap[tempItem.basename])
      }
    }
    dataMap[tempItem.basename] = {
      basename: tempItem.basename,
      lastmod: tempItem.lastmod,
      etag: tempItem.etag,
      updateAt: tempItem.updateAt,
      fullFilepath: tempItem.fullFilepath,
    }
  }
  return {
    snapshot: dataMap,
    multiData,
  }
}

type ChangeMap = Record<string, ChangeFlag>
// 比较两个快照的差异
export function diffSnapshot(
  current: Snapshot = {},
  old: Snapshot = {}
): ChangeMap {
  const result: Record<string, ChangeFlag> = {}
  const resolvedMark: Record<string, boolean> = {}
  for (const i in current) {
    const temCurrent = current[i]
    const temOld = old[i]

    // 之前不存在该数据，则标记为：新增 created
    if (!temOld) {
      result[i] = ChangeFlag.created
    }
    // 如果相同，则标记为： 无变化 nochange
    else if (isSame(temCurrent, temOld)) {
      result[i] = ChangeFlag.nochange
    } else {
      result[i] = ChangeFlag.changed
    }
    resolvedMark[i] = true
  }

  for (const j in old) {
    if (resolvedMark[j]) {
      continue
    }
    result[j] = ChangeFlag.deleted
  }

  return result
}

type SyncTaskInfo = {
  changeMap: ChangeMap
  diffSnapShot: Snapshot
}

type SyncTaskDetail = TaskDetail & {
  localFullFilepath: string
  cloudFullFilepath: string
}
export type SyncTaskMap = Record<string, SyncTaskDetail>

function createTaskDetail(
  localFileStat: AbstractInfo = { basename: '', fullFilepath: '' },
  cloudFileStat: AbstractInfo = { basename: '', fullFilepath: '' },
  action: FILE_ACTION
) {
  const taskDetail: SyncTaskDetail = {
    basename: cloudFileStat.basename || localFileStat.basename,
    state: TaskState.pending,
    cloudEtag: cloudFileStat.etag || '',
    cloudLastmod: cloudFileStat.lastmod?.toString() || '',
    localEtag: localFileStat?.etag || '',
    localLastmod: localFileStat.lastmod?.toString() || '',
    actionType: action,
    cloudFullFilepath: cloudFileStat.fullFilepath,
    localFullFilepath: localFileStat.fullFilepath,
  }
  return taskDetail
}

// 基于 diff 和快照，计算两端的同步任务
export function computeSyncTask(
  base: SyncTaskInfo,
  other: SyncTaskInfo
): SyncTaskMap {
  const tasks: SyncTaskMap = {}
  /** 1 */
  for (const i in base.changeMap) {
    // 如果远端不存在该变化，则忽略该变化，进入步骤2处理
    const cloudFlag = other.changeMap[i]
    if (cloudFlag === undefined) {
      continue
    }
    const localFlag = base.changeMap[i]
    const localInfo = base.diffSnapShot[i]
    const cloudInfo = other.diffSnapShot[i]
    const same = isSame(localInfo, cloudInfo) // 当前本地和远端是否一致
    const flag = localFlag + cloudFlag // 数据变化标记

    let actionType: FILE_ACTION
    if (CONFLICT_FLAT.includes(flag)) {
      if (!same) {
        actionType = FILE_ACTION.conflict
      }
    } else if (DOWNLOAD_FLAG.includes(flag)) {
      if (!same) {
        actionType = FILE_ACTION.overrideDownload
      }
    } else if (CLIENT_DELETE_FLAG.includes(flag)) {
      actionType = FILE_ACTION.clientDelete
    } else if (CLIENT_UPLOAD_FLAG.includes(flag)) {
      if (!same) {
        actionType = FILE_ACTION.overrideUpload
      }
    } else if (SERVER_DELETE_FLAG.includes(flag)) {
      actionType = FILE_ACTION.serverDelete
    }

    // @ts-ignore
    if (actionType) {
      tasks[i] = createTaskDetail(localInfo, cloudInfo, actionType)
    }

    delete base.changeMap[i]
    delete other.changeMap[i]
  }

  /** 2 */
  for (const i in base.changeMap) {
    const flag = base.changeMap[i]
    if (
      [ChangeFlag.nochange, ChangeFlag.changed, ChangeFlag.created].includes(
        flag
      )
    ) {
      tasks[i] = createTaskDetail(
        base.diffSnapShot[i],
        other.diffSnapShot[i],
        FILE_ACTION.clientUpload
      )
    }
  }

  /** 3 */
  for (const i in other.changeMap) {
    const flag = other.changeMap[i]
    if (
      [ChangeFlag.nochange, ChangeFlag.changed, ChangeFlag.created].includes(
        flag
      )
    ) {
      tasks[i] = createTaskDetail(
        base.diffSnapShot[i],
        other.diffSnapShot[i],
        FILE_ACTION.clientDownload
      )
    }
  }
  return tasks
}

type ResolveFunMap = Record<
  FILE_ACTION,
  (key: string, taskDetail: SyncTaskDetail) => Promise<boolean>
>
// 执行同步任务
export function resolveSyncTask(
  taskMap: SyncTaskMap,
  resolveFunMap: ResolveFunMap
): Promise<void[]> {
  const clientDownload: Record<string, SyncTaskDetail> = {}
  const clientDelete: Record<string, SyncTaskDetail> = {}
  const serverDelete: Record<string, SyncTaskDetail> = {}
  const clientUpload: Record<string, SyncTaskDetail> = {}
  const conflict: Record<string, SyncTaskDetail> = {}
  const resolveTaskArray = []
  for (const i in taskMap) {
    const tempTask = taskMap[i]
    // 已执行、或正在执行，直接跳过，防止重复执行
    if ([TaskState.success, TaskState.resolving].includes(tempTask.state)) {
      continue
    }
    const resolveFun: (
      key: string,
      taskDetail: SyncTaskDetail
    ) => Promise<boolean> = function () {
      return Promise.resolve(true)
    }
    switch (tempTask.actionType) {
      case FILE_ACTION.clientDelete:
        clientDelete[i] = tempTask
        resolveFunMap[FILE_ACTION.clientDelete](i, tempTask)
        break
      case FILE_ACTION.clientDownload:
        clientDownload[i] = tempTask
        resolveFunMap[FILE_ACTION.clientDownload](i, tempTask)
        break
      case FILE_ACTION.clientUpload:
        clientUpload[i] = tempTask
        resolveFunMap[FILE_ACTION.clientUpload](i, tempTask)
        break
      case FILE_ACTION.conflict:
        conflict[i] = tempTask
        resolveFunMap[FILE_ACTION.conflict](i, tempTask)
        break
      case FILE_ACTION.serverDelete:
        serverDelete[i] = tempTask
        resolveFunMap[FILE_ACTION.serverDelete](i, tempTask)
        break
      case FILE_ACTION.overrideDownload:
        clientDownload[i] = tempTask
        resolveFunMap[FILE_ACTION.overrideDownload](i, tempTask)
        break
      case FILE_ACTION.overrideUpload:
        clientUpload[i] = tempTask
        resolveFunMap[FILE_ACTION.overrideUpload](i, tempTask)
        break
      default:
        console.log('未知类型任务', taskMap[i])
    }
    tempTask.state = TaskState.resolving
    resolveTaskArray.push(
      resolveFun(i, tempTask)
        .then(function (result) {
          if (result) {
            // TODO 简化类型，增加 detail 描述
            tempTask.state = TaskState.success
          } else {
            tempTask.state = TaskState.valid
          }
        })
        .catch(function () {
          tempTask.state = TaskState.networkError
        })
    )
  }

  return Promise.all(resolveTaskArray)
}
