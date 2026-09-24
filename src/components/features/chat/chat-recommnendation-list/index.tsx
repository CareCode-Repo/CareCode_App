import { ReactElement, memo, useCallback } from 'react'
import RecommendationChip from './RecommendationChip'

interface ChatRecommendationListProps {
  recommendations: string[]
  onRecommendationClick: (text: string) => void
}

const ChatRecommendationList = memo(
  ({ recommendations, onRecommendationClick }: ChatRecommendationListProps): ReactElement => {
    const handleClick = useCallback(
      (text: string) => () => onRecommendationClick(text),
      [onRecommendationClick],
    )

    return (
      <div className="scrollbar-hide flex gap-2 overflow-x-auto">
        {recommendations.map((text, index) => (
          <RecommendationChip key={`${text}-${index}`} onClick={handleClick(text)}>
            {text}
          </RecommendationChip>
        ))}
      </div>
    )
  },
)

ChatRecommendationList.displayName = 'ChatRecommendationList'

export default ChatRecommendationList
