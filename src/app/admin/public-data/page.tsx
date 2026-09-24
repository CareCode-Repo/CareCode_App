'use client'
import { ReactElement, useState } from 'react'
import { getErrorMessage } from '@/apis/errors'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import { useSyncPublicData } from '@/queries/admin'
import { SYNC_TARGETS, SyncResult, SyncTarget } from '@/types/apis/admin'

interface SyncOutcome {
  target: SyncTarget
  result?: SyncResult
  error?: string
}

/** 결과 Map 은 공급자마다 키가 달라 그대로 나열한다. */
const formatResult = (result: SyncResult): string =>
  Object.entries(result)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ')

const AdminPublicDataPage = (): ReactElement => {
  const [confirming, setConfirming] = useState<SyncTarget | null>(null)
  const [runningTarget, setRunningTarget] = useState<SyncTarget | null>(null)
  const [outcomes, setOutcomes] = useState<SyncOutcome[]>([])

  const { mutate: sync } = useSyncPublicData()

  const run = (target: SyncTarget) => {
    setRunningTarget(target)
    setConfirming(null)

    sync(target, {
      onSuccess: (result) => setOutcomes((prev) => [{ target, result }, ...prev]),
      onError: (error) =>
        setOutcomes((prev) => [
          { target, error: getErrorMessage(error, '동기화에 실패했어요.') },
          ...prev,
        ]),
      onSettled: () => setRunningTarget(null),
    })
  }

  const confirmingLabel = SYNC_TARGETS.find((item) => item.key === confirming)?.label

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg bg-gray-100 p-4">
        <p className="text-b1-regular text-gray-700">
          정해진 일정으로도 자동 동기화되며, 여기서는 필요할 때 즉시 실행합니다.
        </p>
        <p className="text-c1-regular pt-2 text-gray-600">
          외부 기관 API 를 순회하므로 수 분이 걸릴 수 있어요. 완료될 때까지 화면을 닫지 말아주세요.
        </p>
      </section>

      <ul className="flex flex-col gap-2">
        {SYNC_TARGETS.map((item) => {
          const isRunning = runningTarget === item.key
          // 동시에 여러 동기화를 돌리면 외부 API 호출 한도를 넘길 수 있다.
          const isBlocked = runningTarget !== null && !isRunning

          return (
            <li
              key={item.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-b1-medium text-gray-800">{item.label}</span>
                <span className="text-c1-regular truncate text-gray-600">{item.description}</span>
              </div>
              <Button
                color="gray"
                size="small"
                className="w-auto shrink-0 px-4"
                disabled={isRunning || isBlocked}
                onClick={() => setConfirming(item.key)}
              >
                {isRunning ? '실행 중...' : '실행'}
              </Button>
            </li>
          )
        })}
      </ul>

      {outcomes.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-b1-semibold text-gray-800">실행 결과</h2>
          <ul className="flex flex-col gap-2">
            {outcomes.map((outcome, index) => {
              const label = SYNC_TARGETS.find((item) => item.key === outcome.target)?.label
              const isFailure = !!outcome.error

              return (
                <li
                  key={`${outcome.target}-${index}`}
                  className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <span className="text-b2-semibold text-gray-800">{label}</span>
                  <span
                    className={
                      isFailure ? 'text-red text-c1-regular' : 'text-c1-regular text-gray-600'
                    }
                  >
                    {outcome.error ?? formatResult(outcome.result ?? {})}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <AlertDialog
        title={`${confirmingLabel ?? ''} 동기화를 실행할까요?`}
        description="외부 API 호출 한도를 쓰며 기존 데이터가 갱신됩니다."
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setConfirming(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button color="green" size="small" onClick={() => confirming && run(confirming)}>
            실행
          </Button>
        }
      />
    </div>
  )
}

export default AdminPublicDataPage
