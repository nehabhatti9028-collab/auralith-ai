import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  ExternalLink, 
  PlayCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

const InterviewHistory = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  // States
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter options
  const [searchRole, setSearchRole] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchRole) params.role = searchRole;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterStatus) params.status = filterStatus;

      const response = await axios.get('/api/interview/history', { params });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      showToast('Error loading history records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [searchRole, filterDifficulty, filterStatus]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Interview History" />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl">
          {/* Top filter section */}
          <div className="glass-panel p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Search Input */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Job Role</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                  placeholder="e.g. React Developer, Backend Engineer"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs appearance-none bg-transparent"
              >
                <option value="" className="bg-darkCard">All Difficulties</option>
                <option value="Beginner" className="bg-darkCard">Easy</option>
                <option value="Intermediate" className="bg-darkCard">Medium</option>
                <option value="Expert" className="bg-darkCard">Hard</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs appearance-none bg-transparent"
              >
                <option value="" className="bg-darkCard">All Statuses</option>
                <option value="completed" className="bg-darkCard">Completed</option>
                <option value="in_progress" className="bg-darkCard">In Progress</option>
              </select>
            </div>

          </div>

          {/* History records container */}
          <div className="glass-panel p-6 rounded-3xl min-h-[350px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 mt-4">Filtering history entries...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-12">
                <HelpCircle className="w-12 h-12 text-slate-700 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-400">No matching mock sessions</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Could not find any mock records matching your search queries. Try relaxing your filters or start a new session!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {history.map((session, index) => {
                  const isCompleted = session.status === 'completed';
                  return (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(isCompleted ? `/interview/${session._id}/summary` : `/interview/${session._id}/session`)}
                      className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between border border-glass cursor-pointer group relative overflow-hidden"
                    >
                      {/* Top title */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            session.difficulty === 'Expert'
                              ? 'border-red-500/20 bg-red-500/10 text-red-400'
                              : session.difficulty === 'Intermediate'
                                ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {session.difficulty}
                          </span>

                          <span className={`flex items-center space-x-1 text-[10px] font-bold ${
                            isCompleted ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                            <span>{isCompleted ? 'Completed' : 'In Progress'}</span>
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-white group-hover:text-brandPurple transition-colors leading-tight">
                          {session.jobRole}
                        </h3>
                        
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                      </div>

                      {/* Bottom values summary */}
                      <div className="border-t border-glass/40 pt-4 mt-5 flex items-center justify-between">
                        {isCompleted && session.scoreCard ? (
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold text-slate-400">Match score:</span>
                            <span className="text-sm font-extrabold text-white">{session.scoreCard.overallScore}%</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold italic">Unfinished session</span>
                        )}

                        <div className="text-xs text-brandPurple group-hover:text-white transition-colors flex items-center space-x-1 font-bold">
                          {isCompleted ? (
                            <>
                              <span>Scorecard</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Resume</span>
                              <PlayCircle className="w-3.5 h-3.5" />
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewHistory;
