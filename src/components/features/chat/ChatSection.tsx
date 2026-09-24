'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, useEffect, useRef } from 'react'
import RightArrowIcon from '@/assets/icons/arrow_with_circle_small.svg'
import CharacterIcon from '@/assets/icons/characters/hi.svg'

const ChatSection = (): ReactElement => {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleClick = () => router.push('/chat')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.beginPath()
    ctx.moveTo(0, canvas.height * 0.85)

    ctx.bezierCurveTo(
      canvas.width * 0.2,
      canvas.height * 0.55,
      canvas.width * 0.3,
      canvas.height * 0.58,
      canvas.width * 0.4,
      canvas.height * 0.6,
    )

    ctx.bezierCurveTo(
      canvas.width * 0.5,
      canvas.height * 0.75,
      canvas.width * 0.7,
      canvas.height * 0.82,
      canvas.width * 0.8,
      canvas.height * 0.83,
    )

    ctx.lineTo(canvas.width, canvas.height * 0.83)

    ctx.lineTo(canvas.width, canvas.height)
    ctx.lineTo(0, canvas.height)
    ctx.closePath()

    ctx.fillStyle = '#B5E89E' // green-200
    ctx.fill()
  }, [])

  return (
    <div
      className="flex cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-100"
      onClick={handleClick}
    >
      <div className="flex items-center gap-1.5 p-3.5">
        <h1 className="text-t2-semibold">상담하러 가기</h1>
        <RightArrowIcon className="size-4.5 fill-black" />
      </div>
      <div className="relative h-44 overflow-hidden bg-green-100">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <CharacterIcon className="absolute top-10 bottom-0 left-4.5 z-10 w-56" />
      </div>
    </div>
  )
}

export default ChatSection
