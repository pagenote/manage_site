import { BrowserType } from '~/utils/browser'

export const defaultInstall = 'https://pagenote.cn/release'
export const installLink: Record<BrowserType, string> = {
  [BrowserType.Firefox]:
    'https://addons.mozilla.org/zh-CN/firefox/addon/pagenote/',
  [BrowserType.CHROME]:
    'https://chrome.google.com/webstore/detail/pagenotehighlight-and-tak/hpekbddiphlmlfjebppjhemobaopekmp?utm_source=blog',
  [BrowserType.Edge]:
    'https://microsoftedge.microsoft.com/addons/detail/ablhdlecfphodoohfacojdngdfkgneaa',
  [BrowserType.SAFARI]:
    'https://apps.apple.com/cn/app/pagenote/id1579330191?mt=12',
  [BrowserType.IE]: defaultInstall,
  [BrowserType.OPREAR]: defaultInstall,
  [BrowserType.UNKNOW]: defaultInstall,
}
