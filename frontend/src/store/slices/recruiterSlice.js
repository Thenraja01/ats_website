import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recruiterAPI } from '../../services/api';

export const fetchJobs = createAsyncThunk('recruiter/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const res = await recruiterAPI.getJobs();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch jobs');
  }
});

export const createJob = createAsyncThunk('recruiter/createJob', async (data, { rejectWithValue }) => {
  try {
    const res = await recruiterAPI.createJob(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to create job');
  }
});

export const updateJob = createAsyncThunk('recruiter/updateJob', async ({ id, data }, { rejectWithValue }) => {
  try {
    await recruiterAPI.updateJob(id, data);
    return { id, data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to update job');
  }
});

export const deleteJob = createAsyncThunk('recruiter/deleteJob', async (id, { rejectWithValue }) => {
  try {
    await recruiterAPI.deleteJob(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to delete job');
  }
});

export const fetchApplications = createAsyncThunk('recruiter/fetchApplications', async (jobId, { rejectWithValue }) => {
  try {
    const res = jobId ? await recruiterAPI.getApplications(jobId) : await recruiterAPI.getAllApplications();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch applications');
  }
});

export const updateApplicationStatus = createAsyncThunk('recruiter/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await recruiterAPI.updateApplicationStatus(id, status);
    return { id, status };
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to update status');
  }
});

const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState: {
    jobs: [],
    applications: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.fulfilled, (state, action) => { state.jobs = action.payload; })
      .addCase(createJob.fulfilled, (state, action) => { state.jobs.unshift(action.payload); })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j.id !== action.payload);
      })
      .addCase(fetchApplications.fulfilled, (state, action) => { state.applications = action.payload; })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const app = state.applications.find((a) => a.id === action.payload.id);
        if (app) app.status = action.payload.status;
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

export const { clearError } = recruiterSlice.actions;
export default recruiterSlice.reducer;