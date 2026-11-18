
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  LayoutDashboard,
  Edit,
  Eye
} from 'lucide-react'

import img from "../../assets/empty.jpg"
import { useSelector } from 'react-redux'

function Courses() {
  const navigate = useNavigate()

  const { creatorCourseData } = useSelector(state => state.course)

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-10">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Courses
            </h1>

            <p className="text-gray-500 mt-2">
              Manage all your created courses
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>

            <button
              onClick={() => navigate('/createCourses')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              <PlusCircle size={20} />
              Create Course
            </button>

          </div>

        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              All Courses Created
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              View and manage your courses
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-5">Courses</th>
                  <th className="p-5">Price</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>

              <tbody>

                {creatorCourseData?.length > 0 ? (

                  creatorCourseData.map((course) => {

                    return (
                      <tr key={course._id} className="border-t hover:bg-gray-50 transition">

                        <td className="p-5">
                          <div className="flex items-center gap-4">

                            <img
                              src={course.thumbnail || img}
                              alt="Course"
                              className="w-16 h-12 rounded-lg object-cover"
                            />

                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {course.title}
                              </h3>
                            </div>

                          </div>
                        </td>

                        <td className="p-5 font-semibold text-gray-700">
                          ₹{course.price || 499}
                        </td>

                        <td className="p-5">
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-3">

                            <button
                              onClick={() => navigate(`/course/${course._id}`)}
                              className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg"
                              title="View Course Details"
                            >
                              <Eye size={19} />
                            </button>

                            <button
                              onClick={() => navigate(`/editCourse/${course._id}`)}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                              title="Edit Course"
                            >
                              <Edit size={19} />
                            </button>

                           

                          </div>
                        </td>

                      </tr>
                    )
                  })

                ) : (

                  <tr>
                    <td colSpan="4" className="p-10 text-center">

                      <img
                        src={img}
                        alt="No Courses"
                        className="w-48 mx-auto mb-4"
                      />

                      <h3 className="text-xl font-semibold text-gray-700">
                        No Courses Found
                      </h3>

                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          <div></div>

        </div>

      </div>

    </div>
  )
}

export default Courses
