// src/redux/slices/scheduleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../tools/axios';

// Асинхронные действия

// GET: Получить расписание
export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/schedule');
      return response.data; // Ожидается массив расписаний
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// POST: Добавить урок в расписание
export const addLessonToSchedule = createAsyncThunk(
  'schedule/addLessonToSchedule',
  async ({ date, lessonId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/schedule/add', { date, lessonId });
      return response.data; // { message: 'Урок добавлен в расписание' }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE: Удалить урок из расписания
export const removeLessonFromSchedule = createAsyncThunk(
  'schedule/removeLessonFromSchedule',
  async ({ scheduleId, lessonId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/schedule/${scheduleId}/lesson/${lessonId}`);
      return { scheduleId, lessonId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: {
    schedules: [], // Массив расписаний
    status: 'idle',
    error: null,
    addStatus: 'idle',
    addError: null,
    removeStatus: 'idle',
    removeError: null,
  },
  reducers: {
    // Дополнительные синхронные редьюсеры, если необходимы
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchSchedule
      .addCase(fetchSchedule.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schedules = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Обработка addLessonToSchedule
      .addCase(addLessonToSchedule.pending, (state) => {
        state.addStatus = 'loading';
        state.addError = null;
      })
      .addCase(addLessonToSchedule.fulfilled, (state, action) => {
        state.addStatus = 'succeeded';
        // Обновление расписания после добавления урока
        // Можно перезапросить расписание или обновить локально
      })
      .addCase(addLessonToSchedule.rejected, (state, action) => {
        state.addStatus = 'failed';
        state.addError = action.payload;
      })
      
      // Обработка removeLessonFromSchedule
      .addCase(removeLessonFromSchedule.pending, (state) => {
        state.removeStatus = 'loading';
        state.removeError = null;
      })
      .addCase(removeLessonFromSchedule.fulfilled, (state, action) => {
        state.removeStatus = 'succeeded';
        // Обновление расписания после удаления урока
        state.schedules = state.schedules.map(schedule => {
          if (schedule._id === action.payload.scheduleId) {
            return {
              ...schedule,
              lessons: schedule.lessons.filter(lesson => lesson._id !== action.payload.lessonId)
            };
          }
          return schedule;
        });
      })
      .addCase(removeLessonFromSchedule.rejected, (state, action) => {
        state.removeStatus = 'failed';
        state.removeError = action.payload;
      });
  },
});

export const scheduleReducer = scheduleSlice.reducer;
