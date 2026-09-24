import clsx from 'clsx'
import { ReactElement } from 'react'

type MenuItem = {
  id: string
  title: string
  onClick?: () => void
}

interface MenuListProps {
  title: string
  items: MenuItem[]
  className?: string
}

const MenuList = ({ title, items, className }: MenuListProps): ReactElement => {
  return (
    <div className={clsx('flex flex-col gap-4 p-7.5 text-black', className)}>
      {/* 메뉴 제목 */}
      <h2 className="text-h3-bold">{title}</h2>
      {/* 메뉴 아이템들 */}
      <div className="text-b1-regular flex flex-col">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="py-2 text-left transition-colors hover:bg-gray-100"
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MenuList
