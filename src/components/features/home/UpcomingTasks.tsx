'use client'

import { useQueries } from '@tanstack/react-query'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { ReactElement } from 'react'
import { getAccessToken } from '@/apis/auth'
import { childQueries, useMyChildren } from '@/queries/child'
import { ChildTimeline, TIMELINE_TYPE_LABEL, TimelineItem } from '@/types/apis/child'

/** 이 기간을 넘어가는 할 일은 지금 알려 줘도 행동으로 이어지지 않는다. */
const HORIZON_DAYS = 60
const MAX_ITEMS = 5

interface DatedTask extends TimelineItem {
  childName: string
  dayDiff: number
}

/** 지난 항목을 먼저, 그다음 날짜가 가까운 순. 지났는데 안 한 건 가장 급하다. */
const byUrgency = (a: DatedTask, b: DatedTask): number => {
  const aOverdue = a.status === 'OVERDUE'
  const bOverdue = b.status === 'OVERDUE'
  if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
  return a.dayDiff - b.dayDiff
}

const formatDDay = (dayDiff: number): string => {
  if (dayDiff === 0) return '오늘'
  if (dayDiff < 0) return `${Math.abs(dayDiff)}일 지남`
  return `D-${dayDiff}`
}

/**
 * 접종·검진·지원금 마감을 한 줄에 모은 할 일.
 *
 * 세 가지가 각각 다른 화면에 있어서 부모는 "다음에 뭘 해야 하나" 를 알려면 화면 세 곳을 돌아야 했고,
 * 그래서 놓쳤다. 서버의 타임라인 API 가 이미 셋을 하나의 시간 축으로 합쳐 주는데 앱이 쓰지 않고 있었다.
 *
 * 아이가 여럿이면 아이별로 따로 묻고 한 줄로 합친다. 부모의 할 일은 아이별로 나뉘어 있지 않다.
 */
const UpcomingTasks = (): ReactElement | null => {
  const { data: children } = useMyChildren()

  /*
    아이 수만큼 질의가 필요한데 훅을 반복문으로 부를 수는 없다. useQueries 가 이 경우를 위한 것이다.
    아이가 늘거나 줄어도 훅 호출 규칙을 깨지 않는다.
  */
  const timelines = useQueries({
    queries: (children ?? []).map((child) => ({
      ...childQueries.timeline(child.id),
      enabled: !!getAccessToken(),
      staleTime: 5 * 60 * 1000,
    })),
  })

  if (!getAccessToken() || !children?.length) return null

  const isLoading = timelines.some((query) => query.isLoading)
  if (isLoading) {
    return <div className="h-32 w-full animate-pulse rounded-xl bg-gray-200" aria-hidden />
  }

  const today = new Date()
  const tasks: DatedTask[] = timelines
    .map((query) => query.data as ChildTimeline | undefined)
    .filter((timeline): timeline is ChildTimeline => !!timeline)
    .flatMap((timeline) =>
      timeline.items
        // DONE 은 이미 한 일이고 INFO 는 행동할 것이 없다. 할 일 목록에 섞으면 목록이 길어지기만 한다.
        .filter((item) => item.status === 'OVERDUE' || item.status === 'UPCOMING')
        .map((item) => ({
          ...item,
          childName: timeline.childName,
          dayDiff: differenceInCalendarDays(parseISO(item.date), today),
        }))
        .filter((task) => task.dayDiff <= HORIZON_DAYS),
    )
    .sort(byUrgency)

  if (tasks.length === 0) return null

  const overdueCount = tasks.filter((task) => task.status === 'OVERDUE').length
  const showChildName = children.length > 1

  return (
    <section aria-labelledby="upcoming-tasks-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="upcoming-tasks-heading" className="text-t1-semibold text-gray-900">
          곧 해야 할 일
        </h2>
        {overdueCount > 0 && (
          <span className="text-c1-regular text-red">{`지난 ${overdueCount}건`}</span>
        )}
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {tasks.slice(0, MAX_ITEMS).map((task) => (
          <li
            key={`${task.childName}-${task.type}-${task.date}-${task.title}`}
            className="flex min-h-11 items-center gap-3 px-4 py-3"
          >
            {/*
              D-day 를 왼쪽 고정폭에 둔다. 목록을 훑을 때 눈이 날짜 열만 따라 내려가면 되도록.
            */}
            <span
              className={`text-c1-regular w-16 shrink-0 ${
                task.status === 'OVERDUE' ? 'text-red' : 'text-gray-700'
              }`}
            >
              {formatDDay(task.dayDiff)}
            </span>

            <div className="flex min-w-0 grow flex-col">
              <span className="text-b1-medium truncate text-gray-900">{task.title}</span>
              <span className="text-c1-regular truncate text-gray-700">
                {[
                  TIMELINE_TYPE_LABEL[task.type] ?? task.type,
                  showChildName ? task.childName : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default UpcomingTasks
