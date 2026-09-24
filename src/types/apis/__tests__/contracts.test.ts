import { describe, expect, it } from 'vitest'
import { consentRequiredErrorSchema } from '@/apis/errors'
import {
  adminBookingSearchSchema,
  adminBookingStatusBodySchema,
  adminDashboardSchema,
  adminNotificationCreateBodySchema,
  adminPolicyBodySchema,
  adminPolicyDetailSchema,
  adminPolicyPatchBodySchema,
  adminPostPageSchema,
  adminUserSchema,
  adminUserUpdateBodySchema,
  funnelSchema,
  pendingReportPageSchema,
  policyVerificationStatusSchema,
  retentionSchema,
} from '@/types/apis/admin'
import { postLoginResponseSchema, postRefreshTokenResponseSchema } from '@/types/apis/auth'
import {
  childSchema,
  growthPointSchema,
  siblingOverviewSchema,
  vaccinationScheduleSchema,
} from '@/types/apis/child'
import {
  bookingSchema,
  facilityAdvancedSearchBodySchema,
  facilitySchema,
  postFacilitiesSearchResponseSchema,
} from '@/types/apis/facility'
import { createHealthRecordBodySchema, healthRecordSchema } from '@/types/apis/health'
import { hospitalSchema } from '@/types/apis/hospital'
import { reportSchema } from '@/types/apis/moderation'
import {
  getNotificationPreferencesResponseSchema,
  mergeNotificationPreferences,
  NOTIFICATION_CHANNEL,
  notificationSchema,
  NotificationType,
  putNotificationChannelBodySchema,
  toChannelAvailability,
} from '@/types/apis/notification'
import {
  benefitAmountConsensusSchema,
  benefitAmountReportBodySchema,
  missedBenefitSchema,
  missedBenefitSummarySchema,
  personalizedPolicySchema,
  policySchema,
  regionalComparisonSchema,
} from '@/types/apis/policy'
import { consentStatusResponseSchema } from '@/types/apis/privacy'
import { getProfileCompletionResponseSchema } from '@/types/apis/user'
import { userSchema } from '@/types/apis/user'
import {
  admissionForecastSchema,
  waitlistEntrySchema,
  waitlistRegisterBodySchema,
  waitlistStatsSchema,
} from '@/types/apis/waitlist'

/**
 * 서버 DTO 대응 스키마의 계약 테스트.
 *
 * 각 픽스처는 백엔드 응답 DTO 를 그대로 옮긴 것이다. 서버가 필드를 바꾸거나
 * null 을 내리기 시작하면 화면이 아니라 여기서 먼저 깨지도록 하는 것이 목적이다.
 * "값이 다 채워진 경우" 보다 "비어 있는 경우" 를 우선해서 검증한다.
 */

describe('facilitySchema (CareFacilityInfo)', () => {
  it('공공데이터 동기화 결과처럼 대부분이 비어 있어도 통과한다', () => {
    // 공공데이터로 들어온 시설은 좌표·연락처·평점이 모두 없을 수 있다.
    const parsed = facilitySchema.parse({
      id: 1,
      name: '햇살어린이집',
      facilityType: 'DAYCARE',
      address: null,
      phoneNumber: null,
      email: null,
      latitude: null,
      longitude: null,
      rating: null,
      reviewCount: null,
      amenities: null,
      additionalInfo: null,
    })

    expect(parsed.id).toBe(1)
    expect(parsed.rating).toBeNull()
  })

  it('서버가 새로운 시설 유형을 추가해도 파싱이 깨지지 않는다', () => {
    // facilityType 을 enum 으로 좁히면 서버가 유형을 추가할 때마다 화면이 죽는다.
    expect(() =>
      facilitySchema.parse({ id: 2, name: '공동육아나눔터', facilityType: 'SHARING' }),
    ).not.toThrow()
  })

  it('식별자와 이름이 없으면 거부한다', () => {
    expect(() => facilitySchema.parse({ name: '이름만 있음' })).toThrow()
  })
})

describe('postFacilitiesSearchResponseSchema (CareFacilityListResponse)', () => {
  it('검색 결과가 없을 때 facilities 가 null 이어도 빈 배열로 정규화한다', () => {
    const parsed = postFacilitiesSearchResponseSchema.parse({
      facilities: null,
      totalCount: 0,
      currentPage: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    })

    expect(parsed.facilities).toEqual([])
  })
})

describe('bookingSchema (BookingResponse)', () => {
  it('예약 응답을 파싱한다', () => {
    const parsed = bookingSchema.parse({
      id: 10,
      facilityId: 1,
      facilityName: '햇살어린이집',
      userId: 'user-1',
      childName: '지우',
      childAge: 3,
      bookingType: 'VISIT',
      status: 'PENDING',
      startTime: '2026-08-10T10:00:00',
      endTime: null,
    })

    expect(parsed.status).toBe('PENDING')
  })
})

describe('userSchema (UserDto)', () => {
  it('카카오 가입 직후처럼 이름·이메일이 비어 있어도 통과한다', () => {
    const parsed = userSchema.parse({
      id: 1,
      userId: 'kakao-123',
      email: null,
      name: null,
      role: 'PARENT',
      registrationCompleted: false,
    })

    expect(parsed.userId).toBe('kakao-123')
  })

  it('password 는 응답에 없다 (WRITE_ONLY) — 없어도 통과해야 한다', () => {
    expect(() => userSchema.parse({ id: 1, userId: 'u1' })).not.toThrow()
  })
})

