// redux/slices/lessonsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../tools/axios';

// Асинхронные действия
export const fetchLessons = createAsyncThunk('lessons/fetchLessons', async () => {
  const response = await api.get('/api/lessons');
  return response.data;
});

export const addLesson = createAsyncThunk('lessons/addLesson', async (lessonData) => {
  const response = await api.post('/api/lessons', lessonData);
  return response.data;
});

export const updateLesson = createAsyncThunk('lessons/updateLesson', async ({ lessonId, updatedData }) => {
  const response = await api.patch(`/api/lessons/${lessonId}`, updatedData);
  return response.data;
});

export const deleteLesson = createAsyncThunk('lessons/deleteLesson', async (lessonId) => {
  await api.delete(`/api/lessons/${lessonId}`);
  return lessonId;
});

// Слайс
const lessonsSlice = createSlice({
  name: 'lessons',
  initialState: {
    lessons: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    // Дополнительные редьюсеры, если необходимы
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lessons = action.payload;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addLesson.fulfilled, (state, action) => {
        state.lessons.push(action.payload);
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        const index = state.lessons.findIndex(lesson => lesson._id === action.payload._id);
        if (index !== -1) {
          state.lessons[index] = action.payload;
        }
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.lessons = state.lessons.filter(lesson => lesson._id !== action.payload);
      });
  },
});

export const lessonReducer = lessonsSlice.reducer;
