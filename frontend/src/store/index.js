import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resumeReducer from './slices/resumeSlice';
import candidateReducer from './slices/candidateSlice';
import recruiterReducer from './slices/recruiterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    candidate: candidateReducer,
    recruiter: recruiterReducer,
  },
});