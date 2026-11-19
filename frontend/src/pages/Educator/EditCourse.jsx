
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import axios from 'axios'

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Upload,
  Video
} from 'lucide-react'

import { serverUrl } from '../../lib/api'

import {
  setCourseData as setPublishedCourseData,
  setCreateCourseData
} from '../../redux/courseSlice'

import img from '../../assets/empty.jpg'

const categories = [
  'Web Development',
  'UI/UX Development',
  'App Development',
  'Ethical Hacking',
  'AI & ML',
  'Data Science',
  'Data Analytics',
  'AI Tools',
  'Others'
]

function EditCourse() {

  const navigate = useNavigate()
  const { courseId } = useParams()
  const dispatch = useDispatch()

  const {
    creatorCourseData,
    courseData: publishedCourseData
  } = useSelector(state => state.course)

  const [courseData, setCourseData] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // GET COURSE DATA
  useEffect(() => {

    let cancelled = false

    const fetchCourse = async () => {

      try {

        const result = await axios.get(
          `${serverUrl}/api/course/getCourseById/${courseId}`,
          { withCredentials: true }
        )

        if (cancelled) return

        const course = result.data.course

        setCourseData({
          title: course.title || '',
          subTitle: course.subTitle || '',
          description: course.description || '',
          category: course.category || '',
          level: course.level || '',
          price: course.price ?? '',
          isPublished: Boolean(course.isPublished),
          thumbnailUrl: course.thumbnail || ''
        })

        setPreview(course.thumbnail || '')
        setError('')

      } catch (error) {

        if (!cancelled) {
          setError(
            error.response?.data?.message ||
            'Unable to load course'
          )
        }

      } finally {

        if (!cancelled) {
          setLoading(false)
        }

      }
    }

    fetchCourse()

    return () => {
      cancelled = true
    }

  }, [courseId])


  // HANDLE INPUT CHANGE
  const handleChange = (event) => {

    const { name, value } = event.target

    setCourseData(current => ({
      ...current,
      [name]: value
    }))

  }


  // HANDLE THUMBNAIL CHANGE
  const handleThumbnailChange = (event) => {

    const file = event.target.files?.[0]

    if (!file) return

    setThumbnail(file)
    setPreview(URL.createObjectURL(file))

  }


  // UPDATE COURSE
  const handleSubmit = async (event) => {

    event.preventDefault()

    if (!courseData) return

    const formData = new FormData()

    formData.append('title', courseData.title.trim())
    formData.append('subTitle', courseData.subTitle)
    formData.append('description', courseData.description)
    formData.append('category', courseData.category)
    formData.append('level', courseData.level)
    formData.append('price', courseData.price)
    formData.append(
      'isPublished',
      String(courseData.isPublished)
    )

    if (thumbnail) {
      formData.append('thumbnail', thumbnail)
    }

    try {

      setSaving(true)

      const result = await axios.post(
        `${serverUrl}/api/course/editCourse/${courseId}`,
        formData,
        { withCredentials: true }
      )

      const updatedCourse = result.data.course

      // UPDATE REDUX
      dispatch(
        setCreateCourseData(
          (creatorCourseData || []).map(course =>
            course._id === courseId
              ? updatedCourse
              : course
          )
        )
      )

      dispatch(
        setPublishedCourseData(
          updatedCourse.isPublished
            ? [
                updatedCourse,
                ...(publishedCourseData || []).filter(
                  course => course._id !== courseId
                )
              ]
            : (publishedCourseData || []).filter(
                course => course._id !== courseId
              )
        )
      )

      toast.success(
        result.data.message || 'Course updated successfully'
      )

      navigate('/courses')

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Course update failed'
      )

    } finally {

      setSaving(false)

    }

  }


  // DELETE COURSE
  const handleDelete = async () => {

    if (!window.confirm(
      'Are you sure you want to delete this course?'
    )) return

    try {

      setDeleting(true)

      const result = await axios.delete(
        `${serverUrl}/api/course/removeCourse/${courseId}`,
        { withCredentials: true }
      )

      dispatch(
        setCreateCourseData(
          (creatorCourseData || []).filter(
            course => course._id !== courseId
          )
        )
      )

      dispatch(
        setPublishedCourseData(
          (publishedCourseData || []).filter(
            course => course._id !== courseId
          )
        )
      )

      toast.success(
        result.data.message || 'Course deleted successfully'
      )

      navigate('/courses')

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Course deletion failed'
      )

    } finally {

      setDeleting(false)

    }

  }


  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Loading course...
        </p>
      </div>
    )

  }


  // ERROR
  if (error || !courseData) {

    return (
      <main className="min-h-screen bg-gray-100 p-5 md:p-10">

        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-md">

          <p className="text-red-600">
            {error || 'Course not found'}
          </p>

          <button
            onClick={() => navigate('/courses')}
            className="mt-5 text-indigo-600 font-semibold"
          >
            Back to Courses
          </button>

        </div>

      </main>
    )

  }


  return (

    <main className="min-h-screen bg-gray-100 p-5 md:p-10">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="flex items-center gap-3 text-left"
          >

            <span className="bg-white p-3 rounded-xl shadow">
              <ArrowLeft size={22} />
            </span>

            <span>
              <span className="block text-2xl font-bold text-gray-800">
                Edit Course
              </span>

              <span className="block text-gray-500 text-sm mt-1">
                Update your course details
              </span>
            </span>

          </button>

          <button
            type="button"
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700"
          >
            <Eye size={20} />
            Preview Course
          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-6 md:p-8"
        >

          {/* TOP SECTION */}

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                Course Information
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Edit details and save your changes
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              {/* PUBLISH BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setCourseData(current => ({
                    ...current,
                    isPublished: !current.isPublished
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  courseData.isPublished
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >

                {courseData.isPublished
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }

                {courseData.isPublished
                  ? 'Unpublish'
                  : 'Publish'
                }

              </button>


              {/* DELETE BUTTON */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
              >

                <Trash2 size={18} />

                {deleting
                  ? 'Removing...'
                  : 'Remove Course'
                }

              </button>

            </div>

          </div>


          {/* COURSE FIELDS */}

          <div className="space-y-6">

            {/* TITLE */}

            <div>

              <label className="block font-semibold text-gray-700 mb-2">
                Course Title
              </label>

              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500"
              />

            </div>


            {/* SUBTITLE */}

            <div>

              <label className="block font-semibold text-gray-700 mb-2">
                Course Subtitle
              </label>

              <input
                type="text"
                name="subTitle"
                value={courseData.subTitle}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500"
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="block font-semibold text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={courseData.description}
                onChange={handleChange}
                rows="5"
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 resize-y"
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label className="block font-semibold text-gray-700 mb-2">
                Category
              </label>

              <select
                name="category"
                value={courseData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500"
              >

                <option value="">
                  Select Category
                </option>

                {!categories.includes(courseData.category) &&
                  courseData.category && (
                    <option value={courseData.category}>
                      {courseData.category}
                    </option>
                  )
                }

                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}

              </select>

            </div>


            {/* LEVEL AND PRICE */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Course Level
                </label>

                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500"
                >

                  <option value="">
                    Select Level
                  </option>

                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>

                </select>

              </div>


              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Course Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  step="any"
                  value={courseData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500"
                />

              </div>

            </div>


            {/* THUMBNAIL */}

            <div>

              <label className="block font-semibold text-gray-700 mb-2">
                Course Thumbnail
              </label>

              <label
                htmlFor="thumbnail"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-500"
              >

                <Upload size={24} className="text-gray-400 mb-3" />

                <img
                  src={preview || img}
                  alt="Course thumbnail preview"
                  className="w-48 h-32 object-cover rounded-lg mb-3"
                />

                <span className="text-gray-600 font-medium">
                  Choose a new thumbnail (PNG, JPG, WEBP)
                </span>

                <input
                  id="thumbnail"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                  className="sr-only"
                />

              </label>

            </div>

          </div>


          {/* BOTTOM BUTTONS */}

          <div className="flex flex-wrap justify-end gap-3 mt-8">

            {/* CANCEL */}

            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>


            {/* GO TO LECTURE PAGE */}

            <button
              type="button"
              onClick={() => navigate(`/createLecture/${courseId}`)}
              className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-200"
            >

              <Video size={18} />

              Go to Lecture Page

            </button>


            {/* SAVE */}

            <button
              type="submit"
              disabled={saving || deleting}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >

              <Save size={18} />

              {saving
                ? 'Saving...'
                : 'Save Changes'
              }

            </button>

          </div>

        </form>

      </div>

    </main>

  )

}

export default EditCourse
