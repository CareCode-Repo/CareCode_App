'use client'
import { ReactElement, useEffect, useState } from 'react'
import { isNativeApp, nativePlatform } from '@/utils/native'

/**
 * 지금 쓰고 있는 버전.
 *
 * 문의를 받았을 때 가장 먼저 물어야 하는 값인데, 물어볼 데가 없으면 사용자는 답할 수 없다.
 * 특히 앱은 사용자가 업데이트를 미루기 때문에 **같은 시점에 서로 다른 버전이 돌고 있다** —
 * 재현되지 않는 문의의 절반은 여기서 갈린다.
 *
 * 앱에서는 네이티브가 들고 있는 값을 쓴다. 스토어에 올라간 버전과 빌드 번호가 그쪽에 있고,
 * 웹 자산만 갈아 끼운 경우에도 네이티브 쪽이 실제 설치본을 가리킨다.
 */
const AppVersion = (): ReactElement | null => {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!isNativeApp()) {
      const version = process.env.NEXT_PUBLIC_APP_VERSION
      setLabel(version ? `웹 ${version}` : null)
      return
    }

    let cancelled = false

    import('@capacitor/app')
      .then(async ({ App }) => {
        const info = await App.getInfo()
        if (cancelled) return
        // 예: "Android 1.0.0 (3)" — 빌드 번호까지 있어야 어느 제출본인지 특정된다.
        setLabel(
          `${nativePlatform() === 'ios' ? 'iOS' : 'Android'} ${info.version} (${info.build})`,
        )
      })
      .catch(() => {
        // 못 읽어도 화면이 깨지지 않게 그냥 감춘다.
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!label) return null

  return <p className="text-c1-regular py-6 text-center text-gray-400">{`맘편한 · ${label}`}</p>
}

export default AppVersion
