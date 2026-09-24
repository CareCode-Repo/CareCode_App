'use client'
import { useRouter } from 'next/navigation'
import { JSX, useState } from 'react'
import Button from '@/components/common/Button'
import Separator from '@/components/common/Separator'
import Loading from '@/components/common/loading'
import TopNavBar from '@/components/common/top-navbar'
import { usePostCommunityPost } from '@/queries/community'
import { Post, PostCommunityPostBody } from '@/types/apis/community'

const PostAdd = (): JSX.Element => {
  const router = useRouter()
  const { mutate: addPost, isPending } = usePostCommunityPost()
  const [title, setTitle] = useState<Post['title']>('')
  const [content, setContent] = useState<Post['content']>('')

  const handleAddButton = () => {
    if (!title.trim() || !content.trim()) return
    addPost({ title, content } as PostCommunityPostBody, {
      onSuccess: () => router.back(),
      onError: (err) => {
        console.error('게시글 등록 실패:', err)
      },
    })
  }
  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      {isPending && <Loading />}

      <TopNavBar title="커뮤니티" hasBackButton isSticky={true} />

      <div className="flex h-full flex-col items-start gap-[1.125rem] p-6">
        <input
          placeholder={'제목을 입력해주세요'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-t1-semibold w-full outline-none"
          disabled={isPending}
        />
        <Separator className="w-full shrink-0" />
        <textarea
          placeholder={`육아 친구들과 자유롭게 얘기해보세요.
#출산 #육아용품`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-b1-regular scrollbar-hide w-full flex-1 resize-none rounded-lg border border-gray-500 p-3 whitespace-pre-wrap !outline-none focus:border-gray-800"
          disabled={isPending}
        />
        <Button
          color={'green'}
          onClick={handleAddButton}
          // 눌러도 아무 일이 없는 것보다 왜 못 누르는지 보이는 편이 낫다.
          disabled={isPending || !title.trim() || !content.trim()}
        >
          등록하기
        </Button>
      </div>
    </div>
  )
}

export default PostAdd
