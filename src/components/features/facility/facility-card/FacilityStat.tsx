import { ReactElement } from 'react'

interface FacilityStatProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  value: string | number
  className?: string
}

const FacilityStat = ({ icon: Icon, value, className = '' }: FacilityStatProps): ReactElement => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Icon className="h-3 w-3 fill-gray-700" />
      <span className="text-c1-regular text-black">{value}</span>
    </div>
  )
}

export default FacilityStat
