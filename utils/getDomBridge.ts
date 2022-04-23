import { Bridge } from '@/lib/bridge/0.20.4/bridge'

enum SupportDomBridgeVersion {
  'common20' = '0.20.4',
  'new21' = '0.21.21',
}

let common20Bridge: any

interface IBridge {
  sendMessage: <T>(
    type: string,
    data: any,
    callback: (res: { data: { success: boolean; data: T } }) => void
  ) => void
}

const getBridge = function (
  version: SupportDomBridgeVersion = SupportDomBridgeVersion.common20
): IBridge {
  switch (version) {
    case SupportDomBridgeVersion.common20:
      common20Bridge =
        common20Bridge ||
        new Bridge(document.getElementById('messenger'), 'page', 'extension')
      return common20Bridge
    default:
      throw new Error('not implement this bridge ' + version)
  }
}

export default getBridge
