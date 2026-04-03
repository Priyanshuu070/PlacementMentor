"use client"
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Code, MessageCircle, Lightbulb, Briefcase, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/services/supabaseClient";
import { useResumeAnalysis } from "@/context/ResumeAnalysis.context";

// Circular Progress Component
const CircularProgress = ({ value, max = 100, size = 120 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  
  const getScoreColor = (val, maxVal) => {
    const pct = (val / maxVal) * 100;
    if (pct >= 70) return 'var(--success)';
    if (pct >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle 
        cx="50" cy="50" r={radius}
        fill="none" 
        stroke="var(--border-default)"
        strokeWidth="8" 
      />
      <circle 
        cx="50" cy="50" r={radius}
        fill="none" 
        stroke={getScoreColor(value, max)}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform="rotate(-90 50 50)" 
      />
      <text 
        x="50" y="50" 
        textAnchor="middle"
        dy="0.35em" 
        fontSize="18" 
        fontWeight="700"
        fill="var(--text-primary)"
      >
        {value}
      </text>
    </svg>
  );
};

// Score calculations
const calcInterviewScore = (ratings) => {
  if (!ratings) return 0;
  const vals = Object.values(ratings).filter(v => typeof v === 'number');
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
};

const calcPlacementReadiness = (atsScore, interviewScore) => {
  const normATS = atsScore || 0;
  const normInterview = (interviewScore / 10) * 100;
  return Math.round((normATS + normInterview) / 2);
};

const scoreColor = (score, max = 10) => {
  const pct = (score / max) * 100;
  if (pct >= 70) return 'var(--success)';
  if (pct >= 50) return 'var(--warning)';
  return 'var(--error)';
};

const scoreIcons = {
  technicalSkills: Code,
  communication: MessageCircle,
  problemSolving: Lightbulb,
  experience: Briefcase
};

const scoreLabels = {
  technicalSkills: 'Technical Skills',
  communication: 'Communication',
  problemSolving: 'Problem Solving',
  experience: 'Experience'
};

export default function FeedbackPage() {
  const params = useParams();
  const interview_id = params.interview_id;
  const router = useRouter();
  const { resumeData } = useResumeAnalysis();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);

  const isFullPrep = resumeData?.userIntent === 'mock_interview';
  const analysisResult = resumeData?.analysisResult;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);

        // Fetch interview details
        const { data: interview, error: interviewError } = await supabase
          .from('InterviewDetails')
          .select('*')
          .eq('interview_id', interview_id)
          .single();

        if (interviewError) {
          console.error('Error fetching interview:', interviewError);
        } else {
          setInterviewDetails(interview);
        }

        // Fetch feedback from postinterview
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('postinterview')
          .select('interview_review')
          .eq('interview_id', interview_id)
          .maybeSingle();

        if (feedbackError) {
          console.error('Error fetching feedback:', feedbackError);
          setError('Failed to load feedback');
          return;
        }

        if (feedbackData?.interview_review) {
          const parsed = typeof feedbackData.interview_review === 'string'
            ? JSON.parse(feedbackData.interview_review)
            : feedbackData.interview_review;
          setFeedback(parsed);
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (interview_id) {
      fetchFeedback();
    }
  }, [interview_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div 
          className="w-10 h-10 border-4 rounded-full"
          style={{ 
            borderColor: 'var(--primary-blue)',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-10 text-center">
        <p style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</p>
        <Link href="/dashboard" className="btn-primary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const ratings = feedback?.feedback?.rating;
  const interviewScore = calcInterviewScore(ratings);
  const atsScore = analysisResult?.atsScore || 0;
  const placementReadiness = calcPlacementReadiness(atsScore, interviewScore);
  const recommendation = feedback?.feedback?.recommendation;
  const recommendationMsg = feedback?.feedback?.recommendationMsg;
  const summary = feedback?.feedback?.summary;

  const getRecommendationStyle = (rec) => {
    const lower = rec?.toLowerCase();
    if (lower === 'hire' || lower === 'strong hire' || lower === 'accept') {
      return { bg: '#D4EDDA', color: '#155724' };
    }
    if (lower === 'no hire' || lower === 'reject' || lower === 'retry') {
      return { bg: '#F8D7DA', color: '#721C24' };
    }
    return { bg: 'var(--primary-blue-light)', color: 'var(--primary-blue)' };
  };

  const recStyle = getRecommendationStyle(recommendation);

  // DECISION: Show different next steps based on recommendation
  const isPositive = ['hire', 'strong hire', 'accept'].includes(recommendation?.toLowerCase());
  const nextSteps = isPositive
    ? [
        'Polish your resume with the suggestions above',
        'Apply to similar roles with confidence',
        'Practice one more mock interview to stay sharp'
      ]
    : [
        'Review the skill gaps identified above',
        'Retake the interview after more preparation',
        'Focus on the lowest-scoring areas first'
      ];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
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
            Your Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Here is how you performed
          </p>
        </div>
      </div>

      {/* Placement Readiness Hero (Mode B only) */}
      {isFullPrep && (
        <div 
          className="card p-8 mb-8 text-center"
          style={{ borderLeft: `4px solid ${scoreColor(placementReadiness, 100)}` }}
        >
          <p 
            className="text-6xl font-bold mb-2"
            style={{ color: scoreColor(placementReadiness, 100) }}
          >
            {placementReadiness}%
          </p>
          <h2 
            className="text-xl font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Placement Readiness Score
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Combined resume + interview performance
          </p>
        </div>
      )}

      {/* Two Column Grid (Mode B) or Single Column (Mode A) */}
      <div 
        className={isFullPrep ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8' : 'mb-8'}
      >
        {/* Resume Analysis (Mode B only) */}
        {isFullPrep && (
          <div className="card p-6">
            <h3 
              className="font-semibold mb-4"
              style={{ color: 'var(--text-primary)', fontSize: '18px' }}
            >
              Resume Analysis
            </h3>

            {!analysisResult ? (
              <div className="text-center py-8">
                <Loader2 
                  size={32} 
                  style={{ color: 'var(--primary-blue)', margin: '0 auto 12px' }}
                  className="animate-spin"
                />
                <p style={{ color: 'var(--text-secondary)' }}>
                  Resume analysis is being processed
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <CircularProgress value={atsScore} max={100} />
                </div>
                <p className="text-center text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  ATS Score
                </p>

                {analysisResult.skillGaps && analysisResult.skillGaps.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Skill Gaps
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.skillGaps.map((gap, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ background: '#FEF3C7', color: '#92400E' }}
                        >
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                  <div>
                    <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Suggestions
                    </p>
                    <ol className="space-y-2">
                      {analysisResult.suggestions.slice(0, 3).map((sug, i) => (
                        <li 
                          key={i}
                          className="text-sm pl-4"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {i + 1}. {sug}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Interview Performance */}
        <div className="card p-6">
          <h3 
            className="font-semibold mb-4"
            style={{ color: 'var(--text-primary)', fontSize: '18px' }}
          >
            Interview Performance
          </h3>

          {/* Overall Score */}
          <div className="text-center mb-6">
            <p 
              className="text-5xl font-bold"
              style={{ color: scoreColor(interviewScore, 10) }}
            >
              {interviewScore}
              <span className="text-2xl">/10</span>
            </p>
          </div>

          {/* 2x2 Score Grid */}
          {ratings && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(ratings).map(([key, value]) => {
                const Icon = scoreIcons[key] || Code;
                const label = scoreLabels[key] || key;
                return (
                  <div 
                    key={key}
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={16} style={{ color: 'var(--primary-blue)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {label}
                      </span>
                    </div>
                    <p 
                      className="font-bold"
                      style={{ color: scoreColor(value, 10) }}
                    >
                      {value}/10
                    </p>
                    <div 
                      className="h-1.5 rounded-full mt-2"
                      style={{ background: 'var(--border-default)' }}
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${(value / 10) * 100}%`,
                          background: scoreColor(value, 10)
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {summary && (
            <p 
              className="text-sm mb-4 p-3 rounded-lg"
              style={{ 
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)'
              }}
            >
              {summary}
            </p>
          )}

          {/* Recommendation */}
          {recommendation && (
            <div className="mb-4">
              <span 
                className="inline-block px-4 py-2 rounded-full font-semibold"
                style={{ background: recStyle.bg, color: recStyle.color }}
              >
                {recommendation}
              </span>
              {recommendationMsg && (
                <p 
                  className="mt-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {recommendationMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* What to do next */}
      <div className="card p-6 mb-8">
        <h3 
          className="font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontSize: '18px' }}
        >
          What to do next
        </h3>
        <ul className="space-y-2">
          {nextSteps.map((step, i) => (
            <li 
              key={i}
              className="flex items-start gap-2"
            >
              <span 
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                style={{ background: 'var(--primary-blue)', color: 'white' }}
              >
                {i + 1}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-4">
        <button 
          className="btn-secondary flex-1 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          <Download size={18} />
          Download Transcript
        </button>
        <button 
          className="btn-primary flex-1 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          <Download size={18} />
          Download Full Report
        </button>
      </div>
    </div>
  );
}
