import React from "react"
import { Routes, Route, BrowserRouter } from "react-router-dom"
import { useDispatch } from "react-redux"

import Header from "./components/header.jsx"
import { Main, Registration, Login, Profile } from './pages/index.js'
import EditProfile from "./pages/editProfile.jsx"

import * as components from './components/index.js'
import * as pages from './pages/index.js'
import * as fetches from './redux/slices/user.js'

function App() {

  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch(fetches.fetchAuthMe())
  }, [dispatch])

  return (
    <>
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<><Header /><Main /></>} />
          <Route path="/login" element={<><Login /></>} />
          <Route path="/registration" element={<><Registration /></>} />
          <Route path="/profile" element={<><Header /><Profile /></>} />
          <Route path="/edit-profile" element={<><Header /><EditProfile /></>} />
          
          <Route path="/lessons" element={<><Header />< pages.LessonsList /></> } />
          <Route path="/lessons/create" element={<><Header /><pages.CreateEditLesson /></>} />
          <Route path="/lessons/:lessonId/edit" element={<><Header /><pages.CreateEditLesson /></>} />
          <Route path="/lessons/:lessonId" element={<><Header /><pages.LessonDetail /></>} />

          <Route path="/lessons/:lessonId/submit-task/:taskId" element={<><Header /><pages.SubmitTask /></>}/>
          <Route path="/lessons/:lessonId/test-result" element={<><Header /><pages.TestResult /></>}/>

          <Route path="/schedule" element={<><Header /><pages.SchedulePage /></>}/>

          <Route path="/admin" element={<><Header /><pages.Admin /></>}/>

        </Routes>
      </BrowserRouter>
    </>)
}

export default App;
