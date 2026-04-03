"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useResumeAnalysis } from "@/context/ResumeAnalysis.context";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const durations = [
  { value: 10, label: '10 mins' },
  { value: 20, label: '20 mins' },
  { value: 30, label: '30 mins' }
];

const difficulties = [
  { value: 'Easy', color: 'var(--success)', bg: '#D1FAE5' },
  { value: 'Medium', color: 'var(--warning)', bg: '#FEF3C7' },
  { value: 'Hard', color: 'var(--error)', bg: '#FEE2E2' }
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const { resumeData, setResumeData } = useResumeAnalysis();
  const { user, setUser } = useUser();

  const [duration, setDuration] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Guard: redirect if no JD
  useEffect(() => {
    if (!resumeData?.jdText) {
      router.push('/dashboard');
    }
  }, [resumeData, router]);

  if (!resumeData?.jdText) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div 
          className="w-8 h-8 border-3 rounded-full"
          style={{ 
            borderColor: 'var(--primary-blue)',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  const canGenerate = duration !== null && difficulty !== null;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setLoading(true);
    try {
      // DECISION: Extract job position from JD or use default
      const jobPosition = resumeData.jobPosition || 'Target Role';

      // Call API to generate questions
      const response = await fetch('/api/ai-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPosition,
          jobDescription: resumeData.jdText,
          experienceLevel: 'mid', // DECISION: Default to mid-level
          interviewDuration: `${duration} minutes`,
          difficultyLevel: difficulty
        })
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to generate questions');
        setLoading(false);
        return;
      }

      // Generate interview ID
      const newInterviewId = uuidv4();

      // Save to InterviewDetails table
      const { error: insertError } = await supabase
        .from('InterviewDetails')
        .insert({
          interview_id: newInterviewId,
          job_position: jobPosition,
          job_description: resumeData.jdText,
          experience_level: 'mid',
          difficulty_level: difficulty,
          interview_time: duration,
          interview_questions: data.questions,
          user_email: user?.email,
          resume_analysis_id: null // Will be set when analysis completes
        });

      if (insertError) {
        console.error('Error saving interview:', insertError);
        toast.error('Failed to save interview details');
        setLoading(false);
        return;
      }

      // Deduct 1 credit from user
      if (user?.credits > 0) {
        const newCredits = user.credits - 1;
        const { error: creditError } = await supabase
          .from('Users')
          .update({ credits: newCredits })
          .eq('email', user.email);

        if (creditError) {
          console.error('Error deducting credit:', creditError);
          // Don't block the flow for credit error
        } else {
          setUser({ ...user, credits: newCredits });
        }
      }

      setQuestions(data.questions || []);
      setInterviewId(newInterviewId);
      toast.success(`${data.questions?.length || 0} questions generated!`);

    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('An error occurred while generating questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    if (interviewId) {
      router.push(`/interview/${interviewId}/start`);
    }
  };

  return (
    <div className="max-w-[680px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Interview Setup
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Configure your mock interview session
          </p>
        </div>
      </div>

      {/* Context Summary Card */}
      <div 
        className="rounded-xl p-5 mb-8 flex items-start gap-3"
        style={{
          background: 'var(--primary-blue-light)',
          border: '1px solid var(--primary-blue-accent)'
        }}
      >
        <Info size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ color: 'var(--primary-blue)', fontWeight: 500 }}>
            Preparing interview for your uploaded role
          </p>
          {resumeData.resumeFileName && (
            <p style={{ color: 'var(--primary-blue)', fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              Resume: {resumeData.resumeFileName}
            </p>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="card p-8">
        {/* Duration */}
        <div className="mb-8">
          <label 
            className="block mb-3"
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Interview Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className="p-4 rounded-lg text-center transition-all"
                style={{
                  border: duration === d.value 
                    ? '2px solid var(--primary-blue)' 
                    : '1px solid var(--border-default)',
                  background: duration === d.value 
                    ? 'var(--primary-blue-light)' 
                    : 'var(--bg-white)',
                  color: 'var(--text-primary)',
                  fontWeight: duration === d.value ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-8">
          <label 
            className="block mb-3"
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className="p-4 rounded-lg text-center transition-all"
                style={{
                  border: difficulty === d.value 
                    ? `2px solid ${d.color}` 
                    : '1px solid var(--border-default)',
                  background: difficulty === d.value 
                    ? d.bg 
                    : 'var(--bg-white)',
                  color: difficulty === d.value ? d.color : 'var(--text-primary)',
                  fontWeight: difficulty === d.value ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                {d.value}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ padding: '14px 20px' }}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Generating questions...
            </>
          ) : (
            'Generate Questions'
          )}
        </button>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="mt-8">
          <h2 
            className="mb-4"
            style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '18px' }}
          >
            {questions.length} Questions Generated
          </h2>

          <div className="space-y-3">
            {questions.map((q, index) => (
              <div key={index} className="card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span 
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ background: 'var(--primary-blue)', color: 'white' }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {q.question}
                      </p>
                      
                      {q.sampleAnswer && (
                        <button
                          onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                          className="mt-2 flex items-center gap-1 text-sm"
                          style={{ color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {expandedQuestion === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          View Sample Answer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {expandedQuestion === index && q.sampleAnswer && (
                  <div 
                    className="px-4 pb-4 pt-2 ml-10"
                    style={{ 
                      borderTop: '1px solid var(--border-default)',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {q.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Start Interview Button */}
          <button
            onClick={handleStartInterview}
            className="btn-primary w-full mt-6"
            style={{ padding: '14px 20px', background: 'var(--success)' }}
          >
            Start Interview
          </button>
        </div>
      )}
    </div>
  );
}
