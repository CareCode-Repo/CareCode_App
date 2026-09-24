'use client'
import { useSearchParams } from 'next/navigation'
import { ReactElement, ReactNode, Suspense } from 'react'

/**
 * 쿼리 파라미터 하나로 대상을 지정하는 상세 화면 라우트의 공통 껍데기.
 *
 * `useSearchParams` 는 Suspense 경계 안에서만 쓸 수 있다. 경계가 없으면 정적 렌더 단계에서
 * 빌드가 깨지는데(앱 빌드는 전부 정적이다), 라우트마다 같은 Suspense 를 손으로 두르면
 * 한 곳만 빠뜨려도 빌드가 멈춘다. 그 boilerplate 를 여기 한 번만 둔다.
 *
 * 값이 없을 수 있다(사용자가 주소를 직접 고쳤거나, 링크가 잘렸거나). `undefined` 를 그대로
 * 넘겨 화면이 "찾을 수 없음" 을 직접 판단하게 한다 — 여기서 기본값을 지어내지 않는다.
 */
type Props = {
  /** 읽어올 쿼리 파라미터 이름. `routes.ts` 가 만드는 키와 같아야 한다. */
  name: string
  /** 하이드레이션 전까지 보여줄 것. 대개 화면 자체의 로딩 상태로 충분하다. */
  fallback?: ReactNode
  render: (value: string | undefined) => ReactNode
}

const ReadParam = ({ name, render }: Omit<Props, 'fallback'>): ReactElement => {
  const value = useSearchParams().get(name)
  return <>{render(value ?? undefined)}</>
}

const SearchParamRoute = ({ name, fallback = null, render }: Props): ReactElement => (
  <Suspense fallback={fallback}>
    <ReadParam name={name} render={render} />
  </Suspense>
)

export default SearchParamRoute
