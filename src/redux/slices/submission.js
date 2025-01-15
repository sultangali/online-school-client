// src/redux/slices/submissionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../tools/axios';
import { toast } from 'react-toastify';

// Асинхронный экшен для отправки решения задачи
export const submitTask = createAsyncThunk(
    'submissions/submitTask',
    async ({ lessonId, taskId, answer }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/api/lessons/${lessonId}/task/submit`, { taskId, answer });
            return response.data;
        } catch (error) {
            // Обработка ошибок
            return rejectWithValue(error.response.data || { message: 'Неизвестная ошибка' });
        }
    }
);

// Получение всех решений задач для урока
export const getSubmissions = createAsyncThunk(
    'lessons/getSubmissions',
    async ({ lessonId }, { rejectWithValue }) => {
      try {
        const response = await api.get(`/api/lessons/${lessonId}/task/submissions`);
        return { lessonId, submissions: response.data.submissions };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  );

// Отправка теста
export const submitTest = createAsyncThunk(
    'lessons/submitTest',
    async ({ lessonId, answers }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/api/lessons/${lessonId}/test/submit`, { answers });
            return response.data; // { message: '...', totalScore: ... }
        } catch (error) {
            // Проверка наличия ответа от сервера
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);


// Асинхронный экшен для получения деталей отправки
export const fetchSubmissionDetail = createAsyncThunk(
    'submissions/fetchSubmissionDetail',
    async ({ lessonId, submissionId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/lessons/${lessonId}/task/submissions/${submissionId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || { message: 'Неизвестная ошибка' });
        }
    }
);

// Асинхронный экшен для оценки отправки
export const reviewSubmission = createAsyncThunk(
    'submissions/reviewSubmission',
    async ({ lessonId, submissionId, feedback, score, status }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/api/lessons/${lessonId}/task/submissions/${submissionId}`, {
                feedback,
                score,
                status,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || { message: 'Неизвестная ошибка' });
        }
    }
);

// Асинхронный экшен для получения деталей задачи
export const fetchTaskDetails = createAsyncThunk(
    'submissions/fetchTaskDetails',
    async ({ lessonId, taskId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/lessons/${lessonId}/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || { message: 'Неизвестная ошибка' });
        }
    }
);


// Слайс
const submissionsSlice = createSlice({
    name: 'submissions',
    initialState: {
        submissions: [],
        currentSubmission: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        // Дополнительные редьюсеры, если необходимо
    },
    extraReducers: (builder) => {
        builder
            // Обработка submitTest
            .addCase(submitTest.pending, (state) => {
                state.status = 'submittingTest';
                state.error = null;
            })
            .addCase(submitTest.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Можно обновить урок с новыми результатами теста, если сервер возвращает обновленные данные урока
                // В вашем случае сервер возвращает только сообщение и totalScore
                // Поэтому можно сохранить totalScore в локальном состоянии или отображать его через toast
            })
            .addCase(submitTest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // submitTask
            .addCase(submitTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(submitTask.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.submissions.push(action.payload);
            })
            .addCase(submitTask.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message || 'Ошибка при отправке решения';
            })

            // fetchSubmissionDetail
            .addCase(fetchSubmissionDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSubmissionDetail.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentSubmission = action.payload;
            })
            .addCase(fetchSubmissionDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message || 'Ошибка при получении деталей отправки';
            })

            // reviewSubmission
            .addCase(reviewSubmission.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(reviewSubmission.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Обновляем текущую отправку
                state.currentSubmission = action.payload;
                // Также можно обновить общую коллекцию отправок, если необходимо
                const index = state.submissions.findIndex(sub => sub._id === action.payload._id);
                if (index !== -1) {
                    state.submissions[index] = action.payload;
                }
            })
            .addCase(reviewSubmission.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message || 'Ошибка при оценке отправки';
            })
            // fetchTaskDetails
            .addCase(fetchTaskDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTaskDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentTask = action.payload;
            })
            .addCase(fetchTaskDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message || 'Ошибка при получении деталей задачи';
            })
            // Обработка getSubmissions
            .addCase(getSubmissions.pending, (state) => {
                state.status = 'loadingSubmissions';
                state.error = null;
            })
            .addCase(getSubmissions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Обновляем поле submissions
                state.submissions = action.payload.submissions;
            })
            .addCase(getSubmissions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
    },
});

export const submissionsReducer = submissionsSlice.reducer;
