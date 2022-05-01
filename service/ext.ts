import { WebPage } from '@pagenote/shared/lib/@types/data'
import getSessionBridge from '~/lib/bridge/0.20.21/getSessionBridge'

export function removeWebpage(key: string): Promise<boolean> {
  return getSessionBridge()
    .requestMessage('REMOVE_LIGHT_PAGE', { key })
    .then(function (result) {
      return result.success
    })
}

export function getWebpageFromExt(key: string): Promise<WebPage | undefined> {
  return getSessionBridge()
    .requestMessage<WebPage>('GET_LIGHT_PAGE_DETAIL', { key })
    .then((result) => {
      if (result.success) {
        return result.data
      }
    })
}
