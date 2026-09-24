'use client'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import { useAdminHospitals, useDeleteAdminHospital } from '@/queries/admin'
import { Hospital } from '@/types/apis/hospital'

const AdminHospitalsPage = (): ReactElement => {
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Hospital | null>(null)

  const { data, isLoading, isError, refetch } = useAdminHospitals(page)
  const { mutate: deleteHospital, isPending } = useDeleteAdminHospital()

  const hospitals = data?.content ?? []

  if (isError) {
    return <ErrorView content="병원 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-c1-regular text-gray-600">
        병원 정보는 공공데이터 동기화로 채워집니다. 여기서 지우면 다음 동기화 때 다시 들어올 수
        있어요.
      </p>

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !hospitals.length ? (
        <EmptyState title="등록된 병원이 없어요" />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`총 ${data?.totalElements ?? hospitals.length}곳`}
          </p>

          <ul className="flex flex-col gap-2">
            {hospitals.map((hospital) => (
              <li
                key={hospital.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {hospital.grade && <Chip color="purple">{hospital.grade}</Chip>}
                  {hospital.type && <Chip color="blue">{hospital.type}</Chip>}
                  <span className="text-b1-semibold truncate text-gray-800">{hospital.name}</span>
                </div>

                {hospital.address && (
                  <span className="text-b2-regular truncate text-gray-600">{hospital.address}</span>
                )}
                <span className="text-c1-regular text-gray-500">
                  {hospital.latitude != null && hospital.longitude != null
                    ? '좌표 있음'
                    : '좌표 없음 · 지도·주변 검색에서 빠져요'}
                </span>

                <Button
                  color="red"
                  size="small"
                  className="mt-1"
                  disabled={isPending}
                  onClick={() => setDeleteTarget(hospital)}
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>

          {!data?.last && (
            <Button color="gray" size="small" onClick={() => setPage((prev) => prev + 1)}>
              더 보기
            </Button>
          )}
        </>
      )}

      <AlertDialog
        title="병원을 삭제할까요?"
        description="이 병원의 리뷰와 찜도 함께 사라질 수 있어요."
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setDeleteTarget(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color="red"
            size="small"
            disabled={isPending}
            onClick={() =>
              deleteTarget &&
              deleteHospital(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
            }
          >
            삭제
          </Button>
        }
      />
    </div>
  )
}

export default AdminHospitalsPage
