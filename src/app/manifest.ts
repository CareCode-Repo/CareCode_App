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
    icons: [
      {
        src: '/images/app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
