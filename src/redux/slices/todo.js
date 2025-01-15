import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../tools/axios.js";

export const fetchCreate = createAsyncThunk(
  "auth/fetchCreate",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/todo", params);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }
)

export const fetchDelete = createAsyncThunk(
  "auth/fetchDelete",
  async ({id}, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/todo/${id}`);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPatch = createAsyncThunk(
  "auth/fetchPatch",
  async ({id, status}, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/todo/${id}`, { status });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }
)

export const fetchUpdate = createAsyncThunk(
  "auth/fetchUpdate",
  async ({id, title, description}, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/todo/${id}/update`, { 
        title,
        description
       });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }
)

export const fetchAll = createAsyncThunk(
  "auth/fetchAll",
  async () => {
    const { data } = await axios.get(`/api/todo/all`);
    return data;
  }
)


const initialState = {
  items: [],
  data: null,
  status: 'idle',
  error: null
}

const slice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
  },
  },
  extraReducers: (builder) => {

    builder
      .addCase(fetchAll.pending, (state) => {
        state.status = 'loading';
        state.items = [];
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        state.status = 'loaded';
        state.items = action.payload;
      })
      .addCase(fetchAll.rejected, (state) => {
        state.status = 'error';
        state.items = [];
      })

      .addCase(fetchCreate.pending, (state) => {
        state.status = 'loading';
        state.items = [];
      })
      .addCase(fetchCreate.fulfilled, (state, action) => {
        state.status = 'loaded';
        state.items = action.payload;
      })
      .addCase(fetchCreate.rejected, (state) => {
        state.status = 'error';
        state.items = [];
      })

      .addCase(fetchPatch.pending, (state, action) => {
        state.items = state.items.filter(
          (obj) => obj._id !== action.meta.arg
        );
      })
      .addCase(fetchPatch.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload
      })


      .addCase(fetchUpdate.pending, (state, action) => {
        state.items = state.items.filter(
          (obj) => obj._id !== action.meta.arg
        );
      })
      .addCase(fetchUpdate.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload
      })


      .addCase(fetchDelete.pending, (state, action) => {
        state.status = "loading";
        state.items = state.items.filter(
          (obj) => obj._id !== action.meta.arg
        );
      })
      .addCase(fetchDelete.rejected, (state, action) => {
        state.status = "error";
        state.items = action.payload;
      })
  }
});

export const todoReducer = slice.reducer;
