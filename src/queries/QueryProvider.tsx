'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactElement, ReactNode, useEffect, useState } from 'react'
import { connectNativeQuerySignals } from '@/queries/nativeSignals'

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

  /**
   * 앱에서는 화면 전환·연결 상태를 네이티브가 알려 준다. 위의 `refetchOnWindowFocus` 와
   * `refetchOnReconnect` 는 그 신호가 와야 의미가 있는데, WebView 의 브라우저 이벤트만으로는
   * 오지 않거나 늦는다.
   */
  useEffect(() => {
    connectNativeQuerySignals()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider
