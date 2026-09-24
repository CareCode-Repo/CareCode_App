'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement } from 'react'
import { ConsentRequiredError } from '@/apis/errors'
import Button from '@/components/common/Button'
import { useLegalVersion } from '@/queries/legal'
import { useUpdateConsent } from '@/queries/privacy'
import { ConsentType } from '@/types/apis/privacy'

interface ConsentRequiredDialogProps {
  /** 서버가 403 으로 알려준 요구 동의. null 이면 닫힌 상태. */
  requirement: ConsentRequiredError | null
  onClose: () => void
  /** 동의 완료 후 막혔던 동작을 다시 시도한다. */
  onGranted?: () => void
}

const DESCRIPTION: Record<string, string> = {
  HEALTH_DATA:
    '키·몸무게·예방접종 이력 같은 건강 정보는 민감정보라 별도 동의가 필요해요.\n동의하면 성장 곡선과 접종 일정을 이어서 쓸 수 있어요.',
}

/**
 * 동의가 없어 막힌 동작을 그 자리에서 풀어주는 다이얼로그.
 *
 * 설정 화면으로 보내면 사용자가 하던 일을 잃어버리므로, 여기서 동의를 받고 바로 재시도한다.
 */
const ConsentRequiredDialog = ({
  requirement,
  onClose,
  onGranted,
}: ConsentRequiredDialogProps): ReactElement => {
  const { mutate: updateConsent, isPending, isError } = useUpdateConsent()
  // 동의 이력에 남는 값이라 서버가 시행 중인 버전을 그대로 써야 한다.
  const { data: policyVersion, isLoading: isVersionLoading } = useLegalVersion()

  const handleAgree = () => {
    if (!requirement || !policyVersion) return

    updateConsent(
      {
        consentType: requirement.consentType as ConsentType,
        policyVersion,
        granted: true,
      },
      {
        onSuccess: () => {
          onClose()
          onGranted?.()
        },
      },
    )
  }

  const title = requirement?.displayName ?? '추가 동의가 필요해요'
  const description =
    (requirement && DESCRIPTION[requirement.consentType]) ??
    requirement?.message ??
    '이 기능을 쓰려면 추가 동의가 필요해요.'

  return (
    <Dialog.Root open={!!requirement} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/65" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-20 w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5">
          <Dialog.Title className="text-t1-semibold text-gray-800">{title}</Dialog.Title>
          <Dialog.Description className="text-b1-regular mt-2 whitespace-pre-line text-gray-600">
            {description}
          </Dialog.Description>

          <p className="text-c1-regular mt-3 text-gray-500">
            동의는 마이페이지 &gt; 개인정보 설정에서 언제든 철회할 수 있어요.
          </p>

          {isError && (
            <p className="text-red text-b2-regular mt-3" role="alert">
              동의 처리에 실패했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <Button color="gray" size="small" onClick={onClose}>
              나중에
            </Button>
            <Button
              color="green"
              size="small"
              onClick={handleAgree}
              disabled={isPending || isVersionLoading || !policyVersion}
            >
              {isPending ? '처리 중...' : '동의하고 계속'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConsentRequiredDialog
