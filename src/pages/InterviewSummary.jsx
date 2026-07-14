import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import { 
  Award, 
  Download, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  FileText,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewSummary = () => {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`/api/interview/${interviewId}`);
        setData(response.data);
        if (response.data.questions && response.data.questions.length > 0) {
          setExpandedQuestionId(response.data.questions[0]._id);
        }
      } catch (error) {
        console.error('Error fetching summary details:', error);
        showToast('Error loading interview scorecard', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [interviewId]);

  // Expand / collapse questions helper
  const toggleQuestion = (qId) => {
    if (expandedQuestionId === qId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(qId);
    }
  };

  // Generate PDF report via jsPDF
  const generatePDFReport = () => {
    if (!data) return;
    const { interview, questions, responses, feedbacks, scoreCard } = data;

    const doc = new jsPDF();
    const primaryColor = '#8b5cf6'; // purple
    let y = 20;

    // Header Title block
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(11, 15, 25);
    doc.text('PrepAI Mock Interview Scorecard', 20, y);
    y += 10;

    // Subtitle metadata
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Candidate: ${user?.name || 'Not Available'}  |  Date: ${new Date(interview.createdAt).toLocaleDateString()}`, 20, y);
    y += 5;
    doc.text(`Target Job Role: ${interview.jobRole}  |  Experience Level: ${interview.experienceLevel}`, 20, y);
    y += 15;

    // Draw horizontal separator
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, 190, y);
    y += 10;

    // Overall Score Breakdown
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 15, 25);
    doc.text('Overall Performance Summary', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Overall Score: ${scoreCard?.overallScore || 0}%`, 20, y);
    doc.text(`Technical Core: ${scoreCard?.technicalScore || 0}%`, 75, y);
    doc.text(`Communication Clarity: ${scoreCard?.communicationScore || 0}%`, 130, y);
    y += 8;
    doc.text(`Structure & Formatting: ${scoreCard?.structureScore || 0}%`, 20, y);
    y += 12;

    // Executive summary text wrap
    doc.setFont('Helvetica', 'bold');
    doc.text('Executive Summary:', 20, y);
    y += 6;
    doc.setFont('Helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(scoreCard?.summary || 'No overall evaluation details.', 170);
    doc.text(summaryLines, 20, y);
    y += (summaryLines.length * 5) + 15;

    // Questions and Answers Block
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Questions & Answer Analysis', 20, y);
    y += 10;

    questions.forEach((q, idx) => {
      const resp = responses.find(r => r.questionId.toString() === q._id.toString());
      const feed = feedbacks.find(f => f.questionId.toString() === q._id.toString());

      // If text hits the bottom margins, add new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(119, 73, 221); // purple accent
      doc.text(`Q${idx + 1}: ${q.text}`, 20, y);
      y += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const ansText = `Answer: ${resp ? resp.transcript : '(No response recorded)'}`;
      const ansLines = doc.splitTextToSize(ansText, 170);
      doc.text(ansLines, 20, y);
      y += (ansLines.length * 5) + 5;

      if (feed) {
        doc.setFont('Helvetica', 'bold');
        doc.text(`Score: ${feed.score}/100`, 20, y);
        y += 6;
        
        doc.setFont('Helvetica', 'normal');
        const feedText = `AI Feedback: ${feed.feedbackText}`;
        const feedLines = doc.splitTextToSize(feedText, 170);
        doc.text(feedLines, 20, y);
        y += (feedLines.length * 5) + 5;

        // Print list details
        if (feed.strengths?.length > 0) {
          doc.setFont('Helvetica', 'bold');
          doc.text('Strengths:', 20, y);
          y += 5;
          doc.setFont('Helvetica', 'normal');
          feed.strengths.forEach(str => {
            doc.text(`- ${str}`, 25, y);
            y += 5;
          });
        }
        if (feed.weaknesses?.length > 0) {
          doc.setFont('Helvetica', 'bold');
          doc.text('Areas of Improvement:', 20, y);
          y += 5;
          doc.setFont('Helvetica', 'normal');
          feed.weaknesses.forEach(wk => {
            doc.text(`- ${wk}`, 25, y);
            y += 5;
          });
        }
        y += 5;
      }

      // Divider line
      doc.setDrawColor(240, 240, 240);
      doc.line(20, y, 190, y);
      y += 10;
    });

    // Download PDF
    doc.save(`PrepAI_Scorecard_${interview.jobRole.replace(/\s+/g, '_')}.pdf`);
    showToast('Scorecard PDF downloaded successfully!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs text-slate-400">Assembling scorecard analytics...</p>
        </div>
      </div>
    );
  }

  const { interview, questions, responses, feedbacks, scoreCard } = data;

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Interview Scorecard" />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto max-w-5xl">
          {/* Back to dashboard */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 py-1 px-3 rounded-lg bg-slate-900 border border-glass"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <button
              onClick={generatePDFReport}
              className="px-4 py-2 bg-brandPurple hover:bg-brandPurple/90 text-white text-xs font-bold rounded-xl shadow-glow-purple flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Report</span>
            </button>
          </div>

          {/* Top Panel: Big Score & Performance Category Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Big Radial/Glow Score Card */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brandPurple to-brandGlow"></div>
              
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Grade</p>
              
              {/* Glowing Score Badge */}
              <div className="w-32 h-32 rounded-full border-4 border-brandPurple/20 flex items-center justify-center mt-6 relative shadow-glow-purple/20">
                <div className="absolute inset-0.5 rounded-full border-4 border-brandPurple border-t-transparent animate-pulse-glow" style={{ animationDuration: '4s' }}></div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white">{scoreCard?.overallScore || 0}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">% Match</span>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                <h4 className="text-sm font-bold text-slate-200 capitalize">{interview.jobRole}</h4>
                <p className="text-xs text-slate-500 capitalize">{interview.difficulty} difficulty</p>
              </div>
            </div>

            {/* Sub-Scores sliders (Technical, Communication, Structure) */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-center space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categorized breakdown</h3>
              
              {/* Technical Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Technical Competency</span>
                  <span className="text-brandPurple">{scoreCard?.technicalScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-glass h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brandPurple h-full rounded-full transition-all duration-1000 shadow-glow-purple" 
                    style={{ width: `${scoreCard?.technicalScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Communication Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Communication Clarity</span>
                  <span className="text-indigo-400">{scoreCard?.communicationScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-glass h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000 shadow-glow-indigo" 
                    style={{ width: `${scoreCard?.communicationScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Structure Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Logical Structure & Flow</span>
                  <span className="text-emerald-400">{scoreCard?.structureScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-glass h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${scoreCard?.structureScore || 0}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* AI Executive Summary Block */}
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-brandPurple" />
              <span>AI Evaluator General Feedback</span>
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {scoreCard?.summary || 'No feedback analysis generated for this session.'}
            </p>
          </div>

          {/* Questions and feedback breakdown list */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white px-1">Detailed Question Analytics</h3>
            
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const isExpanded = expandedQuestionId === q._id;
                const resp = responses.find(r => r.questionId.toString() === q._id.toString());
                const feed = feedbacks.find(f => f.questionId.toString() === q._id.toString());

                return (
                  <div 
                    key={q._id} 
                    className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isExpanded ? 'border-brandPurple/30' : 'border-glass hover:border-glass/80'
                    }`}
                  >
                    {/* Collapsed Header click row */}
                    <div 
                      onClick={() => toggleQuestion(q._id)}
                      className="p-5 flex items-center justify-between cursor-pointer select-none bg-slate-900/10"
                    >
                      <div className="flex-1 pr-4 min-w-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-bold text-brandPurple uppercase tracking-wider bg-brandPurple/10 px-2 py-0.5 border border-brandPurple/20 rounded">
                            Q{idx + 1}
                          </span>
                          {q.followUpTo && (
                            <span className="text-[9px] font-bold text-brandGlow uppercase tracking-wider bg-brandGlow/10 px-1.5 py-0.5 border border-brandGlow/20 rounded animate-pulse">
                              AI Follow-Up
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mt-2 truncate max-w-2xl">{q.text}</h4>
                      </div>
                      
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <span className="text-xs font-extrabold text-slate-400">
                          {feed ? `Score: ${feed.score}/100` : '—'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expandable details wrapper */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-glass/40 overflow-hidden"
                        >
                          <div className="p-6 space-y-6 text-sm">
                            {/* Question details */}
                            <div>
                              <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Question</h5>
                              <p className="text-slate-200 font-semibold">{q.text}</p>
                            </div>

                            {/* Candidate Answer details */}
                            <div>
                              <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your Recorded Transcript</h5>
                              <div className="p-4 bg-slate-950/40 border border-glass rounded-xl text-slate-300 font-medium leading-relaxed italic">
                                "{resp ? resp.transcript : '(No response recorded)'}"
                              </div>
                            </div>

                            {/* AI Detailed Feedback text */}
                            {feed && (
                              <div className="space-y-4">
                                <div>
                                  <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">AI Detailed Evaluation</h5>
                                  <p className="text-slate-300 leading-relaxed font-medium">{feed.feedbackText}</p>
                                </div>

                                {/* Strengths and weaknesses bullet boxes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Strengths */}
                                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                                    <h6 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center space-x-1.5">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Core Strengths</span>
                                    </h6>
                                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                                      {feed.strengths?.length > 0 ? (
                                        feed.strengths.map((str, i) => <li key={i}>{str}</li>)
                                      ) : (
                                        <li>Satisfactory explanation matching standard descriptions.</li>
                                      )}
                                    </ul>
                                  </div>

                                  {/* Weaknesses */}
                                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                                    <h6 className="text-[10px] font-bold text-red-400 uppercase tracking-wide flex items-center space-x-1.5">
                                      <XCircle className="w-4 h-4" />
                                      <span>Areas of Gaps</span>
                                    </h6>
                                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                                      {feed.weaknesses?.length > 0 ? (
                                        feed.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)
                                      ) : (
                                        <li>No severe technical loopholes identified.</li>
                                      )}
                                    </ul>
                                  </div>
                                </div>

                                {/* suggestions */}
                                {feed.suggestions?.length > 0 && (
                                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                                    <h6 className="text-[10px] font-bold text-amber-400 uppercase tracking-wide flex items-center space-x-1.5">
                                      <Lightbulb className="w-4 h-4" />
                                      <span>Improvement Suggestions</span>
                                    </h6>
                                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                                      {feed.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                                    </ul>
                                  </div>
                                )}

                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewSummary;
