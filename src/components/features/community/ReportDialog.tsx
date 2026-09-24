'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement, useState } from 'react'
import Button from '@/components/common/Button'
import ToggleChip from '@/components/common/ToggleChip'
import {
  ReportCreateBody,
  ReportReason,
  ReportTargetType,
  REPORT_REASON_OPTIONS,
} from '@/types/apis/moderation'

interface ReportDialogProps {
  isOpen: boolean
  targetType: ReportTargetType
  targetId: number
  isPending?: boolean
  onClose: () => void
  onSubmit: (body: ReportCreateBody) => void
}

const ReportDialog = ({
  isOpen,
  targetType,
  targetId,
  isPending = false,
  onClose,
  onSubmit,
}: ReportDialogProps): ReactElement => {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [detail, setDetail] = useState('')

  const handleSubmit = () => {
    if (!reason) return
    onSubmit({ targetType, targetId, reason, detail: detail.trim() || undefined })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/65" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-20 w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5">
          <Dialog.Title className="text-t1-semibold text-gray-800">신고하기</Dialog.Title>
          <Dialog.Description className="text-b2-regular mt-1 mb-4 text-gray-600">
            신고가 누적되면 관리자 확인 전까지 자동으로 숨김 처리돼요.
          </Dialog.Description>

          <div className="flex flex-wrap gap-2">
            {REPORT_REASON_OPTIONS.map((option) => (
              <ToggleChip
                key={option.value}
                pressed={reason === option.value}
                onPressedChange={(pressed) => setReason(pressed ? option.value : null)}
              >
                {option.label}
              </ToggleChip>
            ))}
          </div>

          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="상세 내용을 알려주세요 (선택)"
            className="text-b1-regular mt-4 w-full resize-none rounded-md border border-gray-300 p-3 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-600/40 focus:outline-none"
          />

          <div className="mt-4 flex gap-2">
            <Button color="gray" size="small" onClick={onClose}>
              취소
            </Button>
            <Button color="red" size="small" onClick={handleSubmit} disabled={!reason || isPending}>
              {isPending ? '접수 중...' : '신고하기'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ReportDialog
