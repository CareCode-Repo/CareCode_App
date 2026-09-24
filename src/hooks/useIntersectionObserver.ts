import { RefObject, useEffect, useRef, useState } from 'react'

/**
 * 요소의 교차 상태를 구독한다.
 *
 * `options` 는 effect 의 의존성이므로 **모듈 스코프의 고정 객체**를 넘겨야 한다.
 * 렌더마다 새 객체 리터럴을 넘기면 옵저버가 매 렌더 다시 만들어진다.
 */
const useIntersectionObserver = (
  elemRef: RefObject<HTMLElement | null>,
  options: IntersectionObserverInit,
): {
  entries: IntersectionObserverEntry[]
  observerRef: RefObject<IntersectionObserver | null>
} => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([])

  useEffect(() => {
    const node = elemRef.current
    if (!node) return

    const observer = new IntersectionObserver(setEntries, options)
    observerRef.current = observer
    observer.observe(node)

    return () => observer.disconnect()
  }, [elemRef, options])

  return {
    entries,
    observerRef,
  }
}

export default useIntersectionObserver
