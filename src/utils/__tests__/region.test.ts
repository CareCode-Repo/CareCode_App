import { describe, expect, it } from 'vitest'
import { extractRegion } from '@/utils/region'

/**
 * 주소에서 지역 뽑기.
 *
 * 이 값이 틀리면 입소 후보 목록 전체가 엉뚱한 동네로 채워진다. 사용자는 왜 틀렸는지 알 수 없고
 * "이 앱은 우리 동네를 모른다" 로만 읽는다.
 */
describe('extractRegion', () => {
  it('특별시 주소에서 구를 집는다', () => {
    expect(extractRegion('서울특별시 성동구 왕십리로 222')).toBe('성동구')
  })

  it('도 단위 주소에서는 시가 아니라 구를 집는다', () => {
    // "성남시" 가 먼저 나오지만 쓸모 있는 단위는 "분당구" 다.
    expect(extractRegion('경기도 성남시 분당구 정자일로 95')).toBe('분당구')
  })

  it('두 글자 구도 놓치지 않는다', () => {
    expect(extractRegion('대구광역시 중구 공평로 88')).toBe('중구')
  })

  it('군 단위도 집는다', () => {
    expect(extractRegion('강원특별자치도 양양군 양양읍')).toBe('양양군')
  })

  it('도로명에 구가 들어가도 행정구역을 집는다', () => {
    // 앞에서부터 찾기 때문에 도로명이 아니라 행정구역이 먼저 걸린다.
    expect(extractRegion('서울특별시 마포구 지하철출입구로 3')).toBe('마포구')
  })

  it('구가 없는 곳은 시까지만 집는다', () => {
    expect(extractRegion('세종특별자치시 한누리대로 2130')).toBe('세종특별자치시')
    expect(extractRegion('경기도 이천시 부발읍')).toBe('이천시')
  })

  it('주소가 없거나 알아볼 수 없으면 비운다', () => {
    expect(extractRegion(null)).toBeNull()
    expect(extractRegion('')).toBeNull()
    expect(extractRegion('   ')).toBeNull()
    expect(extractRegion('어딘가의 골목')).toBeNull()
  })
})
