export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      // .split(',')[1] 제거 - 완전한 Data URL 반환
      const base64String = reader.result as string
      resolve(base64String)
    }

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'))
    }

    reader.readAsDataURL(file)
  })
}

/** 응답 객체를 JSON 파일로 내려받는다 (개인정보 내보내기 등). */
export const downloadJson = (payload: unknown, fileName: string): void => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(url)
}

/**
 * 서버가 돌려준 업로드 파일 주소를 브라우저가 열 수 있는 주소로 바꾼다.
 *
 * `/files/...` 는 **백엔드 오리진** 기준이라 그대로 쓰면 프런트 주소로 해석돼 404 가 난다.
 * 이미 절대 주소(S3 등)면 그대로 둔다.
 */
export const toAbsoluteFileUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined
  if (/^https?:\/\//.test(url)) return url

  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

/** blob 을 파일로 내려받게 한다. 인증이 필요한 파일은 주소를 직접 열 수 없어 이 경로를 쓴다. */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(url)
}
