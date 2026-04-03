"use client"
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Circle, ArrowLeft } from "lucide-react";
import { useResumeAnalysis } from "@/context/ResumeAnalysis.context";
import Link from "next/link";

// Circular Progress Component
const CircularProgress = ({ value, max = 100, size = 140 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  
  const getScoreColor = () => {
    if (value >= 75) return 'var(--success)';
    if (value >= 50) return 'var(--warning)';
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
        stroke={getScoreColor()}
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
        fontSize="20" 
        fontWeight="700"
        fill="var(--text-primary)"
      >
        {value}
      </text>
    </svg>
  );
};

export default function ResultsPage() {
  const router = useRouter();
  const { resumeData } = useResumeAnalysis();

  const analysisResult = resumeData?.analysisResult;

  // Placeholder state (when analysis is null/processing)
  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <div 
          className="card text-center p-10"
          style={{ maxWidth: '600px', width: '100%' }}
        >
          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-16 h-16 border-4 rounded-full"
              style={{ 
                borderColor: 'var(--primary-blue)',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }}
            />
          </div>

          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Analysing Your Resume
          </h1>
          <p 
            className="mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            This usually takes 15-30 seconds
          </p>

          {/* Progress Steps */}
          <div className="text-left space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <span style={{ color: 'var(--text-primary)' }}>Resume uploaded</span>
            </div>
            <div className="flex items-center gap-3">
              <Loader2 size={20} style={{ color: 'var(--primary-blue)', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-primary)' }}>Extracting skills and keywords...</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle size={20} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Comparing with job description</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle size={20} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Generating suggestions</span>
            </div>
          </div>

          {/* Note */}
          <div 
            className="rounded-lg p-4 mb-6"
            style={{ 
              background: 'var(--primary-blue-light)',
              color: 'var(--primary-blue)',
              fontSize: '14px'
            }}
          >
            Resume analysis engine coming soon. This is a preview of the results page.
          </div>

          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Real results state (when analysisResult exists)
  const { atsScore, coverageScore, skillGaps, suggestions } = analysisResult;

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

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
            Resume Analysis Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Based on your resume and the job description
          </p>
        </div>
      </div>

      {/* Hero Metric Card */}
      <div className="card p-8 mb-6 text-center">
        <CircularProgress value={atsScore || 0} />
        <p 
          className="mt-4"
          style={{ 
            fontWeight: 600, 
            color: 'var(--text-secondary)',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          ATS Score
        </p>
      </div>

      {/* Skill Gaps Section */}
      {skillGaps && skillGaps.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 
            className="mb-4"
            style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '18px' }}
          >
            Skill Gaps
          </h2>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((gap, index) => (
              <span 
                key={index}
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  background: '#FEF3C7',
                  color: '#92400E'
                }}
              >
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Section */}
      {suggestions && suggestions.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 
            className="mb-4"
            style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '18px' }}
          >
            Improvement Suggestions
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-surface)' }}
              >
                <span 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: 'var(--primary-blue)', color: 'white' }}
                >
                  {index + 1}
                </span>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {resumeData?.userIntent === 'analysis_only' && (
        <Link 
          href="/interview-setup"
          className="btn-primary w-full text-center block"
          style={{ padding: '14px 20px' }}
        >
          Try Mock Interview
        </Link>
      )}
    </div>
  );
}
