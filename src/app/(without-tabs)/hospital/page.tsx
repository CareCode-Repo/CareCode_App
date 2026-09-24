'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useMemo, useState } from 'react'
import SearchIcon from '@/assets/icons/search.svg'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import PopularSection from '@/components/features/facility/PopularSection'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useHospitals, useNearbyHospitals, usePopularHospitals } from '@/queries/hospital'
import { HOSPITAL_GRADES, HospitalGrade } from '@/types/apis/hospital'

const RADIUS_KM = 3

const HospitalPage = (): ReactElement => {
  const router = useRouter()
  const { data: popular = [] } = usePopularHospitals()
  const [keyword, setKeyword] = useState('')
  const [nearbyMode, setNearbyMode] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<HospitalGrade | null>(null)

  const { coords, isLocating, error: geoError, request } = useGeolocation()

  const { data: allHospitals = [], isLoading, isError, refetch } = useHospitals(0, 200)
  const { data: nearbyHospitals = [], isLoading: isNearbyLoading } = useNearbyHospitals(
    nearbyMode && coords ? { ...coords, radius: RADIUS_KM } : null,
  )

  const source = nearbyMode && coords ? nearbyHospitals : allHospitals

  // 서버에 병원 키워드 검색 API 가 없어 이름·주소·종별 기준으로 클라이언트에서 거른다.
  const hospitals = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase()

    return source.filter((hospital) => {
      if (selectedGrade && hospital.grade !== selectedGrade) return false
      if (!trimmed) return true

      return (
        hospital.name.toLowerCase().includes(trimmed) ||
        (hospital.address ?? '').toLowerCase().includes(trimmed)
      )
    })
  }, [source, keyword, selectedGrade])

  // 종별이 아직 채워지지 않은 데이터에서는 필터 줄이 의미가 없어 숨긴다.
  const hasGradeData = useMemo(() => source.some((hospital) => !!hospital.grade), [source])

  const handleNearbyToggle = (pressed: boolean) => {
    setNearbyMode(pressed)
    if (pressed && !coords) request()
  }

  const isBusy = isLoading || (nearbyMode && (isLocating || isNearbyLoading))

  return (
    <Layout hasTopNav hasBackButton title="병원 찾기" contentClassName="px-4.5 py-5">
      <PopularSection
        title="많이 찾는 병원"
        items={popular.map((item) => ({
          id: item.id,
          name: item.name,
          subtitle: item.address,
        }))}
        onSelect={(id) => router.push(`/hospital/${id}`)}
      />

      <Input
        value={keyword}
        placeholder="병원 이름이나 지역을 검색하세요"
        onChange={setKeyword}
        rightIcon={<SearchIcon className="size-6 fill-gray-400" aria-hidden />}
      />

      <Spacer className="h-4 shrink-0" />

      <div className="flex items-center gap-2.5">
        <ToggleChip pressed={nearbyMode} onPressedChange={handleNearbyToggle}>
          {`내 주변 ${RADIUS_KM}km`}
        </ToggleChip>
        {nearbyMode && coords && (
          <span className="text-c1-regular text-gray-600">현재 위치 기준</span>
        )}
      </div>

      {hasGradeData && (
        <>
          <Spacer className="h-3 shrink-0" />
          <div
            className="scrollbar-hide flex gap-2.5 overflow-x-auto [&>*]:shrink-0"
            role="group"
            aria-label="요양기관 종별"
          >
            {HOSPITAL_GRADES.map((grade) => (
              <ToggleChip
                key={grade}
                pressed={selectedGrade === grade}
                onPressedChange={(pressed) => setSelectedGrade(pressed ? grade : null)}
              >
                {grade}
              </ToggleChip>
            ))}
          </div>
        </>
      )}

      {geoError && nearbyMode && (
        <p className="text-red text-b2-regular pt-2" role="alert">
          {geoError}
        </p>
      )}

      <Spacer className="h-5 shrink-0" />

      {isBusy ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : isError ? (
        <ErrorView content="병원 정보를 불러오지 못했어요." onRetry={() => refetch()} />
      ) : !hospitals.length ? (
        <EmptyState
          title="조건에 맞는 병원이 없어요"
          description={nearbyMode ? '반경을 넓히거나 검색어를 지워보세요.' : '검색어를 바꿔보세요.'}
        />
      ) : (
        <>
          <p className="text-b2-regular pb-3 text-gray-600">{`총 ${hospitals.length}곳`}</p>
          <ul className="flex flex-col gap-3">
            {hospitals.map((hospital) => (
              <li key={hospital.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/hospital/${hospital.id}`)}
                  className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    {hospital.grade && <Chip color="purple">{hospital.grade}</Chip>}
                    {hospital.type && <Chip color="blue">{hospital.type}</Chip>}
                    <span className="text-b1-semibold truncate text-gray-800">{hospital.name}</span>
                  </div>
                  {hospital.address && (
                    <span className="text-b2-regular truncate text-gray-600">
                      {hospital.address}
                    </span>
                  )}
                  {hospital.phoneNumber && (
                    <span className="text-c1-regular text-gray-700">{hospital.phoneNumber}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Layout>
  )
}

export default HospitalPage
