import { ReactElement, ReactNode, memo } from 'react'

interface RecommendationChipProps {
  onClick?: () => void
  children?: ReactNode
}

const RecommendationChip = memo(({ onClick, children }: RecommendationChipProps): ReactElement => {
  return (
    <button
      onClick={onClick}
      className="text-b2-medium max-w-30 shrink-0 cursor-pointer rounded-xl border border-green-200 bg-green-100 px-3 py-1.5 text-left whitespace-pre-wrap text-black"
    >
      {children}
    </button>
  )
})

RecommendationChip.displayName = 'RecommendationChip'

export default RecommendationChip
