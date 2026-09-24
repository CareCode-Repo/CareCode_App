import type { NextConfig } from 'next'

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

const nextConfig: NextConfig = {
  pageExtensions,

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
