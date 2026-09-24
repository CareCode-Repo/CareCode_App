'use client'

import clsx from 'clsx'
import { ChangeEvent, forwardRef, InputHTMLAttributes, ReactElement, useId, useState } from 'react'

import RadixLabel from '../Label'
import WarningIcon from '@/assets/icons/warning.svg'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onError' | 'onChange'> {
  value: string
  maxLength?: number
  label?: string
  placeholder?: string
  rightIcon?: ReactElement
  type?: string
  errorText?: string
  showErrorText?: boolean
  required?: boolean
  fieldClassName?: string
  inputClassName?: string
  variant?: 'default' | 'rounded'
  onChange?: (value: string) => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value = '',
      maxLength,
      label = '',
      placeholder = '',
      rightIcon,
      type = 'text',
      errorText = '',
      showErrorText = false,
      required = false,
      variant = 'default',
      fieldClassName = '',
      inputClassName = '',
      onChange,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputId = useId()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value

      if (maxLength && inputValue.length > maxLength) return

      onChange?.(inputValue)
    }

    return (
      <div className={clsx('flex w-full flex-col')}>
        {label && (
          <RadixLabel required={required} htmlFor={inputId}>
            {label}
          </RadixLabel>
        )}

        {/* Field */}
        <div
          className={clsx(
            'flex items-center border bg-white',
            'focus-within:ring-2 focus-within:ring-green-600/40',
            // variant별 스타일
            {
              'rounded-md px-3 py-2': variant === 'default',
              'rounded-3xl px-4.5 py-2.5': variant === 'rounded',
            },
            // 상태별 스타일
            {
              'border-gray-400': !errorText, // 기본
              'border-red text-red': errorText, // 에러
              'focus-within:border-green-500': isFocused && !errorText, // 포커스
            },
            fieldClassName,
          )}
        >
          {/* 실제입력값 */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            className={clsx(
              'grow text-black placeholder:text-gray-400 focus:caret-green-600 focus:outline-none',
              errorText && 'placeholder:text-red',
              // variant별 스타일
              {
                'text-t2-regular': variant === 'default',
                'text-b1-regular': variant === 'rounded',
              },
              inputClassName,
            )}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {/* 아이콘 */}
          {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </div>
        {/* 에러메시지 */}
        {errorText && showErrorText && (
          <div className="text-red text-b1-regular mt-2.5 flex items-center gap-1" role="alert">
            <WarningIcon className="fill-red size-5" />
            <p>{errorText}</p>
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
