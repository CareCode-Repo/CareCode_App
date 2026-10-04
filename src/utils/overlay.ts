/**
 * 지금 열려 있는 다이얼로그·메뉴가 있으면 닫는다. 닫을 것이 있었으면 `true`.
 *
 * 안드로이드 사용자는 **뒤로 가기로 창을 닫는다.** 그 처리를 하지 않으면 확인창이 떠 있는
 * 채로 앱이 내려가고, 다시 열면 창이 그대로 있다. 명백히 틀린 동작인데, 화면마다 따로
 * 처리하면 아홉 군데를 손봐야 하고 새로 만드는 다이얼로그마다 또 빠뜨린다. 그래서 한 곳에서
 * DOM 을 보고 판단한다.
 *
 * Esc 를 쏘는 이유: Radix 가 이미 Esc 로 닫는 길을 갖고 있다. 상태를 직접 건드리면 포커스
 * 되돌리기·애니메이션·바깥 클릭 복원을 전부 다시 만들어야 한다.
 *
 * 선택자는 Radix 의 마크업에 기댄다 — 그래서 테스트가 실제 컴포넌트를 띄워 확인한다.
 */
const OPEN_OVERLAY_SELECTOR = [
  '[data-state="open"][role="dialog"]',
  '[data-state="open"][role="alertdialog"]',
  '[data-state="open"][role="menu"]',
].join(', ')

export const closeTopmostOverlay = (): boolean => {
  if (typeof document === 'undefined') return false
  if (!document.querySelector(OPEN_OVERLAY_SELECTOR)) return false

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  return true
}
