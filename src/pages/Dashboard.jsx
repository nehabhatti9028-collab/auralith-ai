import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Sparkles, 
  Award, 
  Activity, 
  BookOpen, 
  UploadCloud, 
  CheckCircle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/interview/history');
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const completedInterviews = history.filter(i => i.status === 'completed');
  const totalInterviews = history.length;
  
  // Calculate average score
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, item) => sum + (item.scoreCard?.overallScore || 0), 0) / completedInterviews.length)
    : 0;

  // Format date helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Dashboard" />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Welcome/Banner Block */}
          {!user?.resumeAnalysis ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel border-brandPurple/30 bg-gradient-to-r from-brandPurple/10 via-brandGlow/5 to-slate-950 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between"
            >
              <div className="space-y-2 mb-4 md:mb-0 text-center md:text-left">
                <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center justify-center md:justify-start space-x-2">
                  <Sparkles className="w-5 h-5 text-brandPurple animate-pulse-glow" />
                  <span>Optimize Your AI Interviews!</span>
                </h2>
                <p className="text-sm text-slate-400 max-w-xl">
                  Upload your PDF resume to parse your skills automatically. Our AI will align generated interview questions specifically to your background!
                </p>
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="px-5 py-3 bg-brandPurple hover:bg-brandPurple/90 text-white text-sm font-bold rounded-xl shadow-glow-purple flex items-center space-x-2 transition-all duration-200"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resume</span>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-slate-950 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between"
            >
              <div className="space-y-1 mb-4 md:mb-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 text-emerald-400 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Profile Synchronized</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Ready for custom tailormade interview chambers</h3>
                <p className="text-xs text-slate-400">
                  Detected level: <strong className="text-brandPurple">{user.experienceLevel}</strong>. Active skills: {user.skills?.slice(0, 8).join(', ')}...
                </p>
              </div>
              <button 
                onClick={() => navigate('/interview/new')}
                className="px-5 py-3 bg-brandPurple hover:bg-brandPurple/90 text-white text-sm font-bold rounded-xl shadow-glow-purple flex items-center space-x-2 transition-all duration-200"
              >
                <span>Launch New Interview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Stats Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Interviews */}
            <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-brandPurple/10 border border-brandPurple/20 text-brandPurple rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Mock Sessions</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{totalInterviews}</h3>
              </div>
            </div>

            {/* Average Score */}
            <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {avgScore > 0 ? `${avgScore}%` : 'N/A'}
                </h3>
              </div>
            </div>

            {/* Identified Skills */}
            <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profile Skills</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {user?.skills?.length || 0}
                </h3>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed rate</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {totalInterviews > 0 ? `${Math.round((completedInterviews.length / totalInterviews) * 100)}%` : '0%'}
                </h3>
              </div>
            </div>
          </div>

          {/* Core Dashboard sections: Actions & History */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <div className="xl:col-span-1 space-y-6">
              <h3 className="text-lg font-bold text-slate-200 px-1">Quick Launchers</h3>
              
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="p-4 bg-slate-900/50 border border-glass rounded-xl hover:border-brandPurple/30 transition-colors cursor-pointer" onClick={() => navigate('/interview/new')}>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-brandPurple" />
                    <span>Create Mock Session</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-2">Generate target questions based on specific roles, levels, and difficulties.</p>
                </div>

                <div className="p-4 bg-slate-900/50 border border-glass rounded-xl hover:border-brandPurple/30 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-brandGlow" />
                    <span>Manage Resume</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-2">Upload and analyze PDF profiles to review skills mappings & compatibility metrics.</p>
                </div>
              </div>
            </div>

            {/* Recent History Table Card */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-slate-200">Recent Activity</h3>
                {history.length > 0 && (
                  <button 
                    onClick={() => navigate('/history')}
                    className="text-xs text-brandPurple hover:underline font-semibold flex items-center space-x-1"
                  >
                    <span>View All History</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="glass-panel p-6 rounded-2xl min-h-[250px] flex flex-col">
                {loadingHistory ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400 mt-3">Loading session history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                    <Clock className="w-10 h-10 text-slate-600 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-400">No mock sessions found</h4>
                    <p className="text-xs text-slate-500 max-w-xs">You haven't conducted any mock interviews yet. Launch your first mock session!</p>
                    <button
                      onClick={() => navigate('/interview/new')}
                      className="px-4 py-2 bg-brandPurple/20 border border-brandPurple/30 text-brandPurple text-xs font-semibold rounded-lg hover:bg-brandPurple hover:text-white transition-all duration-200"
                    >
                      Create First Session
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead>
                        <tr className="border-b border-glass text-slate-400 font-semibold text-xs uppercase tracking-wider">
                          <th className="pb-3">Job Role</th>
                          <th className="pb-3 hidden sm:table-cell">Difficulty</th>
                          <th className="pb-3 hidden sm:table-cell">Date Created</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-glass/40">
                        {history.slice(0, 5).map((session) => (
                          <tr 
                            key={session._id} 
                            onClick={() => navigate(session.status === 'completed' ? `/interview/${session._id}/summary` : `/interview/new`)}
                            className="hover:bg-slate-900/40 cursor-pointer transition-colors"
                          >
                            <td className="py-4 font-bold text-white pr-2">
                              {session.jobRole}
                              <span className="sm:hidden block text-[10px] text-slate-400 font-normal mt-0.5">{session.difficulty} • {formatDate(session.createdAt)}</span>
                            </td>
                            <td className="py-4 hidden sm:table-cell">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                session.difficulty === 'Expert' 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : session.difficulty === 'Intermediate'
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {session.difficulty}
                              </span>
                            </td>
                            <td className="py-4 text-xs text-slate-400 hidden sm:table-cell">{formatDate(session.createdAt)}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold ${
                                session.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                                <span>{session.status === 'completed' ? 'Completed' : 'In Progress'}</span>
                              </span>
                            </td>
                            <td className="py-4 text-right font-extrabold text-white text-base">
                              {session.status === 'completed' && session.scoreCard
                                ? `${session.scoreCard.overallScore}%`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
