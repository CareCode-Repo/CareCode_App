'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement, useState } from 'react'
import Button from '@/components/common/Button'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import { useMyChildren } from '@/queries/child'
import { WaitlistRegisterBody } from '@/types/apis/waitlist'

interface WaitlistDialogProps {
  isOpen: boolean
  facilityName: string
  isPending?: boolean
  isError?: boolean
  onClose: () => void
  onSubmit: (body: WaitlistRegisterBody) => void
}

const todayInput = (): string => new Date().toISOString().slice(0, 10)

/**
 * 대기 신청 기록.
 *
 * 대기 신청 자체는 시설이나 임신육아종합포털에서 이뤄진다. 여기서는 **이미 신청한 내용을
 * 기록**해 입소까지 얼마나 걸리는지 추적한다. 그래서 순번은 모를 수 있어 선택 입력이다.
 */
const WaitlistDialog = ({
  isOpen,
  facilityName,
  isPending = false,
  isError = false,
  onClose,
  onSubmit,
}: WaitlistDialogProps): ReactElement => {
  const { data: children = [] } = useMyChildren()

  const [childId, setChildId] = useState<number | null>(null)
  const [waitNumber, setWaitNumber] = useState('')
  const [appliedAt, setAppliedAt] = useState(todayInput())
  const [note, setNote] = useState('')

  const parsedWaitNumber = Number(waitNumber)
  const isWaitNumberValid =
    waitNumber === '' ||
    (Number.isInteger(parsedWaitNumber) && parsedWaitNumber >= 1 && parsedWaitNumber <= 9999)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isWaitNumberValid || isPending) return

    onSubmit({
      // 미지정 시 서버가 최근 등록 자녀로 잡는다.
      childId: childId ?? undefined,
      waitNumber: waitNumber === '' ? undefined : parsedWaitNumber,
      appliedAt: appliedAt || undefined,
      note: note.trim() || undefined,
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/65" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-20 max-h-[85dvh] w-[21rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-5">
          <Dialog.Title className="text-t1-semibold text-gray-800">대기 기록하기</Dialog.Title>
          <Dialog.Description className="text-b2-regular mt-1 mb-4 text-gray-600">
            {`${facilityName}에 이미 신청한 대기를 기록해요. 여기서 신청이 되는 건 아니에요.`}
          </Dialog.Description>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {children.length > 0 && (
              <fieldset className="flex flex-col gap-2">
                <legend className="text-b1-semibold text-gray-800">아이</legend>
                <div className="flex flex-wrap gap-2 pt-2">
                  {children.map((child) => (
                    <ToggleChip
                      key={child.id}
                      pressed={childId === child.id}
                      onPressedChange={(pressed) => setChildId(pressed ? child.id : null)}
                    >
                      {child.name}
                    </ToggleChip>
                  ))}
                </div>
                <p className="text-c1-regular text-gray-600">
                  선택하지 않으면 최근 등록한 아이로 기록돼요.
                </p>
              </fieldset>
            )}

            <Input
              label="대기 순번"
              type="number"
              inputMode="numeric"
              value={waitNumber}
              onChange={setWaitNumber}
              placeholder="모르면 비워두세요"
              errorText={isWaitNumberValid ? '' : '1~9999 사이로 입력해주세요'}
              showErrorText
            />

            <Input
              label="신청일"
              type="date"
              value={appliedAt}
              onChange={setAppliedAt}
              max={todayInput()}
            />

            <Input
              label="메모"
              value={note}
              onChange={setNote}
              maxLength={300}
              placeholder="반, 담당자 등 (선택)"
            />

            {isError && (
              <p className="text-red text-b2-regular" role="alert">
                기록에 실패했어요. 잠시 후 다시 시도해주세요.
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" color="gray" size="small" onClick={onClose}>
                취소
              </Button>
              <Button
                type="submit"
                color="green"
                size="small"
                disabled={!isWaitNumberValid || isPending}
              >
                {isPending ? '기록 중...' : '기록하기'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default WaitlistDialog
