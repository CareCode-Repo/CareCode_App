'use client'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement, useEffect, useState } from 'react'
import { getAccessToken, getUserId } from '@/apis/auth'
import { postFacilityView } from '@/apis/facility'
import StarIcon from '@/assets/icons/star_small.svg'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import DescriptionItem from '@/components/common/DescriptionItem'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Separator from '@/components/common/Separator'
import AdmissionInsight from '@/components/features/facility/AdmissionInsight'
import BookingDialog from '@/components/features/facility/BookingDialog'
import ReviewForm from '@/components/features/facility/ReviewForm'
import ReviewItem from '@/components/features/facility/ReviewItem'
import WaitlistDialog from '@/components/features/facility/WaitlistDialog'
import {
  useCreateBooking,
  useCreateFacilityReview,
  useDeleteFacilityReview,
  useUpdateFacilityReview,
  useFacilityDetail,
  useFacilityReviews,
} from '@/queries/facility'
import { useRegisterWaitlist } from '@/queries/waitlist'
import { FACILITY_TYPE_LABEL, FacilityType, PostFacilityBookBody } from '@/types/apis/facility'

const FacilityDetailPage = (): ReactElement => {
  const params = useParams<{ id: string }>()
  const facilityId = Number(params?.id)
  const router = useRouter()

  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingDone, setBookingDone] = useState(false)
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)

  const { data: facility, isLoading, isError, refetch } = useFacilityDetail(facilityId)
  const { data: reviews = [], isLoading: isReviewLoading } = useFacilityReviews(facilityId)
  const { mutate: createReview, isPending: isReviewPending } = useCreateFacilityReview(facilityId)
  const { mutate: updateReview, isPending: isUpdatingReview } = useUpdateFacilityReview(facilityId)
  const { mutate: removeReview } = useDeleteFacilityReview(facilityId)
  const {
    mutate: createBooking,
    isPending: isBookingPending,
    isError: isBookingError,
  } = useCreateBooking(facilityId)
  const {
    mutate: registerWaitlist,
    isPending: isWaitlistPending,
    isError: isWaitlistError,
  } = useRegisterWaitlist(facilityId)

  // 조회수 집계. 실패해도 화면에는 영향을 주지 않는다.
  useEffect(() => {
    if (!Number.isFinite(facilityId) || facilityId <= 0) return
    postFacilityView(facilityId).catch(() => undefined)
  }, [facilityId])

  const handleBooking = (body: PostFacilityBookBody) => {
    createBooking(body, {
      onSuccess: () => {
        setBookingOpen(false)
        setBookingDone(true)
      },
    })
  }

  const requireLogin = (action: () => void) => {
    if (!getAccessToken()) {
      router.push('/')
      return
    }
    action()
  }

  if (isError) {
    return (
      <Layout hasTopNav hasBackButton title="시설 정보">
        <ErrorView content="시설 정보를 불러오지 못했어요." onRetry={() => refetch()} />
      </Layout>
    )
  }

  const typeLabel = facility?.facilityType
    ? (FACILITY_TYPE_LABEL[facility.facilityType as FacilityType] ?? facility.facilityType)
    : null

  return (
    <Layout hasTopNav hasBackButton title={facility?.name ?? '시설 정보'}>
      {isLoading ? (
        <div className="flex flex-col gap-3 p-4.5">
          <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-40 animate-pulse rounded-lg bg-gray-200" />
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-3 bg-white px-4.5 py-5">
            <div className="flex items-center gap-2">
              {typeLabel && <Chip color="blue">{typeLabel}</Chip>}
              <h1 className="text-t1-semibold text-gray-900">{facility?.name}</h1>
            </div>

            <div className="text-b1-regular flex items-center gap-2 text-gray-700">
              <StarIcon className="fill-yellow size-4" aria-hidden />
              <span>{facility?.rating != null ? facility.rating.toFixed(1) : '평점 없음'}</span>
              <span className="text-gray-400">·</span>
              <span>{`리뷰 ${facility?.reviewCount ?? 0}개`}</span>
            </div>

            <dl className="flex flex-col gap-1.5">
              {facility?.address && <DescriptionItem title="주소" content={facility.address} />}
              {facility?.phoneNumber && (
                <DescriptionItem title="전화" content={facility.phoneNumber} />
              )}
              {facility?.operatingHours && (
                <DescriptionItem title="운영" content={facility.operatingHours} />
              )}
              {facility?.website && <DescriptionItem title="홈페이지" content={facility.website} />}
            </dl>

            {facility?.description && (
              <p className="text-b1-regular whitespace-pre-line text-gray-700">
                {facility.description}
              </p>
            )}

            {!!facility?.amenities?.length && (
              <div className="flex flex-wrap gap-2 pt-1">
                {facility.amenities.map((amenity) => (
                  <Chip key={amenity} color="white">
                    {amenity}
                  </Chip>
                ))}
              </div>
            )}
          </section>

          <Separator />

          <div className="px-4.5 py-5">
            <AdmissionInsight facilityId={facilityId} />
          </div>

          <Separator />

          <section className="flex flex-col gap-4 px-4.5 py-5">
            <h2 className="text-b1-semibold text-gray-800">{`리뷰 ${reviews.length}`}</h2>

            {isReviewLoading ? (
              <div className="h-20 animate-pulse rounded-lg bg-gray-200" />
            ) : !reviews.length ? (
              <EmptyState
                title="아직 리뷰가 없어요"
                description="첫 번째 리뷰를 남겨 다른 부모님께 도움을 주세요."
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {reviews.map((review) => {
                  // 본인 리뷰에만 수정·삭제를 준다. 실제 통제는 서버가 한다.
                  // 시설 리뷰의 userId 는 업무 식별자다 (CareFacilityService: getUser().getUserId()).
                  // 병원 리뷰·커뮤니티와 달리 DB id 가 아니므로 여기서는 getUserId() 가 맞다.
                  const isMine = !!review.userId && review.userId === getUserId()

                  return (
                    <ReviewItem
                      key={review.reviewId}
                      rating={review.rating}
                      content={review.content}
                      createdAt={review.createdAt}
                      isSaving={isUpdatingReview}
                      onEdit={
                        isMine
                          ? (body) => updateReview({ reviewId: review.reviewId, body })
                          : undefined
                      }
                      onDelete={isMine ? () => removeReview(review.reviewId) : undefined}
                    />
                  )
                })}
              </ul>
            )}

            <ReviewForm
              isPending={isReviewPending}
              onSubmit={(body) => requireLogin(() => createReview(body))}
            />
          </section>

          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-gray-200 bg-white p-4">
            {bookingDone ? (
              <p className="text-b1-semibold py-2 text-center text-green-700">
                예약 신청이 접수됐어요. 시설 확인 후 알림으로 안내됩니다.
              </p>
            ) : (
              <Button color="green" onClick={() => requireLogin(() => setBookingOpen(true))}>
                방문 예약하기
              </Button>
            )}

            {waitlistDone ? (
              <p className="text-b2-regular text-center text-gray-600">
                대기를 기록했어요. 결과는 마이페이지 &gt; 내 대기에서 남겨주세요.
              </p>
            ) : (
              <Button color="gray" onClick={() => requireLogin(() => setWaitlistOpen(true))}>
                대기 기록하기
              </Button>
            )}
          </div>

          <BookingDialog
            isOpen={bookingOpen}
            facilityName={facility?.name ?? ''}
            isPending={isBookingPending}
            errorMessage={
              isBookingError ? '예약 신청에 실패했어요. 잠시 후 다시 시도해주세요.' : undefined
            }
            onClose={() => setBookingOpen(false)}
            onSubmit={handleBooking}
          />

          <WaitlistDialog
            isOpen={waitlistOpen}
            facilityName={facility?.name ?? ''}
            isPending={isWaitlistPending}
            isError={isWaitlistError}
            onClose={() => setWaitlistOpen(false)}
            onSubmit={(body) =>
              registerWaitlist(body, {
                onSuccess: () => {
                  setWaitlistOpen(false)
                  setWaitlistDone(true)
                },
              })
            }
          />
        </>
      )}
    </Layout>
  )
}

export default FacilityDetailPage
