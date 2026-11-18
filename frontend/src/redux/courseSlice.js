import { createSlice } from "@reduxjs/toolkit";

const courseSlice = createSlice({
  name: "course",
  initialState: {
    creatorCourseData: [],
    courseData: [],
    courseStatus: "loading",
    courseError: null,
    selectedCourse: null
  },
  reducers: {
    setCreateCourseData: (state, action) => {
      state.creatorCourseData = action.payload
    },
    setCourseData: (state, action) => {
      state.courseData = action.payload
    },
    setCourseStatus: (state, action) => {
      state.courseStatus = action.payload.status
      state.courseError = action.payload.error || null
    },
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload
    }

  }
})
export const { setCreateCourseData, setCourseData, setCourseStatus, setSelectedCourse } = courseSlice.actions
export default courseSlice.reducer