import { ImageResponse } from 'next/og'

export const alt = '맘편한 — 부모와 자녀를 위한 육아 정보 플랫폼'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * 링크를 공유했을 때 보이는 카드.
 *
 * 외부 폰트를 받아오지 않는다. 빌드·요청 시점에 네트워크에 기대면 폰트 서버가 느릴 때
 * 이미지 생성이 통째로 실패한다. 한글은 시스템 폰트로 그린다.
 */
export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          background: 'linear-gradient(135deg, #d3f1c4 0%, #edfae8 100%)',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, color: '#139510' }}>맘편한</div>
        <div style={{ fontSize: 40, color: '#424242' }}>부모와 자녀를 위한 육아 정보 플랫폼</div>
        <div style={{ fontSize: 30, color: '#616161' }}>
          지원금 · 어린이집 · 예방접종 · 커뮤니티
        </div>
      </div>
    ),
    size,
  )
}
