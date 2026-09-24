import { nativePlatform } from './native'

/**
 * 운영에서 터진 오류를 모아 본다.
 *
 * 이게 없으면 사용자가 겪은 오류를 알 방법이 전혀 없다. "앱이 안 돼요" 라는 문의를 받고
 * 재현부터 시작해야 하는데, 이 서비스는 아이 정보·지원금 자격처럼 **계정마다 다른 데이터**
 * 위에서 도는 화면이 많아 재현이 잘 되지 않는다.
 *
 * DSN 이 없으면 SDK 를 **불러오지 않는다.** 지연 import 라 네트워크로 내려받지도, 실행되지도
 * 않는다.
 *
 * 다만 청크 파일 자체는 빌드 결과물에 남는다(약 400KB / 앱 번들 7.6MB). 번들러가 조건을
 * 정적으로 접어 없애 주길 기대하고 `process.env` 를 직접 조건에 써 보았지만 그러지 않았다.
 * 한 번도 요청되지 않는 파일이라 실행 비용은 0 이고, 상용 서비스라면 어차피 DSN 을 채우게
 * 되므로 여기까지만 둔다.
 */

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

export const isErrorReportingConfigured = (): boolean => !!DSN

let initPromise: Promise<typeof import('@sentry/browser') | null> | null = null

/**
 * 오류 본문에서 걷어낼 것들.
 *
 * 이 앱은 아이 건강기록과 개인정보를 다룬다. 오류를 보겠다고 그 내용을 외부 서비스에
 * 쌓으면 그 자체가 유출이다. 주소의 쿼리와 요청 본문은 통째로 버린다 — 어느 화면에서
 * 무슨 오류가 났는지만 알면 고칠 수 있고, 값이 무엇이었는지는 대개 필요 없다.
 */
const scrub = (
  event: import('@sentry/browser').ErrorEvent,
): import('@sentry/browser').ErrorEvent => {
  if (event.request) {
    // 예: /policy/detail?id=123 → /policy/detail
    event.request.url = event.request.url?.split('?')[0]
    delete event.request.query_string
    delete event.request.data
    delete event.request.cookies
    delete event.request.headers
  }

  // 사용자 식별은 서버가 준 userId 까지만. 이메일·이름은 보내지 않는다.
  if (event.user) {
    event.user = { id: event.user.id }
  }

  return event
}

const load = async (): Promise<typeof import('@sentry/browser') | null> => {
  if (!DSN) return null

  if (!initPromise) {
    initPromise = import('@sentry/browser')
      .then((Sentry) => {
        Sentry.init({
          dsn: DSN,
          environment: process.env.NODE_ENV,
          // 어느 플랫폼에서 났는지가 원인을 가르는 첫 갈래다(WebView 전용 버그가 많다).
          initialScope: { tags: { platform: nativePlatform() } },
          /**
           * 성능 추적은 끈다. 표본을 켜면 모든 요청 주소가 함께 올라가는데, 이 앱의
           * 주소에는 아이 id·기록 id 가 들어 있다.
           */
          tracesSampleRate: 0,
          beforeSend: scrub,
        })
        return Sentry
      })
      .catch(() => null)
  }

  return initPromise
}

/** 화면이 붙잡은 오류를 보낸다. 실패해도 조용히 넘어간다 — 보고가 화면을 막으면 안 된다. */
export const reportError = (error: unknown, context?: Record<string, string>): void => {
  void load()
    .then((Sentry) => Sentry?.captureException(error, context ? { tags: context } : undefined))
    .catch(() => undefined)
}

/** 로그인·로그아웃에 맞춰 누구의 오류인지만 표시해 둔다(이메일·이름은 넣지 않는다). */
export const setErrorReportingUser = (userId: string | null): void => {
  void load()
    .then((Sentry) => Sentry?.setUser(userId ? { id: userId } : null))
    .catch(() => undefined)
}

/** 앱 부팅 시 한 번. 여기서 SDK 가 전역 오류·미처리 거부를 잡기 시작한다. */
export const initErrorReporting = (): void => {
  void load()
}
