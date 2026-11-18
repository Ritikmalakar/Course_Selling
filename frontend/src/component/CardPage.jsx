import { useSelector } from 'react-redux'
import Card from './Card'

function CardPage() {
  const { courseData, courseStatus, courseError } = useSelector(state => state.course)
  const popularCourses = Array.isArray(courseData) ? courseData.slice(0, 6) : []

  return (
    <section
      id="popular-courses"
      aria-labelledby="popular-courses-heading"
      className="bg-slate-50 px-6 py-16 md:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
            Learn something new
          </p>
          <h1
            id="popular-courses-heading"
            className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl"
          >
            Popular Courses
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Explore expert-led courses and find the skills you need for your next step.
          </p>
        </div>

        {courseStatus === 'loading' ? (
          <p className="mt-8 text-center text-slate-500" role="status">
            Loading courses...
          </p>
        ) : courseStatus === 'failed' ? (
          <p className="mt-8 text-center text-red-600" role="alert">
            {courseError || 'Unable to load courses. Please try again later.'}
          </p>
        ) : popularCourses.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularCourses.map((course, index) => (
              <Card
                key={course._id || `${course.title || 'course'}-${index}`}
                courseId={course._id}
                thumbnail={course.thumbnail}
                title={course.title}
                subTitle={course.subTitle}
                category={course.category}
                level={course.level}
                price={course.price}
                reviews={course.reviews}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="font-semibold text-slate-800" role="status">
              No published courses are available yet.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Only published courses appear here. Educators can publish a course from My Courses by editing it and selecting Publish.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CardPage