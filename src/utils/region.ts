/**
 * 주소에서 시·군·구를 뽑는다.
 *
 * 입소 후보는 "성동구" 처럼 좁은 단위라야 쓸모가 있다. 시 단위로 찾으면 차로 한 시간 걸리는 곳이
 * 같은 목록에 섞인다.
 *
 * 앞에서부터 처음 만나는 구·군을 쓴다. 한국 주소는 [시/도] [시/군/구] [읍/면/동/로] 순이라
 * 행정구역이 도로명보다 항상 앞에 온다 — 뒤에서 찾으면 "...출입구" 같은 도로명에 걸린다.
 */
export const extractRegion = (address?: string | null): string | null => {
  if (!address?.trim()) return null

  const tokens = address.trim().split(/\s+/)

  const district = tokens.find((token) => /[구군]$/.test(token) && token.length >= 2)
  if (district) return district

  // 세종처럼 구가 없는 곳, 그리고 "성남시" 처럼 시까지만 적힌 주소.
  const city = tokens.find((token) => /시$/.test(token) && token.length >= 3)
  return city ?? null
}
