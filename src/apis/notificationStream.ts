/**
 * 알림 실시간 채널 (서버 GET /notifications/stream, text/event-stream).
 *
 * 브라우저 EventSource 는 Authorization 헤더를 붙일 수 없다. 액세스 토큰은 메모리에만 두므로
 * (쿠키가 아님) fetch 스트림으로 직접 읽는다. 서버 계약은 서버 저장소의
 * docs/features/realtime-notifications.md 에 있다.
 */
import { getAccessToken } from '@/apis/auth'

export type SseEvent = {
  event: string
  data: string
  id?: string
}

/**
 * 조각난 텍스트를 받아 완성된 이벤트만 돌려준다. 이벤트는 빈 줄로 끝나고,
 * 네트워크 조각은 이벤트 경계와 무관하게 끊겨 들어오므로 남은 부분을 다음 호출까지 들고 있는다.
 */
export class SseParser {
  private buffer = ''

  push(chunk: string): SseEvent[] {
    this.buffer += chunk.replace(/\r\n?/g, '\n')
    const events: SseEvent[] = []
    let boundary = this.buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const block = this.buffer.slice(0, boundary)
      this.buffer = this.buffer.slice(boundary + 2)
      const parsed = parseBlock(block)
      if (parsed) events.push(parsed)
      boundary = this.buffer.indexOf('\n\n')
    }
    return events
  }
}

function parseBlock(block: string): SseEvent | null {
  let event = 'message'
  let id: string | undefined
  const data: string[] = []
  for (const line of block.split('\n')) {
    // ':' 로 시작하면 주석(서버 heartbeat)이다.
    if (!line || line.startsWith(':')) continue
    const colon = line.indexOf(':')
    const field = colon === -1 ? line : line.slice(0, colon)
    let value = colon === -1 ? '' : line.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)
    if (field === 'event') event = value
    else if (field === 'data') data.push(value)
    else if (field === 'id') id = value
  }
  // heartbeat 처럼 필드가 하나도 없는 블록은 이벤트가 아니다.
  if (data.length === 0 && event === 'message') return null
  return { event, data: data.join('\n'), id }
}

export class StreamHttpError extends Error {
  constructor(readonly status: number) {
    super(`notification stream responded ${status}`)
  }
}

/**
 * 연결해서 끊길 때까지 이벤트를 넘긴다. 정상 종료(서버 타임아웃)면 resolve, 오류면 reject.
 * 다시 연결할지는 호출하는 쪽이 정한다.
 */
export async function readNotificationStream(
  onEvent: (event: SseEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const token = getAccessToken()
  if (!token) throw new StreamHttpError(401)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/notifications/stream`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
    credentials: 'include',
    cache: 'no-store',
    signal,
  })
  if (!res.ok || !res.body) throw new StreamHttpError(res.status)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const parser = new SseParser()
  for (;;) {
    const { value, done } = await reader.read()
    if (done) return
    parser.push(decoder.decode(value, { stream: true })).forEach(onEvent)
  }
}
