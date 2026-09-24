'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactElement, ReactNode, useState } from 'react'

const QueryProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2분간 캐시 데이터를 신선하다고 간주
            retry: (failureCount, error: Error) => {
              // 4xx 에러는 재시도하지 않음
              if ('response' in error && error.response) {
                const status = (error.response as { status: number }).status
                if (status >= 400 && status < 500) {
                  return false
                }
              }
              return failureCount < 3
            },
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
          },
          mutations: {
            // retry: 1,
            // onError: (error: Error) => {
            //   console.error('Mutation error:', error)
            // },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider
