
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Users,
  Star,
  UserRound
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { serverUrl } from '../App'
import emptyImage from '../assets/empty.jpg'
import { setCourseData, setSelectedCourse } from '../redux/courseSlice'
import { setUserData } from '../redux/slice'

function loadRazorpayCheckout() {
  return new Promise(resolve => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => {
      script.remove()
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

function ViewCourse() {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { courseId } = useParams()

  const { courseData, courseError } = useSelector(state => state.course)
  const { userData } = useSelector(state => state.user)

  const [remoteCourse, setRemoteCourse] = useState(null)
  const [remoteResult, setRemoteResult] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  // Review states
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [creatorResult, setCreatorResult] = useState(null)


  const publishedCourse = useMemo(
    () => courseData.find(course => course._id === courseId) || null,
    [courseData, courseId]
  )

  const course = publishedCourse ||
    (remoteResult?.courseId === courseId ? remoteCourse : null)
  const creatorId = course?.creater?._id || course?.creater
  const creatorData = creatorId && creatorResult?.creatorId === creatorId
    ? creatorResult.data
    : null
  const creatorError = creatorId && creatorResult?.creatorId === creatorId
    ? creatorResult.error
    : ''
  const courseReviews = Array.isArray(course?.reviews)
    ? course.reviews.filter(Boolean).sort(
        (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
      )
    : []

  const remoteStatus = remoteResult?.courseId === courseId
    ? remoteResult.status
    : 'loading'

  const enrolledCourseIds = userData?.enrollCourses || []

  const isEnrolled = enrolledCourseIds.some(
    enrolledCourse => (enrolledCourse?._id || enrolledCourse)?.toString() === courseId
  )

  const lectures = Array.isArray(course?.lectures) ? course.lectures : []
  const previewLecture = lectures.find(lecture => lecture.isPreviewFree)
  const coursePrice = Number(course?.price)
  const hasValidPrice = course?.price !== null &&
    course?.price !== '' &&
    Number.isFinite(coursePrice) &&
    coursePrice >= 0
  const isFree = hasValidPrice && coursePrice === 0

  useEffect(() => {
    if (!creatorId) return

    const controller = new AbortController()
    const loadCreator = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/userData/getCreatorById`,
          {
            params: { userId: creatorId },
            signal: controller.signal
          }
        )

        if (!response.data?.success || !response.data.user) {
          throw new Error(response.data?.message || 'Creator profile could not be loaded')
        }

        setCreatorResult({
          creatorId,
          data: response.data.user,
          error: ''
        })
      } catch (error) {
        if (controller.signal.aborted) return
        setCreatorResult({
          creatorId,
          data: null,
          error: error.response?.data?.message || error.message || 'Creator profile could not be loaded'
        })
      }
    }

    loadCreator()
    return () => controller.abort()
  }, [creatorId])
  
  useEffect(() => {
    if (publishedCourse) return

    const controller = new AbortController()

    const loadCourse = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/course/getPublished/${courseId}`,
          { signal: controller.signal }
        )

        if (!response.data?.success || !response.data.course) {
          throw new Error(response.data?.message || 'Course details could not be loaded')
        }

        setRemoteCourse(response.data.course)
        setRemoteResult({ courseId, status: 'succeeded' })

      } catch (error) {
        if (controller.signal.aborted) return

        setRemoteResult({
          courseId,
          status: 'failed',
          error: error.response?.data?.message || error.message || 'Unable to load course'
        })
      }
    }

    loadCourse()

    return () => controller.abort()

  }, [courseId, publishedCourse])

  useEffect(() => {
    if (course) dispatch(setSelectedCourse(course))
  }, [course, dispatch])

  const openLecture = () => {
    const query = previewLecture ? `?lectureId=${previewLecture._id}` : ''
    navigate(`/viewlecture/${courseId}${query}`)
  }

  const handleEnrollment = async () => {
    if (!userData) {
      toast.info('Please log in to enroll in this course')
      navigate('/login')
      return
    }

    if (isEnrolled) {
      navigate(`/viewlecture/${courseId}`)
      return
    }

    if (!hasValidPrice) {
      toast.error('Enrollment is unavailable because this course has no valid price')
      return
    }

    setEnrolling(true)

    try {
      if (isFree) {
        const response = await axios.post(
          `${serverUrl}/api/course/enroll/${courseId}`,
          {},
          { withCredentials: true }
        )

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Unable to enroll in this course')
        }

        const enrolledCourses = userData.enrollCourses || []
        const alreadyInUserState = enrolledCourses.some(
          enrolledCourse => (enrolledCourse?._id || enrolledCourse)?.toString() === courseId
        )
        dispatch(setUserData({
          ...userData,
          enrollCourses: alreadyInUserState ? enrolledCourses : [...enrolledCourses, courseId]
        }))
        toast.success(response.data.message || 'Successfully enrolled in course')
        navigate(`/viewlecture/${courseId}`)
        return
      }

      const checkoutLoaded = await loadRazorpayCheckout()
      if (!checkoutLoaded) {
        throw new Error('Razorpay Checkout could not be loaded. Check your connection and try again.')
      }

      const orderResponse = await axios.post(
        `${serverUrl}/api/order/razorpay-order`,
        { courseId },
        { withCredentials: true }
      )
      const { order, keyId } = orderResponse.data || {}

      if (!orderResponse.data?.success || !order?.id || !keyId) {
        throw new Error(orderResponse.data?.message || 'Unable to start checkout')
      }

      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'LearnHub',
        description: course.title,
        order_id: order.id,
        prefill: {
          name: userData.name || '',
          email: userData.email || ''
        },
        theme: { color: '#4f46e5' },
        handler: async paymentResponse => {
          try {
            const verificationResponse = await axios.post(
              `${serverUrl}/api/order/verifyPayment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              },
              { withCredentials: true }
            )

            if (!verificationResponse.data?.success || !verificationResponse.data.user) {
              throw new Error(
                verificationResponse.data?.message ||
                'Payment could not be verified. Please contact support.'
              )
            }

            dispatch(setUserData(verificationResponse.data.user))
            toast.success('Payment successful. You are enrolled in the course.')
            navigate(`/viewlecture/${courseId}`)
          } catch (error) {
            const paymentId = paymentResponse.razorpay_payment_id
            toast.error(
              error.response?.data?.message ||
              `Payment could not be verified. Contact support with payment ID ${paymentId}.`
            )
          } finally {
            setEnrolling(false)
          }
        },
        modal: {
          ondismiss: () => setEnrolling(false)
        }
      })

      checkout.on('payment.failed', event => {
        toast.error(event.error?.description || 'Payment failed. Please try again.')
        setEnrolling(false)
      })
      checkout.open()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to enroll in this course')
      setEnrolling(false)
    }
  }

  // Submit Review
  const handleReviewSubmit = async () => {

    if (!userData) {
      toast.info('Please login to submit review')
      navigate('/login')
      return
    }

    if (!isEnrolled) {
      toast.info('Please enroll in this course first')
      return
    }

    if (!rating) {
      toast.error('Please select star rating')
      return
    }

    if (!review.trim()) {
      toast.error('Please write your review')
      return
    }

    setReviewSubmitting(true)
    try {
      const response = await axios.post(
        `${serverUrl}/api/course/${courseId}/reviews`,
        { rating, comment: review.trim() },
        { withCredentials: true }
      )

      if (!response.data?.success || !response.data.review) {
        throw new Error(response.data?.message || 'Unable to save your review')
      }

      const savedReview = response.data.review
      const existingReviewIndex = (course.reviews || []).findIndex(
        item => item && (item.user?._id || item.user)?.toString() === userData._id.toString()
      )
      const updatedReviews = (course.reviews || []).filter(Boolean)

      if (existingReviewIndex >= 0) {
        updatedReviews[existingReviewIndex] = savedReview
      } else {
        updatedReviews.push(savedReview)
      }

      const updatedCourse = { ...course, reviews: updatedReviews }
      dispatch(setCourseData(courseData.map(item =>
        item._id === courseId ? updatedCourse : item
      )))
      dispatch(setSelectedCourse(updatedCourse))
      setRemoteCourse(current => current?._id === courseId ? updatedCourse : current)
      setReview('')
      setRating(0)
      toast.success(response.data.message || 'Review saved successfully')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Unable to save your review'
      )
    } finally {
      setReviewSubmitting(false)
    }
  }

  const formatPrice = price => {
    if (price === null || price === undefined || price === '') return 'Price unavailable'
    const amount = Number(price)

    if (!Number.isFinite(amount) || amount < 0) return 'Price unavailable'
    if (amount === 0) return 'Free'

    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}`
  }

  const status = course ? 'succeeded' : publishedCourse ? 'succeeded' : remoteStatus

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <span className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
            <GraduationCap size={20} />
            LearnHub
          </span>

        </div>
      </header>

      {status === 'loading' ? (

        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="rounded-2xl bg-white p-8 text-slate-600 shadow-sm">
            Loading course details...
          </p>
        </div>

      ) : status === 'failed' ? (

        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm">

            <h1 className="text-xl font-bold">Course unavailable</h1>

            <p className="mt-2 text-red-600">
              {remoteResult?.courseId === courseId
                ? remoteResult.error
                : courseError || 'Unable to load this course.'}
            </p>

            <button
              type="button"
              onClick={() => navigate('/allCourses')}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white"
            >
              Browse courses
            </button>

          </div>
        </div>

      ) : !course ? (

        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

            <h1 className="text-xl font-bold">Course not found</h1>

            <button
              type="button"
              onClick={() => navigate('/allCourses')}
              className="mt-5 font-semibold text-indigo-700"
            >
              Browse all courses
            </button>

          </div>
        </div>

      ) : (

        <>

          <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">

              <div className="max-w-3xl">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-indigo-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-200">
                    {course.category || 'General'}
                  </span>

                  {course.level && (
                    <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200">
                      {course.level}
                    </span>
                  )}

                </div>

                <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                  {course.title}
                </h1>

                {course.subTitle && (
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                    {course.subTitle}
                  </p>
                )}

                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">

                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-300" />
                    {lectures.length} {lectures.length === 1 ? 'lesson' : 'lessons'}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Users size={18} className="text-indigo-300" />
                    {course.enrolledStudents?.length || 0} learners
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-300" />
                    Learn at your own pace
                  </span>

                </div>

              </div>

              <aside className="h-fit overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl">

                <div className="relative aspect-video bg-slate-100">

                  <img
                    src={course.thumbnail || emptyImage}
                    alt={`${course.title} course cover`}
                    onError={event => {
                      event.currentTarget.src = emptyImage
                    }}
                    className="h-full w-full object-cover"
                  />

                  {previewLecture && (
                    <button
                      type="button"
                      onClick={openLecture}
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/25 text-white transition hover:bg-slate-950/40"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-indigo-700 shadow-lg">
                        <PlayCircle size={34} />
                      </span>
                    </button>
                  )}

                </div>

                <div className="p-5 sm:p-6">

                  <p className="text-3xl font-extrabold text-slate-950">
                    {formatPrice(course.price)}
                  </p>

                  <button
                    type="button"
                    onClick={handleEnrollment}
                    disabled={enrolling || (!isEnrolled && !hasValidPrice)}
                    className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enrolling
                      ? 'Processing...'
                      : isEnrolled
                        ? 'Continue learning'
                        : isFree
                          ? 'Enroll for free'
                          : 'Enroll now'}
                  </button>

                  {previewLecture && (
                    <button
                      type="button"
                      onClick={openLecture}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                    >
                      <PlayCircle size={18} />
                      Preview a lesson
                    </button>
                  )}

                  <ul className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">

                    <li className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      {lectures.length} on-demand lessons
                    </li>

                    <li className="flex items-center gap-3">
                      <Clock3 size={18} className="text-emerald-600" />
                      Learn on your schedule
                    </li>

                    <li className="flex items-center gap-3">
                      <LockKeyhole size={18} className="text-emerald-600" />
                      Course access after enrollment
                    </li>

                  </ul>

                </div>

              </aside>

            </div>

          </section>

          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:py-14">

            <article className="min-w-0">

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <h2 className="text-2xl font-bold text-slate-900">
                  About this course
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                  {course.description || 'Course description will be available soon.'}
                </p>

              </section>

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-end justify-between gap-4">

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Course content
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {lectures.length} {lectures.length === 1 ? 'lesson' : 'lessons'}
                    </p>
                  </div>

                </div>

                {lectures.length ? (

                  <ol className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">

                    {lectures.map((lecture, index) => (

                      <li key={lecture._id || index} className="flex items-center gap-4 p-4">

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                          {index + 1}
                        </span>

                        <span className="min-w-0 flex-1">

                          <span className="block font-semibold text-slate-800">
                            {lecture.lectureTitle || `Lesson ${index + 1}`}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {lecture.isPreviewFree ? 'Free preview' : 'Included with enrollment'}
                          </span>

                        </span>

                        {lecture.isPreviewFree ? (

                          <button
                            type="button"
                            onClick={() => navigate(`/viewlecture/${courseId}?lectureId=${lecture._id}`)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                          >
                            <PlayCircle size={17} />
                            Preview
                          </button>

                        ) : (

                          <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                        )}

                      </li>

                    ))}

                  </ol>

                ) : (

                  <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                    Lessons for this course are coming soon.
                  </p>

                )}

              </section>

              {/* Star Rating and Review */}

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <h2 className="text-2xl font-bold text-slate-900">
                  Student Reviews
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Share your experience with this course.
                </p>

                {/* Star Rating */}

                <div className="mt-5">

                  <h3 className="font-semibold text-slate-800">
                    Rate this course
                  </h3>

                  <div className="mt-3 flex gap-2">

                    {[1, 2, 3, 4, 5].map((star) => (

                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                      >
                        <Star
                          size={32}
                          className={
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }
                        />
                      </button>

                    ))}

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {rating > 0 ? `${rating} out of 5 stars` : 'Select your rating'}
                  </p>

                </div>

                {/* Review Textarea */}

                <div className="mt-5">

                  <label className="font-semibold text-slate-800">
                    Write your review
                  </label>

                  <textarea
                    id="course-review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your experience here..."
                    rows={4}
                    maxLength={1000}
                    className="mt-3 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-500"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">
                    {review.length}/1000
                  </p>

                </div>

                {/* Submit Button */}

                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting || !rating || !review.trim()}
                  className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Saving review...' : 'Submit Review'}
                </button>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Reviews ({courseReviews.length})
                  </h3>
                  {courseReviews.length ? (
                    <ul className="mt-4 space-y-4">
                      {courseReviews.map((courseReview, index) => (
                        <li
                          key={courseReview._id || `${courseReview.user?._id || 'review'}-${index}`}
                          className="rounded-xl bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {courseReview.user?.name || 'Student'}
                              </p>
                              <div className="mt-1 flex gap-0.5" aria-label={`${courseReview.rating} out of 5 stars`}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    size={15}
                                    className={star <= courseReview.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'}
                                  />
                                ))}
                              </div>
                            </div>
                            {courseReview.createdAt && (
                              <time
                                dateTime={courseReview.createdAt}
                                className="shrink-0 text-xs text-slate-500"
                              >
                                {new Intl.DateTimeFormat('en', {
                                  dateStyle: 'medium'
                                }).format(new Date(courseReview.createdAt))}
                              </time>
                            )}
                          </div>
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                            {courseReview.comment}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      No reviews yet. Enroll and share your experience.
                    </p>
                  )}
                </div>

              </section>

            </article>

            <aside className="h-fit rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6">

              <h2 className="text-lg font-bold text-slate-900">
                What you&apos;ll learn
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">

                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-indigo-600" />
                  Build practical knowledge in {course.category || 'this subject'}.
                </li>

                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-indigo-600" />
                  Follow structured lessons at your own pace.
                </li>

                {course.level && (
                  <li className="flex gap-3">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-indigo-600" />
                    Study content designed for {course.level.toLowerCase()} learners.
                  </li>
                )}

              </ul>

              <div className="mt-7 border-t border-indigo-100 pt-6">
                <h2 className="text-lg font-bold text-slate-900">Course creator</h2>
                {!creatorId ? (
                  <p role="status" className="mt-3 text-sm text-slate-600">
                    Creator information is unavailable.
                  </p>
                ) : creatorData ? (
                  <div className="mt-4 flex items-start gap-3">
                    {creatorData.photoUrl ? (
                      <img
                        src={creatorData.photoUrl}
                        alt={`${creatorData.name || 'Course creator'} profile`}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                        {creatorData.name?.charAt(0)?.toUpperCase() || <UserRound size={20} />}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {creatorData.name || 'Course creator'}
                      </p>
                      <p className="mt-0.5 text-xs font-medium capitalize text-indigo-700">
                        {creatorData.role || 'Educator'}
                      </p>
                      {creatorData.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {creatorData.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : creatorError ? (
                  <p role="status" className="mt-3 text-sm text-slate-600">
                    Creator profile is currently unavailable.
                  </p>
                ) : (
                  <p role="status" className="mt-3 text-sm text-slate-500">
                    Loading creator profile...
                  </p>
                )}
              </div>

            </aside>

          </div>

        </>

      )}

    </main>
  )
}

export default ViewCourse
