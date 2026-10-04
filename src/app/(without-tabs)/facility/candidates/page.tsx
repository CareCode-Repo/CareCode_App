'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import ForecastAccuracyNote from '@/components/features/facility/ForecastAccuracyNote'
import { useMyChildren } from '@/queries/child'
import { useUserProfile } from '@/queries/user'
import { useAdmissionCandidates } from '@/queries/waitlist'
import { CONFIDENCE_LABEL } from '@/types/apis/waitlist'
import { extractRegion } from '@/utils/region'
import { routes } from '@/utils/routes'

/** 선택할 수 있는 예측 기간. 3개월은 당장, 12개월은 내년 신학기까지 본다. */
const HORIZONS = [3, 6, 12] as const

const monthsSince = (birthDate?: string | null): number | null => {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  return Math.max(0, months)
}

/**
 * 들어갈 수 있는 곳.
 *
 * 시설 상세에 들어가야 입소 확률을 볼 수 있다면, 어디를 고를지 모르는 사람은 그 숫자를 영영 못 본다.
 * 어린이집을 찾는 사람이 정작 모르는 게 "어디를 골라야 하나" 인데도 그랬다.
 *
 * 그래서 검색을 뒤집는다. 조건을 넣어 목록을 거르는 게 아니라, 아이와 동네를 알고 있으니 답부터 준다.
 */
const AdmissionCandidatesPage = (): ReactElement => {
  const router = useRouter()
  const { data: children = [] } = useMyChildren()
  const { data: profile } = useUserProfile()

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  const [region, setRegion] = useState('')
  const [horizon, setHorizon] = useState<number>(6)

  // 주소에서 동네를 꺼내 미리 채운다. 매번 손으로 적게 하면 대부분 쓰지 않는다.
  useEffect(() => {
    if (region) return
    const derived = extractRegion(profile?.address)
    if (derived) setRegion(derived)
  }, [profile?.address, region])

  useEffect(() => {
    if (selectedChildId == null && children.length > 0) setSelectedChildId(children[0].id)
  }, [children, selectedChildId])

  const child = useMemo(
    () => children.find((item) => item.id === selectedChildId) ?? children[0],
    [children, selectedChildId],
  )
  const childAgeMonths = monthsSince(child?.birthDate)

  const {
    data,
    isLoading,
    isError,
    refetch: retry,
  } = useAdmissionCandidates({
    region: region.trim() || undefined,
    childAgeMonths: childAgeMonths ?? undefined,
    horizonMonths: horizon,
    limit: 20,
  })

  const needsChild = children.length === 0 || childAgeMonths == null

  return (
    <Layout hasTopNav hasBackButton title="들어갈 수 있는 곳" contentClassName="px-4.5 py-5">
      {needsChild ? (
        <EmptyState
          title="아이를 먼저 등록해주세요"
          description="월령에 따라 배정되는 반이 달라서, 아이를 알아야 들어갈 수 있는 곳을 찾을 수 있어요."
          actionLabel="아이 등록하기"
          onAction={() => router.push(routes.childNew())}
        />
      ) : (
        <>
          {/* 아이가 여럿이면 누구 기준인지 분명히 해야 한다. 반이 달라지면 답도 달라진다. */}
          {children.length > 1 && (
            <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto [&>*]:shrink-0">
              {children.map((item) => (
                <ToggleChip
                  key={item.id}
                  pressed={item.id === child?.id}
                  onPressedChange={() => setSelectedChildId(item.id)}
                >
                  {item.name}
                </ToggleChip>
              ))}
            </div>
          )}

          <Input value={region} onChange={setRegion} aria-label="지역" placeholder="예: 성동구" />

          <Spacer className="h-3" />

          <div className="flex gap-2" role="group" aria-label="예측 기간">
            {HORIZONS.map((months) => (
              <ToggleChip
                key={months}
                pressed={horizon === months}
                onPressedChange={() => setHorizon(months)}
              >
                {`${months}개월 내`}
              </ToggleChip>
            ))}
          </div>

          <Spacer className="h-5" />

          {!region.trim() ? (
            <p className="text-b1-regular text-gray-700">동네를 입력하면 바로 찾아볼게요.</p>
          ) : isLoading ? (
            <ul className="flex flex-col gap-3">
              {[0, 1, 2].map((index) => (
                <li key={index} className="h-24 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </ul>
          ) : isError ? (
            <ErrorView content="입소 가능성을 불러오지 못했어요." onRetry={() => retry()} />
          ) : !data?.candidates.length ? (
            <EmptyState
              title="아직 확률을 낼 수 있는 곳이 없어요"
              description={
                data && data.evaluatedFacilities > 0
                  ? `${data.region}에서 ${data.evaluatedFacilities}곳을 봤지만, 정원 관측이 더 쌓여야 확률을 낼 수 있어요. 관측은 매주 쌓입니다.`
                  : `${region.trim()}에서 ${child?.name ?? '아이'}를 받아주는 시설을 찾지 못했어요. 동네 이름을 다시 확인해주세요.`
              }
            />
          ) : (
            <>
              <p className="text-b2-regular text-gray-700">
                {`${data.targetDate ?? ''}까지 ${data.targetClass ?? ''} 자리가 날 가능성이에요.`}
              </p>

              <ul className="mt-3 flex flex-col gap-3">
                {data.candidates.map((candidate) => (
                  <li key={candidate.facilityId}>
                    <button
                      type="button"
                      onClick={() => router.push(routes.facilityDetail(candidate.facilityId))}
                      className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-t2-semibold min-w-0 grow truncate text-gray-900">
                          {candidate.facilityName}
                        </span>
                        <span className="text-h3-bold shrink-0 text-green-900">
                          {`${candidate.probability}%`}
                        </span>
                      </div>

                      {candidate.address && (
                        <span className="text-c1-regular truncate text-gray-700">
                          {candidate.address}
                        </span>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        {candidate.confidence && (
                          <Chip color={candidate.confidence === 'HIGH' ? 'green' : 'white'}>
                            {`신뢰도 ${CONFIDENCE_LABEL[candidate.confidence] ?? candidate.confidence}`}
                          </Chip>
                        )}
                        {candidate.availableSpots != null && candidate.availableSpots > 0 && (
                          <Chip color="white">{`현재 잔여 ${candidate.availableSpots}석`}</Chip>
                        )}
                        <span className="text-c1-regular text-gray-700">
                          {`관측 ${candidate.observationCount}회`}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/*
                보여주지 않은 것을 밝힌다. 40곳 중 3곳만 나왔을 때 그 사실을 숨기면
                "이 동네에 어린이집이 3곳뿐인가" 로 읽힌다.
              */}
              {data.notEnoughDataCount > 0 && (
                <p className="text-c1-regular mt-3 text-gray-700">
                  {`${data.region}의 ${data.evaluatedFacilities}곳 중 ${data.notEnoughDataCount}곳은 정원 관측이 아직 모자라 확률을 내지 않았어요.`}
                </p>
              )}

              <div className="mt-5">
                <ForecastAccuracyNote accuracy={data.accuracy} />
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  )
}

export default AdmissionCandidatesPage
