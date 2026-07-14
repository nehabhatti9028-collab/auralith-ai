import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="glass-panel border-b border-glass sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
      {/* Page Title & Welcome */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent capitalize">
          {title}
        </h1>
        <p className="hidden sm:block text-xs text-slate-400 mt-1">
          {user ? `${getGreeting()}, ${user.name}! Prepare for success.` : 'Prepare for success.'}
        </p>
      </div>

      {/* Right Side Info */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Date Display */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/40 border border-glass px-3 py-1.5 rounded-lg">
          <Calendar className="w-4 h-4 text-brandPurple" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* User Profile Trigger */}
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-150 py-1 px-2 rounded-lg hover:bg-slate-900/40 border border-transparent hover:border-glass"
        >
          <div className="w-8 h-8 rounded-full bg-brandPurple/20 border border-brandPurple/30 flex items-center justify-center font-bold text-brandPurple">
            {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <span className="hidden sm:inline text-sm font-medium">{user ? user.name : 'Profile'}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