describe('postLoginResponseSchema (TokenDto)', () => {
  /**
   * POST /auth/login 이 실제로 돌려준 응답을 그대로 옮긴 픽스처.
   * 서버는 DTO 에 선언된 최상위 userId/email/role 을 채우지 않는다
   * (AuthServiceImpl.issueTokenForUser 가 .user(...) 만 세팅한다).
   */
  const LOGIN_RESPONSE = {
    accessToken: 'eyJhbGciOiJIUzI1NiJ9.access',
    refreshToken: 'eyJhbGciOiJIUzI1NiJ9.refresh',
    tokenType: 'Bearer',
    expiresIn: 3600000,
    refreshExpiresIn: 2592000000,
    userId: null,
    email: null,
    role: null,
    success: true,
    message: '로그인 성공!',
    user: {
      id: 2,
      userId: 'user_1787417490710_394',
      email: 'dev@carecode.local',
      name: '개발계정',
      role: 'PARENT',
      isActive: true,
      emailVerified: false,
      registrationCompleted: false,
      lastLoginAt: '2026-08-23T01:51:48.9822556',
      createdAt: '2026-08-23T01:51:30.710671',
      updatedAt: '2026-08-23T01:51:48.9822556',
    },
  }

  it('최상위 userId/email/role 이 null 이어도 통과한다', () => {
    const parsed = postLoginResponseSchema.parse(LOGIN_RESPONSE)

    expect(parsed.success).toBe(true)
  })

  it('신원은 중첩된 user 에서 읽는다', () => {
    const parsed = postLoginResponseSchema.parse(LOGIN_RESPONSE)

    if (!parsed.success) throw new Error('성공 응답이어야 한다')
    expect(parsed.user.userId).toBe('user_1787417490710_394')
    expect(parsed.user.role).toBe('PARENT')
  })

  it('user 가 없으면 실패한다 — 토큰만으로는 누구인지 알 수 없다', () => {
    const withoutUser: Record<string, unknown> = { ...LOGIN_RESPONSE }
    delete withoutUser.user

    expect(() => postLoginResponseSchema.parse(withoutUser)).toThrow()
  })
})

describe('postRefreshTokenResponseSchema (TokenDto)', () => {
  /**
   * POST /auth/refresh 가 실제로 돌려준 응답.
   *
   * 이 스키마가 어긋나면 화면에는 아무 표시도 나지 않고 **새로고침할 때마다 로그아웃**된다.
   * SessionBootstrap 이 파싱 실패를 "세션 만료" 로 보고 clearTokens() 를 부르기 때문이다.
   */
  const REFRESH_RESPONSE = {
    accessToken: 'eyJhbGciOiJIUzI1NiJ9.new-access',
    refreshToken: 'eyJhbGciOiJIUzI1NiJ9.new-refresh',
    tokenType: 'Bearer',
    expiresIn: 3600000,
    refreshExpiresIn: 2592000000,
    userId: null,
    email: null,
    role: null,
    success: true,
    message: '토큰 갱신 성공!',
    user: {
      id: 2,
      userId: 'user_1787417490710_394',
      email: 'dev@carecode.local',
      name: '개발계정',
      role: 'PARENT',
    },
    isNewUser: null,
  }

  it('최상위 userId 가 null 이어도 통과한다 — 신원은 user 에 있다', () => {
    const parsed = postRefreshTokenResponseSchema.parse(REFRESH_RESPONSE)

    expect(parsed.accessToken).toBe('eyJhbGciOiJIUzI1NiJ9.new-access')
    expect(parsed.user.userId).toBe('user_1787417490710_394')
  })

  it('expiresIn 은 밀리초다 — 초로 오해하면 자동 갱신 타이머가 즉시 돈다', () => {
    const parsed = postRefreshTokenResponseSchema.parse(REFRESH_RESPONSE)

    expect(parsed.expiresIn).toBeGreaterThan(60_000)
  })
})

describe('getProfileCompletionResponseSchema (UserProfileCompletionResponse)', () => {
  /**
   * GET /users/profile/completion 이 실제로 돌려준 응답.
   * `missingFields` 는 문자열 배열이 아니라 **불리언 맵**이고, 완성 여부 키는 `complete` 다.
   */
  const COMPLETION_RESPONSE = {
    completionPercentage: 20,
    message: '프로필 완성도: 20% (4개 항목 추가 필요)',
    missingFields: {
      needsRealName: false,
      needsPhoneNumber: true,
      needsBirthDate: true,
      needsGender: true,
      needsAddress: true,
    },
    completedFields: 0,
    totalFields: 0,
    complete: false,
  }

  it('불리언 맵으로 온 missingFields 를 그대로 읽는다', () => {
    const parsed = getProfileCompletionResponseSchema.parse(COMPLETION_RESPONSE)

    expect(parsed.completionPercentage).toBe(20)
    expect(parsed.missingFields?.needsAddress).toBe(true)
    expect(parsed.missingFields?.needsRealName).toBe(false)
  })

  it('완성 여부는 complete 로 온다 — 이 키를 놓치면 다 채운 사용자에게도 안내가 뜬다', () => {
    const parsed = getProfileCompletionResponseSchema.parse({
      ...COMPLETION_RESPONSE,
      complete: true,
    })

    expect(parsed.complete).toBe(true)
  })
})

describe('childSchema / vaccinationScheduleSchema', () => {
  it('아이 정보를 파싱한다', () => {
    const parsed = childSchema.parse({
      id: 5,
      userId: 1,
      name: '지우',
      birthDate: '2024-03-02',
      gender: 'FEMALE',
    })

    expect(parsed.name).toBe('지우')
  })

  it('overdue 가 없으면 false 로 채운다', () => {
    const parsed = vaccinationScheduleSchema.parse({
      id: 1,
      childId: 5,
      vaccineType: 'BCG',
      vaccineName: 'BCG (결핵)',
      doseNumber: 1,
      totalDoses: 1,
      dueDate: '2024-04-01',
      completedDate: null,
      status: 'SCHEDULED',
    })

    expect(parsed.overdue).toBe(false)
  })
})

