'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import AuthGuard from '@/components/common/AuthGuard'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import { useLikedHospitals } from '@/queries/hospital'

const LikedHospitalsContent = (): ReactElement => {
  const router = useRouter()
  const { data: hospitals = [], isLoading, isError, refetch } = useLikedHospitals()

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-3 px-4.5">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </ul>
    )
  }

  if (isError) {
    return <ErrorView content="찜한 병원을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  if (hospitals.length === 0) {
    return (
      <EmptyState
        title="찜한 병원이 없어요"
        description={'자주 가는 병원을 찜해두면\n여기에서 바로 찾을 수 있어요.'}
        actionLabel="병원 찾아보기"
        onAction={() => router.push('/hospital')}
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-gray-200 border-t border-gray-200 bg-white">
      {hospitals.map((hospital) => (
        <li key={hospital.id}>
          <button
            type="button"
            onClick={() => router.push(`/hospital/${hospital.id}`)}
            className="flex w-full flex-col gap-1 px-4.5 py-4 text-left focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
          >
            <span className="text-b1-semibold text-gray-800">{hospital.name}</span>
            <span className="text-c1-regular text-gray-500">
              {[hospital.type, hospital.address].filter(Boolean).join(' · ')}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

const LikedHospitalsPage = (): ReactElement => (
  <AuthGuard>
    <Layout hasTopNav hasBackButton title="찜한 병원" contentClassName="py-5">
      <LikedHospitalsContent />
    </Layout>
  </AuthGuard>
)

export default LikedHospitalsPage
