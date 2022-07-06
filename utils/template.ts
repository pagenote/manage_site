import { WebPage } from '@pagenote/shared/lib/@types/data'
import { convertDataToString } from '@pagenote/shared/lib/pagenote-convert'
import { PredefinedSchema } from '@pagenote/shared/lib/pagenote-convert/predefined'
import { contentToFile } from '@pagenote/shared/lib/utils/document'

// TODO 收敛到工具方法中去
function writeTextToClipboard(text: string) {
  try {
    return navigator.clipboard.writeText(text)
  } catch (e) {
    const textarea = document.createElement('textarea')
    textarea.textContent = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('Copy', false, '')
    document.body.removeChild(textarea)
    return Promise.resolve()
  }
}

enum ACTION_NUM {
  copy = 'COPY',
  download = 'DOWNLOAD',
}

const templates = {
  markdown: {
    template: PredefinedSchema.markdown,
    fileExt: 'md',
    actions: [ACTION_NUM.copy, ACTION_NUM.download],
  },
}

const dataToString = function (
  exportTemplate: string,
  data: WebPage,
  action?: ACTION_NUM,
  filename?: string
): string {
  const result = {
    success: false,
    data: '',
  }
  result.data = convertDataToString(data, exportTemplate)
  result.success = !!result.data
  if (action && actions[action]) {
    actions[action](result.data, filename)
  }
  return result.data
}

const actions = {
  [ACTION_NUM.copy](resultString: string): Promise<void> {
    return writeTextToClipboard(resultString)
  },
  [ACTION_NUM.download](
    resultString: string,
    filename?: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      contentToFile(resultString, filename || `${Date.now()}.pagenote`)
      resolve(true)
    })
  },
}

export { templates, actions, dataToString, ACTION_NUM, writeTextToClipboard }
