import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { authAPI } from '../../services/api';
import { getApiErrorMessage } from '../../utils';

const token = localStorage.getItem('token');

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

// Clear auth state if token is expired
let initialToken = token;
if (initialToken && isTokenExpired(initialToken)) {
  localStorage.removeItem('token');
  initialToken = null;
}

const initialUser = initialToken ? decodeToken(initialToken) : null;

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(email, password);
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    const user = res.data.user || decodeToken(token);
    return { token, user };
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Invalid email or password'));
  }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(name, email, password);
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    const user = res.data.user || decodeToken(token);
    return { token, user };
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Registration failed. Please check your information.'));
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async ({ credential }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/google', { credential });
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    const user = res.data.user || decodeToken(token);
    return { token, user };
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Google sign-in failed'));
  }
});

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  state.token = action.payload.token;
  state.user = action.payload.user;
  state.isAuthenticated = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken || null,
    isAuthenticated: !!initialToken,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected)
      .addCase(googleLogin.pending, handlePending)
      .addCase(googleLogin.fulfilled, handleFulfilled)
      .addCase(googleLogin.rejected, handleRejected);
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;