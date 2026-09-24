import type { CapacitorConfig } from '@capacitor/cli'

/**
 * 네이티브 셸 설정.
 *
 * 웹 자산은 `npm run build:app` 이 만드는 `out/` 을 그대로 담는다. 앱은 서버에서 화면을
 * 받아오지 않는다 — 번들 안의 파일을 WebView 가 직접 연다. 비행기 모드에서도 앱이 뜨고,
 * "웹사이트를 감싸기만 한 앱"으로 심사에서 걸리지 않기 위한 전제이기도 하다.
 */
const config: CapacitorConfig = {
  /**
   * 스토어에 한 번 올리면 바꿀 수 없다. 두 스토어에서 이 앱을 가리키는 영구 식별자다.
   * 도메인을 보유했다면 그 역순(예: `kr.co.carecode.app`)이 관례다.
   */
  appId: 'com.carecode.app',
  appName: '맘편한',
  webDir: 'out',

  server: {
    /**
     * WebView 가 파일을 여는 출처. `https` 로 둬야 오리진이 `https://localhost` 가 되고,
     * 그래야 보안 컨텍스트에서만 열리는 API(푸시 권한, 위치, 클립보드)가 동작한다.
     * `http` 로 두면 어린이집·병원 찾기의 위치 권한부터 막힌다.
     */
    androidScheme: 'https',
  },

  android: {
    // 앱 안에서 평문 HTTP 를 섞어 쓰지 않는다. 백엔드는 HTTPS 여야 한다.
    allowMixedContent: false,
  },

  ios: {
    // 상단 노치·하단 홈 인디케이터 영역을 WebView 가 직접 다루게 둔다(레이아웃이 safe-area 를 쓴다).
    contentInset: 'never',
  },

  plugins: {
    SplashScreen: {
      // 웹 자산이 준비되면 코드에서 직접 내린다(SplashScreen.hide). 시간으로 재면 기기마다 어긋난다.
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    PushNotifications: {
      // 알림을 탭했을 때 앱이 받을 수 있도록 배지·소리·알림을 모두 표시 대상으로 둔다.
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
