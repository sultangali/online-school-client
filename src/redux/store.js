import {configureStore} from '@reduxjs/toolkit'
import { userReducer } from './slices/user.js'
import { todoReducer } from './slices/todo.js'
import { lessonReducer } from './slices/lesson.js'
import {submissionsReducer} from './slices/submission.js'
import { scheduleReducer } from './slices/schedule.js'
import { ratingReducer } from './slices/rating.js'

const store = configureStore({
    reducer: {
        user: userReducer,
        todo: todoReducer,
        lessons: lessonReducer,
        submissions: submissionsReducer,
        schedule: scheduleReducer,
        rating: ratingReducer
    }
})

export default store