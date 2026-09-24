/**
 * 앱 안에서 이동할 주소를 만드는 곳.
 *
 * 왜 상세 화면이 `/policy/1` 이 아니라 `/policy/detail?id=1` 인가:
 * 앱(Capacitor) 빌드는 서버가 없는 정적 파일 묶음이라, 빌드 시점에 존재하는 id 를 전부
 * 알지 못하면 `[id]` 경로를 만들어 둘 수 없다. 반면 쿼리는 파일 하나로 무한한 id 를 받는다.
 *
 * 웹 빌드에는 `[id]` 라우트(`*.web.tsx`)가 그대로 남아 있다. 검색 결과와 공유 링크가
 * 가리키는 주소라 없앨 수 없다. 즉 상세 화면에 이르는 길이 둘인데, **앱 안에서의 이동은
 * 언제나 이 파일을 거쳐 쿼리 쪽으로 간다.** 두 벌을 유지하지 않으려는 의도다.
 *
 * 경로를 문자열로 직접 쓰지 말고 여기에 함수를 추가한다. 템플릿 문자열이 호출부에 흩어지면
 * 라우트 구조를 바꿀 때 무엇이 깨졌는지 grep 으로도 잡히지 않는다.
 */

type Id = string | number

const withQuery = (path: string, params: Record<string, Id>): string => {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  )
  return `${path}?${query.toString()}`
}

export const routes = {
  // 자녀
  childDetail: (childId: Id): string => withQuery('/children/detail', { childId }),
  childEdit: (childId: Id): string => withQuery('/children/edit', { childId }),

  // 커뮤니티
  communityDetail: (postId: Id): string => withQuery('/community/detail', { id: postId }),
  communityEdit: (postId: Id): string => withQuery('/community/edit', { id: postId }),
  communitySearch: (keyword: string): string => withQuery('/community/search', { keyword }),

  // 어린이집·유치원
  facilityDetail: (facilityId: Id): string => withQuery('/facility/detail', { id: facilityId }),

  // 건강기록
  healthDetail: (recordId: Id): string => withQuery('/health/detail', { recordId }),
  healthEdit: (recordId: Id): string => withQuery('/health/edit', { recordId }),

  // 병원
  hospitalDetail: (hospitalId: Id): string => withQuery('/hospital/detail', { id: hospitalId }),

  // 약관·정책 문서
  legalDocument: (type: string): string => withQuery('/legal/detail', { type }),

  // 지원금
  policyDetail: (policyId: Id): string => withQuery('/policy/detail', { id: policyId }),
  policyCategory: (category: string): string => withQuery('/policy/category', { category }),
  policySearch: (keyword: string): string => withQuery('/search/policy', { keyword }),
} as const
