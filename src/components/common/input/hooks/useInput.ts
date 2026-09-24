import { Dispatch, SetStateAction, useCallback, useState } from 'react'

export function useInput(initial = ''): {
  value: string
  onChange: (v: string) => void
  setValue: Dispatch<SetStateAction<string>>
} {
  const [value, setValue] = useState(initial)
  const onChange = useCallback((v: string) => setValue(v), [])
  return { value, onChange, setValue }
}
