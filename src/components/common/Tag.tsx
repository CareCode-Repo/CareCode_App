import { ReactElement } from 'react'

interface TagProps {
  tag: string
}

const Tag = ({ tag }: TagProps): ReactElement => {
  return <span className="text-c1-regular text-gray-700">{`# ${tag}`}</span>
}

export default Tag
