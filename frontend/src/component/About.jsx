import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const benefits = [
  {
    icon: BookOpen,
    title: 'Learn at your pace',
    description: 'Explore structured courses and revisit lessons whenever you need.'
  },
  {
    icon: GraduationCap,
    title: 'Learn from educators',
    description: 'Discover practical lessons created by instructors who share what they know.'
  },
  {
    icon: ShieldCheck,
    title: 'One place to grow',
    description: 'Keep your learning organized and continue from where you left off.'
  }
]

function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
 

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-200">
              <GraduationCap size={18} />
              About LearnHub
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Learning should move you
              <span className="text-indigo-300"> forward.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              LearnHub brings learners and educators together through useful,
              well-organized online courses. Build new skills one lesson at a time,
              wherever you are.
            </p>
            <button
              type="button"
              onClick={() => navigate('/allCourses')}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 font-bold text-white transition hover:bg-indigo-400"
            >
              Explore courses
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] md:items-center md:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Our purpose
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Make meaningful learning easier to access.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Finding the right next step can be difficult. LearnHub makes it
              easier to discover courses, understand what they cover, and learn
              through lessons designed by educators. Learners can explore new
              subjects while educators can share their knowledge with a wider
              community.
            </p>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Users size={28} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              A community for curious minds
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              Whether you are starting from scratch or building on what you
              already know, LearnHub is here to help you keep learning.
            </p>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                The LearnHub experience
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Built around the way you learn.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, description }, index) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Icon size={23} />
                  </span>
                  <p className="mt-5 text-sm font-bold text-indigo-600">
                    0{index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-indigo-700 p-8 text-white sm:p-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Ready to find your next course?
              </h2>
              <p className="mt-2 text-indigo-100">
                Explore the learning opportunities available on LearnHub.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/allCourses')}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Browse courses
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About
