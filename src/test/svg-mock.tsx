import { ReactElement, SVGProps } from 'react'

/**
 * 테스트에서 SVG 임포트를 대신하는 스텁.
 *
 * 앱은 `@svgr/webpack` 으로 SVG 를 React 컴포넌트로 변환하지만 Vitest 에는 그 로더가 없다.
 * 아이콘 자체는 검증 대상이 아니므로 자리만 차지하는 요소로 바꾼다.
 */
const SvgMock = (props: SVGProps<SVGSVGElement>): ReactElement => (
  <svg data-testid="svg-mock" {...props} />
)

export default SvgMock
