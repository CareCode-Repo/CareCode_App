'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Separator from '@/components/common/Separator'
import Switch from '@/components/common/Switch'
import { useLegalVersion } from '@/queries/legal'
import {
  useConsentHistory,
  useConsents,
  useDeleteAccount,
  useExportMyData,
  useUpdateConsent,
} from '@/queries/privacy'
import { ConsentType, SENSITIVE_CONSENT_TYPES } from '@/types/apis/privacy'
import { formatDate } from '@/utils/date'
import { downloadJson } from '@/utils/file'

/**
 * 동의 이력.
 *
 * 약관은 개정되므로 "지금 동의했는가" 만으로는 무엇에 동의했는지 증명할 수 없다.
 * 서버가 동의 시점의 약관 버전을 함께 남기므로 그대로 보여준다.
 */
const ConsentHistorySection = (): ReactElement => {
  const { data: history = [], isLoading, isError, refetch } = useConsentHistory()

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-2">
        {[0, 1].map((i) => (
          <li key={i} className="h-12 animate-pulse rounded bg-gray-200" />
        ))}
      </ul>
    )
  }

  if (isError) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className="text-b2-regular w-fit text-gray-700 underline"
      >
        이력을 불러오지 못했어요. 다시 시도
      </button>
    )
  }

  if (!history.length) {
    return <p className="text-b2-regular text-gray-600">아직 남은 동의 이력이 없어요.</p>
  }

  return (
    <ul className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200">
      {history.map((item, index) => (
        <li
          key={`${item.consentType}-${item.createdAt ?? index}`}
          className="flex flex-col gap-1 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-b2-semibold text-gray-800">
              {item.displayName ?? item.consentType}
            </span>
            <span
              className={
                item.granted ? 'text-b2-regular text-green-700' : 'text-b2-regular text-gray-500'
              }
            >
              {item.granted ? '동의' : '철회'}
            </span>
          </div>
          <span className="text-c1-regular text-gray-500">
            {[
              item.policyVersion && `약관 ${item.policyVersion}`,
              formatDate(item.createdAt, 'yyyy.MM.dd HH:mm'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </li>
      ))}
    </ul>
  )
}

const PrivacyPage = (): ReactElement => {
  const router = useRouter()
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useConsents()
  // 동의 이력에 남는 값이라 서버가 시행 중인 버전을 쓴다.
  const { data: policyVersion } = useLegalVersion()
  const { mutate: updateConsent, isPending: isUpdating } = useUpdateConsent()
  const { mutate: exportData, isPending: isExporting } = useExportMyData()
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount()

  const handleToggle = (consentType: string, granted: boolean) => {
    if (!policyVersion) return

    updateConsent({
      consentType: consentType as ConsentType,
      policyVersion,
      granted,
    })
  }

  const handleExport = () => {
    exportData(undefined, {
      onSuccess: (payload) => downloadJson(payload, 'carecode-my-data.json'),
    })
  }

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="개인정보 설정" contentClassName="py-5">
        <section className="flex flex-col gap-3 px-4.5">
          <h2 className="text-b1-semibold text-gray-800">동의 항목</h2>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : isError ? (
            <ErrorView content="동의 정보를 불러오지 못했어요." onRetry={() => refetch()} />
          ) : (
            <ul className="flex flex-col rounded-lg border border-gray-200 bg-white">
              {data?.consents.map((consent) => (
                <li
                  key={consent.consentType}
                  className="flex items-center justify-between gap-3 border-b border-gray-200 p-4 last:border-b-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-b1-medium text-gray-800">
                      {consent.displayName ?? consent.consentType}
                      {consent.required && (
                        <span className="text-b2-regular pl-1 text-gray-500">(필수)</span>
                      )}
                    </span>
                    {/* 민감정보는 철회 시 기능이 즉시 막히므로 미리 알려둔다. */}
                    {SENSITIVE_CONSENT_TYPES.includes(consent.consentType) && (
                      <span className="text-c1-regular text-gray-600">
                        철회하면 건강 기록 저장과 성장 곡선을 쓸 수 없어요.
                      </span>
                    )}
                    <span className="text-c1-regular text-gray-500">
                      {consent.updatedAt ? `${formatDate(consent.updatedAt)} 갱신` : '기록 없음'}
                    </span>
                  </div>
                  <Switch
                    checked={consent.granted}
                    // 버전을 모르는 채로 동의를 기록하면 무엇에 동의했는지 남지 않는다.
                    disabled={consent.required || isUpdating || !policyVersion}
                    onCheckedChange={(checked) => handleToggle(consent.consentType, checked)}
                    aria-label={consent.displayName ?? consent.consentType}
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="text-c1-regular text-gray-500">
            필수 항목은 서비스 이용에 반드시 필요해 해제할 수 없어요. 철회를 원하시면 탈퇴를
            진행해주세요.
            {policyVersion && ` (현재 시행 ${policyVersion})`}
          </p>

          {/* 무엇에 동의하는지 읽을 수 있어야 동의가 의미를 갖는다 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/legal/terms')}
              className="text-b2-semibold text-green-700 underline"
            >
              이용약관
            </button>
            <button
              type="button"
              onClick={() => router.push('/legal/privacy-policy')}
              className="text-b2-semibold text-green-700 underline"
            >
              개인정보 처리방침
            </button>
          </div>
        </section>

        <Separator className="my-6" />

        <section className="flex flex-col gap-3 px-4.5">
          <h2 className="text-b1-semibold text-gray-800">동의 이력</h2>
          <p className="text-b2-regular text-gray-600">
            언제 어떤 버전의 약관에 동의했는지 남겨둔 기록이에요.
          </p>

          <button
            type="button"
            aria-expanded={isHistoryOpen}
            onClick={() => setIsHistoryOpen((open) => !open)}
            className="text-b2-regular w-fit rounded text-gray-700 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
          >
            {isHistoryOpen ? '접기' : '이력 보기'}
          </button>

          {/* 열었을 때만 받아온다. 대부분의 방문에서는 필요 없는 조회다. */}
          {isHistoryOpen && <ConsentHistorySection />}
        </section>

        <Separator className="h-2 shrink-0 bg-gray-100" />

        <section className="flex flex-col gap-3 px-4.5">
          <h2 className="text-b1-semibold text-gray-800">내 데이터</h2>
          <p className="text-b1-regular text-gray-600">
            계정에 저장된 프로필·아이·게시글 데이터를 JSON 파일로 내려받을 수 있어요.
          </p>
          <Button color="gray" size="small" onClick={handleExport} disabled={isExporting}>
            {isExporting ? '준비 중...' : '내 데이터 내려받기'}
          </Button>
        </section>

        <Separator className="my-6" />

        <section className="flex flex-col gap-3 px-4.5">
          <h2 className="text-b1-semibold text-gray-800">회원 탈퇴</h2>
          <p className="text-b1-regular text-gray-600">
            탈퇴하면 계정과 아이 정보가 삭제돼요. 삭제된 정보는 복구할 수 없어요.
          </p>
          <Button color="red" size="small" onClick={() => setWithdrawOpen(true)}>
            회원 탈퇴
          </Button>
        </section>

        <AlertDialog
          title="정말 탈퇴할까요?"
          description="계정과 아이 정보가 삭제되며 복구할 수 없어요."
          isOpen={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setWithdrawOpen(false)}>
              취소
            </Button>
          }
          confirmButton={
            <Button color="red" size="small" onClick={() => deleteAccount()} disabled={isDeleting}>
              탈퇴하기
            </Button>
          }
        />
      </Layout>
    </AuthGuard>
  )
}

export default PrivacyPage
