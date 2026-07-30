import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resumeAPI } from '../../services/api';

export const uploadResume = createAsyncThunk('resume/upload', async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await resumeAPI.upload(formData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Upload failed');
  }
});

export const analyzeResume = createAsyncThunk('resume/analyze', async ({ resumeText, jdText }, { rejectWithValue }) => {
  try {
    const res = await resumeAPI.analyze({ resume_text: resumeText, jd_text: jdText });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Analysis failed');
  }
});

export const fetchHistory = createAsyncThunk('resume/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const res = await resumeAPI.getHistory();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch history');
  }
});

export const fetchStats = createAsyncThunk('resume/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await resumeAPI.getHistoryStats();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch stats');
  }
});

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    currentResult: null,
    history: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearResult(state) {
      state.currentResult = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload;
      })
      .addCase(uploadResume.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(analyzeResume.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(analyzeResume.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload;
      })
      .addCase(analyzeResume.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchHistory.fulfilled, (state, action) => { state.history = action.payload; })
      .addCase(fetchStats.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export const { clearResult, clearError } = resumeSlice.actions;
export default resumeSlice.reducer;