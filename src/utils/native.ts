import { Capacitor } from '@capacitor/core'

/**
 * 지금 네이티브 셸(Capacitor) 안에서 돌고 있는지.
 *
 * 같은 코드가 브라우저에서도, 앱 안에서도 돈다. 네이티브 플러그인은 앱에서만 존재하므로
 * 분기 없이 부르면 웹에서 터진다. 분기의 기준을 이 한 곳으로 모아 둔다.
 */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform()

/** 'ios' | 'android' | 'web' */
export const nativePlatform = (): string => Capacitor.getPlatform()

export const isIOS = (): boolean => nativePlatform() === 'ios'
export const isAndroid = (): boolean => nativePlatform() === 'android'
