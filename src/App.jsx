import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import InterviewCreation from './pages/InterviewCreation';
import InterviewSession from './pages/InterviewSession';
import InterviewSummary from './pages/InterviewSummary';
import InterviewHistory from './pages/InterviewHistory';

// Icons for toast
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast Notification Sub-component
const GlobalToast = () => {
  const { toast } = useAuth();

  if (!toast.message) return null;

  const bgMap = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  };

  const IconMap = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info,
    warning: AlertTriangle
  };

  const Icon = IconMap[toast.type] || Info;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`glass-panel border p-4 rounded-2xl flex items-start space-x-3 shadow-glass ${bgMap[toast.type] || bgMap.info}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider">
            {toast.type === 'error' ? 'Error occurred' : toast.type || 'Notification'}
          </p>
          <p className="text-xs mt-1 leading-relaxed font-semibold">{toast.message}</p>
        </div>
      </motion.div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/interview/new" element={<InterviewCreation />} />
          <Route path="/interview/:id/session" element={<InterviewSession />} />
          <Route path="/interview/:id/summary" element={<InterviewSummary />} />
          <Route path="/history" element={<InterviewHistory />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalToast />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
