import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import { serverUrl } from '../App'
import img from '../assets/empty.jpg'

function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchCourse = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/course/getCourseById/${courseId}`,
          { withCredentials: true }
        )

        if (!cancelled) {
          setCourse(result.data.course)
          setError('')
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.response?.data?.message || 'Unable to load course details')
        }
      }
    }

    fetchCourse()

    return () => {
      cancelled = true
    }
  }, [courseId])

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </button>

        {error ? (
          <p role="alert" className="bg-white rounded-2xl p-8 text-red-600 shadow-md">
            {error}
          </p>
        ) : course ? (
          <article className="bg-white rounded-2xl shadow-md overflow-hidden">
            <img
              src={course.thumbnail || img}
              alt={course.title}
              className="w-full max-h-96 object-cover"
            />
            <div className="p-6 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-indigo-600 font-semibold">{course.category}</p>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mt-3">{course.title}</h1>
              {course.subTitle && (
                <p className="text-lg text-gray-600 mt-2">{course.subTitle}</p>
              )}
              {course.level && (
                <p className="text-gray-500 mt-4">Level: {course.level}</p>
              )}
              <p className="text-2xl font-bold text-gray-800 mt-5">
                {course.price != null ? `₹${course.price}` : 'Price not set'}
              </p>
              <div className="border-t mt-6 pt-6">
                <h2 className="text-xl font-semibold text-gray-800">About this course</h2>
                <p className="text-gray-600 leading-7 mt-3 whitespace-pre-wrap">
                  {course.description || 'No description available.'}
                </p>
              </div>
            </div>
          </article>
        ) : (
          <p className="bg-white rounded-2xl p-8 text-gray-600 shadow-md" role="status">
            Loading course details...
          </p>
        )}
      </div>
    </main>
  )
}

export default CourseDetail
