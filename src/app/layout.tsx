import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { ReactNode } from 'react'
import NotificationStreamListener from '@/components/common/NotificationStreamListener'
import PushListener from '@/components/common/PushListener'
import SessionBootstrap from '@/components/common/SessionBootstrap'
import PromotionPanel from '@/components/organism/PromotionPanel'
import QueryProvider from '@/queries/QueryProvider'

export const metadata: Metadata = {
  title: '맘편한',
  description: '맘편한은 부모와 자녀를 위한 육아 정보 공유 플랫폼입니다.',
  // public/ 의 파일을 그대로 쓴다. app/icon.svg 규약을 쓰면 next.config 의 svgr 규칙과 부딪힌다.
  icons: { icon: '/images/app-icon.svg', apple: '/images/app-icon.svg' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: '맘편한', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  // 확대를 막으면 저시력 사용자가 본문을 읽을 방법이 없다(WCAG 1.4.4).
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#4fbe27',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): ReactNode {
  return (
    <html lang="ko">
      <body className={`font-pretendard min-h-dvh antialiased`}>
        <QueryProvider>
          <SessionBootstrap>
            <PushListener>
              <NotificationStreamListener>
                <div className="flex min-h-dvh">
                  {/* 데스크톱 프로모션 패널 */}
                  <aside className="hidden sm:block sm:flex-1/3">
                    <PromotionPanel />
                  </aside>

                  {/* 앱 콘텐츠 영역 */}
                  <div className="flex-1 bg-amber-50 sm:flex-2/3">
                    <div className="mx-auto h-dvh max-w-sm overflow-y-auto">{children}</div>
                  </div>
                </div>
              </NotificationStreamListener>
            </PushListener>
          </SessionBootstrap>
        </QueryProvider>
      </body>
    </html>
  )
}
