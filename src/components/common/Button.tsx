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
          /*
           * 초록 버튼의 글자는 어둡게 간다.
           *
           * 흰 글자(gray-100)는 green-600 위에서 2.21:1 이었다 — 야외나 밝기를 낮춘 화면에서
           * "지금 눌러야 할 것" 이 사라진다. 초록을 어둡게 하면 통과하지만 브랜드 색이 바뀐다.
           * 밝은 초록을 지키고 글자를 gray-900 으로 내려 6.69:1 로 올렸다(hover 5.31, 비활성 11.5).
           */
          'bg-green-600 text-gray-900 hover:bg-green-700 focus-visible:ring-green-700 disabled:bg-green-200':
            color === 'green',
          // gray-600 은 gray-200 위에서 3.97:1 이라 미달이었다.
          'bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-700':
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
