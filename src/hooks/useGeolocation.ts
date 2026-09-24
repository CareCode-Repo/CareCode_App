'use client'
import { useCallback, useState } from 'react'

interface Coordinates {
  lat: number
  lng: number
}

interface UseGeolocationResult {
  coords: Coordinates | null
  isLocating: boolean
  error: string | null
  request: () => void
}

/**
 * 브라우저 위치 권한을 필요한 시점에만 요청한다.
 * 화면 진입과 동시에 묻지 않고 사용자가 "내 주변" 을 누를 때 호출하는 용도.
 */
export const useGeolocation = (): UseGeolocationResult => {
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('이 브라우저에서는 위치 기능을 쓸 수 없어요.')
      return
    }

    setIsLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setIsLocating(false)
      },
      () => {
        setError('위치 정보를 가져오지 못했어요. 브라우저 권한을 확인해주세요.')
        setIsLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  return { coords, isLocating, error, request }
}
