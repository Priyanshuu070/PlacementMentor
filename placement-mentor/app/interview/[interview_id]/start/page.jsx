"use client"
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mic, MicOff, User } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import { toast } from "sonner";
import Vapi from "@vapi-ai/web";

// DECISION: Vapi assistant configuration - using PlayHT voice for natural conversation
const VAPI_CONFIG = {
  voiceProvider: 'playht',
  voiceId: 'jennifer',
  transcriberProvider: 'deepgram',
  transcriberModel: 'nova-2',
  language: 'en-US'
};

export default function InterviewStartPage() {
  const params = useParams();
  const interview_id = params.interview_id;
  const router = useRouter();
  const { user } = useUser();

  const [interviewData, setInterviewData] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vapi state
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const vapiRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptContainerRef = useRef(null);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('InterviewDetails')
          .select('*')
          .eq('interview_id', interview_id)
          .single();

        if (error) {
          console.error('Error fetching interview:', error);
          setError('Failed to load interview details');
          return;
        }

        if (data?.resume_analysis_id) {
          const { data: analysisData, error: analysisError } = await supabase
            .from('resume_analysis')
            .select('detected_skills_resume, detected_skills_jd, skill_gaps, coverage_score, ats_score, suggestions')
            .eq('id', data.resume_analysis_id)
            .single();

          if (!analysisError && analysisData) {
            setResumeAnalysis(analysisData);
          }
        }

        setInterviewData(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (interview_id) {
      fetchInterview();
    }
  }, [interview_id]);

  // Initialize Vapi when interview data is loaded
  useEffect(() => {
    if (!interviewData || !process.env.NEXT_PUBLIC_VAPI_API_KEY) return;

    const initVapi = async () => {
      try {
        const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
        vapiRef.current = vapi;

        // Set up event handlers
        vapi.on('call-start', () => {
          setIsConnected(true);
          // Start timer
          timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
          }, 1000);
          toast.success('Interview started');
        });

        vapi.on('call-end', () => {
          setIsConnected(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          toast.info('Interview ended');
          // Navigate to feedback page
          router.push(`/interview/${interview_id}/feedback`);
        });

        vapi.on('speech-start', () => {
          setIsSpeaking(true);
        });

        vapi.on('speech-end', () => {
          setIsSpeaking(false);
        });

        vapi.on('volume-level', (level) => {
          // DECISION: Threshold of 0.1 for detecting user speech
          setIsUserSpeaking(level > 0.1);
        });

        vapi.on('message', (message) => {
          if (message.type === 'transcript') {
            setTranscript(prev => [...prev, {
              role: message.role,
              text: message.transcript,
              timestamp: new Date().toISOString()
            }]);
          }
        });

        vapi.on('error', (error) => {
          console.error('Vapi error:', error);
          toast.error('Connection error. Please try again.');
        });

        // Parse questions for the assistant
        let questions = [];
        if (interviewData.interview_questions) {
          try {
            questions = typeof interviewData.interview_questions === 'string'
              ? JSON.parse(interviewData.interview_questions)
              : interviewData.interview_questions;
          } catch (e) {
            console.error('Error parsing questions:', e);
          }
        }

        const buildCandidateProfile = (resumeAnalysis) => {
          if (!resumeAnalysis) {
            console.log('Resume analysis loaded for interview:', {
              hasResumeContext: false,
              matchedSkills: [],
              skillGaps: [],
              atsScore: undefined
            });
            return '';
          }
          
          // Get contextual vs isolated from the full resume skills
          // We dont have zone data in DB so approximate:
          // All resume skills that are also in JD skills = matched
          const resumeSkills = resumeAnalysis.detected_skills_resume || []
          const jdSkills = resumeAnalysis.detected_skills_jd || []
          const skillGaps = resumeAnalysis.skill_gaps || []
          const matchedSkills = resumeSkills.filter(s => jdSkills.includes(s))
          
          console.log('Resume analysis loaded for interview:', {
            hasResumeContext: !!resumeAnalysis,
            matchedSkills: matchedSkills,
            skillGaps: skillGaps,
            atsScore: resumeAnalysis?.ats_score
          })
          
          return \`
CANDIDATE RESUME ANALYSIS:
- Skills matching the role: \${matchedSkills.join(', ') || 'none detected'}
- Skills required but missing: \${skillGaps.join(', ') || 'none'}
- Resume-role match score: \${resumeAnalysis.ats_score}%

INTERVIEWING STRATEGY (follow this strictly):
1. For matched skills: ask deep technical questions.
   Probe actual depth of knowledge, not just familiarity.
   Example: dont ask "do you know React" — ask 
   "walk me through how you handle state management 
   in a large React application"

2. For missing skills: ask awareness questions only.
   Example: "How familiar are you with Docker and 
   what is your understanding of containerization?"
   Do NOT penalize — treat as learning opportunity.

3. Vary question difficulty based on match score:
   - Score above 70%: go deep on technical topics
   - Score 40-70%: balance technical and conceptual
   - Score below 40%: focus on fundamentals and 
     learning ability

4. At least 2 questions must directly reference 
   skills from the candidate's matched skills list.
   Make these specific to what they know.
\`
        }

        const candidateProfile = buildCandidateProfile(resumeAnalysis);

        // Build system prompt
        const systemPrompt = \`You are an experienced AI interviewer conducting a mock interview for the position of \${interviewData.job_position}.

The candidate has \${interviewData.experience_level || 'mid-level'} experience. The difficulty level is \${interviewData.difficulty_level || 'Medium'}.
\${candidateProfile}
Here are the prepared interview questions (ask them one by one, listen to answers, and provide brief follow-ups):
\${questions.map((q, i) => \`\${i + 1}. \${q.question}\`).join('\\n')}

Guidelines:
- Start with a warm greeting and introduce yourself
- Ask questions one at a time
- Listen carefully to responses
- Provide brief, encouraging feedback
- Ask follow-up questions when appropriate
- At the end, thank the candidate and summarize the interview
- Keep responses concise and natural

The interview duration is approximately ${interviewData.interview_time || 30} minutes.`;

        // Start the call
        await vapi.start({
          transcriber: {
            provider: VAPI_CONFIG.transcriberProvider,
            model: VAPI_CONFIG.transcriberModel,
            language: VAPI_CONFIG.language,
          },
          model: {
            provider: 'openai',
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              }
            ]
          },
          voice: {
            provider: VAPI_CONFIG.voiceProvider,
            voiceId: VAPI_CONFIG.voiceId,
          },
        });

      } catch (err) {
        console.error('Error initializing Vapi:', err);
        toast.error('Failed to start interview. Please try again.');
      }
    };

    initVapi();

    // Cleanup
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewData, interview_id, router]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndInterview = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0F172A' }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 rounded-full mx-auto mb-4"
            style={{ 
              borderColor: 'var(--primary-blue)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p className="text-white">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0F172A' }}
      >
        <div className="card p-8 text-center" style={{ maxWidth: '400px' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--error)' }}>
            {error}
          </h2>
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: '#0F172A' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span 
          className="font-bold text-xl"
          style={{ color: 'white' }}
        >
          PlacementMentor
        </span>
        <span 
          className="font-mono text-lg"
          style={{ color: 'white' }}
        >
          {formatTime(elapsedTime)}
        </span>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="flex gap-16">
          {/* AI Interviewer */}
          <div className="text-center">
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 transition-all"
              style={{ 
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                boxShadow: isSpeaking ? '0 0 40px rgba(139, 92, 246, 0.6)' : 'none',
                animation: isSpeaking ? 'pulse 1.5s ease-in-out infinite' : 'none'
              }}
            >
              <User size={48} style={{ color: 'white' }} />
            </div>
            <p className="text-white font-medium">AI Interviewer</p>
            {isSpeaking && (
              <p className="text-blue-400 text-sm mt-1">Speaking...</p>
            )}
          </div>

          {/* User */}
          <div className="text-center">
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 transition-all"
              style={{ 
                background: 'var(--primary-blue)',
                boxShadow: isUserSpeaking ? '0 0 40px rgba(37, 99, 235, 0.6)' : 'none',
                animation: isUserSpeaking ? 'pulse 1.5s ease-in-out infinite' : 'none'
              }}
            >
              <span className="text-white text-3xl font-bold">
                {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <p className="text-white font-medium">You</p>
            {isUserSpeaking && (
              <p className="text-blue-400 text-sm mt-1">Speaking...</p>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="px-6 py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="p-4 rounded-full transition-colors"
            style={{ 
              background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: isMuted ? '#EF4444' : 'white'
            }}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* End Interview Button */}
          <button
            onClick={handleEndInterview}
            className="px-8 py-3 rounded-full font-semibold flex items-center gap-2"
            style={{ 
              background: '#EF4444',
              color: 'white'
            }}
          >
            <Phone size={20} style={{ transform: 'rotate(135deg)' }} />
            End Interview
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              background: isConnected ? '#22C55E' : '#EF4444',
              boxShadow: isConnected ? '0 0 8px #22C55E' : 'none'
            }}
          />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </footer>

      {/* Transcript Side Panel */}
      <div 
        className="fixed right-0 top-0 bottom-0 w-80 p-4 overflow-hidden flex flex-col"
        style={{ 
          background: 'rgba(15, 23, 42, 0.95)',
          borderLeft: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <h3 className="text-white font-semibold mb-4">Live Transcript</h3>
        <div 
          ref={transcriptContainerRef}
          className="flex-1 overflow-y-auto space-y-3"
        >
          {transcript.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Transcript will appear here...
            </p>
          ) : (
            transcript.map((entry, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg"
                style={{ 
                  background: entry.role === 'assistant' 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : 'rgba(37, 99, 235, 0.2)'
                }}
              >
                <p 
                  className="text-xs mb-1"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {entry.role === 'assistant' ? 'AI Interviewer' : 'You'}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                >
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
