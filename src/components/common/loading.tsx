import { motion } from 'motion/react'
import { ReactElement, useEffect } from 'react'
import CharacterIcon from '@/assets/icons/characters/loading.svg'

interface LoadingProps {
  content?: string
}

const Loading = ({ content = '로딩 중' }: LoadingProps): ReactElement => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    // 키보드 이벤트도 막기
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
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
