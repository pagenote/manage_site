import SessionStorageBridge from '@pagenote/shared/lib/communication/sessionStorageBridge'

let sessionBridge: SessionStorageBridge

export default function getSessionBridge(): SessionStorageBridge {
  sessionBridge =
    sessionBridge ||
    new SessionStorageBridge('manage_web', {
      asServer: false,
      listenKey: 'pagenote_session_bridge',
      timeout: 60 * 1000,
    })
  return sessionBridge
}
