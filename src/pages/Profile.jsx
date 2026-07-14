import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  User, 
  Mail, 
  UploadCloud, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  FileText, 
  Plus, 
  X,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile, updateResumeData, showToast } = useAuth();
  
  // Profile editing states
  const [name, setName] = useState(user?.name || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // File upload states
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setIsSaving(true);
    const result = await updateProfile({
      name,
      experienceLevel,
      skills: skillsInput
    });
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      showToast('Only PDF files are supported', 'error');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB', 'error');
      return;
    }
    setFile(selectedFile);
  };

  const handleResumeUpload = async () => {
    if (!file) {
      showToast('Please select a PDF file first', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Reading document content...');
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadProgress('Extracting and mapping skills via AI Interview parser...');
      const response = await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { analysis, skills, experienceLevel: level } = response.data;
      
      // Update state in Context
      updateResumeData(skills, level, analysis);
      
      // Sync editing fields
      setSkillsInput(skills.join(', '));
      setExperienceLevel(level);

      showToast('Resume uploaded and parsed successfully!', 'success');
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      const msg = error.response?.data?.message || 'Error uploading resume';
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="My Profile" />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto max-w-5xl">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Account Details & Editing */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
                {/* Header background glow */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brandPurple to-brandGlow"></div>

                <div className="w-20 h-20 rounded-full bg-brandPurple/20 border-2 border-brandPurple flex items-center justify-center font-bold text-3xl text-brandPurple shadow-glow-purple mt-4">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{user?.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>

                <div className="w-full border-t border-glass my-6"></div>

                <div className="w-full text-left space-y-4">
                  <div>
                    <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Experience Level</h5>
                    <p className="text-sm font-semibold text-white mt-1">
                      {user?.experienceLevel || 'Not Specified'}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Stored Skills</h5>
                    <p className="text-sm font-semibold text-white mt-1">
                      {user?.skills?.length || 0} Skills mapped
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full mt-6 py-2.5 bg-slate-900 border border-glass hover:border-brandPurple/30 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brandPurple" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {/* Editing Form Drawer */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel p-6 rounded-2xl overflow-hidden"
                  >
                    <h3 className="text-sm font-bold text-white mb-4">Edit Profile Fields</h3>
                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 text-sm glass-input rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience level</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full px-3 py-2 text-sm glass-input rounded-lg"
                        >
                          <option value="Beginner" className="bg-darkCard">Beginner (0-2 Yrs)</option>
                          <option value="Intermediate" className="bg-darkCard">Intermediate (2-5 Yrs)</option>
                          <option value="Expert" className="bg-darkCard">Expert (5+ Yrs)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma Separated)</label>
                        <textarea
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          className="w-full px-3 py-2 text-sm glass-input rounded-lg h-24 resize-none"
                          placeholder="React, Node.js, Python, SQL..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-2.5 bg-brandPurple hover:bg-brandPurple/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Columns: Resume Upload and AI Analysis */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Uploader Card */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-brandPurple" />
                  <span>Resume Upload</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Upload your resume in PDF format to synchronize and optimize interview questions.</p>

                {/* Drag zone */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`mt-6 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative ${
                    dragActive ? 'border-brandPurple bg-brandPurple/5' : 'border-glass hover:border-brandPurple/30 bg-slate-900/10'
                  }`}
                >
                  <input
                    type="file"
                    id="resume-file"
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center w-full h-full">
                    <UploadCloud className="w-10 h-10 text-slate-500 mb-4 animate-bounce" style={{ animationDuration: '3s' }} />
                    <p className="text-sm font-bold text-slate-300">
                      {file ? file.name : "Drag & Drop PDF or Browse"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF format only, maximum 5MB</p>
                  </label>

                  {file && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/60 hover:bg-slate-900 border border-glass rounded-full text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Upload action button / progress bar */}
                {file && !isUploading && (
                  <button
                    onClick={handleResumeUpload}
                    className="w-full mt-4 py-3 bg-brandPurple hover:bg-brandPurple/90 text-white font-bold rounded-xl shadow-glow-purple transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Extract Profile Details</span>
                  </button>
                )}

                {isUploading && (
                  <div className="mt-6 p-4 bg-brandPurple/5 border border-brandPurple/20 rounded-xl flex items-center space-x-4">
                    <div className="w-6 h-6 border-2 border-brandPurple border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">Analyzing Resume...</p>
                      <p className="text-xs text-slate-400 mt-1 animate-pulse">{uploadProgress}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Analysis Result Panel */}
              <div className="glass-panel p-6 rounded-2xl min-h-[250px] flex flex-col">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-brandGlow animate-pulse-glow" />
                  <span>AI Resume Diagnostics</span>
                </h3>

                {user?.resumeAnalysis ? (
                  <div className="mt-6 flex-1 space-y-6">
                    {/* Summary */}
                    <div className="p-4 bg-brandPurple/5 border border-brandPurple/10 rounded-xl">
                      <h4 className="text-xs font-bold text-brandPurple uppercase tracking-wider">Candidate Summary</h4>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed font-medium">
                        {user.resumeAnalysis.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Skills */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.skills?.map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-slate-900 border border-glass rounded-lg text-xs font-semibold text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Matching Level */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience Level Match</h4>
                        <div className="p-4 bg-slate-900/50 border border-glass rounded-xl flex items-center space-x-3">
                          <Cpu className="w-5 h-5 text-brandPurple" />
                          <div>
                            <p className="text-xs text-slate-500">Classified Grade</p>
                            <p className="text-sm font-bold text-white mt-0.5">{user.experienceLevel}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-600">
                    <FileText className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-400">No profile metrics available</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">Please upload your PDF resume above to extract and populate diagnostic credentials.</p>
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

export default Profile;
