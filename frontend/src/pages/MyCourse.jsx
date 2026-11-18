import { useEffect, useState } from 'react'
import axios from 'axios'
import { BookOpen, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../component/Navbar'
import Footer from '../component/Footer'
import { serverUrl } from '../App'
import emptyImage from '../assets/empty.jpg'

function MyCourse() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadCourses = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/course/myCourses`, {
          withCredentials: true,
          signal: controller.signal
        })

        if (!response.data?.success || !Array.isArray(response.data.courses)) {
          throw new Error(response.data?.message || 'Enrolled courses response is invalid')
        }

        setCourses(response.data.courses)
        setStatus('succeeded')
      } catch (requestError) {
        if (controller.signal.aborted) return

        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          'Unable to load your courses'
        )
        setStatus('failed')
      }
    }

    loadCourses()
    return () => controller.abort()
  }, [])

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
            Your learning
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            My courses
          </h1>
          <p className="mt-3 text-slate-600">
            Your enrollments are loaded from your account and stay available after refresh.
          </p>
        </div>

        {status === 'loading' ? (
          <p role="status" className="rounded-2xl bg-white p-10 text-center text-slate-600 shadow-sm">
            Loading your courses...
          </p>
        ) : status === 'failed' ? (
          <p role="alert" className="rounded-2xl bg-white p-10 text-center text-red-600 shadow-sm">
            {error}
          </p>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <BookOpen className="mx-auto text-indigo-500" size={36} />
            <h2 className="mt-4 font-semibold text-slate-800">No enrolled courses yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enroll in a course and it will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/allCourses')}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <article
                key={course._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={course.thumbnail || emptyImage}
                  alt={`${course.title} course cover`}
                  onError={event => {
                    event.currentTarget.src = emptyImage
                  }}
                  className="aspect-video w-full bg-slate-100 object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                    {course.category || 'Course'}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-slate-900">
                    {course.title}
                  </h2>
                  {course.subTitle && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {course.subTitle}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-slate-500">
                    {course.lectures?.length || 0} lessons
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/viewlecture/${course._id}`)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <PlayCircle size={18} />
                    Continue learning
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default MyCourse
