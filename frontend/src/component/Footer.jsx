import { ArrowUpRight, BookOpen, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpg'

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] md:py-14">
        <div>
          <Link
            to="/"
            aria-label="LearnHub home"
            className="inline-flex items-center gap-3"
          >
            <img
              src={logo}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-xl font-extrabold text-white">LearnHub</span>
          </Link>
          <p className="mt-4 max-w-sm leading-7 text-slate-400">
            Learn new skills, explore practical courses, and keep moving
            forward at your own pace.
          </p>
          <Link
            to="/allCourses"
            className="mt-5 inline-flex items-center gap-2 font-semibold text-indigo-300 transition hover:text-white"
          >
            Explore courses
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="font-bold text-white">Explore</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/allCourses" className="transition hover:text-white">
                All courses
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition hover:text-white">
                About LearnHub
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Learning and account links">
          <h2 className="font-bold text-white">Your learning</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                to="/my-courses"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <BookOpen size={17} />
                My courses
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <GraduationCap size={18} />
                Sign in to LearnHub
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} LearnHub. All rights reserved.</p>
          <p>Learn something new, one lesson at a time.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
