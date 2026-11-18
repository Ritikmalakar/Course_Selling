import {
  Code,
  Palette,
  Smartphone,
  ShieldCheck,
  BrainCircuit,
  Database,
  ChartNoAxesCombined,
  Bot
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function ExploreCourse() {
  const navigate=useNavigate();
  const courses = [
    { name: 'Web Development', icon: Code, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'UI/UX Development', icon: Palette, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'App Development', icon: Smartphone, color: 'text-pink-600', bg: 'bg-pink-100' },
    { name: 'Ethical Hacking', icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'AI & ML', icon: BrainCircuit, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Data Science', icon: Database, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Data Analytics', icon: ChartNoAxesCombined, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'AI Tools', icon: Bot, color: 'text-cyan-600', bg: 'bg-cyan-100' }
  ]

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 md:px-12 py-20">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">

        {/* Left Side */}
        <div className="w-full md:w-2/5">

          <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-bold tracking-wide">
            EXPLORE OUR PROGRAMS
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mt-6 leading-tight">
            Explore Our
            <span className="block text-blue-600 mt-2">
              Courses
            </span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg leading-8 mt-7">
            Discover industry-focused courses designed to help you
            develop new skills, work on real-world projects and build
            a successful career in technology.
          </p>

          <button className="mt-9 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-blue-200 transition duration-300 hover:-translate-y-1" onClick={()=>navigate("/allCourses")}>
            Explore Courses →
          </button>

        </div>

        {/* Right Side */}
        <div className="w-full md:w-3/5 grid grid-cols-2 md:grid-cols-4 gap-4">

          {courses.map((course, index) => {
            const Icon = course.icon

            return (
              <div
                key={index}
                className="group bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center cursor-pointer"
              >

                <div className={`w-16 h-16 ${course.bg} ${course.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300`}>
                  <Icon size={32} strokeWidth={1.8} />
                </div>

                <h2 className="font-bold text-gray-800 text-sm md:text-base mt-5">
                  {course.name}
                </h2>

                <span className="text-blue-600 text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition">
                  Explore Now →
                </span>

              </div>
            )
          })}

        </div>

      </div>
    </div>
  )
}

export default ExploreCourse