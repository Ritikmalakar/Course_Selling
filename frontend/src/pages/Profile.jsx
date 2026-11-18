
import { useSelector } from 'react-redux'
import {
  Mail,
  BookOpen,
  ShieldCheck,
  Home,
  Pencil
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const { userData } = useSelector(state => state.user)
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center p-4">

      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition duration-300"
      >
        <Home size={20} />
        Home
      </button>

      {/* Profile Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        {/* Profile Image */}
        <div className="flex justify-center -mt-16">
          {userData?.photoUrl ? (
            <img
              src={userData.photoUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg">
              {userData?.name?.slice(0, 1)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="text-center px-6 mt-4">

          <h1 className="text-2xl font-bold text-gray-800">
            {userData?.name || 'User Name'}
          </h1>

          <span className="inline-block mt-2 px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold">
            {userData?.role || 'Student'}
          </span>

          <p className="text-gray-500 text-sm mt-4 leading-relaxed">
            {userData?.description || 'No description available'}
          </p>

        </div>

        <div className="border-t border-gray-100 mx-6 my-6"></div>

        {/* Details */}
        <div className="px-6 space-y-4">

          {/* Email */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition">
            <div className="w-11 h-11 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Mail className="text-indigo-600" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-400">Email Address</p>
              <p className="text-sm font-semibold text-gray-700 break-all">
                {userData?.email || 'Not available'}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition">
            <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-purple-600" />
            </div>

            <div>
              <p className="text-xs text-gray-400">Account Role</p>
              <p className="text-sm font-semibold text-gray-700">
                {userData?.role || 'Student'}
              </p>
            </div>
          </div>

        </div>

        {/* Course Stats */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white flex items-center justify-between">

            <div>
              <p className="text-sm text-indigo-100">
                Enrolled Courses
              </p>

              <h2 className="text-3xl font-bold mt-1">
                {userData?.enrollCourses?.length || 0}
              </h2>
            </div>

            <BookOpen size={40} className="text-indigo-200" />

          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-md transition duration-300"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile
