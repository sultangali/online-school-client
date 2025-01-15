// src/redux/slices/ratingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../tools/axios.js';

// Асинхронный экшен для получения рейтинга
export const fetchRating = createAsyncThunk(
  'rating/fetchRating',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/user/rating');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const ratingSlice = createSlice({
  name: 'rating',
  initialState: {
    submissions: [],
    testResults: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRating.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRating.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.submissions = action.payload.submissions;
        state.testResults = action.payload.testResults;
      })
      .addCase(fetchRating.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.message || action.error.message;
      });
  },
});

export const ratingReducer = ratingSlice.reducer;
