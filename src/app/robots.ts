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
 * 로그인해야 볼 수 있는 화면과 관리자 화면은 크롤링 대상이 아니다.
 * 색인돼 봐야 검색 결과에서 로그인 화면으로 튕기므로 유입에 도움이 되지 않는다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/auth',
        '/mypage',
        '/children',
        '/health',
        '/notification',
        '/chat',
        '/signup',
        '/benefits',
        // 로그인이 필요한 쓰기 화면
        '/community/write',
        '/community/*/edit',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/sitemap.xml`,
  }
}
