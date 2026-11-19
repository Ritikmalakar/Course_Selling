
import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../lib/api'
import { useDispatch } from 'react-redux'
import { setAuthChecked, setUserData } from '../redux/slice'

function useCurrentUser() {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/userData/getCurrentuser`,
          {
            withCredentials: true
          }
        )

        console.log("Full API Response:", result.data)
        console.log("User Data:", result.data.user)

        dispatch(setUserData(result.data.user))

      } catch (error) {
        console.log("API Error:", error.response?.data || error.message)
      } finally {
        dispatch(setAuthChecked(true))
      }
    }

    fetchUser()
  }, [dispatch])

}

export default useCurrentUser
