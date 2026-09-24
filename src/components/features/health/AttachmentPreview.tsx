'use client'
import { ReactElement, useEffect, useState } from 'react'
import { useAttachmentBlob } from '@/queries/health'

interface AttachmentPreviewProps {
  recordId: number
  attachmentId: number
  fileName: string
}

/**
 * 이미지 첨부 미리보기.
 *
 * 첨부 저장소는 정적으로 공개되지 않으므로 `<img src="/files/...">` 는 401 이 난다.
 * 인증된 요청으로 받은 본문을 object URL 로 그린다.
 *
 * 본문 자체는 쿼리 캐시가 들고 있고(중복 요청 방지), object URL 은 이 컴포넌트가
 * 만들고 해제한다. 해제하지 않으면 화면을 오갈 때마다 blob 이 메모리에 쌓인다.
 */
const AttachmentPreview = ({
  recordId,
  attachmentId,
  fileName,
}: AttachmentPreviewProps): ReactElement | null => {
  const { data: blob, isError } = useAttachmentBlob(recordId, attachmentId)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!blob) return

    const url = URL.createObjectURL(blob)
    setObjectUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [blob])

  if (isError) return null

  if (!objectUrl) {
    return <div className="size-16 shrink-0 animate-pulse rounded bg-gray-200" />
  }

  return (
    // 인증된 blob 이라 next/image 최적화 대상이 아니다. 원본을 그대로 그린다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={objectUrl}
      alt={fileName}
      className="size-16 shrink-0 rounded border border-gray-200 object-cover"
    />
  )
}

export default AttachmentPreview
