import type { MetadataRoute } from 'next'

/**
 * 빌드 시점에 한 번만 만든다.
 *
 * 메타데이터 파일(sitemap/robots/manifest/opengraph-image)은 파일 이름 자체가 규약이라
 * `*.web.ts` 로 바꿔 앱 빌드에서 빼낼 수 없다 — 이름을 바꾸면 라우트는 생기지만 GET 핸들러로
 * 이어지지 않아 405 가 된다. 대신 정적으로 고정해 `output: export` 와 양립시킨다.
 */
export const dynamic = 'force-static'

/**
 * 홈 화면에 추가했을 때의 정보.
 * 모바일 우선 웹 앱이라 브라우저 크롬 없이 열리는 편이 자연스럽다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '맘편한',
    short_name: '맘편한',
    description: '맘편한은 부모와 자녀를 위한 육아 정보 공유 플랫폼입니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4fbe27',
    lang: 'ko',
    /**
     * `scripts/make-app-assets.mjs` + `@capacitor/assets` 가 만든 비트맵을 함께 싣는다.
     * SVG 만 두면 홈 화면 추가 시 아이콘을 그리지 못하는 기기가 있고, 설치 배너 조건을
     * 충족하려면 192·512 비트맵이 필요하다.
     *
     * `maskable` 은 안드로이드가 자기 마스크(원형·스쿼클 등)로 잘라 쓰는 용도다.
     * 잘려도 되도록 글리프를 안전 영역 안에 줄여 둔 자산이라 그대로 쓸 수 있다.
     */
    icons: [
      { src: '/images/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },
      { src: '/icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },
      { src: '/icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'maskable' },
    ],
  }
}
