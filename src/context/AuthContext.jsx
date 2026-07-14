import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  
  // Toast notifications state
  const [toast, setToast] = useState({ message: '', type: null });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4000);
  };

  // Configure axios authorization header on load or token change
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load User profile on boot
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Session restoration failed:', error.message);
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Register User
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', { name, email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      showToast('Registration successful! Welcome to PrepAI.', 'success');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      showToast('Sign in successful. Welcome back!', 'success');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    setToken('');
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  // Update Profile
  const updateProfile = async ({ name, skills, experienceLevel }) => {
    try {
      const response = await axios.put('/api/auth/profile/update', { name, skills, experienceLevel });
      setUser(response.data);
      showToast('Profile updated successfully!', 'success');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Update failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Update resume analysis and skills locally after upload
  const updateResumeData = (skills, experienceLevel, analysis) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        skills,
        experienceLevel,
        resumeAnalysis: analysis
      };
    });
  };

  const value = {
    user,
    token,
    loading,
    toast,
    login,
    register,
    logout,
    updateProfile,
    updateResumeData,
    showToast
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
