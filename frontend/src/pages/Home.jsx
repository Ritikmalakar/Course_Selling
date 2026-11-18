
import Navbar from '../component/Navbar'

import home from '../assets/home1.jpg'
import searchAi from '../assets/SearchAi.png'

import { BookOpen } from 'lucide-react'
import Logo from '../component/Logo'
import ExploreCourse from '../component/ExploreCourse'
import CardPage from '../component/CardPage'
import { useNavigate } from 'react-router-dom'
import About from '../component/About'
import Footer from '../component/Footer'

function Home() {
  const navigate=useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      {/* Hero Section */}
      <div className="w-full min-h-[85vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-10">

        {/* Left Content */}
        <div className="w-full md:w-1/2 space-y-6">

          <h1 className="text-4xl md:text-6xl font-bold text-blue-950 leading-tight">
            Learn New Skills
            <span className="text-indigo-600"> Build Your Future</span>
          </h1>

          <p className="text-slate-600 text-lg leading-8">
            Learn from expert instructors, improve your knowledge
            and develop skills with our online virtual courses.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            {/* Explore Courses */}
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition" onClick={()=>navigate("/allCourses")}>

              <BookOpen size={20} />

              Explore Courses

            </button>

            
            {/* Search With AI */}
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition" onClick={()=>navigate("/search")}>

              <img
                src={searchAi}
                alt="AI Search"
                className="w-6 h-6 object-contain"
              />

              Search With AI

            </button>

          </div>

        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center">

          <img
            src={home}
            alt="Online Learning"
            className="w-full max-w-lg h-[350px] md:h-[450px] object-cover rounded-2xl shadow-xl"
          />

        </div>
        
      </div>
      <Logo/>
      <ExploreCourse/>
      <CardPage/>
      <About/>
      <Footer/>


    </div>
  )
}

export default Home
