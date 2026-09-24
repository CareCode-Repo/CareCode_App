import clsx from 'clsx'
import { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: 'large' | 'small'
  color?: 'green' | 'gray' | 'red'
  className?: string
}

const Button = ({
  children,
  size = 'large',
  color = 'green',
  className,
  type = 'button',
  ...props
}: ButtonProps): ReactElement => {
  return (
    <button
      // 기본값이 submit 이라 폼 안에 놓인 보조 버튼까지 제출을 일으킨다.
      type={type}
      className={clsx(
        'text-t1-semibold rounded-xl transition-colors disabled:cursor-not-allowed',
        // 포커스 링을 지우면 키보드 사용자는 지금 어디에 있는지 알 수 없다(WCAG 2.4.7).
        // 마우스 클릭 때는 뜨지 않도록 focus-visible 로만 건다.
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        {
          'w-full py-4.5': size === 'large',
          'w-full px-2.5 py-3.5': size === 'small',
        },
        {
          'bg-green-600 text-gray-100 hover:bg-green-700 focus-visible:ring-green-700 disabled:bg-green-200':
            color === 'green',
          'bg-gray-200 text-gray-600 hover:bg-gray-300 focus-visible:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400':
            color === 'gray',
          // `red-400` 은 테마에 없어 Tailwind 기본 팔레트로 새어 나가고 있었다.
          'bg-red focus-visible:ring-red text-white hover:opacity-90 disabled:opacity-50':
            color === 'red',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
