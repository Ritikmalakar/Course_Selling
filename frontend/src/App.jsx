import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import SignUp from "./pages/SignUp"
import Login from "./pages/Login"
import useCurrentUser from "./customHooks/useCurrentUser"
import { useSelector } from "react-redux"
import Profile from "./pages/profile"
import MyCourse from "./pages/MyCourse"
import ForgetPassword from "./pages/ForgetPassword"
import EditProfile from "./pages/EditProfile"
import Dashboard from "./pages/Educator/Dashboard"
import Courses from "./pages/Educator/Courses"
import CreateCourse from "./pages/Educator/CreateCourse"
import CourseDetail from "./pages/CourseDetail"
import GetCreateCourse from "./customHooks/getCreateCourse"
import EditCourse from "./pages/Educator/EditCourse"
import usePublishedCourse from "./customHooks/usePublishedCourse"
import AllCourse from "./pages/AllCourse"
import CreateLecture from "./pages/Educator/CreateLecture"
import EditLeckure from "./pages/Educator/EditLeckure"
import ViewCourse from "./pages/ViewCourse"
import ViewLecture from "./pages/ViewLecture"
import About from "./component/About"
import Footer from "./component/Footer"
import Search from "./pages/Search"

export const serverUrl="http://localhost:1112"

function App() {
  useCurrentUser();
  GetCreateCourse();
  usePublishedCourse();
 const {userData, authChecked}=useSelector((state=>state.user))

  return (
    <>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/about" element={<><About/><Footer/></>}/>
      <Route path="/signUp" element={!userData ?<SignUp/> : <Navigate to={"/"}/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/forgot-password" element={<ForgetPassword/>}/>
      <Route path="/my-profile" element={
        !authChecked ? <p>Loading profile...</p> : userData ? <Profile/> : <Navigate to={"/login"}/>
      }/>
      <Route path="/my-courses" element={
        !authChecked ? <p>Loading courses...</p> : userData ? <MyCourse/> : <Navigate to={"/login"}/>
      }/>
      <Route path="/edit-profile" element={
        !authChecked ? <p>Loading courses...</p> : userData ? <EditProfile/> : <Navigate to={"/login"}/>
      }/>
      <Route path="/dashboard" element={
        !authChecked ? <p>Loading dashboard...</p> : userData?.role === "educator" ? <Dashboard/> : <Navigate to={"/login"}/>
      }/>
      <Route path="/courses" element={
        !authChecked ? <p>Loading courses...</p> : userData?.role === "educator" ? <Courses/> : <Navigate to={"/login"}/>
      }/>
      <Route path="/course/:courseId" element={
        !authChecked ? <p>Loading course...</p> : userData ? <CourseDetail/> : <Navigate to={"/login"}/>
      }/>
         <Route path="/createCourses" element={
        !authChecked ? <p>Loading courses...</p> : userData?.role === "educator" ? <CreateCourse/> : <Navigate to={"/login"}/>
      }/>
        <Route path="/editCourse/:courseId" element={
        !authChecked ? <p>Loading courses...</p> : userData?.role === "educator" ? <EditCourse/> : <Navigate to={"/login"}/>
      }/>
      
      <Route path="/allCourses" element={<AllCourse/>}/>

      <Route path="/createLecture/:courseId" element={
        !authChecked ? <p>Loading courses...</p> : userData?.role === "educator" ? <CreateLecture/> : <Navigate to={"/login"}/>
      }/>

      <Route path="/editLecture/:courseId/:lectureId" element={
        !authChecked ? <p>Loading courses...</p> : userData?.role === "educator" ? <EditLeckure/> : <Navigate to={"/login"}/>
      }/>

      <Route path="/viewCourse/:courseId" element={<ViewCourse/>}/>
      <Route path="/viewlecture/:courseId" element={<ViewLecture/>}/>
      <Route path="/search" element={<Search/>}/>


    </Routes>
    </>
  )
}

export default App
