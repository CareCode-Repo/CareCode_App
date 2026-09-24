import { describe, expect, it } from 'vitest'
import {
  toFormValues,
  toPolicyBody,
  toPolicyPatchBody,
} from '@/components/features/admin/PolicyFormDialog'
import {
  adminPolicyBodySchema,
  adminPolicyPatchBodySchema,
  AdminPolicyDetail,
} from '@/types/apis/admin'

/**
 * 수정은 PATCH 라서 서버가 "키의 존재 여부" 로 판단한다.
 * - 키 없음 → 기존 값 유지
 * - 키 있고 값 null → 비우기
 * JSON 직렬화에서 undefined 는 키째 사라지므로, 이 구분이 그대로 서버에 전달된다.
 */

const detail: AdminPolicyDetail = {
  id: 12,
  policyCode: 'FIRST_MEETING_2026',
  title: '첫만남이용권',
  description: '출생 축하 바우처',
  policyType: 'VOUCHER',
  targetAgeMin: 0,
  targetAgeMax: 12,
  targetRegion: '서울특별시',
  benefitAmount: 2_000_000,
  benefitType: 'LUMP_SUM',
  applicationStartDate: '2026-01-01',
  applicationEndDate: '2026-12-31',
  policyStartDate: '2026-01-01',
  policyEndDate: '2026-12-31',
  applicationUrl: 'https://example.gov/apply',
  contactInfo: '129',
  requiredDocuments: '신분증, 출생증명서',
  isActive: true,
  priority: 5,
  policyCategoryId: 3,
  policyCategoryName: '출산지원',
  verifiedAt: '2026-07-01T10:00:00',
  verifiedBy: 'admin@example.com',
  sourceUrl: 'https://example.gov/source',
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-07-01T10:00:00',
}

/** 실제 전송 형태(JSON)로 바꿔 키가 남는지 확인한다. */
const serialize = (body: unknown): Record<string, unknown> => JSON.parse(JSON.stringify(body))

describe('정책 조회 → 폼 값', () => {
  it('정책 코드를 그대로 보존한다', () => {
    // 사용자용 PolicyDto 에는 policyCode 가 없어 예전에는 ID 를 대신 넣고 있었다.
    const values = toFormValues(detail)

    expect(values.policyCode).toBe('FIRST_MEETING_2026')
    expect(values.policyCode).not.toBe(String(detail.id))
  })

  it('신청 기간을 날짜 그대로 복원한다', () => {
    // 서버가 "2026.01.01 ~ 2026.12.31" 처럼 합쳐 준 문자열로는 복원할 수 없다.
    const values = toFormValues(detail)

    expect(values.applicationStartDate).toBe('2026-01-01')
    expect(values.applicationEndDate).toBe('2026-12-31')
  })

  it('ISO 날짜가 와도 날짜 부분만 남긴다', () => {
    expect(
      toFormValues({ ...detail, applicationStartDate: '2026-01-01T00:00:00' }).applicationStartDate,
    ).toBe('2026-01-01')
  })

  it('노출 여부가 없으면 노출로 본다', () => {
    expect(toFormValues({ ...detail, isActive: null }).isActive).toBe(true)
  })
})

describe('수정 요청 (PATCH)', () => {
  it('폼이 다루지 않는 항목은 아예 보내지 않는다', () => {
    // 키가 없어야 서버가 기존 값을 유지한다. null 을 보내면 지워진다.
    const sent = serialize(toPolicyPatchBody(toFormValues(detail)))

    expect(sent).not.toHaveProperty('policyType')
    expect(sent).not.toHaveProperty('benefitType')
    expect(sent).not.toHaveProperty('requiredDocuments')
    expect(sent).not.toHaveProperty('policyStartDate')
    expect(sent).not.toHaveProperty('policyEndDate')
    expect(sent).not.toHaveProperty('priority')
    expect(sent).not.toHaveProperty('policyCategoryId')
  })

  it('폼이 다루는 항목은 값을 그대로 보낸다', () => {
    const sent = serialize(toPolicyPatchBody(toFormValues(detail)))

    expect(sent.title).toBe('첫만남이용권')
    expect(sent.benefitAmount).toBe(2_000_000)
    expect(sent.applicationEndDate).toBe('2026-12-31')
    expect(sent.isActive).toBe(true)
  })

  it('입력을 비우면 null 로 보내 실제로 지워지게 한다', () => {
    // undefined 로 보내면 키가 사라져 "건드리지 않음" 이 되어 값이 지워지지 않는다.
    const cleared = toFormValues({ ...detail, applicationEndDate: null, benefitAmount: null })
    const sent = serialize(toPolicyPatchBody(cleared))

    expect(sent).toHaveProperty('applicationEndDate')
    expect(sent.applicationEndDate).toBeNull()
    expect(sent).toHaveProperty('benefitAmount')
    expect(sent.benefitAmount).toBeNull()
  })

  it('요청이 PATCH 스키마를 통과한다', () => {
    expect(() =>
      adminPolicyPatchBodySchema.parse(toPolicyPatchBody(toFormValues(detail))),
    ).not.toThrow()
  })
})

describe('등록 요청 (POST)', () => {
  it('빈 값은 null 이 아니라 키 없이 보낸다', () => {
    // 등록은 새로 만드는 것이라 "비우기" 라는 개념이 없다.
    const values = toFormValues({ ...detail, description: null, benefitAmount: null })
    const sent = serialize(toPolicyBody(values))

    expect(sent).not.toHaveProperty('description')
    expect(sent).not.toHaveProperty('benefitAmount')
  })

  it('요청이 등록 스키마를 통과한다', () => {
    expect(() => adminPolicyBodySchema.parse(toPolicyBody(toFormValues(detail)))).not.toThrow()
  })

  it('정책 코드와 이름이 없으면 스키마가 거부한다', () => {
    expect(() => adminPolicyBodySchema.parse({ title: '이름만 있음' })).toThrow()
  })
})
