import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useRecentSearches } from './useRecentSearches'

interface UseSearchPolicyReturn {
  inputValue: string
  search: (value?: string) => void
  handleInputChange: (value: string) => void
}

export const useSearchPolicy = (initialKeyword: string = ''): UseSearchPolicyReturn => {
  const [inputValue, setInputValue] = useState(initialKeyword)
  const { addSearch } = useRecentSearches()
  const router = useRouter()

  useEffect(() => {
    setInputValue(initialKeyword)
  }, [initialKeyword])

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])
  const search = useCallback(
    (value?: string) => {
      const searchTerm = (value ?? inputValue).trim()
      if (!searchTerm) return

      setInputValue(searchTerm)
      addSearch(searchTerm)
      router.push(`/search/policy?keyword=${encodeURIComponent(searchTerm)}`)
    },
    [addSearch, router, inputValue],
  )

  return {
    inputValue,
    search,
    handleInputChange,
  }
}
