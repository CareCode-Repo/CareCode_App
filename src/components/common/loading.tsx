import { motion } from 'motion/react'
import { ReactElement, useEffect } from 'react'
import CharacterIcon from '@/assets/icons/characters/loading.svg'

interface LoadingProps {
  content?: string
}

const Loading = ({ content = '로딩 중' }: LoadingProps): ReactElement => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    /*
      뒤 화면이 스크롤되는 것만 막는다.
      전에는 모든 키를 preventDefault 로 삼켜서, 로딩이 떠 있는 동안 Tab 도 Esc 도 죽었다 —
      키보드만 쓰는 사용자는 로딩이 끝날 때까지 아무 데도 갈 수 없었다.
    */
    const SCROLL_KEYS = [' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.includes(e.key)) return
      e.preventDefault()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-live="polite"
      aria-label={content}
    >
      <div className="flex flex-col items-center gap-5">
        <CharacterIcon className="w-36" />
        <div className="flex gap-3.5">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="size-2.5 rounded-full bg-white will-change-transform"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <p className="text-h3-bold text-center whitespace-pre-line text-white">{content}</p>
      </div>
    </div>
  )
}

export default Loading
