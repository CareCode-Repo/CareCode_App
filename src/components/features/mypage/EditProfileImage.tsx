'use client'
import Image from 'next/image'
import { ReactElement, useRef, useState } from 'react'
import CameraIcon from '@/assets/icons/camera_small.svg'
import IconButton from '@/components/common/top-navbar/IconButton'

/** 서버 multipart 제한과 맞춘다(spring.servlet.multipart.max-file-size: 10MB). */
const MAX_SIZE_BYTES = 10 * 1024 * 1024

interface EditProfileImageProps {
  imageUrl?: string | null
  isUploading?: boolean
  onSelect: (file: File) => void
}

/**
 * 프로필 사진.
 *
 * 예전에는 파일을 base64 로 바꿔 넘겼지만 그걸 받아 줄 업로드 경로가 없어서 어디에도
 * 저장되지 않았다. 이제 파일을 그대로 올리고, 서버가 돌려준 주소를 화면에 반영한다.
 */
const EditProfileImage = ({
  imageUrl,
  isUploading = false,
  onSelect,
}: EditProfileImageProps): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // 같은 파일을 다시 골랐을 때도 change 가 뜨도록 값을 비운다.
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 올릴 수 있어요.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('10MB 이하 이미지만 올릴 수 있어요.')
      return
    }

    setError('')
    onSelect(file)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-30 shrink-0 rounded-full border border-gray-300 bg-gray-300">
        {imageUrl && (
          <Image
            src={imageUrl}
            width={120}
            height={120}
            alt="프로필 사진"
            unoptimized
            className="h-full w-full rounded-full object-cover"
          />
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <span className="text-c1-regular text-white">올리는 중...</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleChangeFile}
        />
        <IconButton
          icon={CameraIcon}
          iconClassName="size-6 fill-gray-700"
          aria-label="프로필 사진 변경"
          className="absolute right-0 bottom-0 rounded-full border border-gray-50 bg-white p-1"
          onClick={() => inputRef.current?.click()}
        />
      </div>

      {error && (
        <p className="text-red text-b2-regular" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default EditProfileImage
