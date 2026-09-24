'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useMemo, useState } from 'react'
import SearchIcon from '@/assets/icons/search.svg'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import FacilityListItem from '@/components/features/facility/FacilityListItem'
import PopularSection from '@/components/features/facility/PopularSection'
import {
  useAdvancedFacilitySearch,
  useFacilitySearch,
  usePopularFacilities,
} from '@/queries/facility'
import {
  FACILITY_TYPE_LABEL,
  FacilityAdvancedSearchBody,
  FacilityType,
  PostFacilitiesSearchBody,
} from '@/types/apis/facility'

const PAGE_SIZE = 20

const FacilityPage = (): ReactElement => {
  const router = useRouter()
  const { data: popular = [] } = usePopularFacilities()
  const [inputValue, setInputValue] = useState('')
  const [keyword, setKeyword] = useState('')
  const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [onlySubsidy, setOnlySubsidy] = useState(false)

  // 검색 조건이 바뀔 때만 새 쿼리가 되도록 메모한다.
  const searchBody = useMemo<PostFacilitiesSearchBody>(
    () => ({
      keyword: keyword || undefined,
      facilityType: selectedType ?? undefined,
      page: 0,
      size: PAGE_SIZE,
      sortBy: 'rating',
      sortDirection: 'DESC',
    }),
    [keyword, selectedType],
  )

  /**
   * 조건 검색은 별도 엔드포인트를 쓴다.
   * 키워드 검색이 이름·지역으로 좁히는 것과 달리 정원 여유·보육료 같은 조건으로 거른다.
   */
  const advancedBody = useMemo<FacilityAdvancedSearchBody>(
    () => ({
      facilityType: selectedType ?? undefined,
      subsidyAvailable: onlySubsidy || undefined,
      minAvailableSpots: onlyAvailable ? 1 : undefined,
    }),
    [selectedType, onlySubsidy, onlyAvailable],
  )

  const isAdvanced = onlySubsidy || onlyAvailable

  const {
    data: searchResult,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useFacilitySearch(searchBody, !isAdvanced)

  const {
    data: advancedResult = [],
    isLoading: isAdvancedLoading,
    isError: isAdvancedError,
    refetch: refetchAdvanced,
  } = useAdvancedFacilitySearch(advancedBody, isAdvanced)

  // 조건 검색은 키워드를 받지 않아 이름 필터는 클라이언트에서 마저 적용한다.
  const facilities = isAdvanced
    ? advancedResult.filter(
        (facility) =>
          !keyword ||
          facility.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (facility.address ?? '').toLowerCase().includes(keyword.toLowerCase()),
      )
    : (searchResult?.facilities ?? [])

  const isLoading = isAdvanced ? isAdvancedLoading : isSearchLoading
  const isError = isAdvanced ? isAdvancedError : isSearchError
  const refetch = isAdvanced ? refetchAdvanced : refetchSearch
  const totalCount = isAdvanced
    ? facilities.length
    : (searchResult?.totalCount ?? facilities.length)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setKeyword(inputValue.trim())
  }

  return (
    <Layout hasTopNav hasBackButton title="시설 찾기" contentClassName="px-4.5 py-5">
      <PopularSection
        title="많이 찾는 시설"
        items={popular.map((item) => ({
          id: item.id,
          name: item.name,
          subtitle: item.address,
        }))}
        onSelect={(id) => router.push(`/facility/${id}`)}
      />

      <form onSubmit={handleSubmit}>
        <Input
          value={inputValue}
          placeholder="어린이집·유치원 이름이나 지역을 검색하세요"
          onChange={setInputValue}
          rightIcon={
            <button type="submit" aria-label="시설 검색">
              <SearchIcon className="size-6 cursor-pointer fill-gray-400" />
            </button>
          }
        />
      </form>

      <Spacer className="h-4 shrink-0" />

      <div className="scrollbar-hide flex gap-2.5 overflow-x-auto [&>*]:shrink-0">
        {(Object.keys(FACILITY_TYPE_LABEL) as FacilityType[]).map((type) => (
          <ToggleChip
            key={type}
            pressed={selectedType === type}
            onPressedChange={(pressed) => setSelectedType(pressed ? type : null)}
          >
            {FACILITY_TYPE_LABEL[type]}
          </ToggleChip>
        ))}
      </div>

      <Spacer className="h-3 shrink-0" />

      {/* 조건 필터. 켜면 조건 검색 엔드포인트로 전환된다 */}
      <div className="scrollbar-hide flex gap-2.5 overflow-x-auto [&>*]:shrink-0">
        <ToggleChip pressed={onlyAvailable} onPressedChange={setOnlyAvailable}>
          정원 여유
        </ToggleChip>
        <ToggleChip pressed={onlySubsidy} onPressedChange={setOnlySubsidy}>
          보조금 지원
        </ToggleChip>
      </div>

      <Spacer className="h-5 shrink-0" />

      {isLoading ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : isError ? (
        <ErrorView content="시설 정보를 불러오지 못했어요." onRetry={() => refetch()} />
      ) : !facilities.length ? (
        <EmptyState
          title="조건에 맞는 시설이 없어요"
          description={'검색어를 줄이거나\n유형 필터를 해제해보세요.'}
        />
      ) : (
        <>
          <p className="text-b2-regular pb-3 text-gray-600">{`총 ${totalCount}곳`}</p>
          <ul className="flex flex-col gap-3">
            {facilities.map((facility) => (
              <li key={facility.id}>
                <FacilityListItem
                  facility={facility}
                  onClick={() => router.push(`/facility/${facility.id}`)}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </Layout>
  )
}

export default FacilityPage
