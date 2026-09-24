import type { NextConfig } from 'next'
import pkg from './package.json' with { type: 'json' }

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * 앱(Capacitor) 빌드인지.
 *
 * 같은 소스에서 결과물이 둘 나온다.
 * - 웹(`BUILD_TARGET` 없음): 서버가 있는 Next 앱. 동적 라우트(`/policy/[id]`)와 OG 이미지로
 *   검색 유입과 링크 공유 카드를 만든다. sitemap.xml 이 가리키는 문서가 바로 이 경로들이다.
 * - 앱(`BUILD_TARGET=app`): WebView 안에서 도는 정적 파일 묶음. 서버가 없으므로 임의의
 *   `[id]` 를 미리 그려둘 수 없다. 대신 `/policy/detail?id=` 쿼리 라우트만 싣는다.
 *
 * 두 라우트는 같은 화면 컴포넌트를 렌더한다. 갈라지는 것은 "id 를 어디서 읽는가" 뿐이다.
 */
const isAppBuild = process.env.BUILD_TARGET === 'app'

/**
 * 확장자로 라우트를 걸러낸다. 이미 `*.dev.tsx`(개발 전용 화면)에 쓰던 방식을 그대로 넓혔다.
 * - `*.web.tsx` — 서버가 있어야 도는 라우트. 앱 빌드에서는 통째로 빠진다.
 * - `*.dev.tsx` — 내부 확인용 화면. 프로덕션 번들에 섞여 나가지 않는다.
 */
const pageExtensions = ['tsx', 'ts', 'jsx', 'js']
if (!isAppBuild) pageExtensions.push('web.tsx', 'web.ts')
if (isDevelopment) pageExtensions.push('dev.tsx')

/**
 * 웹 응답에 붙이는 보안 헤더.
 *
 * 이 서비스는 아이 건강기록과 개인정보를 다룬다. 헤더가 없으면 브라우저는 기본값으로
 * 동작하는데, 그 기본값은 대체로 "일단 허용" 이다.
 *
 * 앱 빌드에는 붙지 않는다(정적 파일이라 응답 헤더를 줄 서버가 없다). 앱 쪽 같은 보호는
 * WebView 설정이 맡는다 — `allowMixedContent: false` 로 평문 HTTP 를 막아 뒀다.
 */
const securityHeaders = () => {
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? ''

  /**
   * `'unsafe-inline'` 을 script-src 에 둔 이유: Next 는 하이드레이션 데이터를 인라인
   * 스크립트로 심는다. 없애려면 요청마다 nonce 를 발급하는 미들웨어가 필요하다.
   * 지금은 거기까지 가지 않되, **어디로 보낼 수 있는지**(connect/form/frame)는 조인다 —
   * XSS 가 나더라도 데이터를 밖으로 빼가기는 어렵게 한다.
   */
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    // 프로필·첨부 이미지가 어느 도메인에서 올지 서버가 정한다.
    "img-src 'self' data: blob: https:",
    // 백엔드와 FCM 말고는 어디로도 보내지 않는다.
    `connect-src 'self' ${apiOrigin} https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com`.trim(),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    /**
     * 평문 요청을 https 로 올린다. 백엔드가 https 일 때만 켠다 —
     * 로컬·사내 백엔드가 http 인 상태에서 켜면 API 호출이 통째로 실패한다.
     */
    ...(apiOrigin.startsWith('https://') ? ['upgrade-insecure-requests'] : []),
  ].join('; ')

  return [
    { key: 'Content-Security-Policy', value: csp },
    // HTTPS 로만 오게 한다. 한 번 받으면 브라우저가 기억한다.
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    // 확장자와 다른 내용을 실행 가능한 타입으로 넘겨짚지 않게 한다.
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    // 클릭재킹. CSP frame-ancestors 를 못 읽는 옛 브라우저용으로 함께 둔다.
    { key: 'X-Frame-Options', value: 'DENY' },
    // 외부로 나갈 때 경로까지 흘리지 않는다(정책 id 등이 리퍼러에 남지 않게).
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    /**
     * 쓰지 않는 기기 기능은 잠근다. 위치는 "내 주변" 검색에 필요하므로 self 로 연다.
     * 카메라는 파일 선택기만 쓰므로 막아 둔다.
     */
    {
      key: 'Permissions-Policy',
      value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
    },
  ]
}

const nextConfig: NextConfig = {
  pageExtensions,

  /**
   * 화면에 표시할 버전.
   *
   * 문의를 받았을 때 "어느 버전이세요" 를 물을 수 있어야 한다. 앱에서는 네이티브가
   * 들고 있는 버전이 더 정확하지만(스토어에 올라간 값), 웹에는 그런 게 없어 여기서 준다.
   */
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version },

  // 정적 export 에는 응답 헤더라는 개념이 없다(Next 도 이 설정을 무시한다).
  ...(isAppBuild
    ? {}
    : {
        async headers() {
          return [{ source: '/:path*', headers: securityHeaders() }]
        },
      }),

  // 앱 빌드에서만 정적 파일로 뽑는다(out/). Capacitor 가 이 폴더를 네이티브 프로젝트에 복사한다.
  ...(isAppBuild
    ? {
        output: 'export' as const,
        // WebView 는 파일을 디스크에서 바로 읽는다. 이미지 최적화 서버가 없다.
        images: { unoptimized: true },
        // `/policy/detail` 을 `/policy/detail/index.html` 로 뽑아야 WebView 가 찾아낸다.
        trailingSlash: true,
      }
    : {}),

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    // @ts-expect-error 타입 에러 무시
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              typescript: true,
              ext: 'tsx',
            },
          },
        ],
      },
    )
    fileLoaderRule.exclude = /\.svg$/i
    return config
  },
}

export default nextConfig
