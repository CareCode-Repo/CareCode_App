import type { MetadataRoute } from 'next'

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
