import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Sparkles, 
  Briefcase, 
  Award, 
  CheckSquare, 
  Play, 
  Cpu, 
  Terminal,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewCreation = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [difficulty, setDifficulty] = useState('Intermediate');
  
  // Generating state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Sync with profile if user is loaded
  useEffect(() => {
    if (user) {
      if (user.experienceLevel) setExperienceLevel(user.experienceLevel);
      if (user.skills && user.skills.length > 0) setSkills(user.skills.join(', '));
    }
  }, [user]);

  const generationMessages = [
    "Establishing handshake with PrepAI Brain...",
    "Scanning skills profiles & experience grade...",
    "Drafting customized assessment parameters...",
    "AI compiling technical questions array...",
    "Finalizing live evaluation chamber..."
  ];

  useEffect(() => {
    let interval = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev < generationMessages.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);
    } else {
      setGenerationStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) {
      showToast('Please enter a target Job Role', 'error');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/interview/generate', {
        jobRole,
        experienceLevel,
        skills,
        difficulty
      });

      const { interview } = response.data;
      showToast('Interview session generated successfully!', 'success');
      
      // Wait briefly for last step visual before redirecting
      setTimeout(() => {
        navigate(`/interview/${interview._id}/session`);
      }, 1000);
    } catch (error) {
      console.error('Error generating interview:', error);
      setIsGenerating(false);
      const msg = error.response?.data?.message || 'Failed to generate interview. Please try again.';
      showToast(msg, 'error');
      setErrorMsg(msg);
    }
  };

  const [errorMsg, setErrorMsg] = useState('');

  // Popular options helper
  const popularRoles = [
    "Frontend Developer", "Backend Developer", "Full Stack Engineer", 
    "Data Scientist", "DevOps Engineer", "Product Manager"
  ];

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Start Interview" />

        <main className="flex-1 p-6 flex flex-col justify-center max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {!isGenerating ? (
              <motion.div
                key="creation-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Intro Headers */}
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start space-x-2">
                    <Sparkles className="w-6 h-6 text-brandPurple animate-pulse-glow" />
                    <span>Setup Mock Interview Room</span>
                  </h2>
                  <p className="text-sm text-slate-400">
                    Configure your targeted parameters. AI Interview will create a dedicated session specific to your expertise.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="glass-panel p-8 rounded-3xl shadow-glass border border-glass">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Job Role Input & Quick Picks */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Briefcase className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          value={jobRole}
                          onChange={(e) => setJobRole(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                          placeholder="e.g. Software Engineer, React Developer"
                          required
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {popularRoles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setJobRole(role)}
                            className="px-3 py-1 bg-slate-900 border border-glass hover:border-brandPurple/30 text-slate-400 hover:text-white text-xs rounded-lg transition-all"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skill profile matchers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Experience dropdown */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Experience Level</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <Award className="w-5 h-5" />
                          </span>
                          <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm appearance-none bg-transparent"
                          >
                            <option value="Beginner" className="bg-darkCard">Beginner (0-2 Yrs)</option>
                            <option value="Intermediate" className="bg-darkCard">Intermediate (2-5 Yrs)</option>
                            <option value="Expert" className="bg-darkCard">Expert (5+ Yrs)</option>
                          </select>
                        </div>
                      </div>

                      {/* Difficulty level */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interview Difficulty</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <CheckSquare className="w-5 h-5" />
                          </span>
                          <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm appearance-none bg-transparent"
                          >
                            <option value="Beginner" className="bg-darkCard">Easy (Fundamental conceptual checks)</option>
                            <option value="Intermediate" className="bg-darkCard">Medium (Intermediate and API designs)</option>
                            <option value="Expert" className="bg-darkCard">Hard (Advanced architecture and failures)</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    {/* Specific skills */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Skills Focus (Comma Separated)</label>
                      <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm h-24 resize-none"
                        placeholder="React, JavaScript, Node.js, System Design, REST APIs..."
                      />
                      <p className="text-[10px] text-slate-500 mt-2">Questions will focus on testing competency for these specific frameworks/skills.</p>
                    </div>

                    {/* Generate button */}
                    <button
                      type="submit"
                      className="w-full py-4 bg-brandPurple hover:bg-brandPurple/90 text-white font-bold rounded-xl shadow-glow-purple flex items-center justify-center space-x-2 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>Start Mock Session</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="generating-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center justify-center py-20 space-y-8"
              >
                {/* Recruiter Brain Animation */}
                <div className="relative flex items-center justify-center w-28 h-28">
                  <div className="absolute inset-0 rounded-full border border-brandPurple/40 animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-2 rounded-full border border-brandGlow/30 animate-pulse-glow"></div>
                  <div className="p-5 bg-brandPurple/20 border border-brandPurple/40 rounded-full shadow-glow-purple">
                    <Cpu className="w-12 h-12 text-brandPurple animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white">Generating AI Mock Session</h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto animate-pulse">
                    {generationMessages[generationStep]}
                  </p>
                </div>

                {/* Micro status ticker */}
                <div className="glass-panel w-full max-w-md p-4 rounded-2xl flex items-center space-x-3 text-left">
                  <Terminal className="w-5 h-5 text-brandGlow flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Engine Logs</p>
                    <p className="text-xs text-brandPurple font-mono truncate mt-0.5">
                      GET /api/interview/generate - Status: Creating Questions...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default InterviewCreation;
