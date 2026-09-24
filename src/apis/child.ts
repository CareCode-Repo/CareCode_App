import { CareCode } from './interceptor'
import {
  Child,
  ChildBody,
  childBodySchema,
  childListSchema,
  childSchema,
  GrowthMetric,
  GrowthPoint,
  growthPointListSchema,
  growthPointSchema,
  SiblingOverview,
  siblingOverviewSchema,
  VaccinationSchedule,
  vaccinationScheduleListSchema,
  vaccinationScheduleSchema,
} from '@/types/apis/child'

// GET /children - 내 아이 목록
export const getMyChildren = async (): Promise<Child[]> => {
  const res = await CareCode.get('/children')
  return childListSchema.parse(res.data)
}

// GET /children/overview - 모든 자녀의 접종·대기·다자녀 혜택을 한 번에
export const getSiblingOverview = async (): Promise<SiblingOverview> => {
  const res = await CareCode.get('/children/overview')
  return siblingOverviewSchema.parse(res.data)
}

// GET /children/{childId}
export const getChildById = async (childId: number): Promise<Child> => {
  const res = await CareCode.get(`/children/${childId}`)
  return childSchema.parse(res.data)
}

// POST /children - 등록 시 표준 예방접종 일정이 자동 생성된다
export const postChild = async (body: ChildBody): Promise<Child> => {
  const parsedBody = childBodySchema.parse(body)
  const res = await CareCode.post('/children', parsedBody)
  return childSchema.parse(res.data)
}

// PUT /children/{childId}
export const putChild = async (childId: number, body: ChildBody): Promise<Child> => {
  const parsedBody = childBodySchema.parse(body)
  const res = await CareCode.put(`/children/${childId}`, parsedBody)
  return childSchema.parse(res.data)
}

// DELETE /children/{childId}
export const deleteChild = async (childId: number): Promise<void> => {
  await CareCode.delete(`/children/${childId}`)
}

// ==================== 예방접종 ====================

export const getVaccinationSchedule = async (childId: number): Promise<VaccinationSchedule[]> => {
  const res = await CareCode.get(`/children/${childId}/vaccinations`)
  return vaccinationScheduleListSchema.parse(res.data)
}

export const getOverdueVaccinations = async (childId: number): Promise<VaccinationSchedule[]> => {
  const res = await CareCode.get(`/children/${childId}/vaccinations/overdue`)
  return vaccinationScheduleListSchema.parse(res.data)
}

// completedDate 미지정 시 서버가 오늘 날짜로 처리한다
export const patchVaccinationComplete = async (
  childId: number,
  scheduleId: number,
  completedDate?: string,
): Promise<VaccinationSchedule> => {
  const res = await CareCode.patch(
    `/children/${childId}/vaccinations/${scheduleId}/complete`,
    null,
    { params: completedDate ? { completedDate } : {} },
  )
  return vaccinationScheduleSchema.parse(res.data)
}

// ==================== 성장 곡선 ====================

export const getGrowthChart = async (
  childId: number,
  metric: GrowthMetric = 'WEIGHT',
): Promise<GrowthPoint[]> => {
  const res = await CareCode.get(`/children/${childId}/growth`, { params: { metric } })
  return growthPointListSchema.parse(res.data)
}

// 측정 기록이 없으면 서버가 204를 반환하므로 null 로 정규화한다
export const getLatestGrowth = async (
  childId: number,
  metric: GrowthMetric = 'WEIGHT',
): Promise<GrowthPoint | null> => {
  const res = await CareCode.get(`/children/${childId}/growth/latest`, { params: { metric } })
  if (res.status === 204 || !res.data) return null
  return growthPointSchema.parse(res.data)
}
