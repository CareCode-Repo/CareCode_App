declare module '*.svg' {
  import type { FC, SVGProps } from 'react'

  // React.VFC 는 @types/react 19 에서 삭제됐다.
  const SVG: FC<SVGProps<SVGSVGElement>>
  export default SVG
}
