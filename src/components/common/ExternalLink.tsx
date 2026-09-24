'use client'
import { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react'
import { openExternal } from '@/utils/externalLink'
import { isNativeApp } from '@/utils/native'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel' | 'onClick'> & {
  href: string
  children: ReactNode
}

/**
 * 밖으로 나가는 링크.
 *
 * `<a>` 를 그대로 쓴다 — 스크린 리더에 링크로 읽히고, 웹에서는 길게 눌러 주소를 복사하거나
 * 새 탭으로 여는 평소 동작이 남는다. 앱에서만 기본 동작을 막고 인앱 브라우저로 넘긴다.
 * (WebView 에서 `target="_blank"` 는 조용히 아무 일도 하지 않을 수 있다)
 */
const ExternalLink = ({ href, children, ...rest }: Props): ReactElement => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer noopener"
    onClick={(event) => {
      if (!isNativeApp()) return

      event.preventDefault()
      openExternal(href).catch((error) => console.error('링크를 열지 못했습니다:', error))
    }}
    {...rest}
  >
    {children}
  </a>
)

export default ExternalLink
