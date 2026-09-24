import { ImageResponse } from 'next/og'

export const alt = '지원금 상세'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * 지원금 상세 공유 카드.
 *
 * 제목을 카드에 실어야 "무슨 지원금인지" 가 링크만 보고도 전달된다.
 * 서버가 응답하지 않으면 제목 없이 기본 문구로 그린다 — 카드가 통째로 깨지는 것보다 낫다.
 */
const fetchTitle = async (policyId: string): Promise<string | null> => {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) return null

  try {
    const res = await fetch(`${base}/policies/${policyId}`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null

    const data = (await res.json()) as { title?: string }
    return data.title ?? null
  } catch {
    return null
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ImageResponse> {
  const { id } = await params
  const title = await fetchTitle(id)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#ffffff',
          borderTop: '24px solid #4fbe27',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 32, color: '#4fbe27', fontWeight: 700 }}>지원금</div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#212121',
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            {title ?? '받을 수 있는 지원금을 확인해보세요'}
          </div>
        </div>
        <div style={{ fontSize: 34, color: '#757575' }}>맘편한 · 놓친 지원금까지 찾아드려요</div>
      </div>
    ),
    size,
  )
}
