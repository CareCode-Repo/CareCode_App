import { ReactElement } from 'react'
import RouteSkeleton from '@/components/common/RouteSkeleton'

/** 관리자 레이아웃이 이미 상단바를 그리므로 여기서는 본문만 비운다. */
const Loading = (): ReactElement => <RouteSkeleton hasTopNav={false} rows={5} />

export default Loading