describe('growthPointSchema', () => {
  it('WHO 표준 범위를 벗어나 백분위가 없어도 통과한다', () => {
    // 성별/생년월일이 없거나 0~60개월 밖이면 서버가 percentile 계열을 null 로 준다.
    const parsed = growthPointSchema.parse({
      recordDate: '2026-08-01',
      ageMonths: 72,
      value: 21.4,
      metric: 'WEIGHT',
      unit: 'kg',
      percentile: null,
      zScore: null,
      medianValue: null,
      interpretation: null,
      needsAttention: null,
    })

    expect(parsed.percentile).toBeNull()
    expect(parsed.value).toBe(21.4)
  })
})

describe('healthRecordSchema (HealthRecordResponse)', () => {
  it('childId 가 문자열로 오는 서버 표현을 그대로 받는다', () => {
    const parsed = healthRecordSchema.parse({
      id: 3,
      childId: '5',
      childName: '지우',
      userId: '1',
      recordType: 'CHECKUP',
      title: '12개월 영유아 검진',
      recordDate: '2025-03-02',
      height: 76.5,
      weight: 9.8,
      temperature: null,
      isCompleted: false,
    })

    expect(parsed.childId).toBe('5')
    expect(parsed.weight).toBe(9.8)
  })
})

describe('createHealthRecordBodySchema', () => {
  it('빈 문자열 측정값은 서버 검증에 걸리지 않도록 undefined 로 정규화한다', () => {
    // 폼에서 입력하지 않은 숫자 필드는 ''로 들어온다.
    // 그대로 보내면 서버 @DecimalMin 이 400 을 낸다.
    const parsed = createHealthRecordBodySchema.parse({
      childId: '5',
      recordType: 'CHECKUP',
      title: '검진',
      recordDate: '2026-08-04T10:00:00',
      height: '',
      weight: '',
      temperature: '',
    })

    expect(parsed.height).toBeUndefined()
    expect(parsed.weight).toBeUndefined()
    expect(parsed.temperature).toBeUndefined()
  })

  it('문자열로 입력된 측정값을 숫자로 변환한다', () => {
    const parsed = createHealthRecordBodySchema.parse({
      childId: '5',
      recordType: 'CHECKUP',
      title: '검진',
      recordDate: '2026-08-04T10:00:00',
      height: '76.5',
      weight: 9.8,
    })

    expect(parsed.height).toBe(76.5)
    expect(parsed.weight).toBe(9.8)
  })

  it('아이 ID 없이 저장하려 하면 거부한다', () => {
    expect(() =>
      createHealthRecordBodySchema.parse({
        childId: '',
        recordType: 'CHECKUP',
        title: '검진',
        recordDate: '2026-08-04T10:00:00',
      }),
    ).toThrow()
  })
})

describe('hospitalSchema (HospitalInfoResponse)', () => {
  it('좌표가 없는 병원도 통과한다', () => {
    const parsed = hospitalSchema.parse({
      id: 7,
      name: '서울소아과의원',
      type: null,
      address: '서울시 강남구',
      phoneNumber: null,
      latitude: null,
      longitude: null,
    })

    expect(parsed.name).toBe('서울소아과의원')
  })
})

describe('reportSchema (ReportResponse)', () => {
  it('처리 전 신고를 파싱한다', () => {
    const parsed = reportSchema.parse({
      id: 1,
      targetType: 'POST',
      targetId: 42,
      reason: 'SPAM',
      reasonDisplay: '스팸/광고',
      detail: null,
      status: 'PENDING',
      moderatorNote: null,
      createdAt: '2026-08-04T10:00:00',
      resolvedAt: null,
    })

    expect(parsed.status).toBe('PENDING')
  })
})

describe('policySchema (PolicyDto)', () => {
  it('공공데이터 정책처럼 설명·연락처가 비어 있어도 통과한다', () => {
    const parsed = policySchema.parse({
      id: 1,
      title: '첫만남이용권',
      description: null,
      category: null,
      location: null,
      minAge: null,
      maxAge: null,
      supportAmount: 2000000,
      applicationPeriod: null,
      contactInfo: null,
      websiteUrl: null,
    })

    expect(parsed.title).toBe('첫만남이용권')
    expect(parsed.supportAmount).toBe(2000000)
  })

  it('식별자와 제목은 반드시 있어야 한다', () => {
    expect(() => policySchema.parse({ id: 1 })).toThrow()
  })
})

describe('missedBenefitSummarySchema', () => {
  it('놓친 지원금이 없을 때 목록이 null 이어도 빈 배열로 정규화한다', () => {
    const parsed = missedBenefitSummarySchema.parse({
      claimableCount: 0,
      claimableAmount: 0,
      expiredCount: 0,
      unknownEligibilityCount: 0,
      claimable: null,
      expired: null,
    })

    expect(parsed.claimable).toEqual([])
    expect(parsed.expired).toEqual([])
  })

  it('소급 가능 건의 남은 기간과 금액을 읽는다', () => {
    const parsed = missedBenefitSummarySchema.parse({
      claimableCount: 1,
      claimableAmount: 2000000,
      expiredCount: 0,
      unknownEligibilityCount: 2,
      claimable: [
        {
          policyId: 7,
          title: '첫만남이용권',
          childName: '지우',
          eligibleFromMonth: 0,
          eligibleToMonth: 12,
          claimable: true,
          remainingMonths: 2,
          benefitAmount: 2000000,
          applicationUrl: 'https://example.gov/apply',
          reasons: ['출생 후 1년 이내 신청 가능'],
        },
      ],
      expired: [],
    })

    expect(parsed.claimable[0].remainingMonths).toBe(2)
    expect(parsed.unknownEligibilityCount).toBe(2)
  })

  it('금액 미상 정책은 null 로 받는다', () => {
    // 0 으로 채우면 "0원 지원" 으로 잘못 읽힌다.
    const parsed = missedBenefitSchema.parse({
      policyId: 9,
      title: '지역 양육수당',
      claimable: false,
      benefitAmount: null,
    })

    expect(parsed.benefitAmount).toBeNull()
    expect(parsed.claimable).toBe(false)
  })
})

