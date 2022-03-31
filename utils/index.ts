import Aes from 'crypto-js/aes'
import Crypto from 'crypto-js'
import { WebPage } from '@pagenote/shared/lib/@types/data'
import { WebPageItem } from '@pagenote/shared/lib/models/WebPageItem'

function decodeTextToWebPage(
  txt: string,
  secretKey: string
): WebPage | null | undefined {
  let downloadWebPage = null
  // TODO 下载内容中文会出现乱码问题
  try {
    let text = txt.toString()
    if (secretKey) {
      try {
        text = Aes.decrypt(text, secretKey).toString(Crypto.enc.Utf8)
      } catch (e) {
        // console.warn('解密失败')
      }
      text = text || txt.toString()
    }
    downloadWebPage = JSON.parse(text)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('解析错误', e, txt)
    return undefined
  }

  // 文件数据确定解析成功
  const webpage = new WebPageItem(downloadWebPage)
  if (webpage.isValid()) {
    return webpage.data
  } else {
    // eslint-disable-next-line no-console
    console.error(webpage, '空数据')
    return null
  }
}

export { decodeTextToWebPage }
