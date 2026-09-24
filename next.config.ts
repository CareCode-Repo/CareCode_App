import type { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  /**
   * `*.dev.tsx` 는 개발 서버에서만 라우트로 잡힌다.
   * 컴포넌트 갤러리(/component-test) 처럼 내부 확인용 화면이 프로덕션 번들에
   * 섞여 나가지 않도록 확장자로 걸러낸다.
   */
  pageExtensions: isDevelopment
    ? ['tsx', 'ts', 'jsx', 'js', 'dev.tsx']
    : ['tsx', 'ts', 'jsx', 'js'],
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