describe('regionalComparisonSchema', () => {
  it('거주지 미입력이면 기준 지역 없이도 통과한다', () => {
    const parsed = regionalComparisonSchema.parse({
      childName: '지우',
      childAgeMonths: 14,
      horizonMonths: 60,
      baseRegion: null,
      baseAmount: null,
      rankings: [
        {
          region: '서울특별시 강남구',
          totalAmount: 12000000,
          differenceFromBase: 0,
          cashPolicyCount: 5,
          nonCashPolicyCount: 2,
          verifiedPolicyCount: 3,
          dataQuality: 'PARTIAL',
          topContributors: [{ title: '출산지원금', amount: 3000000, paymentType: 'LUMP_SUM' }],
        },
      ],
      dataQuality: 'PARTIAL',
      disclaimers: null,
    })

    expect(parsed.baseRegion).toBeNull()
    expect(parsed.disclaimers).toEqual([])
    expect(parsed.rankings[0].topContributors).toHaveLength(1)
  })

  it('순위가 비어 있어도 빈 배열로 정규화한다', () => {
    const parsed = regionalComparisonSchema.parse({ horizonMonths: 60, rankings: null })

    expect(parsed.rankings).toEqual([])
  })
})

describe('personalizedPolicySchema', () => {
  it('추천 근거가 없어도 통과한다', () => {
    const parsed = personalizedPolicySchema.parse({
      policy: { id: 3, title: '아동수당' },
      score: 87,
      reasons: null,
    })

    expect(parsed.policy.title).toBe('아동수당')
    expect(parsed.reasons).toBeNull()
  })
})

describe('hospitalSchema - 요양기관 종별', () => {
  it('진료과목과 종별을 각각 읽는다', () => {
    // type 은 진료과목(소아청소년과), grade 는 종별(의원/상급종합)로 의미가 다르다.
    const parsed = hospitalSchema.parse({
      id: 1,
      name: '서울대학교어린이병원',
      type: '소아청소년과',
      grade: '상급종합',
      address: '서울시 종로구',
    })

    expect(parsed.type).toBe('소아청소년과')
    expect(parsed.grade).toBe('상급종합')
  })

  it('아직 종별이 채워지지 않은 데이터도 통과한다', () => {
    const parsed = hospitalSchema.parse({ id: 2, name: '동네소아과의원', grade: null })

    expect(parsed.grade).toBeNull()
  })
})

describe('funnelSchema (FunnelResponse)', () => {
  it('첫 단계의 전환율은 null 로 둔다', () => {
    const parsed = funnelSchema.parse({
      from: '2026-07-07',
      to: '2026-08-06',
      steps: [
        { event: 'SIGNED_UP', label: null, users: 100, conversionRate: null },
        { event: 'CHILD_REGISTERED', label: null, users: 60, conversionRate: 60 },
      ],
    })

    expect(parsed.steps[0].conversionRate).toBeNull()
    expect(parsed.steps[1].conversionRate).toBe(60)
  })

  it('집계 결과가 없어도 빈 배열로 정규화한다', () => {
    expect(funnelSchema.parse({ from: null, to: null, steps: null }).steps).toEqual([])
  })
})

describe('retentionSchema (RetentionResponse)', () => {
  it('아직 도래하지 않은 날의 잔존율은 null 로 둔다', () => {
    // 0% 로 채우면 "아무도 안 돌아왔다" 로 잘못 읽힌다.
    const parsed = retentionSchema.parse({
      cohorts: [{ signUpDate: '2026-08-05', signedUp: 42, day1: 55, day7: null, day30: null }],
    })

    expect(parsed.cohorts[0].day1).toBe(55)
    expect(parsed.cohorts[0].day7).toBeNull()
  })
})

describe('policyVerificationStatusSchema', () => {
  it('지역별 검증 현황을 읽는다', () => {
    const parsed = policyVerificationStatusSchema.parse({
      region: '서울특별시',
      total: 40,
      verified: 12,
      unverified: 28,
      verifiedRate: 30,
    })

    expect(parsed.verifiedRate).toBe(30)
    expect(parsed.unverified).toBe(28)
  })
})

