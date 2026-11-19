
import { useEffect, useState } from 'react'
import { PlusCircle, ArrowLeft, Video, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { FaEdit } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../lib/api'
import { toast } from 'react-toastify'
import { setLectureData } from '../../redux/lectureSlice'

function CreateLecture() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [lectureTitle, setLectureTitle] = useState("")
  const [isReordering, setIsReordering] = useState(false)

  const dispatch = useDispatch()
  const { lectureData = [] } = useSelector(state => state.lecture)

  const handleRemoveLecture = async (lectureId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) {
      return
    }

    try {
      const result = await axios.delete(
        `${serverUrl}/api/course/deleteLecture/${lectureId}`,
        { withCredentials: true }
      )

      if (!result.data.success) {
        return toast.error(result.data.message || "Lecture not removed")
      }

      dispatch(setLectureData(lectureData.filter(lecture => lecture._id !== lectureId)))
      toast.success("Lecture removed successfully")
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Lecture not removed")
    }
  }

  const handleMoveLecture = async (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= lectureData.length || isReordering) {
      return
    }

    const reorderedLectures = [...lectureData]
    const lectureToMove = reorderedLectures[index]
    reorderedLectures[index] = reorderedLectures[targetIndex]
    reorderedLectures[targetIndex] = lectureToMove

    setIsReordering(true)
    try {
      const result = await axios.put(
        `${serverUrl}/api/course/reorderLectures/${courseId}`,
        { lectureIds: reorderedLectures.map(lecture => lecture._id) },
        { withCredentials: true }
      )

      if (!result.data.success) {
        return toast.error(result.data.message || "Lecture order not updated")
      }

      dispatch(setLectureData(result.data.lectures))
      toast.success("Lecture order updated")
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Lecture order not updated")
    } finally {
      setIsReordering(false)
    }
  }

  // Create Lecture
  const handleCreateLecture = async () => {
    if (!lectureTitle.trim()) {
      return toast.error("Please enter lecture title")
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/course/createLecture/${courseId}`,
        { lectureTitle },
        { withCredentials: true }
      )

      if (result.data.success) {
        dispatch(setLectureData([...lectureData, result.data.lecture]))

        toast.success("Lecture Added")
        setLectureTitle("")
      }

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Lecture not added")
    }
  }

  // Get All Lectures
  useEffect(() => {
    const getLecture = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/course/getLecture/${courseId}`,
          { withCredentials: true }
        )

        dispatch(setLectureData(result.data.course.lectures))

      } catch (error) {
        console.log(error)
        toast.error("Unable to get lectures")
      }
    }

    getLecture()
  }, [courseId, dispatch])

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-10">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <button
            onClick={() => navigate(`/editCourse/${courseId}`)}
            className="bg-white p-3 rounded-xl shadow hover:bg-gray-50"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Let's Add Lecture
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Add new lectures to your course
            </p>
          </div>

        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-indigo-100 p-3 rounded-xl">
              <Video size={25} className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Lecture Information
              </h2>

              <p className="text-gray-500 text-sm">
                About your lecture summary
              </p>
            </div>

          </div>

          {/* Input */}
          <div className="mb-6">

            <label className="block text-gray-700 font-semibold mb-2">
              Lecture Title
            </label>

            <input
              type="text"
              name="lectureTitle"
              value={lectureTitle}
              placeholder="Enter lecture title"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setLectureTitle(e.target.value)}
            />

          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">

            <button
              onClick={handleCreateLecture}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              <PlusCircle size={20} />
              Create Lecture
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              <ArrowLeft size={18} />
              Back to Course
            </button>

          </div>

        </div>

        {/* All Lectures */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-bold mb-4">
            All Lectures
          </h2>

          {lectureData.length === 0 ? (
            <p className="text-gray-500">
              No lectures added yet.
            </p>
          ) : (

            lectureData.map((lecture, idx) => (

              <div
                key={lecture._id}
                className="flex justify-between items-center border p-4 rounded-lg mb-3"
              >

                <span className="font-medium text-gray-700">
                  {idx + 1}: {lecture.lectureTitle}
                </span>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label={`Move ${lecture.lectureTitle} up`}
                    disabled={idx === 0 || isReordering}
                    className="text-gray-600 hover:text-indigo-600 disabled:opacity-30"
                    onClick={() => handleMoveLecture(idx, -1)}
                  >
                    <ArrowUp size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${lecture.lectureTitle} down`}
                    disabled={idx === lectureData.length - 1 || isReordering}
                    className="text-gray-600 hover:text-indigo-600 disabled:opacity-30"
                    onClick={() => handleMoveLecture(idx, 1)}
                  >
                    <ArrowDown size={20} />
                  </button>
                  <FaEdit
                    className="text-indigo-600 cursor-pointer"
                    size={20}
                    onClick={() => navigate(`/editLecture/${courseId}/${lecture._id}`)}
                  />
                  <button
                    type="button"
                    aria-label={`Delete ${lecture.lectureTitle}`}
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleRemoveLecture(lecture._id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  )
}

export default CreateLecture
