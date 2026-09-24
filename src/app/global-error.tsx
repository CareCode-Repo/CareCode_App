'use client'
import { ReactElement, useEffect } from 'react'

/**
 * 루트 레이아웃 자체가 터졌을 때의 마지막 그물.
 *
 * 이 경계는 레이아웃을 대신하므로 html·body 를 직접 그려야 한다.
 * 같은 이유로 전역 스타일도 아직 적용되지 않으므로 인라인 스타일만 쓴다.
 */
const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): ReactElement => {
  useEffect(() => {
    console.error('앱을 시작하지 못했습니다:', error)
  }, [error])

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '0 1.5rem',
          background: '#fafafa',
          color: '#212121',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          앱을 여는 중 문제가 생겼어요
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#616161', margin: 0, lineHeight: 1.6 }}>
          잠시 후 다시 시도해주세요.
          <br />
          계속 이러면 앱을 완전히 껐다가 다시 열어주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: 0,
            borderRadius: '0.75rem',
            padding: '0.875rem 2rem',
            background: '#4fbe27',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          다시 시도하기
        </button>
      </body>
    </html>
  )
}

export default GlobalError
