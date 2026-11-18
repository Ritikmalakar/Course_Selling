import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, BookOpen, LockKeyhole, PlayCircle } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'

function ViewLecture() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const requestedLectureId = searchParams.get('lectureId')
  const [course, setCourse] = useState(null)
  const [selectedLecture, setSelectedLecture] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [videoError, setVideoError] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const loadCourse = async () => {
      try {
        let response
        let previewMode = false

        try {
          response = await axios.get(
            `${serverUrl}/api/course/learn/${courseId}`,
            {
              withCredentials: true,
              signal: controller.signal
            }
          )
        } catch (requestError) {
          if (![401, 403].includes(requestError.response?.status)) {
            throw requestError
          }

          response = await axios.get(
            `${serverUrl}/api/course/previews/${courseId}`,
            { signal: controller.signal }
          )
          previewMode = true
        }

        if (!response.data?.success || !response.data.course) {
          throw new Error(response.data?.message || 'Course content response is invalid')
        }

        const lectures = Array.isArray(response.data.course.lectures)
          ? response.data.course.lectures
          : []

        setCourse(response.data.course)
        const requestedLecture = lectures.find(
          lecture => lecture._id === requestedLectureId
        )
        setSelectedLecture(
          requestedLecture ||
          lectures.find(lecture => lecture.videoUrl) ||
          lectures[0] ||
          null
        )
        setIsPreviewMode(previewMode)
        setStatus('succeeded')
      } catch (requestError) {
        if (controller.signal.aborted) return

        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          'Unable to load course videos'
        )
        setStatus(requestError.response?.status === 401 ? 'unauthorized' : 'failed')
      }
    }

    loadCourse()
    return () => controller.abort()
  }, [courseId, requestedLectureId])

  const selectLecture = (lecture) => {
    if (isPreviewMode && !lecture.isPreviewFree) {
      toast.info('Enroll in this course to unlock this lecture')
      navigate(`/viewCourse/${courseId}`)
      return
    }

    setSelectedLecture(lecture)
    setVideoError(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(`/viewCourse/${courseId}`)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-2 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft size={19} />
          Back to course
        </button>

        {status === 'loading' ? (
          <p role="status" className="rounded-2xl bg-slate-900 p-8 text-slate-300">
            Loading course videos...
          </p>
        ) : status === 'unauthorized' ? (
          <div role="alert" className="rounded-2xl bg-slate-900 p-8">
            <p className="text-red-300">Please log in to watch this course.</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500"
            >
              Log in
            </button>
          </div>
        ) : status === 'failed' ? (
          <p role="alert" className="rounded-2xl bg-slate-900 p-8 text-red-300">
            {error}
          </p>
        ) : (
          <>
            <header className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
                Course player
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                {course.title}
              </h1>
              {course.subTitle && (
                <p className="mt-2 text-slate-400">{course.subTitle}</p>
              )}
            </header>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="min-w-0">
                <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
                  {isPreviewMode && selectedLecture && !selectedLecture.isPreviewFree ? (
                    <div className="flex aspect-video flex-col items-center justify-center gap-4 p-6 text-center text-slate-300">
                      <LockKeyhole size={42} className="text-amber-400" />
                      <div>
                        <p className="font-semibold text-white">This lecture is locked</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Enroll in the course to watch this lecture.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/viewCourse/${courseId}`)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
                      >
                        View enrollment options
                      </button>
                    </div>
                  ) : selectedLecture?.videoUrl && !videoError ? (
                    <video
                      key={selectedLecture._id}
                      src={selectedLecture.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      onError={() => setVideoError(true)}
                      className="aspect-video w-full"
                    >
                      Your browser does not support HTML video.
                    </video>
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center text-slate-300">
                      <PlayCircle size={42} className="text-indigo-400" />
                      <p>
                        {videoError
                          ? 'This video could not be played. Try another lecture or contact the course creator.'
                          : 'No video has been uploaded for this lecture yet.'}
                      </p>
                    </div>
                  )}
                </div>

                {selectedLecture && (
                  <div className="mt-5">
                    <p className="text-sm text-slate-400">
                      Lecture {(course.lectures || []).findIndex(
                        lecture => lecture._id === selectedLecture._id
                      ) + 1}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      {selectedLecture.lectureTitle}
                    </h2>
                  </div>
                )}
              </section>

              <aside className="h-fit overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center gap-3 border-b border-slate-800 p-5">
                  <BookOpen className="text-indigo-400" size={21} />
                  <div>
                    <h2 className="font-semibold">Course content</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {course.lectures?.length || 0} lectures
                    </p>
                  </div>
                </div>

                {course.lectures?.length ? (
                  <ol className="max-h-[60vh] overflow-y-auto">
                    {course.lectures.map((lecture, index) => {
                      const isSelected = selectedLecture?._id === lecture._id

                      return (
                        <li key={lecture._id || index}>
                          <button
                            type="button"
                            onClick={() => selectLecture(lecture)}
                            aria-current={isSelected ? 'true' : undefined}
                            className={`flex w-full items-start gap-3 border-b border-slate-800 px-4 py-4 text-left transition ${
                              isSelected
                                ? 'bg-indigo-950/70'
                                : 'hover:bg-slate-800'
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-indigo-300">
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-slate-100">
                                {lecture.lectureTitle || 'Untitled lecture'}
                              </span>
                              <span className="mt-1 block text-xs text-slate-400">
                                {isPreviewMode && !lecture.isPreviewFree
                                  ? 'Enroll to unlock'
                                  : lecture.videoUrl
                                    ? lecture.isPreviewFree
                                      ? 'Free preview'
                                      : 'Video lesson'
                                    : 'Video not uploaded'}
                              </span>
                            </span>
                            {isPreviewMode && !lecture.isPreviewFree ? (
                              <LockKeyhole
                                size={18}
                                className="mt-1 shrink-0 text-amber-400"
                                aria-label="Locked lecture"
                              />
                            ) : (
                              <PlayCircle size={18} className="mt-1 shrink-0 text-indigo-300" />
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                ) : (
                  <p className="p-5 text-sm text-slate-400">
                    No lectures have been added to this course yet.
                  </p>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default ViewLecture
