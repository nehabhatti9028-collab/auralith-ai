import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  Sparkles, 
  History, 
  LogOut, 
  Menu, 
  X, 
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Start Interview', path: '/interview/new', icon: Sparkles },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full glass-panel border-r border-glass text-slate-300 py-6 px-4">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 px-3 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="p-2 bg-brandPurple/20 border border-brandPurple/40 rounded-xl shadow-glow-purple">
          <Cpu className="w-6 h-6 text-brandPurple animate-pulse-glow" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-brandPurple bg-clip-text text-transparent">
          PrepAI
        </span>
      </div>

      {/* User Mini Card */}
      {user && (
        <div className="flex items-center space-x-3 px-3 py-4 mb-6 bg-slate-900/40 border border-glass rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brandPurple to-brandGlow flex items-center justify-center font-bold text-white shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate text-slate-100">{user.name}</h4>
            <p className="text-xs truncate text-slate-400">{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active 
                  ? 'bg-brandPurple text-white font-medium shadow-glow-purple' 
                  : 'hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-brandPurple'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Log Out button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 px-4 py-3 mt-auto rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors duration-200 border border-transparent hover:border-red-500/20"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-darkCard border border-glass rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-brandPurple/40"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-50 h-full"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
