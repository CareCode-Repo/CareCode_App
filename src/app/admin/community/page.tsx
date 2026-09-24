'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import { useAdminPosts, useDeleteAdminPost } from '@/queries/admin'
import { AdminPost } from '@/types/apis/admin'
import { formatDate } from '@/utils/date'

const AdminCommunityPage = (): ReactElement => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null)

  const { data, isLoading, isError, refetch } = useAdminPosts(page)
  const { mutate: deletePost, isPending } = useDeleteAdminPost()

  const posts = data?.content ?? []

  if (isError) {
    return <ErrorView content="게시글 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-c1-regular text-gray-600">
        신고를 거치지 않은 직접 삭제입니다. 신고 접수 건은 신고 처리 화면에서 다루는 편이 기록이
        남아 낫습니다.
      </p>

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !posts.length ? (
        <EmptyState title="게시글이 없어요" />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`총 ${data?.totalElements ?? posts.length}건`}
          </p>

          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li
                key={post.postId}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  {post.category && <Chip color="green">{post.category}</Chip>}
                  <button
                    type="button"
                    onClick={() => router.push(`/community/${post.postId}`)}
                    className="text-b1-semibold min-w-0 flex-1 truncate text-left text-gray-800"
                  >
                    {post.title || '(제목 없음)'}
                  </button>
                </div>

                <p className="text-b2-regular line-clamp-2 text-gray-600">{post.content}</p>

                <span className="text-c1-regular text-gray-500">
                  {`${post.isAnonymous ? '익명' : (post.authorName ?? '알 수 없음')} · ${formatDate(post.createdAt, 'MM.dd HH:mm')} · 조회 ${post.viewCount ?? 0} · 좋아요 ${post.likeCount ?? 0}`}
                </span>

                <Button
                  color="red"
                  size="small"
                  className="mt-1"
                  disabled={isPending}
                  onClick={() => setDeleteTarget(post)}
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>

          {!data?.last && (
            <Button color="gray" size="small" onClick={() => setPage((prev) => prev + 1)}>
              더 보기
            </Button>
          )}
        </>
      )}

      <AlertDialog
        title="게시글을 삭제할까요?"
        description="사용자 화면에서도 즉시 사라지며 복구할 수 없어요."
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setDeleteTarget(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color="red"
            size="small"
            disabled={isPending}
            onClick={() =>
              deleteTarget &&
              deletePost(deleteTarget.postId, { onSettled: () => setDeleteTarget(null) })
            }
          >
            삭제
          </Button>
        }
      />
    </div>
  )
}

export default AdminCommunityPage
