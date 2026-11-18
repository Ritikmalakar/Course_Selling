import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Eye,
  GraduationCap,
  Home,
  IndianRupee,
  PlusCircle,
  Users
} from 'lucide-react'
import { serverUrl } from '../../App'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const chartColors = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

const formatCourseName = title => {
  const name = title || 'Untitled course'
  return name.length > 18 ? `${name.slice(0, 18)}...` : name
}

const formatPrice = price => {
  const amount = Number(price)
  if (!Number.isFinite(amount) || amount < 0) return 'Not set'
  if (amount === 0) return 'Free'

  return `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  }).format(amount)}`
}

function Dashboard() {
  const { userData } = useSelector(state => state.user)
  const { creatorCourseData } = useSelector(state => state.course)
  const navigate = useNavigate()
  const [earnings, setEarnings] = useState({
    status: 'loading',
    totalRevenue: 0,
    paymentCount: 0,
    error: ''
  })

  const courses = useMemo(
    () => Array.isArray(creatorCourseData) ? creatorCourseData : [],
    [creatorCourseData]
  )

  const stats = useMemo(() => {
    const learners = courses.reduce(
      (total, course) => total + (Array.isArray(course.enrolledStudents)
        ? course.enrolledStudents.length
        : 0),
      0
    )
    const lessons = courses.reduce(
      (total, course) => total + (Array.isArray(course.lectures)
        ? course.lectures.length
        : 0),
      0
    )

    return {
      courseCount: courses.length,
      learners,
      publishedCount: courses.filter(course => course.isPublished).length,
      lessons
    }
  }, [courses])

  const enrollmentData = useMemo(
    () => courses.map(course => ({
      name: formatCourseName(course.title),
      learners: Array.isArray(course.enrolledStudents)
        ? course.enrolledStudents.length
        : 0
    })),
    [courses]
  )

  const lessonData = useMemo(
    () => courses.map(course => ({
      name: formatCourseName(course.title),
      lessons: Array.isArray(course.lectures) ? course.lectures.length : 0
    })),
    [courses]
  )

  useEffect(() => {
    if (userData?.role !== 'educator') return

    const controller = new AbortController()

    const loadEarnings = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/order/educator-earnings`,
          {
            withCredentials: true,
            signal: controller.signal
          }
        )

        if (
          !response.data?.success ||
          !Number.isFinite(response.data.totalRevenue) ||
          !Number.isFinite(response.data.paymentCount)
        ) {
          throw new Error(response.data?.message || 'Payment totals response is invalid')
        }

        setEarnings({
          status: 'succeeded',
          totalRevenue: response.data.totalRevenue,
          paymentCount: response.data.paymentCount,
          error: ''
        })
      } catch (error) {
        if (controller.signal.aborted) return

        setEarnings({
          status: 'failed',
          totalRevenue: 0,
          paymentCount: 0,
          error: error.response?.data?.message || error.message || 'Unable to load payment totals'
        })
      }
    }

    loadEarnings()
    return () => controller.abort()
  }, [userData?.role])

  const formattedEarnings = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(earnings.totalRevenue)

  const statCards = [
    {
      title: 'Total courses',
      value: stats.courseCount,
      detail: `${stats.publishedCount} published`,
      icon: BookOpen,
      iconClass: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Total learners',
      value: stats.learners,
      detail: 'Across all your courses',
      icon: Users,
      iconClass: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Total lessons',
      value: stats.lessons,
      detail: 'Across all your courses',
      icon: GraduationCap,
      iconClass: 'bg-sky-50 text-sky-600'
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-sm sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {userData?.photoUrl ? (
              <img
                src={userData.photoUrl}
                alt={`${userData.name || 'Educator'} profile`}
                className="h-16 w-16 rounded-full border-2 border-white/30 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold">
                {userData?.name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-indigo-200">Educator dashboard</p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                Welcome, {userData?.name || 'Educator'}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                {userData?.email || 'Manage your courses and learners'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              <Home size={18} />
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/createCourses')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
            >
              <PlusCircle size={18} />
              Create course
            </button>
          </div>
        </header>

        <section
          aria-label="Course statistics"
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statCards.map(({ title, value, detail, icon: Icon, iconClass }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{title}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{detail}</p>
                </div>
                <span className={`rounded-xl p-3 ${iconClass}`}>
                  <Icon size={22} />
                </span>
              </div>
            </article>
          ))}

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-900">Gross captured payments</p>
                <p className="mt-2 text-xl font-extrabold text-slate-900">
                  {earnings.status === 'loading'
                    ? 'Loading...'
                    : earnings.status === 'failed'
                      ? 'Unavailable'
                      : formattedEarnings}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {earnings.status === 'failed'
                    ? earnings.error
                    : `${earnings.paymentCount} verified ${earnings.paymentCount === 1 ? 'payment' : 'payments'}`}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Recorded payments only; gateway fees and refunds are not deducted.
                </p>
              </div>
              <span className="rounded-xl bg-white p-3 text-emerald-600">
                <IndianRupee size={22} />
              </span>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Learners by course</h2>
              <p className="mt-1 text-sm text-slate-500">
                Students currently enrolled in each course.
              </p>
            </div>
            {courses.length ? (
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#eef2ff' }}
                      contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                    />
                    <Bar dataKey="learners" name="Learners" radius={[6, 6, 0, 0]}>
                      {enrollmentData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                Create a course to see learner statistics here.
              </p>
            )}
          </article>

          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lessons by course</h2>
              <p className="mt-1 text-sm text-slate-500">
                Course content currently available to learners.
              </p>
            </div>
            {courses.length ? (
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lessonData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#eef2ff' }}
                      contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                    />
                    <Bar dataKey="lessons" name="Lessons" radius={[6, 6, 0, 0]}>
                      {lessonData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                Add lessons to a course to see your content overview.
              </p>
            )}
          </article>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your courses</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review publishing status and course activity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 self-start font-semibold text-indigo-600 hover:text-indigo-800 sm:self-auto"
            >
              Manage courses
              <ArrowRight size={17} />
            </button>
          </div>

          {courses.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold sm:px-6">Course</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Learners</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map(course => (
                    <tr key={course._id} className="text-sm">
                      <td className="px-5 py-4 font-semibold text-slate-800 sm:px-6">
                        {course.title || 'Untitled course'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatPrice(course.price)}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          course.isPublished
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/editCourse/${course._id}`)}
                          className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <BookOpen className="mx-auto text-slate-300" size={36} />
              <h3 className="mt-3 font-semibold text-slate-800">No courses yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create your first course to start building your learning community.
              </p>
              <button
                type="button"
                onClick={() => navigate('/createCourses')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
              >
                <PlusCircle size={18} />
                Create course
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Dashboard
