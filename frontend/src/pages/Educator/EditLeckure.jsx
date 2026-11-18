
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Video } from 'lucide-react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { setLectureData } from '../../redux/lectureSlice'
import { ClipLoader } from 'react-spinners'

const MAX_VIDEO_SIZE = 100 * 1024 * 1024

function EditLecture() {

  const navigate = useNavigate()
  const { courseId, lectureId } = useParams()

  const { lectureData = [] } = useSelector(state => state.lecture)

  const selectedLecture = lectureData.find(
    lecture => lecture._id === lectureId
  )

  const [lectureTitle, setLectureTitle] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isPreviewFree, setIsPreviewFree] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const dispatch = useDispatch()

  useEffect(() => {
    const loadLectures = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/course/getLecture/${courseId}`,
          { withCredentials: true }
        )

        dispatch(setLectureData(result.data.course.lectures))
      } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.message || "Unable to load lecture")
      } finally {
        setIsLoading(false)
      }
    }

    loadLectures()
  }, [courseId, dispatch])

  const handleEdit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setUploadProgress(0)

    try {

      const formData = new FormData()

      formData.append("lectureTitle", lectureTitle ?? selectedLecture.lectureTitle)

      if (videoUrl) {
        formData.append("videoUrl", videoUrl)
      }

      formData.append(
        "isPreviewFree",
        isPreviewFree ?? Boolean(selectedLecture.isPreviewFree)
      )

      const result = await axios.post(
        `${serverUrl}/api/course/updateLecture/${lectureId}`,
        formData,
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
            }
          }
        }
      )

      if (!result.data.success) {
        return toast.error(result.data.message || "Edit failed")
      }

      const updatedLectureData = lectureData.map(lecture =>
        lecture._id === lectureId ? result.data.lecture : lecture
      )

      dispatch(setLectureData(updatedLectureData))

      toast.success("Lecture updated successfully")

      navigate(`/createLecture/${courseId}`)

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Edit failed")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <ClipLoader color='#2563eb' size={42} />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-100 p-6'>

      <div className='max-w-2xl mx-auto bg-white p-6 rounded-xl shadow'>

        {/* Back Button */}
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-gray-600 hover:text-black mb-6'
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h2 className='text-2xl font-bold mb-6'>
          Edit Lecture
        </h2>

        <form onSubmit={handleEdit} className='space-y-5'>

          {/* Lecture Title */}
          <div>
            <label className='block mb-2 font-medium'>
              Lecture Title
            </label>

            <input
              type='text'
              name='lectureTitle'
              value={lectureTitle ?? selectedLecture?.lectureTitle ?? ''}
              onChange={(e) => setLectureTitle(e.target.value)}
              placeholder='Enter lecture title'
              className='w-full border p-3 rounded-lg outline-none'
            />
          </div>

          {/* Video Upload */}
          <div>
            <label className='block mb-2 font-medium'>
              Upload Lecture Video
            </label>

            <label className='flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-500'>

              <Video size={40} className='text-blue-500 mb-3' />

              <span className='font-medium text-gray-700'>
                Click to upload video
              </span>

              <span className='text-sm text-gray-400 mt-2'>
                MP4, MOV, WEBM
              </span>

              <input
                type='file'
                name='videoUrl'
                accept='video/mp4,video/webm,video/quicktime'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  if (file.size > MAX_VIDEO_SIZE) {
                    setVideoUrl(null)
                    e.target.value = ''
                    toast.error("Video must be 100 MB or smaller")
                    return
                  }

                  setVideoUrl(file)
                  setUploadProgress(0)
                }}
                className='hidden'
              />

            </label>

            {videoUrl && (
              <p className='text-sm text-green-600 mt-2'>
                Selected: {videoUrl.name}
              </p>
            )}
            {isSaving && videoUrl && (
              <p className='text-sm text-blue-600 mt-2'>
                Uploading: {uploadProgress}%
              </p>
            )}
          </div>

          {/* Free Preview */}
          <div className='flex items-center gap-3'>
            <input
              type='checkbox'
              name='isPreviewFree'
              checked={isPreviewFree ?? Boolean(selectedLecture?.isPreviewFree)}
              onChange={(e) => setIsPreviewFree(e.target.checked)}
            />

            <label>Free Preview Lecture</label>
          </div>

          {/* Buttons */}
          <div className='flex gap-4'>

            <button
              type='submit'
              disabled={!selectedLecture || isSaving}
              className='bg-blue-600 text-white px-5 py-3 rounded-lg disabled:opacity-60'
            >
              {isSaving ? 'Updating...' : 'Update Lecture'}
            </button>

            <button
              type='button'
              onClick={() => navigate(-1)}
              className='bg-red-600 text-white px-5 py-3 rounded-lg'
            >
              Cancel
            </button>

          </div>

        </form>

      </div>
    </div>
  )
}

export default EditLecture
