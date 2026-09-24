/**
 * 백그라운드 푸시 수신용 서비스 워커.
 *
 * 서비스 워커는 번들을 거치지 않아 `process.env` 를 읽을 수 없다. 그래서 설정은 등록할 때
 * 쿼리 파라미터로 넘겨받는다 (apis/push.ts). FCM 웹 설정값은 원래 공개되는 값이라 문제없다.
 */
// 이 버전은 package.json 의 `firebase` 와 같아야 한다. 서비스 워커는 번들을 거치지 않아
// 버전을 읽어올 방법이 없으므로 여기에 박고, package.json 쪽은 캐럿 없이 고정해 둔다.
importScripts('https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js')

const params = new URL(self.location).searchParams

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {}

  self.registration.showNotification(notification.title || '케어코드 알림', {
    body: notification.body || '',
    icon: '/images/app-icon.svg',
    // 알림함에서 열 때 어디로 갈지. 유형만 넘겨받아 앱에서 목적지를 정한다.
    data: { notificationType: (payload.data || {}).notificationType || '' },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  // 알림함으로 보낸다. 개별 목적지는 알림함에서 유형에 따라 정한다.
  event.waitUntil(clients.openWindow('/notification'))
})
