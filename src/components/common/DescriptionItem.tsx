import { ReactElement } from 'react'

interface DescriptionItemProps {
  title: string
  content: string
}

const DescriptionItem = ({ title, content }: DescriptionItemProps): ReactElement => {
  return (
    <div className="text-c1-regular flex items-start gap-2">
      <dt className="flex-shrink-0 whitespace-nowrap text-gray-700">{title}</dt>
      <dd className="min-w-0 truncate text-black">{content}</dd>
    </div>
  )
}

export default DescriptionItem
