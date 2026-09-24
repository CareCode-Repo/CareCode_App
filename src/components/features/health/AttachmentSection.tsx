'use client'
import { ReactElement, useRef, useState } from 'react'
import { downloadAttachment } from '@/apis/health'
import TrashIcon from '@/assets/icons/trash.svg'
import AttachmentPreview from '@/components/features/health/AttachmentPreview'
import { useAttachments, useDeleteAttachment, useUploadAttachment } from '@/queries/health'
import { getAttachmentId } from '@/types/apis/health'
import { downloadBlob } from '@/utils/file'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 서버 업로드 제한과 동일

interface AttachmentSectionProps {
  recordId: number
}

const isImage = (fileType?: string | null): boolean => !!fileType?.startsWith('image/')

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  return mb >= 1 ? `${mb.toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`
}

/** 예방접종 수첩·진료 기록 사진을 건강기록에 붙인다. */
const AttachmentSection = ({ recordId }: AttachmentSectionProps): ReactElement => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const { data: attachments = [], isLoading } = useAttachments(recordId)
  const {
    mutate: upload,
    isPending: isUploading,
    isError: isUploadError,
  } = useUploadAttachment(recordId)
  const { mutate: remove } = useDeleteAttachment(recordId)

  /**
   * 첨부는 인증을 거쳐야 받을 수 있어 주소를 그대로 열 수 없다.
   * 본문을 받아 blob 으로 저장한다.
   */
  const handleDownload = async (attachmentId: number, fileName: string) => {
    setDownloadingId(attachmentId)
    setLocalError(null)
    try {
      downloadBlob(await downloadAttachment(recordId, attachmentId), fileName)
    } catch {
      setLocalError('파일을 받지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일을 다시 골라도 change 가 발생하도록 비운다
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setLocalError('파일은 10MB 이하만 올릴 수 있어요.')
      return
    }

    setLocalError(null)
    upload({ file })
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-b1-semibold text-gray-800">{`첨부 ${attachments.length}`}</h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-b2-semibold rounded-full border border-green-600 px-3 py-1.5 text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
        >
          {isUploading ? '업로드 중...' : '파일 추가'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {(localError || isUploadError) && (
        <p className="text-red text-b2-regular" role="alert">
          {localError ?? '업로드에 실패했어요. 잠시 후 다시 시도해주세요.'}
        </p>
      )}

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-lg bg-gray-200" />
      ) : !attachments.length ? (
        <p className="text-b2-regular text-gray-600">
          예방접종 수첩이나 진료 기록 사진을 올려두면 나중에 찾기 쉬워요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {attachments.map((attachment) => {
            const id = getAttachmentId(attachment)
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                {isImage(attachment.fileType) && (
                  <AttachmentPreview
                    recordId={recordId}
                    attachmentId={id}
                    fileName={attachment.fileName ?? '첨부파일'}
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleDownload(id, attachment.fileName ?? '첨부파일')}
                  disabled={downloadingId === id}
                  className="text-b1-regular min-w-0 flex-1 truncate text-left text-gray-800 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none disabled:opacity-60"
                >
                  {downloadingId === id ? '받는 중...' : (attachment.fileName ?? '첨부파일')}
                </button>
                <span className="text-c1-regular shrink-0 text-gray-500">
                  {formatFileSize(attachment.fileSize)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`${attachment.fileName ?? '첨부파일'} 삭제`}
                >
                  <TrashIcon className="size-5 fill-gray-500" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default AttachmentSection
