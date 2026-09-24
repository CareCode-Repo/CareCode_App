'use client'
import { useParams } from 'next/navigation'
import { ReactElement } from 'react'
import { LEGAL_DOCUMENT_LABEL, LegalDocumentType } from '@/apis/legal'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import { useLegalDocument, useLegalVersion } from '@/queries/legal'

const isSupported = (value?: string): value is LegalDocumentType =>
  value === 'terms' || value === 'privacy-policy'

/**
 * 약관·처리방침 원문.
 *
 * 동의하기 전에 읽을 수 있어야 하므로 로그인 없이도 열린다(서버도 비로그인 접근을 허용한다).
 * 마크다운 렌더러를 새로 들이는 대신 원문을 그대로 보여준다 — 법적 문서는 가공하지 않는 편이 낫다.
 */
const LegalDocumentPage = (): ReactElement => {
  const params = useParams<{ type: string }>()
  const type = params?.type

  const { data: version } = useLegalVersion()
  const {
    data: content,
    isLoading,
    isError,
    refetch,
  } = useLegalDocument(isSupported(type) ? type : 'terms', isSupported(type))

  if (!isSupported(type)) {
    return (
      <Layout hasTopNav hasBackButton title="약관">
        <ErrorView content="요청하신 문서를 찾을 수 없어요." />
      </Layout>
    )
  }

  return (
    <Layout
      hasTopNav
      hasBackButton
      title={LEGAL_DOCUMENT_LABEL[type]}
      contentClassName="px-4.5 py-5"
    >
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      ) : isError ? (
        <ErrorView content="문서를 불러오지 못했어요." onRetry={() => refetch()} />
      ) : (
        <>
          {version && (
            <p className="text-c1-regular pb-3 text-gray-500">{`현재 시행 버전 ${version}`}</p>
          )}
          <article className="text-b1-regular whitespace-pre-wrap text-gray-800">{content}</article>
        </>
      )}
    </Layout>
  )
}

export default LegalDocumentPage
