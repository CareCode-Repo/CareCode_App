import type { MetadataRoute } from 'next'

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
