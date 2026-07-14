import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  Mic, 
  MicOff, 
  Volume2, 
  Video, 
  VideoOff, 
  Play, 
  ChevronRight, 
  AlertCircle,
  Clock,
  User,
  Power,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewSession = () => {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();

  // Interview state
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permissions state
  const [hasCameraPerm, setHasCameraPerm] = useState(false);
  const [hasMicPerm, setHasMicPerm] = useState(false);
  const [mediaError, setMediaError] = useState('');

  // Video Ref
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds per question
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const timerRef = useRef(null);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Fetch Interview Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`/api/interview/${interviewId}`);
        setInterview(response.data.interview);
        setQuestions(response.data.questions);
        setResponses(response.data.responses || []);
        
        // Find first unanswered question
        const answeredIds = (response.data.responses || []).map(r => r.questionId.toString());
        const firstUnansweredIndex = response.data.questions.findIndex(q => !answeredIds.includes(q._id.toString()));
        
        if (firstUnansweredIndex !== -1) {
          setCurrentIdx(firstUnansweredIndex);
        } else if (response.data.questions.length > 0) {
          // All answered, redirect to summary
          navigate(`/interview/${interviewId}/summary`);
        }
      } catch (error) {
        console.error('Error fetching interview details:', error);
        showToast('Error loading interview session', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [interviewId]);

  // Request webcam & microphone permissions and activate stream
  const startMediaDevices = async () => {
    try {
      setMediaError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 300 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPerm(true);
      setHasMicPerm(true);
    } catch (err) {
      console.error('Media devices permission denied:', err);
      setMediaError('Could not access webcam or microphone. Please check browser permissions.');
      setHasCameraPerm(false);
      setHasMicPerm(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      startMediaDevices();
    }
    return () => {
      stopMediaDevices();
    };
  }, [loading]);

  const stopMediaDevices = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (loading || questions.length === 0 || currentIdx >= questions.length) return;

    setTimeLeft(90);
    setQuestionStartTime(Date.now());

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit(); // Time is up, auto-submit transcript
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, questions, loading]);

  // Voice Speech synthesis: Read question when index changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentIdx]) {
      speakQuestion(questions[currentIdx].text);
      setTranscript('');
    }
  }, [currentIdx, questions]);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select a nice English voice if available
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(voice => voice.lang.includes('en-US') && voice.name.includes('Google')) 
        || voices.find(voice => voice.lang.includes('en'));
      
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // HTML5 Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript((prev) => {
          // Combine prev and new results cleanly
          const updated = (prev + ' ' + finalTranscript).trim();
          return updated;
        });
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          showToast('Speech recognition issue: ' + event.error, 'info');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser. Please type your response.', 'warning');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        showToast('Listening... Speak clearly.', 'info');
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  // Submit Answer
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAnswer = async (finalAnswer) => {
    if (isSubmitting) return;

    const currentQuestion = questions[currentIdx];
    const duration = Math.round((Date.now() - questionStartTime) / 1000);

    // Stop recording first
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/interview/${interviewId}/response`, {
        questionId: currentQuestion._id,
        transcript: finalAnswer || transcript || '(No response provided)',
        duration
      });

      const { followUpQuestion } = response.data;
      
      showToast('Response logged!', 'success');

      // Inject Follow-up dynamically if returned
      if (followUpQuestion) {
        showToast('AI Recruiter generated a follow-up question!', 'info');
        
        // Insert followUpQuestion right after current index
        const updatedQuestions = [...questions];
        updatedQuestions.splice(currentIdx + 1, 0, followUpQuestion);
        
        // Correct order keys
        for (let i = 0; i < updatedQuestions.length; i++) {
          updatedQuestions[i].order = i + 1;
        }
        
        setQuestions(updatedQuestions);
      }

      // Progress index
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Last question answered, automatically finish interview
        handleFinishInterview();
      }
    } catch (error) {
      console.error('Error logging answer:', error);
      showToast('Error saving response', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    showToast('Time expired. Auto-submitting response.', 'info');
    submitAnswer(transcript || '(Time expired - no response)');
  };

  const handleFinishInterview = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/interview/${interviewId}/finish`);
      showToast('Interview completed! Calculating scorecard...', 'success');
      navigate(`/interview/${interviewId}/summary`);
    } catch (error) {
      console.error('Error closing interview:', error);
      showToast('Error finalizing scorecard', 'error');
      setLoading(false);
    }
  };

  const handleSaveAndExit = () => {
    stopMediaDevices();
    showToast('Progress saved. You can resume this session later.', 'info');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs text-slate-400">Booting live interview chamber...</p>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-darkBg flex flex-col relative text-slate-100">
      
      {/* Session Header */}
      <header className="glass-panel border-b border-glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-brandPurple/20 border border-brandPurple/40 rounded-lg">
            <Cpu className="w-5 h-5 text-brandPurple animate-pulse-glow" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">{interview?.jobRole}</h2>
            <p className="text-[10px] text-slate-400 mt-1 capitalize">{interview?.difficulty} level</p>
          </div>
        </div>

        {/* Question progress dot grid */}
        <div className="hidden md:flex items-center space-x-2">
          {questions.map((q, idx) => (
            <div 
              key={q._id || idx}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIdx 
                  ? 'bg-brandPurple scale-125 shadow-glow-purple' 
                  : idx < currentIdx 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-800'
              }`}
              title={`Question ${idx + 1}`}
            />
          ))}
        </div>

        <button 
          onClick={handleSaveAndExit}
          className="px-4 py-2 bg-slate-900 border border-glass hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-xl transition-all"
        >
          Save & Exit
        </button>
      </header>

      {/* Main session body grid */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden">
        
        {/* Left Column: Webcam & mic feedback (Lg: col 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Webcam view container */}
          <div className="flex-1 glass-panel rounded-3xl overflow-hidden relative min-h-[250px] bg-slate-950 flex items-center justify-center border border-glass shadow-lg">
            {hasCameraPerm ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" // mirror view
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <VideoOff className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-400">Webcam Feed Inactive</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {mediaError || "Camera permission is requested to stream live interview visuals."}
                </p>
                <button
                  onClick={startMediaDevices}
                  className="px-4 py-2 bg-brandPurple/20 border border-brandPurple/30 text-brandPurple text-xs font-semibold rounded-lg hover:bg-brandPurple hover:text-white transition-all"
                >
                  Activate Stream
                </button>
              </div>
            )}

            {/* Float Overlay Indicators */}
            {hasCameraPerm && (
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-glass px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-300">Live Video Stream</span>
              </div>
            )}
          </div>

          {/* Device diagnostics */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                {hasCameraPerm ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
                <span>Camera</span>
              </span>
              <span className="flex items-center space-x-1.5">
                {hasMicPerm ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                <span>Microphone</span>
              </span>
            </div>
            <button 
              onClick={startMediaDevices}
              className="text-brandPurple hover:underline font-semibold"
            >
              Reset Devices
            </button>
          </div>
        </div>

        {/* Right Column: Question text & recording response workspace (Lg: col 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Question panel */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-brandPurple/10 border border-brandPurple/20 text-brandPurple rounded-lg text-xs font-bold shadow-glow-purple/20">
                Question {currentIdx + 1} of {questions.length}
              </span>
              
              {/* Question timer */}
              <div className={`flex items-center space-x-1.5 px-3 py-1 border rounded-lg text-xs font-mono font-bold ${
                timeLeft < 20 
                  ? 'border-red-500/40 bg-red-500/10 text-red-400 animate-pulse' 
                  : 'border-glass bg-slate-900/40 text-slate-300'
              }`}>
                <Clock className="w-4 h-4" />
                <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="min-h-[90px] flex items-center">
              <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {activeQuestion?.text}
              </h3>
            </div>

            {/* Audio Synthesis / Repeat button */}
            <div className="flex items-center justify-between border-t border-glass/40 pt-4">
              <button
                onClick={() => speakQuestion(activeQuestion?.text)}
                className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                <Volume2 className="w-4.5 h-4.5 text-brandPurple" />
                <span>Repeat Voice Readout</span>
              </button>

              {activeQuestion?.followUpTo && (
                <span className="text-[10px] text-brandGlow bg-brandGlow/10 px-2 py-0.5 rounded-full border border-brandGlow/20 animate-pulse font-semibold">
                  AI Follow-Up Question
                </span>
              )}
            </div>
          </div>

          {/* Transcript/Input Response Workspace */}
          <div className="flex-1 glass-panel p-6 rounded-3xl flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Answer Response</label>
              {isRecording && (
                <div className="flex items-center space-x-1">
                  <span className="voice-wave-bar wave-delay-1"></span>
                  <span className="voice-wave-bar wave-delay-2"></span>
                  <span className="voice-wave-bar wave-delay-3"></span>
                  <span className="voice-wave-bar wave-delay-4"></span>
                  <span className="voice-wave-bar wave-delay-5"></span>
                </div>
              )}
            </div>

            {/* Editable transcript text-area */}
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="flex-1 w-full p-4 rounded-2xl glass-input text-sm resize-none focus:ring-0 leading-relaxed font-medium bg-slate-900/30"
              placeholder="Speak using the microphone controls or type your response directly into this text block..."
              disabled={isSubmitting}
            />

            {/* Record / Submit controls bar */}
            <div className="flex items-center space-x-4 pt-2">
              {/* Record Mic toggle button */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isSubmitting}
                className={`flex-1 py-4 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                    : 'bg-brandPurple/20 border border-brandPurple/30 text-brandPurple hover:bg-brandPurple hover:text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 animate-pulse-glow" />}
                <span>{isRecording ? 'Stop Recording' : 'Answer with Voice'}</span>
              </button>

              {/* Submit Answer */}
              <button
                onClick={() => submitAnswer(transcript)}
                disabled={isSubmitting}
                className="py-4 px-8 bg-brandPurple hover:bg-brandPurple/90 text-white font-bold rounded-xl shadow-glow-purple flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                <span>{isSubmitting ? 'Logging...' : 'Submit Answer'}</span>
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default InterviewSession;
