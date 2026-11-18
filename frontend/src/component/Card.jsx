
import { Link, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import emptyImage from '../assets/empty.jpg'

function Card({ courseId, thumbnail, title, subTitle, category, level, price, reviews = [] }) {

  const navigate = useNavigate()

  const numericPrice =
    price === null || price === undefined || price === ''
      ? null
      : Number(price)

  const formattedPrice =
    numericPrice !== null && Number.isFinite(numericPrice) && numericPrice >= 0
      ? numericPrice === 0
        ? 'Free'
        : `₹${new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
          }).format(numericPrice)}`
      : 'Price not set'

  const courseReviews = Array.isArray(reviews)
    ? reviews.filter(review => review && Number.isFinite(Number(review.rating)))
    : []
  const reviewCount = courseReviews.length
  const averageRating = reviewCount
    ? courseReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviewCount
    : 0
  const latestReview = courseReviews
    .filter(review => typeof review.comment === 'string' && review.comment.trim())
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))[0]

  const cardContent = (
    <>
      {/* Thumbnail */}
      <div
        className="aspect-video overflow-hidden bg-slate-100"
        onClick={() => navigate(`/viewcourse/${courseId}`)}
      >
        <img
          src={thumbnail || emptyImage}
          alt={title || 'Course thumbnail'}
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.dataset.fallback !== 'true') {
              event.currentTarget.dataset.fallback = 'true'
              event.currentTarget.src = emptyImage
            }
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Course Details */}
      <div className="flex flex-1 flex-col p-5">

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {category || 'General'}
          </span>

          {level && (
            <span className="text-xs font-medium text-slate-500">
              {level}
            </span>
          )}
        </div>

        <h2 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">
          {title || 'Untitled course'}
        </h2>

        {subTitle && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {subTitle}
          </p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Star size={16} className={reviewCount ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
            <span className="font-bold text-slate-800">
              {reviewCount ? averageRating.toFixed(1) : 'New'}
            </span>
            <span className="text-slate-500">
              {reviewCount
                ? `(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
                : 'No reviews yet'}
            </span>
          </div>
          {latestReview && (
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
              “{latestReview.comment}”
              {latestReview.user?.name && (
                <span className="ml-1 font-semibold text-slate-700">
                  — {latestReview.user.name}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-lg font-bold text-indigo-700">
            {formattedPrice}
          </span>

          <span className="text-sm font-semibold text-indigo-600">
            View course →
          </span>
        </div>

      </div>
    </>
  )

  const className =
    'group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left no-underline shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2'

  return (
    <Link to={`/viewcourse/${courseId}`} className={className}>
      {cardContent}
    </Link>
  )
}

export default Card
