/**
 * 웹 푸시(FCM) 설정.
 *
 * 값이 하나라도 없으면 푸시 기능 전체를 켜지 않는다. 자격증명 없이 초기화를 시도하면
 * 콘솔이 오류로 가득 차기만 하고, 서버 쪽 발송기도 어차피 비활성이다.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

export const isPushConfigured = (): boolean =>
  !!vapidKey && Object.values(firebaseConfig).every((value) => !!value)

/**
 * firebase SDK 는 항상 **지연 로딩**한다.
 *
 * 이 모듈은 루트 레이아웃(PushListener)에서 쓰이므로 정적으로 import 하면 SDK 가 모든 페이지의
 * 첫 로딩에 실린다. 푸시를 설정하지 않은 환경에서는 한 번도 쓰지 않을 코드다.
 */
const loadMessaging = async () => {
  const [{ getApp, getApps, initializeApp }, messaging] = await Promise.all([
    import('firebase/app'),
    import('firebase/messaging'),
  ])

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

  return { app, messaging }
}

/** 이 브라우저에서 웹 푸시를 쓸 수 있는지. iOS 사파리 등 지원하지 않는 환경이 있다. */
export const isPushSupported = async (): Promise<boolean> => {
  if (!isPushConfigured()) return false
  if (typeof window === 'undefined' || !('Notification' in window)) return false

  try {
    const { messaging } = await loadMessaging()
    return await messaging.isSupported()
  } catch {
    return false
  }
}

/** 구독할 게 없을 때 돌려주는 해제 함수. 호출부가 존재 여부를 따지지 않아도 되게 한다. */
const noop = (): void => undefined

export type PushPermission = 'granted' | 'denied' | 'default' | 'unsupported'

export const getPushPermission = async (): Promise<PushPermission> => {
  if (!(await isPushSupported())) return 'unsupported'
  return Notification.permission
}

/**
 * 앱이 열려 있는 동안 도착한 푸시.
 *
 * 이때는 브라우저가 시스템 알림을 띄우지 않는다(서비스 워커의 백그라운드 핸들러도 돌지 않는다).
 * 그대로 두면 알림은 도착했는데 화면의 안 읽음 배지가 그대로다.
 *
 * 구독 해제 함수를 돌려준다. 푸시를 쓸 수 없으면 아무것도 하지 않는다.
 */
export const onForegroundPush = async (handler: () => void): Promise<() => void> => {
  if (!(await isPushSupported())) return noop
  if (Notification.permission !== 'granted') return noop

  try {
    const { app, messaging } = await loadMessaging()
    return messaging.onMessage(messaging.getMessaging(app), handler)
  } catch (error) {
    console.error('푸시 수신 구독 실패', error)
    return noop
  }
}

/**
 * 이 기기의 푸시 토큰 발급.
 *
 * 권한 요청은 사용자의 명시적인 행동에서만 불러야 한다. 화면에 들어오자마자 물으면
 * 대부분 거절하고, 한 번 거절하면 브라우저 설정에서 직접 풀기 전까지 다시 물을 수 없다.
 *
 * 권한이 없거나 발급에 실패하면 `null`. 푸시는 부가 수단이라 실패가 화면을 막지 않는다.
 */
export const requestPushToken = async (): Promise<string | null> => {
  if (!(await isPushSupported())) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    // 서비스 워커는 번들 밖이라 `process.env` 를 읽을 수 없다. 설정을 쿼리로 넘긴다.
    const params = new URLSearchParams(
      Object.entries(firebaseConfig).map(([key, value]) => [key, value ?? '']),
    )
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${params.toString()}`,
    )

    const { app, messaging } = await loadMessaging()
    const token = await messaging.getToken(messaging.getMessaging(app), {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    return token || null
  } catch (error) {
    console.error('푸시 토큰 발급 실패', error)
    return null
  }
}
