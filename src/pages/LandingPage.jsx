import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Cpu, 
  Mic, 
  FileText, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const features = [
    {
      icon: Cpu,
      title: "AI Interview Generator",
      desc: "Tailored mock sessions generated on-demand matching your targeted Job Role, specific Skills, and difficulty levels."
    },
    {
      icon: Mic,
      title: "Voice Response Chamber",
      desc: "Answer naturally. Integrated Speech-to-Text captures transcripts, while Text-to-Speech reads questions like a real human."
    },
    {
      icon: FileText,
      title: "Resume Parser & Analyzer",
      desc: "Upload a PDF resume to instantly map your experience levels, extract skills, and audit compatibility scores."
    },
    {
      icon: TrendingUp,
      title: "Deep Diagnostics & Scores",
      desc: "Receive granular analysis highlighting core strengths, communication gaps, structural suggestion blocks, and a final grade."
    }
  ];

  return (
    <div className="min-h-screen bg-darkBg overflow-hidden text-slate-100 flex flex-col relative">
      {/* Decorative Aurora Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brandPurple/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brandGlow/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="glass-panel border-b border-glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-brandPurple/20 border border-brandPurple/40 rounded-lg">
            <Cpu className="w-5 h-5 text-brandPurple animate-pulse-glow" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-brandPurple bg-clip-text text-transparent">Auralith AI</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="px-4 py-2 bg-brandPurple hover:bg-brandPurple/90 text-white text-sm font-semibold rounded-lg shadow-glow-purple transition-all duration-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-brandPurple hover:bg-brandPurple/90 text-white text-sm font-semibold rounded-lg shadow-glow-purple transition-all duration-200"
              >
                Register Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center text-center relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 px-3 py-1 bg-brandPurple/10 border border-brandPurple/30 rounded-full text-brandPurple text-xs font-semibold mb-6 shadow-glow-purple/20"
          >
            <Sparkles className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Confidence Starts Here</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
          >
            Dream Bigger Achieve Faster <span className="bg-gradient-to-r from-brandPurple to-brandGlow bg-clip-text text-transparent">
              AI Interview</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
           Practice realistic AI interviews, receive personalized feedback, improve your communication and technical skills, and build the confidence to achieve your dream career.          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="w-full sm:w-auto px-8 py-4 bg-brandPurple hover:bg-brandPurple/90 text-white font-bold rounded-xl shadow-glow-purple hover:shadow-purple-500/30 flex items-center justify-center space-x-2 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Build Mock Session</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-900 border border-glass hover:border-brandPurple/40 text-slate-300 hover:text-white font-bold rounded-xl transition-all duration-300"
            >
              Sign In Account
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-24"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col text-left group"
              >
                <div className="p-3 bg-brandPurple/10 border border-brandPurple/20 rounded-xl w-fit mb-5 group-hover:bg-brandPurple group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6 text-brandPurple group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors mb-2">
                  {feat.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-1">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 pt-8 border-t border-glass w-full flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs"
        >
          <div className="flex items-center space-x-1.5 mb-4 sm:mb-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />

            <span>Building Confidence for Every Opportunity</span>          </div>
          <span>&copy; {new Date().getFullYear()} Auralith AI platform. All rights reserved.</span>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
