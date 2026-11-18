
import { useState } from 'react'
import logo from '../assets/logo.jpg'
import {
  IoPersonCircle,
  IoMenu,
  IoClose,
  IoChevronDown,
  IoPerson,
  IoBook
} from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'
import { setUserData } from '../redux/slice'

function Navbar() {
  const { userData } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handlelogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/logout`, {
        withCredentials: true
      })

      dispatch(setUserData(null))
      toast.success(result.data?.message || 'Logout successful')
      setOpen(false)
      setProfileOpen(false)
      navigate('/login')

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Logout failed')
    }
  }

  return (
    <div className="relative w-full min-h-20 bg-white shadow-md flex items-center justify-between px-4 py-3 md:px-8">

      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">

        

        {/* Dashboard Only Educator */}
        {userData?.role === 'educator' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="font-bold text-gray-700 hover:text-blue-600 transition"
          >
            Dashboard
          </button>
        )}

        {/* Profile Photo Dropdown */}
        {userData && (
          <div className="relative">

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2"
            >
              {userData.photoUrl ? (
                <img
                  src={userData.photoUrl}
                  alt="Profile"
                  className="h-11 w-11 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <IoPersonCircle className="text-4xl text-gray-700" />
              )}

              <IoChevronDown className="text-gray-600" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-48 bg-white shadow-xl rounded-xl border p-2 z-50">

                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-semibold text-gray-800">
                    {userData.name}
                  </p>

                  <p className="text-xs text-gray-500 capitalize">
                    {userData.role}
                  </p>
                </div>

                {/* My Profile */}
                <button
                  onClick={() => {
                    navigate('/my-profile')
                    setProfileOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700"
                >
                  <IoPerson />
                  My Profile
                </button>

                {/* My Courses - Both Users */}
                <button
                  onClick={() => {
                    navigate('/my-courses')
                    setProfileOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700"
                >
                  <IoBook />
                  My Courses
                </button>

                {/* Logout */}
                <button
                  onClick={handlelogout}
                  className="w-full text-left px-3 py-2 mt-2 text-red-500 hover:bg-red-50 rounded-md font-semibold"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}

        {/* Login */}
        {!userData && (
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        )}

      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden text-3xl text-gray-700"
      >
        {open ? <IoClose /> : <IoMenu />}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg p-5 flex flex-col gap-4 md:hidden z-50">

          <button
            onClick={() => {
              navigate('/about')
              setOpen(false)
            }}
            className="text-left font-semibold text-gray-700 hover:text-blue-600"
          >
            About LearnHub
          </button>

          {userData && (
            <>
              {/* User Information */}
              <div className="flex items-center gap-3 border-b pb-4">

                {userData.photoUrl ? (
                  <img
                    src={userData.photoUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <IoPersonCircle className="text-5xl text-gray-700" />
                )}

                <div>
                  <p className="font-semibold text-gray-800">
                    {userData.name}
                  </p>

                  <p className="text-sm text-gray-500 capitalize">
                    {userData.role}
                  </p>
                </div>

              </div>

              {/* Dashboard Only Educator */}
              {userData.role === 'educator' && (
                <button
                  onClick={() => {
                    navigate('/dashboard')
                    setOpen(false)
                  }}
                  className="text-left font-semibold text-gray-700 hover:text-blue-600"
                >
                  Dashboard
                </button>
              )}

              {/* My Profile */}
              <button
                onClick={() => {
                  navigate('/my-profile')
                  setOpen(false)
                }}
                className="flex items-center gap-3 p-2 text-gray-700 hover:bg-blue-50 rounded-md"
              >
                <IoPerson />
                My Profile
              </button>

              {/* My Courses - Both Users */}
              <button
                onClick={() => {
                  navigate('/my-courses')
                  setOpen(false)
                }}
                className="flex items-center gap-3 p-2 text-gray-700 hover:bg-blue-50 rounded-md"
              >
                <IoBook />
                My Courses
              </button>

              {/* Logout */}
              <button
                onClick={handlelogout}
                className="w-full py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
              >
                Logout
              </button>

            </>
          )}

          {/* Login */}
          {!userData && (
            <button
              onClick={() => {
                navigate('/login')
                setOpen(false)
              }}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold"
            >
              Login
            </button>
          )}

        </div>
      )}

    </div>
  )
}

export default Navbar
