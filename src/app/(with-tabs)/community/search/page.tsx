import { JSX, Suspense } from 'react'
import ClientCommunitySearchPage from './ClientCommunitySearchPage'

export default function CommunitySearchPage(): JSX.Element {
  return (
    <Suspense>
      <ClientCommunitySearchPage />
    </Suspense>
  )
}
