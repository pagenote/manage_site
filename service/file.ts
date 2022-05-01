import { WebPage } from '@pagenote/shared/lib/@types/data'
import LocalFileSystem from '~/lib/localFileSystem'
import { decodeTextToWebPage } from '~/utils'

export default function (lfs: LocalFileSystem) {
  const methods = {
    removeFile(file: string) {
      return lfs
        .unlink(file)
        .then(function () {
          return true
        })
        .catch(function () {
          return false
        })
    },
    getWebpage(file: string, secret = ''): Promise<WebPage | undefined> {
      return lfs
        .readFile(file)
        .then((text) => {
          if (text.length < 50) {
            return undefined
          }
          const pageFromFile = decodeTextToWebPage(text, secret)
          return pageFromFile
        })
        .catch(function () {
          return undefined
        })
    },
    writeToDir(file: string, page: WebPage): Promise<boolean> {
      return lfs.writeFile(file, JSON.stringify(page)).then(function (result) {
        return !!result
      })
    },
    listPagenoteFiles() {
      return lfs.readdir('/pages', {
        deep: true,
        fileFilter: /(\.pagenote|\.pagenote\.html)$/,
      })
    },
  }

  return methods
}
