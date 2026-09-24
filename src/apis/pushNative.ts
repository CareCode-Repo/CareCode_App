import { isNativeApp } from '@/utils/native'

/**
 * 앱에서의 푸시.
 *
 * 웹은 브라우저의 Notification·서비스 워커 위에서 돈다(`push.ts`). 앱에서는 그 둘이 없거나
 * 다르게 동작하므로 네이티브 경로를 따로 둔다. 공개 API 는 `push.ts` 가 하나로 묶는다.
 *
 * **왜 `@capacitor/push-notifications` 가 아니라 Firebase 래퍼인가.**
 * 서버는 FCM 으로 쏜다(`PushNotificationSender` 가 `FirebaseMessaging.send(setToken(...))`).
 * 그런데 `@capacitor/push-notifications` 는 iOS 에서 **APNs 원시 토큰**을 준다. 그 토큰을
 * FCM 에 넣으면 발송이 실패한다. Firebase 래퍼는 양 플랫폼 모두 FCM 등록 토큰을 주므로
 * 서버가 지금 쓰는 방식 그대로 쓸 수 있다. 두 플러그인을 같이 두면 iOS 에서 APNs 델리게이트를
 * 서로 가져가려 해 문제가 생기므로 `@capacitor/push-notifications` 는 걷어냈다.
 *
 * 네이티브 자격증명(`android/app/google-services.json`,
 * `ios/App/App/GoogleService-Info.plist`)이 없으면 토큰 발급이 실패한다. 실패해도 화면을
 * 막지 않는다 — 푸시는 부가 수단이고, 알림함은 그대로 동작한다.
 */

type PushPermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

const loadMessaging = () => import('@capacitor-firebase/messaging')

export const isNativePush = (): boolean => isNativeApp()

export const getNativePushPermission = async (): Promise<PushPermissionState> => {
  if (!isNativePush()) return 'unsupported'

  try {
    const { FirebaseMessaging } = await loadMessaging()
    const { receive } = await FirebaseMessaging.checkPermissions()
    if (receive === 'granted') return 'granted'
    if (receive === 'denied') return 'denied'
    // 'prompt' / 'prompt-with-rationale' — 아직 묻지 않았다.
    return 'default'
  } catch {
    return 'unsupported'
  }
}

/**
 * 이 기기의 FCM 토큰.
 *
 * 권한 요청은 사용자의 명시적인 행동에서만 부른다. 들어오자마자 물으면 대부분 거절하고,
 * 한 번 거절하면 앱 설정에서 직접 풀기 전까지 다시 물을 수 없다(웹과 같은 제약).
 */
export const requestNativePushToken = async (): Promise<string | null> => {
  if (!isNativePush()) return null

  try {
    const { FirebaseMessaging } = await loadMessaging()

    const { receive } = await FirebaseMessaging.requestPermissions()
    if (receive !== 'granted') return null

    const { token } = await FirebaseMessaging.getToken()
    return token || null
  } catch (error) {
    // 자격증명이 안 들어간 빌드에서 여기로 온다. 무엇이 빠졌는지 알 수 있게 남긴다.
    console.error('네이티브 푸시 토큰 발급 실패 (google-services.json 확인)', error)
    return null
  }
}

/** 구독할 게 없을 때 돌려주는 해제 함수. 호출부가 존재 여부를 따지지 않아도 되게 한다. */
const noop = (): void => undefined

/** 앱이 열려 있는 동안 도착한 푸시. 이때는 시스템 알림이 뜨지 않으므로 화면을 직접 갱신해야 한다. */
export const onNativePushReceived = async (handler: () => void): Promise<() => void> => {
  if (!isNativePush()) return noop

  try {
    const { FirebaseMessaging } = await loadMessaging()
    const handle = await FirebaseMessaging.addListener('notificationReceived', () => handler())
    return () => void handle.remove()
  } catch (error) {
    console.error('네이티브 푸시 수신 구독 실패', error)
    return noop
  }
}

/**
 * 알림을 **탭해서** 앱이 열린 경우.
 *
 * 웹에서는 서비스 워커가 `/notification` 을 열어 준다(firebase-messaging-sw.js). 앱에는
 * 그 서비스 워커가 없으므로 같은 이동을 여기서 해 준다 — 알림을 눌렀는데 홈 화면이 뜨면
 * 무엇 때문에 열렸는지 알 수 없다.
 */
export const onNativePushOpened = async (handler: () => void): Promise<() => void> => {
  if (!isNativePush()) return noop

  try {
    const { FirebaseMessaging } = await loadMessaging()
    const handle = await FirebaseMessaging.addListener('notificationActionPerformed', () =>
      handler(),
    )
    return () => void handle.remove()
  } catch (error) {
    console.error('네이티브 푸시 탭 구독 실패', error)
    return noop
  }
}
