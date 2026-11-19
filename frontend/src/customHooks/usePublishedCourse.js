
import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../lib/api'
import { useDispatch } from 'react-redux'
import { setCourseData, setCourseStatus } from '../redux/courseSlice'

const usePublishedCourse = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const getCourseData = async () => {
      dispatch(setCourseStatus({ status: 'loading' }))

      try {
        const result = await axios.get(
          `${serverUrl}/api/course/getPublished`,
          { withCredentials: true }
        )

        if (!Array.isArray(result.data?.courses)) {
          throw new Error('Published courses response is invalid')
        }

        dispatch(setCourseData(result.data.courses))
        dispatch(setCourseStatus({ status: 'succeeded' }))
      } catch (error) {
        console.error('Get Published Course Error:', error)
        dispatch(setCourseStatus({
          status: 'failed',
          error: error.response?.data?.message || error.message || 'Unable to load courses'
        }))
      }
    }

    getCourseData()
  }, [dispatch])

  return null
}

export default usePublishedCourse
