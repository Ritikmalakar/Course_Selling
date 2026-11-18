
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft, PlusCircle } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { serverUrl } from '../../App'

function CreateCourse() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !category) {
      return toast.error('Please fill all fields')
    }

    try {
      setLoading(true)

      const result = await axios.post(
        `${serverUrl}/api/course/createCourse`,
        { title, category },
        { withCredentials: true }
      )

      toast.success(result.data.message || 'Course created successfully!')

      setTitle('')
      setCategory('')

      navigate('/courses')

    } catch (error) {
      console.log(error)

      toast.error(
        error.response?.data?.message || 'Course creation failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-10">

      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </button>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">

          <div className="flex items-center gap-3 mb-8">

            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
              <BookOpen size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Create New Course
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Enter your course details below
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Course Title
              </label>

              <input
                type="text"
                placeholder="Enter course title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Course Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white"
              >
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="UI/UX Development">UI/UX Development</option>
                <option value="App Development">App Development</option>
                <option value="Ethical Hacking">Ethical Hacking</option>
                <option value="AI & ML">AI & ML</option>
                <option value="Data Science">Data Science</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="AI Tools">AI Tools</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-semibold transition"
            >
              <PlusCircle size={20} />
              {loading ? 'Creating...' : 'Create Course'}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default CreateCourse
