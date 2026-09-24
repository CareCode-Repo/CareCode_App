import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'recentSearches'
const MAX_SEARCHES = 10

interface UseRecentSearchesReturn {
  recentSearches: string[]
  addSearch: (keyword: string) => void
  removeSearch: (keyword: string) => void
  clearAllSearches: () => void
}

const getStoredSearches = (): string[] => {
  if (typeof window === 'undefined') return []

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Failed to load recent searches:', error)
    return []
  }
}

const saveToStorage = (searches: string[]): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
  } catch (error) {
    console.error('Failed to save recent searches:', error)
  }
}

export const useRecentSearches = (): UseRecentSearchesReturn => {
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load stored searches after mount to prevent hydration mismatch
  useEffect(() => {
    setRecentSearches(getStoredSearches())
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setRecentSearches(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Failed to sync recent searches:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addSearch = useCallback((keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== trimmed)
      const newSearches = [trimmed, ...filtered].slice(0, MAX_SEARCHES)
      saveToStorage(newSearches)
      return newSearches
    })
  }, [])

  const removeSearch = useCallback((keyword: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== keyword)
      saveToStorage(filtered)
      return filtered
    })
  }, [])

  const clearAllSearches = useCallback(() => {
    setRecentSearches([])
    saveToStorage([])
  }, [])

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearAllSearches,
  }
}
