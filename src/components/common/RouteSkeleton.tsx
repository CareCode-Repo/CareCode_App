import { ReactElement } from 'react'

interface RouteSkeletonProps {
  /** 상단바가 있는 화면이면 그 자리만큼 비워 둔다. 뒤늦게 밀려 내려가지 않게. */
  hasTopNav?: boolean
  rows?: number
}

/**
 * 라우트 전환 중 잠깐 보이는 뼈대.
 *
 * 각 화면에도 자체 스켈레톤이 있지만 그건 **데이터**를 기다리는 동안의 것이다.
 * 이건 그보다 앞선 구간 — 라우트의 JS 청크를 받아오는 동안 — 을 덮는다.
 * 그 사이에는 화면 컴포넌트가 아직 없어서 자체 스켈레톤도 그려질 수 없다.
 *
 * 공용 Loading 은 body 스크롤을 잠그는 모달용이라 여기에는 쓰지 않는다.
 */
const RouteSkeleton = ({ hasTopNav = true, rows = 4 }: RouteSkeletonProps): ReactElement => {
  return (
    <div className="flex h-full flex-col bg-white" aria-busy="true" aria-live="polite">
      <span className="sr-only">화면을 불러오는 중</span>

      {hasTopNav && (
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="size-6 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      )}

      <div className="flex flex-col gap-3 px-4.5 py-5">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

export default RouteSkeleton