describe('pendingReportPageSchema', () => {
  it('신고 페이지 응답을 읽는다', () => {
    const parsed = pendingReportPageSchema.parse({
      content: [
        {
          id: 1,
          targetType: 'POST',
          targetId: 42,
          reason: 'ABUSE',
          reasonDisplay: '욕설/비방',
          detail: null,
          status: 'PENDING',
          createdAt: '2026-08-06T10:00:00',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      last: true,
    })

    expect(parsed.content).toHaveLength(1)
    expect(parsed.last).toBe(true)
  })

  it('신고가 없으면 빈 배열로 정규화한다', () => {
    expect(pendingReportPageSchema.parse({ content: null, last: true }).content).toEqual([])
  })
})

describe('adminDashboardSchema', () => {
  it('서버가 조립한 Map 응답을 키 단위로 읽는다', () => {
    const parsed = adminDashboardSchema.parse({
      userCount: 1204,
      hospitalCount: 87,
      policyCount: 340,
      recentActivities: [
        { type: 'user', desc: '신규 사용자 가입: 김부모', time: '2026-08-06 10:00' },
      ],
      userTrendLabels: ['2026-06', '2026-07', '2026-08'],
      userTrendData: [10, 24, 31],
    })

    expect(parsed.userCount).toBe(1204)
    expect(parsed.userTrendData).toHaveLength(3)
  })

  it('항목이 비어 있어도 빈 배열로 정규화한다', () => {
    const parsed = adminDashboardSchema.parse({ userCount: 0 })

    expect(parsed.recentActivities).toEqual([])
    expect(parsed.userTrendLabels).toEqual([])
  })
})

describe('adminUserSchema (AdminUserResponse)', () => {
  it('탈퇴 계정은 deletedAt 으로 구분한다', () => {
    const parsed = adminUserSchema.parse({
      id: 3,
      userId: 'u-3',
      email: 'left@example.com',
      name: '탈퇴회원',
      role: 'PARENT',
      isActive: false,
      deletedAt: '2026-07-01T00:00:00',
    })

    expect(parsed.deletedAt).toBe('2026-07-01T00:00:00')
  })

  it('카카오 가입 직후처럼 이름·연락처가 비어 있어도 통과한다', () => {
    expect(() => adminUserSchema.parse({ id: 4, userId: 'u-4' })).not.toThrow()
  })
})

describe('adminUserUpdateBodySchema', () => {
  it('허용된 역할만 받는다', () => {
    // 엔티티를 그대로 바인딩하지 않기 위해 서버가 좁혀 둔 계약을 프런트에서도 지킨다.
    expect(() => adminUserUpdateBodySchema.parse({ role: 'SUPERUSER' })).toThrow()
    expect(adminUserUpdateBodySchema.parse({ role: 'ADMIN' }).role).toBe('ADMIN')
  })

  it('일부 필드만 보낼 수 있다', () => {
    expect(adminUserUpdateBodySchema.parse({ isActive: false })).toEqual({ isActive: false })
  })
})

describe('adminPostPageSchema', () => {
  it('관리 목록 페이지를 읽는다', () => {
    const parsed = adminPostPageSchema.parse({
      content: [
        {
          postId: 11,
          title: '어린이집 추천해주세요',
          content: '내용',
          category: 'PARENTING',
          authorName: '김부모',
          isAnonymous: false,
          createdAt: '2026-08-01T09:00:00',
          viewCount: 30,
          likeCount: 2,
          commentCount: 1,
        },
      ],
      totalElements: 1,
      last: true,
    })

    expect(parsed.content[0].postId).toBe(11)
  })

  it('빈 페이지도 빈 배열로 정규화한다', () => {
    expect(adminPostPageSchema.parse({ content: null, last: true }).content).toEqual([])
  })
})

describe('adminBookingSearchSchema', () => {
  it('Spring Page 가 아닌 자체 포맷을 읽는다', () => {
    // 이 응답만 content/last 가 아니라 bookings/hasNext 를 쓴다.
    const parsed = adminBookingSearchSchema.parse({
      bookings: [
        {
          id: 1,
          facilityId: 2,
          facilityName: '햇살어린이집',
          userId: 'u-1',
          userName: '김부모',
          childName: '지우',
          bookingType: 'VISIT',
          status: 'PENDING',
          startTime: '2026-08-10T10:00:00',
          endTime: null,
          createdAt: '2026-08-06T09:00:00',
        },
      ],
      totalElements: 1,
      hasNext: false,
    })

    expect(parsed.bookings[0].status).toBe('PENDING')
    expect(parsed.hasNext).toBe(false)
  })

  it('예약이 없으면 빈 배열로 정규화한다', () => {
    expect(adminBookingSearchSchema.parse({ bookings: null }).bookings).toEqual([])
  })
})

describe('adminBookingStatusBodySchema', () => {
  it('허용된 상태만 받는다', () => {
    expect(() => adminBookingStatusBodySchema.parse({ status: 'DONE' })).toThrow()
    expect(adminBookingStatusBodySchema.parse({ status: 'CONFIRMED' }).status).toBe('CONFIRMED')
  })

  it('사유와 메모는 선택이다', () => {
    const parsed = adminBookingStatusBodySchema.parse({ status: 'REJECTED', reason: '정원 초과' })

    expect(parsed.reason).toBe('정원 초과')
    expect(parsed.adminNote).toBeUndefined()
  })
})

describe('adminPolicyDetailSchema (AdminPolicyDetailResponse)', () => {
  it('수정에 필요한 원본 값을 읽는다', () => {
    // 사용자용 PolicyDto 와 달리 신청 기간이 합쳐지지 않고 policyCode 가 살아 있어야 한다.
    const parsed = adminPolicyDetailSchema.parse({
      id: 12,
      policyCode: 'FIRST_MEETING_2026',
      title: '첫만남이용권',
      applicationStartDate: '2026-01-01',
      applicationEndDate: '2026-12-31',
      benefitAmount: 2000000,
      isActive: true,
      verifiedAt: null,
    })

    expect(parsed.policyCode).toBe('FIRST_MEETING_2026')
    expect(parsed.applicationStartDate).toBe('2026-01-01')
  })

  it('식별자·코드·제목이 없으면 거부한다', () => {
    expect(() => adminPolicyDetailSchema.parse({ id: 1, title: '코드 없음' })).toThrow()
  })

  it('나머지 항목은 비어 있어도 통과한다', () => {
    expect(() =>
      adminPolicyDetailSchema.parse({ id: 1, policyCode: 'CODE', title: '제목' }),
    ).not.toThrow()
  })
})

describe('adminPolicyBodySchema', () => {
  it('정책 코드와 이름은 필수다', () => {
    expect(() => adminPolicyBodySchema.parse({ title: '이름만 있음' })).toThrow()
    expect(() => adminPolicyBodySchema.parse({ policyCode: 'CODE' })).toThrow()
  })

  it('나머지 항목은 비워둘 수 있다', () => {
    const parsed = adminPolicyBodySchema.parse({
      policyCode: 'FIRST_MEETING',
      title: '첫만남이용권',
    })

    expect(parsed.benefitAmount).toBeUndefined()
    expect(parsed.targetRegion).toBeUndefined()
  })
})

describe('adminPolicyPatchBodySchema', () => {
  it('모든 항목이 선택이다', () => {
    // 부분 수정이라 하나만 보내도 유효해야 한다.
    expect(() => adminPolicyPatchBodySchema.parse({})).not.toThrow()
    expect(adminPolicyPatchBodySchema.parse({ title: '새 이름' }).title).toBe('새 이름')
  })

  it('비우기 위한 null 을 허용한다', () => {
    // 등록용 스키마(optional 만)로는 null 을 표현할 수 없어 지우기가 안 된다.
    const parsed = adminPolicyPatchBodySchema.parse({ benefitAmount: null, contactInfo: null })

    expect(parsed.benefitAmount).toBeNull()
    expect(parsed.contactInfo).toBeNull()
  })

  it('필수 항목은 null 로 비울 수 없다', () => {
    expect(() => adminPolicyPatchBodySchema.parse({ title: null })).toThrow()
    expect(() => adminPolicyPatchBodySchema.parse({ policyCode: '' })).toThrow()
  })

  it('노출 여부는 null 을 받지 않는다', () => {
    // null 로 두면 목록 조회 조건에서 빠져 사라진 것처럼 보인다.
    expect(() => adminPolicyPatchBodySchema.parse({ isActive: null })).toThrow()
  })
})

describe('adminNotificationCreateBodySchema', () => {
  it('대상은 숫자 사용자 PK 다', () => {
    // 서버는 userId 문자열이 아니라 User 의 PK 를 받는다.
    expect(() =>
      adminNotificationCreateBodySchema.parse({
        userId: 'kakao-123',
        notificationType: 'SYSTEM',
        title: '제목',
        message: '내용',
      }),
    ).toThrow()
  })

  it('허용된 알림 유형만 받는다', () => {
    expect(() =>
      adminNotificationCreateBodySchema.parse({
        userId: 1,
        notificationType: 'MARKETING',
        title: '제목',
        message: '내용',
      }),
    ).toThrow()

    expect(
      adminNotificationCreateBodySchema.parse({
        userId: 1,
        notificationType: 'POLICY',
        title: '제목',
        message: '내용',
      }).notificationType,
    ).toBe('POLICY')
  })
})

describe('admissionForecastSchema', () => {
  it('표본이 모자라면 확률 없이 이유만 내려온다', () => {
    // 근거 없는 확률을 지어내지 않도록 available=false 를 그대로 다룬다.
    const parsed = admissionForecastSchema.parse({
      facilityId: 1,
      available: false,
      unavailableReason: '관측 데이터가 부족합니다',
      observationDays: 3,
      observationCount: 1,
      probability: null,
      confidence: null,
      reasons: null,
    })

    expect(parsed.available).toBe(false)
    expect(parsed.probability).toBeNull()
    expect(parsed.reasons).toEqual([])
  })

  it('예측이 가능하면 확률과 근거를 읽는다', () => {
    const parsed = admissionForecastSchema.parse({
      facilityId: 1,
      available: true,
      observationDays: 120,
      observationCount: 16,
      targetClass: '만 1세반',
      probability: 62,
      confidence: 'MEDIUM',
      targetDate: '2027-03-01',
      reasons: ['최근 6개월간 2자리 발생'],
    })

    expect(parsed.probability).toBe(62)
    expect(parsed.reasons).toHaveLength(1)
  })
})

describe('waitlistStatsSchema', () => {
  it('입소 기록이 없으면 수치가 전부 null 이다', () => {
    const parsed = waitlistStatsSchema.parse({
      facilityId: 1,
      available: false,
      unavailableReason: '입소 기록이 3건 미만입니다',
      admittedSamples: 1,
      currentlyWaiting: 12,
      averageWaitDays: null,
      medianWaitDays: null,
      maxWaitDays: null,
    })

    expect(parsed.available).toBe(false)
    expect(parsed.medianWaitDays).toBeNull()
    // 대기 인원은 표본과 무관하게 셀 수 있다.
    expect(parsed.currentlyWaiting).toBe(12)
  })
})

describe('waitlistEntrySchema', () => {
  it('서버가 Map 으로 조립한 대기 기록을 읽는다', () => {
    const parsed = waitlistEntrySchema.parse({
      waitlistId: 3,
      facilityId: 1,
      waitNumber: 24,
      appliedAt: '2026-03-02',
      status: 'WAITING',
      statusName: '대기 중',
      waitedDays: 158,
    })

    expect(parsed.status).toBe('WAITING')
    expect(parsed.waitedDays).toBe(158)
  })
})

describe('siblingOverviewSchema', () => {
  it('자녀별 다음 접종과 대기 수를 읽는다', () => {
    const parsed = siblingOverviewSchema.parse({
      childCount: 2,
      multiChildHousehold: true,
      children: [
        {
          childId: 1,
          name: '지우',
          birthDate: '2024-03-02',
          ageMonths: 29,
          classLabel: '만 2세반',
          nextVaccination: 'MMR 2차',
          nextVaccinationDate: '2026-09-01',
          waitlistCount: 2,
        },
      ],
      multiChildBenefits: ['다자녀 우선 입소'],
      notes: null,
    })

    expect(parsed.multiChildHousehold).toBe(true)
    expect(parsed.children[0].waitlistCount).toBe(2)
    expect(parsed.notes).toEqual([])
  })

  it('자녀가 없으면 빈 배열로 정규화한다', () => {
    const parsed = siblingOverviewSchema.parse({ childCount: 0, children: null })

    expect(parsed.children).toEqual([])
    expect(parsed.multiChildHousehold).toBe(false)
  })
})

describe('benefitAmountReportBodySchema', () => {
  it('자릿수 오입력을 막는다', () => {
    // 육아 지원금에 1억을 넘는 항목은 없다. 서버 상한과 맞춰 둔다.
    expect(() =>
      benefitAmountReportBodySchema.parse({ amount: 200_000_000, paymentType: 'ONE_TIME' }),
    ).toThrow()
  })

  it('허용된 지급 방식만 받는다', () => {
    expect(() =>
      benefitAmountReportBodySchema.parse({ amount: 1000, paymentType: 'YEARLY' }),
    ).toThrow()

    expect(
      benefitAmountReportBodySchema.parse({ amount: 2_000_000, paymentType: 'MONTHLY' })
        .paymentType,
    ).toBe('MONTHLY')
  })
})

describe('benefitAmountConsensusSchema', () => {
  it('확정 전에는 남은 제보 수를 알려준다', () => {
    const parsed = benefitAmountConsensusSchema.parse({
      policyId: 7,
      title: '첫만남이용권',
      totalReports: 2,
      consensusThreshold: 5,
      agreedCount: 2,
      consensusAmount: null,
      confirmed: false,
      currentAmount: null,
      remainingForConsensus: 3,
    })

    expect(parsed.confirmed).toBe(false)
    expect(parsed.remainingForConsensus).toBe(3)
  })
})

describe('notificationSchema (NotificationInfoResponse)', () => {
  it('서버가 보내는 이름은 notificationType 이다', () => {
    // 예전 스키마는 `type` 을 필수로 요구해 목록 파싱이 통째로 실패했다.
    const parsed = notificationSchema.parse({
      id: 1,
      userId: 'u-1',
      notificationType: 'HEALTH',
      title: 'BCG 접종일이 다가와요',
      message: '3일 뒤 예정입니다',
      priority: 'HIGH',
      isRead: false,
      createdAt: '2026-08-08T09:00:00',
      readAt: null,
    })

    expect(parsed.notificationType).toBe('HEALTH')
    expect(parsed.isRead).toBe(false)
  })

  it('isRead 가 없으면 안 읽음으로 본다', () => {
    // 읽음으로 기본값을 주면 안 읽은 알림이 조용히 사라진다.
    expect(notificationSchema.parse({ id: 2 }).isRead).toBe(false)
  })

  it('제목·본문이 비어 있어도 통과한다', () => {
    expect(() => notificationSchema.parse({ id: 3, title: null, message: null })).not.toThrow()
  })
})

describe('알림 설정 (NotificationSettingsResponse)', () => {
  it('설정 조회는 유형별 배열이다', () => {
    // 예전 스키마는 `{ success, preferences: {...} }` 단일 객체를 기대해 항상 파싱이 실패했다.
    const parsed = getNotificationPreferencesResponseSchema.parse([
      {
        id: 1,
        userId: 'u-1',
        notificationType: 'POLICY',
        emailEnabled: false,
        pushEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        emailAddress: 'parent@example.com',
        phoneNumber: null,
        deviceToken: null,
        createdAt: '2026-08-08T09:00:00',
        updatedAt: '2026-08-08T09:00:00',
      },
    ])

    expect(parsed).toHaveLength(1)
    expect(parsed[0].notificationType).toBe('POLICY')
  })

  it('설정한 적 없는 사용자는 빈 배열을 받는다', () => {
    expect(getNotificationPreferencesResponseSchema.parse([])).toEqual([])
  })

  it('저장된 행이 없는 유형도 기본값으로 채워 모두 보여준다', () => {
    // 서버가 준 것만 그리면 한 번도 설정한 적 없는 사용자에게 빈 화면이 나온다.
    const settings = mergeNotificationPreferences([])

    expect(settings).toHaveLength(NotificationType.length)
    expect(settings.every((setting) => !setting.isStored)).toBe(true)
  })

  it('기본값은 앱 알림함과 푸시만 켠다', () => {
    // 서버가 기본 행을 만들 때 쓰는 값과 같아야 한다. 다르면 토글 하나를 건드리는 순간
    // 손대지 않은 채널의 표시값이 바뀐다.
    const [policy] = mergeNotificationPreferences([])

    expect(policy.channels).toEqual({ inapp: true, push: true, email: false, sms: false })
  })

  it('서버에 저장된 값이 기본값을 덮는다', () => {
    const settings = mergeNotificationPreferences([
      { notificationType: 'HEALTH', pushEnabled: false, emailEnabled: true },
    ])
    const health = settings.find((setting) => setting.notificationType === 'HEALTH')

    expect(health?.isStored).toBe(true)
    expect(health?.channels.push).toBe(false)
    expect(health?.channels.email).toBe(true)
    // 서버가 값을 주지 않은 채널은 기본값을 유지한다.
    expect(health?.channels.inapp).toBe(true)
  })

  it('쓸 수 없는 채널은 이유와 함께 잠근다', () => {
    // SMS 는 사업자 연동 전이라 켜도 발송되지 않는다. 서버만 아는 사정이라 화면이 알 방법이 없다.
    const availability = toChannelAvailability([
      { channel: 'inapp', available: true, unavailableReason: null },
      {
        channel: 'sms',
        available: false,
        unavailableReason: '문자 발송은 아직 준비 중이에요.',
        reasonCode: 'SERVER_NOT_CONFIGURED',
      },
    ])

    expect(availability.sms.isAvailable).toBe(false)
    expect(availability.sms.unavailableReason).toBe('문자 발송은 아직 준비 중이에요.')
    expect(availability.inapp.isAvailable).toBe(true)
    expect(availability.inapp.unavailableReason).toBeUndefined()
  })

  it('서버 설정 문제는 사용자가 해결할 수 없는 것으로 본다', () => {
    // 여기서 "등록하세요" 라고 안내하면 사용자가 등록하고도 알림을 받지 못한다.
    const availability = toChannelAvailability([
      {
        channel: 'push',
        available: false,
        unavailableReason: '푸시 발송이 아직 설정되지 않았어요.',
        reasonCode: 'SERVER_NOT_CONFIGURED',
      },
    ])

    expect(availability.push.isFixableByUser).toBe(false)
  })

  it('수신처가 없는 경우만 사용자가 해결할 수 있다고 본다', () => {
    // 기기를 등록하면 실제로 해결된다. 이때만 등록 버튼을 띄운다.
    const availability = toChannelAvailability([
      {
        channel: 'push',
        available: false,
        unavailableReason: '이 기기에서 알림을 허용하면 받을 수 있어요.',
        reasonCode: 'NO_DESTINATION',
      },
    ])

    expect(availability.push.isFixableByUser).toBe(true)
  })

  it('상태를 못 받은 채널은 사용 가능으로 본다', () => {
    // 상태 조회가 실패했다고 토글을 잠그면 멀쩡한 설정까지 못 바꾸게 된다.
    const availability = toChannelAvailability([])

    expect(NOTIFICATION_CHANNEL.every((channel) => availability[channel].isAvailable)).toBe(true)
  })

  it('채널 이름은 서버가 아는 소문자만 허용한다', () => {
    // 서버는 email/push/sms/inapp 만 처리하고 나머지는 400 을 낸다.
    expect(() =>
      putNotificationChannelBodySchema.parse({
        notificationType: 'POLICY',
        channel: 'inApp',
        enabled: true,
      }),
    ).toThrow()

    expect(
      putNotificationChannelBodySchema.parse({
        notificationType: 'POLICY',
        channel: 'inapp',
        enabled: true,
      }).channel,
    ).toBe('inapp')
  })
})

describe('waitlistRegisterBodySchema', () => {
  it('전부 선택 입력이다', () => {
    // 순번을 모르는 채로도 기록할 수 있어야 한다. 서버가 자녀·신청일을 기본값으로 채운다.
    expect(() => waitlistRegisterBodySchema.parse({})).not.toThrow()
  })

  it('순번 범위를 벗어나면 거부한다', () => {
    expect(() => waitlistRegisterBodySchema.parse({ waitNumber: 0 })).toThrow()
    expect(() => waitlistRegisterBodySchema.parse({ waitNumber: 10000 })).toThrow()
    expect(waitlistRegisterBodySchema.parse({ waitNumber: 24 }).waitNumber).toBe(24)
  })

  it('메모 길이를 서버 제한과 맞춘다', () => {
    expect(() => waitlistRegisterBodySchema.parse({ note: 'x'.repeat(301) })).toThrow()
  })
})

describe('facilityAdvancedSearchBodySchema', () => {
  it('조건 없이도 파싱된다 (호출 여부는 화면이 판단한다)', () => {
    expect(() => facilityAdvancedSearchBodySchema.parse({})).not.toThrow()
  })

  it('평점 범위를 벗어나면 거부한다', () => {
    expect(() => facilityAdvancedSearchBodySchema.parse({ minRating: 6 })).toThrow()
    expect(facilityAdvancedSearchBodySchema.parse({ minRating: 4.5 }).minRating).toBe(4.5)
  })

  it('허용된 시설 유형만 받는다', () => {
    expect(() => facilityAdvancedSearchBodySchema.parse({ facilityType: 'SHARING' })).toThrow()
  })
})

describe('consentRequiredErrorSchema', () => {
  it('서버가 내려주는 동의 요구 응답을 읽는다', () => {
    const parsed = consentRequiredErrorSchema.parse({
      error: 'CONSENT_REQUIRED',
      consentType: 'HEALTH_DATA',
      displayName: '건강정보 수집·이용 (민감정보)',
      sensitive: true,
      message: '건강정보 수집·이용 (민감정보) 동의가 필요합니다.',
      path: 'uri=/health/records',
    })

    expect(parsed.consentType).toBe('HEALTH_DATA')
  })

  it('다른 오류 응답은 거부한다', () => {
    expect(() =>
      consentRequiredErrorSchema.parse({ error: 'FORBIDDEN', message: '권한이 없습니다.' }),
    ).toThrow()
  })
})

describe('consentStatusResponseSchema', () => {
  it('동의 이력이 없으면 빈 배열로 정규화한다', () => {
    expect(consentStatusResponseSchema.parse({ consents: null }).consents).toEqual([])
  })

  it('required/granted 누락 시 false 로 채운다', () => {
    const parsed = consentStatusResponseSchema.parse({
      consents: [{ consentType: 'MARKETING', displayName: '마케팅 정보 수신' }],
    })

    expect(parsed.consents[0].required).toBe(false)
    expect(parsed.consents[0].granted).toBe(false)
  })
})
