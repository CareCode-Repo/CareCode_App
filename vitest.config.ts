import { fileURLToPath } from 'node:url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  // @vitejs/plugin-react 는 이 프로젝트의 @babel/core 버전과 peer 충돌이 있고,
  // 테스트에는 Fast Refresh 가 필요 없으므로 esbuild 의 JSX 변환만 켠다.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: [
      // svgr 로더가 없는 환경이라 SVG 임포트를 스텁 컴포넌트로 돌린다.
      // 정규식 alias 는 "매칭된 부분"만 치환하므로 경로 전체를 잡아야 한다.
      {
        find: /^.*\.svg$/,
        replacement: fileURLToPath(new URL('./src/test/svg-mock.tsx', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
