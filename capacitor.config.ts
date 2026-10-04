import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

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

    /**
     * 개발 서버를 앱이 직접 불러오게 한다(라이브 리로드).
     *
     * 평소에는 비운다 — 비어 있으면 번들된 파일을 연다. 값을 주면 그 주소에서 화면을
     * 받아오므로 고칠 때마다 다시 빌드하지 않아도 되고, `NODE_ENV=development` 라서
     * 개발 전용 화면(빠른 로그인 버튼 등)도 함께 뜬다. 정적 번들로는 확인할 수 없는
     * 로그인 뒤 화면을 기기에서 보려면 이 길이 필요하다.
     *
     *   CAP_SERVER_URL=http://10.0.2.2:3000 CAP_ALLOW_CLEARTEXT=true npm run app:sync
     *
     * 10.0.2.2 는 안드로이드 에뮬레이터에서 본 호스트 PC 다. 실기기라면 PC 의 LAN 주소를 쓴다.
     * **이 값이 들어간 채로 릴리스를 만들면 안 된다.** 앱이 개발 PC 를 바라보게 된다.
     */
    ...(process.env.CAP_SERVER_URL ? { url: process.env.CAP_SERVER_URL, cleartext: true } : {}),
  },

  android: {
    /**
     * 평문 HTTP 를 섞어 쓸지.
     *
     * 기본은 막는다 — 운영 백엔드는 HTTPS 여야 하고, 페이지 출처가 `https://localhost` 라
     * http 요청은 혼합 콘텐츠가 된다.
     *
     * 로컬 백엔드(http://10.0.2.2:8082)를 기기에서 붙여 볼 때만 연다:
     *
     *   CAP_ALLOW_CLEARTEXT=true npm run app:sync
     *
     * 이 값은 `cap sync` 시점에 `capacitor.config.json` 으로 구워져 앱에 들어간다.
     * 켠 채로 릴리스를 만들지 않도록, 평소에는 빼고 sync 한다.
     */
    allowMixedContent: process.env.CAP_ALLOW_CLEARTEXT === 'true',
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
    Keyboard: {
      /**
       * 키보드가 올라올 때 화면 전체를 밀지 않고 본문만 줄인다.
       *
       * 런타임의 `Keyboard.setResizeMode()` 는 안드로이드에 구현돼 있지 않아
       * `UNIMPLEMENTED` 로 떨어진다. 이 값은 설정으로만 준다.
       */
      resize: KeyboardResize.Native,
    },
  },
}

export default config
