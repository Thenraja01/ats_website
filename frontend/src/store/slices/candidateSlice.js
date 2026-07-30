import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { candidateAPI } from '../../services/api';

export const fetchResumes = createAsyncThunk('candidate/fetchResumes', async (_, { rejectWithValue }) => {
  try {
    const res = await candidateAPI.getResumes();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch resumes');
  }
});

export const uploadResumeFile = createAsyncThunk('candidate/uploadResume', async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await candidateAPI.uploadResume(formData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Upload failed');
  }
});

export const deleteResume = createAsyncThunk('candidate/deleteResume', async (id, { rejectWithValue }) => {
  try {
    await candidateAPI.deleteResume(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Delete failed');
  }
});

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    resumes: [],
    applications: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResumes.fulfilled, (state, action) => { state.resumes = action.payload; })
      .addCase(uploadResumeFile.fulfilled, (state, action) => {
        state.resumes.unshift(action.payload);
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.resumes = state.resumes.filter((r) => r.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => { state.loading = false; }
      );
  },
});

export const { clearError } = candidateSlice.actions;
export default candidateSlice.reducer;