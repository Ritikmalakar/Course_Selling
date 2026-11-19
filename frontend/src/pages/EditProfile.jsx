import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Camera, ArrowLeft, Save } from 'lucide-react'

import { serverUrl } from '../lib/api'
import { setUserData } from '../redux/slice'

function EditProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userData } = useSelector(state => state.user)

  const [name, setName] = useState(userData?.name || '')
  const [email, setEmail] = useState(userData?.email || '')
  const [description, setDescription] = useState(userData?.description || '')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(userData?.photoUrl || '')
  const [loading, setLoading] = useState(false)

  // Select photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image')
      return
    }

    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      formData.append('name', name)
      formData.append('email', email)
      formData.append('description', description)

      // IMPORTANT:
      // 'photo' must match your backend upload.single('photo')
      if (photo) {
        formData.append('photo', photo)
      }

      const result = await axios.post(
        `${serverUrl}/api/userData/updateUser`,
        formData,
        { withCredentials: true }
      )

      dispatch(setUserData(result.data.user))

      toast.success('Profile updated successfully')
      navigate('/my-profile')

    } catch (error) {
      console.log(error)
      toast.error(
        error.response?.data?.message || 'Profile update failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">

      <div className="max-w-2xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate('/my-profile')}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={20} />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">
              Edit Profile
            </h1>
            <p className="text-blue-100 mt-1">
              Update your personal information
            </p>
          </div>

          <form onSubmit={handleUpdate} className="p-6 sm:p-8">

            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-8">

              <div className="relative">

                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                    {name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}

                <label
                  htmlFor="profilePhoto"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
                >
                  <Camera size={20} />
                </label>

                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

              </div>

              <p className="text-sm text-gray-500 mt-3">
                Change profile photo
              </p>

            </div>

            {/* Name */}
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div className="mb-7">
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about yourself..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() => navigate('/my-profile')}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={19} />
                {loading ? 'Updating...' : 'Save Changes'}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfile