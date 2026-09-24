import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const API_URL = process.env.NEXT_PUBLIC_API_URL

/** 목록당 이 개수까지만 싣는다. 사이트맵 하나가 지나치게 커지면 크롤러가 통째로 건너뛴다. */
const MAX_PER_TYPE = 500

/**
 * 빌드 시점에 백엔드가 떠 있지 않을 수 있다(CI 등).
 * 사이트맵 때문에 빌드가 깨지면 안 되므로 실패하면 정적 경로만 내보낸다.
 */
const fetchList = async (path: string): Promise<unknown[]> => {
  if (!API_URL) return []

  try {
    const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return []

    const data = await res.json()
    // 배열로 주는 곳과 { content: [...] } 로 주는 곳이 섞여 있다.
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.content)) return data.content
    return []
  } catch {
    return []
  }
}

const toEntries = (
  items: unknown[],
  idKey: string,
  prefix: string,
  priority: number,
): MetadataRoute.Sitemap =>
  items
    .slice(0, MAX_PER_TYPE)
    .map((item) => (item as Record<string, unknown>)[idKey])
    .filter((id): id is string | number => id != null)
    .map((id) => ({
      url: `${SITE_URL}${prefix}/${id}`,
      changeFrequency: 'weekly' as const,
      priority,
    }))

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/home`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/search`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/community`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/facility`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/hospital`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/legal/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const [policies, posts, facilities, hospitals] = await Promise.all([
    fetchList('/policies'),
    fetchList('/community/posts?page=0&size=500'),
    fetchList('/facilities?page=0&size=500'),
    fetchList('/health/hospitals?page=0&size=500'),
  ])

  return [
    ...staticRoutes,
    // 지원금 상세가 이 서비스에서 검색 유입 가치가 가장 큰 문서다.
    ...toEntries(policies, 'id', '/policy', 0.9),
    ...toEntries(posts, 'postId', '/community', 0.6),
    ...toEntries(facilities, 'id', '/facility', 0.6),
    ...toEntries(hospitals, 'id', '/hospital', 0.6),
  ]
}
