'use client'
import { ReactElement, use, useEffect } from 'react'
import { getPolicyApplyUrl, postPolicyView } from '@/apis/policy'
import Chip from '@/components/common/Chip'
import Layout from '@/components/common/Layout'
import Separator from '@/components/common/Separator'
import BenefitAmountReport from '@/components/features/policy/BenefitAmountReport'
import PolicyBookmarkButton from '@/components/features/policy/PolicyBookmarkButton'
import { useGetPolicyById } from '@/queries/policy'
import { getChipColor, determinePolicyType, formatAge, formatSupportAmount } from '@/types/policy'

const PolicyDetailPage = ({ params }: { params: Promise<{ id: string }> }): ReactElement => {
  const { id } = use(params)
  const policyId = parseInt(id, 10)
  const { data: policy, isLoading, error } = useGetPolicyById(policyId)

  // 조회수 집계. 실패해도 화면에는 영향을 주지 않는다.
  useEffect(() => {
    if (!Number.isFinite(policyId)) return
    postPolicyView(policyId).catch(() => undefined)
  }, [policyId])

  if (isLoading) {
    return (
      <Layout hasBackButton hasTopNav title="정책 상세">
        <div className="flex grow items-center justify-center">
          <span className="text-b1-regular text-gray-500">로딩 중...</span>
        </div>
      </Layout>
    )
  }

  if (error || !policy) {
    return (
      <Layout hasBackButton hasTopNav title="정책 상세">
        <div className="flex grow items-center justify-center">
          <span className="text-b1-regular text-gray-500">정책을 찾을 수 없습니다.</span>
        </div>
      </Layout>
    )
  }

  const policyType = determinePolicyType(policy.applicationPeriod)
  const tags = policy.category ? [policy.category] : []
  return (
    <Layout hasBackButton hasTopNav title="정책 상세">
      <div className="hide-scrollbar scrollbar-hide flex grow flex-col overflow-y-scroll">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between gap-2">
            <Chip shape="square" size="md" className="w-fit" color={getChipColor(policyType)}>
              {policyType}
            </Chip>
            <PolicyBookmarkButton policyId={policyId} />
          </div>
          <div className="flex gap-3">
            {tags?.map((tag) => (
              <span key={tag} className="text-b1-medium text-gray-700">
                {'# ' + tag}
              </span>
            ))}
          </div>
          <h2 className="text-h3-bold text-black">{policy.title}</h2>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3.5">
              <span className="text-b1-regular text-gray-700">지역</span>
              <span className="text-b1-medium text-black">{policy.location || '전국'}</span>
            </div>
            <div className="flex gap-3.5">
              <span className="text-b1-regular text-gray-700">연령</span>
              <span className="text-b1-medium text-black">
                {formatAge(policy.minAge, policy.maxAge)}
              </span>
            </div>
            <div className="flex gap-3.5">
              <span className="text-b1-regular text-gray-700">지원금액</span>
              <span className="text-b1-medium text-black">
                {formatSupportAmount(policy.supportAmount)}
              </span>
            </div>
            <div className="flex gap-3.5">
              <span className="text-b1-regular text-gray-700">신청기간</span>
              <span className="text-b1-medium text-black">
                {policy.applicationPeriod || '상시 신청 가능'}
              </span>
            </div>
          </div>
        </div>
        <Separator />

        {/* 공공데이터 금액은 비어 있거나 추정치가 많다. 받은 사람들이 채운다. */}
        <div className="p-6">
          <BenefitAmountReport policyId={policyId} />
        </div>

        {/* 공공데이터로 수집된 정책은 항목이 비어 있는 경우가 많다. 제목만 남은 섹션은 그리지 않는다. */}
        {policy.description && (
          <>
            <Separator />
            <div className="flex flex-col gap-4 p-7.5">
              <span className="text-b1-semibold text-gray-800">지원 내용 상세</span>
              <p className="text-b1-regular whitespace-pre-line text-gray-700">
                {policy.description}
              </p>
            </div>
          </>
        )}
        {policy.requiredDocuments && (
          <>
            <Separator />
            <div className="flex flex-col gap-4 p-7.5">
              <span className="text-b1-semibold text-gray-800">필수 서류</span>
              <p className="text-b1-regular whitespace-pre-line text-gray-700">
                {policy.requiredDocuments}
              </p>
            </div>
          </>
        )}
        {policy.contactInfo && (
          <>
            <Separator />
            <div className="flex flex-col gap-4 p-7.5">
              <span className="text-b1-semibold text-gray-800">연락처 정보</span>
              <p className="text-b1-regular whitespace-pre-line text-gray-700">
                {policy.contactInfo}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="p-6">
        {/*
          신청 링크는 서버 경로를 거친다. 서버가 클릭을 집계한 뒤 실제 신청처로 리다이렉트하며,
          이 전환이 "지원금을 실제로 찾아줬는지" 를 보여주는 유일한 지표다.
        */}
        {policy.websiteUrl ? (
          <a
            href={getPolicyApplyUrl(policyId)}
            target="_blank"
            rel="noreferrer"
            className="text-t1-semibold block w-full rounded-xl bg-green-600 py-4.5 text-center text-gray-100 transition-colors hover:bg-green-700"
          >
            신청하기
          </a>
        ) : (
          <div className="text-t1-semibold w-full rounded-xl bg-gray-200 py-4.5 text-center text-gray-400">
            온라인 신청 경로 없음
          </div>
        )}
      </div>
    </Layout>
  )
}

export default PolicyDetailPage
