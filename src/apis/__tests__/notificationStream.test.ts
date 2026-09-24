import { describe, expect, it } from 'vitest'
import { SseParser } from '@/apis/notificationStream'

// 서버(Spring SseEmitter)가 실제로 보낸 바이트를 그대로 옮겼다.
const SERVER_OUTPUT =
  'event:connected\ndata:ok\n\n' +
  ':ping\n\n' +
  'id:1\nevent:notification\ndata:{"id":1,"notificationType":"FACILITY","title":"빈자리 알림","isRead":false}\n\n'

describe('SseParser', () => {
  it('서버 출력에서 connected·notification 을 읽고 heartbeat 는 건너뛴다', () => {
    const events = new SseParser().push(SERVER_OUTPUT)

    expect(events).toHaveLength(2)
    expect(events[0]).toEqual({ event: 'connected', data: 'ok', id: undefined })
    expect(events[1].event).toBe('notification')
    expect(events[1].id).toBe('1')
    expect(JSON.parse(events[1].data).title).toBe('빈자리 알림')
  })

  it('이벤트가 여러 조각으로 끊겨 와도 완성된 뒤에만 넘긴다', () => {
    const parser = new SseParser()
    const pieces = SERVER_OUTPUT.match(/[\s\S]{1,7}/g) ?? []

    const events = pieces.flatMap((piece) => parser.push(piece))

    expect(events.map((e) => e.event)).toEqual(['connected', 'notification'])
  })

  it('CRLF 줄바꿈과 콜론 뒤 공백도 표준대로 처리한다', () => {
    const events = new SseParser().push('event: notification\r\ndata: a\r\ndata: b\r\n\r\n')

    expect(events).toEqual([{ event: 'notification', data: 'a\nb', id: undefined }])
  })
})
