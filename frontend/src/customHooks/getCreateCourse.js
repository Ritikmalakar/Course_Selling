
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setCreateCourseData } from "../redux/courseSlice";

const GetCreateCourse = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user)
  useEffect(() => {
    if (userData?.role !== "educator") {
      return
    }

    const createCourses = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/course/getcreateCourse`,
          { withCredentials: true }
        );

        dispatch(setCreateCourseData(result.data.courses));

      } catch (error) {
        console.log("Get Create Course Error:", error);
      }
    };

    createCourses();
  }, [dispatch, userData?.role]);

  return null;
};

export default GetCreateCourse;
