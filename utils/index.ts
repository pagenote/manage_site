import Aes from 'crypto-js/aes'
import Crypto from 'crypto-js'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import { WebPageItem } from '@pagenote/shared/lib/models/WebPageItem'

function decodeTextToWebPage(
  txt: string,
  secretKey: string
): WebPage | undefined {
  let downloadWebPage
  // TODO 下载内容中文会出现乱码问题
  try {
    const text = txt.toString()
    downloadWebPage = JSON.parse(text)
  } catch (e) {
    if (secretKey) {
      try {
        const text = Aes.decrypt(txt.toString(), secretKey).toString(
          Crypto.enc.Utf8
        )
        downloadWebPage = JSON.parse(text)
      } catch (e) {
        // return undefined
      }
    }
    // eslint-disable-next-line no-console
    // console.error('解析错误', e, txt)
  }

  // 文件数据确定解析成功
  const webpage = new WebPageItem(downloadWebPage)
  if (webpage.isValid()) {
    return webpage.data
  } else {
    // eslint-disable-next-line no-console
    console.error(webpage, '空数据')
  }
}

export { decodeTextToWebPage }
