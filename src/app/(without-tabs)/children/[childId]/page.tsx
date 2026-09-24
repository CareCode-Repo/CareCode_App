'use client'
import * as Tabs from '@radix-ui/react-tabs'
import clsx from 'clsx'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import ToggleChip from '@/components/common/ToggleChip'
import GrowthChart from '@/components/features/child/GrowthChart'
import VaccinationItem from '@/components/features/child/VaccinationItem'
import {
  useChildDetail,
  useCompleteVaccination,
  useDeleteChild,
  useGrowthChart,
  useVaccinationSchedule,
} from '@/queries/child'
import { GROWTH_METRIC_LABEL, GrowthMetric } from '@/types/apis/child'
import { formatChildAge, formatDate } from '@/utils/date'

const ChildDetailPage = (): ReactElement => {
  const params = useParams<{ childId: string }>()
  const childId = Number(params?.childId)
  const router = useRouter()

  const [metric, setMetric] = useState<GrowthMetric>('WEIGHT')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [completingId, setCompletingId] = useState<number | null>(null)

  const { data: child, isLoading, isError, refetch } = useChildDetail(childId)
  const { data: schedules = [], isLoading: isScheduleLoading } = useVaccinationSchedule(childId)
  const { data: growthPoints = [], isLoading: isGrowthLoading } = useGrowthChart(childId, metric)
  const { mutate: completeVaccination } = useCompleteVaccination(childId)
  const { mutate: removeChild, isPending: isDeleting } = useDeleteChild()

  const overdue = schedules.filter((s) => s.overdue && s.status !== 'COMPLETED')
  const upcoming = schedules.filter((s) => !s.overdue && s.status !== 'COMPLETED')
  const completed = schedules.filter((s) => s.status === 'COMPLETED')
  const latestPoint = growthPoints[growthPoints.length - 1]

  const handleComplete = (scheduleId: number) => {
    setCompletingId(scheduleId)
    completeVaccination({ scheduleId }, { onSettled: () => setCompletingId(null) })
  }

  const handleDelete = () => {
    removeChild(childId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        router.replace('/children')
      },
    })
  }

  if (isError) {
    return (
      <Layout hasTopNav hasBackButton title="아이 정보">
        <ErrorView content="아이 정보를 불러오지 못했어요." onRetry={() => refetch()} />
      </Layout>
    )
  }

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title={child?.name ?? '아이 정보'}>
        {/* 프로필 요약 */}
        <section className="flex items-center justify-between border-b border-gray-200 bg-white px-4.5 py-5">
          {isLoading ? (
            <div className="h-12 w-40 animate-pulse rounded bg-gray-200" />
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-t2-semibold text-gray-800">{child?.name}</span>
              <span className="text-b2-regular text-gray-600">
                {formatChildAge(child?.birthDate)} · {formatDate(child?.birthDate)}
              </span>
            </div>
          )}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/children/${childId}/edit`)}
              className="text-b2-regular rounded text-gray-700 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-b2-regular rounded text-gray-500 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
            >
              삭제
            </button>
          </div>
        </section>

        <Tabs.Root defaultValue="vaccination" className="flex grow flex-col">
          <Tabs.List className="flex border-b border-gray-200 bg-white">
            {[
              { value: 'vaccination', label: '예방접종' },
              { value: 'growth', label: '성장 기록' },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={clsx(
                  'text-b1-semibold flex-1 cursor-pointer py-3 text-gray-500 transition-colors',
                  'data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700',
                )}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* 예방접종 */}
          <Tabs.Content value="vaccination" className="flex flex-col gap-4 py-4">
            {isScheduleLoading ? (
              <div className="flex flex-col gap-2 px-4.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            ) : !schedules.length ? (
              <EmptyState
                title="예방접종 일정이 없어요"
                description={'생년월일이 등록되면\n표준 일정이 자동으로 생성돼요.'}
              />
            ) : (
              <>
                {overdue.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 px-4.5 pb-2">
                      <h2 className="text-b1-semibold text-gray-800">접종 기한이 지났어요</h2>
                      <Chip color="red" size="sm">{`${overdue.length}건`}</Chip>
                    </div>
                    <ul className="bg-white">
                      {overdue.map((schedule) => (
                        <VaccinationItem
                          key={schedule.id}
                          schedule={schedule}
                          isCompleting={completingId === schedule.id}
                          onComplete={() => handleComplete(schedule.id)}
                        />
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h2 className="text-b1-semibold px-4.5 pb-2 text-gray-800">
                    {`다가오는 일정 (${upcoming.length})`}
                  </h2>
                  {upcoming.length ? (
                    <ul className="bg-white">
                      {upcoming.map((schedule) => (
                        <VaccinationItem
                          key={schedule.id}
                          schedule={schedule}
                          isCompleting={completingId === schedule.id}
                          onComplete={() => handleComplete(schedule.id)}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-b1-regular px-4.5 py-3 text-gray-600">
                      남은 접종 일정이 없어요.
                    </p>
                  )}
                </section>

                {completed.length > 0 && (
                  <section>
                    <h2 className="text-b1-semibold px-4.5 pb-2 text-gray-800">
                      {`완료 (${completed.length})`}
                    </h2>
                    <ul className="bg-white">
                      {completed.map((schedule) => (
                        <VaccinationItem key={schedule.id} schedule={schedule} />
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </Tabs.Content>

          {/* 성장 기록 */}
          <Tabs.Content value="growth" className="flex flex-col gap-4 px-4.5 py-4">
            <div className="flex gap-2.5">
              {(['WEIGHT', 'HEIGHT'] as const).map((option) => (
                <ToggleChip
                  key={option}
                  pressed={metric === option}
                  onPressedChange={() => setMetric(option)}
                >
                  {GROWTH_METRIC_LABEL[option]}
                </ToggleChip>
              ))}
            </div>

            {isGrowthLoading ? (
              <div className="h-40 animate-pulse rounded-lg bg-gray-200" />
            ) : !growthPoints.length ? (
              <EmptyState
                title="성장 기록이 아직 없어요"
                description={'건강 기록에 키·몸무게를 남기면\n여기에서 백분위와 함께 볼 수 있어요.'}
                actionLabel="키·몸무게 기록하기"
                onAction={() => router.push('/health/new')}
              />
            ) : (
              <>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <GrowthChart points={growthPoints} metric={metric} />
                </div>

                {latestPoint && (
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-b1-semibold text-gray-800">최근 측정</span>
                      <span className="text-b2-regular text-gray-600">
                        {formatDate(latestPoint.recordDate)}
                      </span>
                    </div>
                    <p className="text-h3-bold text-gray-900">
                      {`${latestPoint.value}${latestPoint.unit ?? ''}`}
                      {latestPoint.percentile != null && (
                        <span className="text-b1-regular pl-2 text-gray-600">
                          {`상위 ${(100 - latestPoint.percentile).toFixed(0)}% · ${latestPoint.percentile.toFixed(0)}백분위`}
                        </span>
                      )}
                    </p>
                    {latestPoint.interpretation && (
                      <p
                        className={clsx(
                          'text-b1-regular',
                          latestPoint.needsAttention ? 'text-red' : 'text-gray-700',
                        )}
                      >
                        {latestPoint.interpretation}
                      </p>
                    )}
                    <p className="text-c1-regular text-gray-500">
                      백분위는 참고 지표예요. 진단은 의료진 판단을 따라주세요.
                    </p>
                  </div>
                )}
              </>
            )}
          </Tabs.Content>
        </Tabs.Root>

        <AlertDialog
          title="아이 정보를 삭제할까요?"
          description="예방접종 일정과 성장 기록도 함께 삭제돼요."
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
          }
          confirmButton={
            <Button color="red" size="small" onClick={handleDelete} disabled={isDeleting}>
              삭제
            </Button>
          }
        />
      </Layout>
    </AuthGuard>
  )
}

export default ChildDetailPage
