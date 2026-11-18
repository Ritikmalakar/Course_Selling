import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import Navbar from '../component/Navbar'
import Card from '../component/Card'
import Footer from '../component/Footer'

function AllCourse() {
  const navigate = useNavigate()
  const { courseData, courseStatus, courseError } = useSelector(state => state.course)
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])

  const courses = useMemo(
    () => Array.isArray(courseData) ? courseData : [],
    [courseData]
  )
  const categories = useMemo(
    () => [...new Set(courses.map(course => course.category).filter(Boolean))].sort(),
    [courses]
  )

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()

    return courses.filter(course => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(course.category)
      const searchableText = [
        course.title,
        course.subTitle,
        course.description,
        course.category,
        course.level
      ].filter(Boolean).join(' ').toLowerCase()

      return matchesCategory && (!query || searchableText.includes(query))
    })
  }, [courses, search, selectedCategories])

  const toggleCategory = (category) => {
    setSelectedCategories(current =>
      current.includes(category)
        ? current.filter(item => item !== category)
        : [...current, category]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategories([])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-9">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to home
          </button>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
            Find your next skill
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Explore all courses
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Search published courses or narrow the list by category.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <SlidersHorizontal size={19} />
              Filter by category
            </div>

            {categories.length > 0 ? (
              <div className="mt-4 space-y-3">
                {categories.map(category => (
                  <label key={category} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                    <input
                      checked={selectedCategories.includes(category)}
                    type="checkbox"
                        onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Categories will appear when published courses are available.
              </p>
            )}

            {(search || selectedCategories.length > 0) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </aside>

          <section aria-label="Course results">
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={event => event.preventDefault()}
              role="search"
            >
              <label className="relative flex-1">
                <span className="sr-only">Search courses</span>
                <Search
                  aria-hidden="true"
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search by course, topic, or level"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </form>

            <div className="mb-5 mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600" aria-live="polite">
                {courseStatus === 'succeeded'
                  ? `${filteredCourses.length} ${filteredCourses.length === 1 ? 'course' : 'courses'} found`
                  : ' '}
              </p>
              {selectedCategories.length > 0 && (
                <p className="text-sm text-slate-500">
                  {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                </p>
              )}
            </div>

            {courseStatus === 'loading' ? (
              <p className="rounded-2xl bg-white p-10 text-center text-slate-600 shadow-sm" role="status">
                Loading courses...
              </p>
            ) : courseStatus === 'failed' ? (
              <p className="rounded-2xl bg-white p-10 text-center text-red-600 shadow-sm" role="alert">
                {courseError || 'Unable to load courses. Please try again later.'}
              </p>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course, index) => (
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
            ) : courses.length > 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <h2 className="font-semibold text-slate-800">No courses match those filters</h2>
                <p className="mt-2 text-sm text-slate-500">Try another search or clear your filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <h2 className="font-semibold text-slate-800">No published courses yet</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Courses will appear here after an educator publishes them.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AllCourse
