import clsx from 'clsx'
import { ReactElement, ReactNode } from 'react'

interface MainSectionProps {
  title: string
  className?: string
  children?: ReactNode
}

const MainSection = ({ title, className, children }: MainSectionProps): ReactElement => {
  return (
    <div
      className={clsx(
        'flex flex-col gap-4.5 rounded-lg border border-gray-100 bg-white',
        className,
      )}
    >
      {/*
        전에는 h1 이었다. 한 화면에 h1 이 네 개씩 생기고, 정작 페이지 제목은 heading 이
        아니었다. 페이지 제목이 h1(TopNavBar)이고 섹션은 그 아래 단계다.
      */}
      <h2 className="text-t2-semibold px-4 pt-4 text-black">{title}</h2>
      {children}
    </div>
  )
}

export default MainSection
