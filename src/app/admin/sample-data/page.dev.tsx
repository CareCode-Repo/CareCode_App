'use client'
import { ReactElement, useState } from 'react'
import { deleteSampleData, postSeedSampleData } from '@/apis/admin'
import { getErrorMessage } from '@/apis/errors'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'

type Action = 'seed' | 'clean'

/**
 * 개발용 샘플 데이터 도구.
 *
 * 파일명이 `page.dev.tsx` 라 개발 서버에서만 라우트로 잡히고 프로덕션 번들에서는 빠진다
 * (`next.config.ts` 의 pageExtensions). 운영 관리 화면에 "데이터 적재/삭제" 버튼을 두면
 * 오조작 위험이 실익보다 커서 이렇게 분리했다.
 */
const AdminSampleDataPage = (): ReactElement => {
  const [confirming, setConfirming] = useState<Action | null>(null)
  const [running, setRunning] = useState<Action | null>(null)
  const [outcome, setOutcome] = useState<string | null>(null)

  const run = async (action: Action) => {
    setConfirming(null)
    setRunning(action)
    setOutcome(null)

    try {
      const result = action === 'seed' ? await postSeedSampleData() : await deleteSampleData()
      const summary = Object.entries(result)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' · ')
      setOutcome(summary || '완료되었습니다.')
    } catch (error) {
      setOutcome(getErrorMessage(error, '실행에 실패했어요.'))
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-yellow/30 rounded-lg p-4">
        <p className="text-b2-semibold text-gray-800">개발 환경 전용</p>
        <p className="text-c1-regular pt-1 text-gray-700">
          이 화면은 개발 서버에서만 열립니다. 삭제는 접두어로 식별해 실제 데이터는 남깁니다.
        </p>
      </section>

      <Button
        color="green"
        size="small"
        disabled={running !== null}
        onClick={() => setConfirming('seed')}
      >
        {running === 'seed' ? '적재 중...' : '샘플 데이터 적재'}
      </Button>

      <Button
        color="red"
        size="small"
        disabled={running !== null}
        onClick={() => setConfirming('clean')}
      >
        {running === 'clean' ? '삭제 중...' : '샘플 데이터 제거'}
      </Button>

      {outcome && (
        <p className="text-b2-regular rounded-lg border border-gray-200 bg-white p-3 text-gray-700">
          {outcome}
        </p>
      )}

      <AlertDialog
        title={confirming === 'seed' ? '샘플 데이터를 넣을까요?' : '샘플 데이터를 지울까요?'}
        description={
          confirming === 'seed'
            ? '지역별 정책과 정원 관측 이력이 추가됩니다.'
            : '접두어로 식별된 샘플만 삭제되고 실데이터는 남습니다.'
        }
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setConfirming(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color={confirming === 'seed' ? 'green' : 'red'}
            size="small"
            onClick={() => confirming && run(confirming)}
          >
            실행
          </Button>
        }
      />
    </div>
  )
}

export default AdminSampleDataPage
