"use client"
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Circle, ArrowLeft, Lightbulb } from "lucide-react";
import { useResumeAnalysis } from "@/context/ResumeAnalysis.context";
import { useUser } from "@/app/provider";
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
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

const ProgressBar = ({ label, percentage }) => {
  return (
    <div className="my-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ width: `${percentage}%`, background: 'var(--primary-blue)' }}
        ></div>
      </div>
    </div>
  );
};

export default function ResultsPage() {
  const router = useRouter();
  const { resumeData, setResumeData } = useResumeAnalysis();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analysisResult = resumeData?.analysisResult;

  // Add debug log to verify threshold suggestion values
  useEffect(() => {
    if (analysisResult) {
      console.log('Analysis result:', analysisResult);
      console.log('Coverage score:', analysisResult?.coverage_score);
      console.log('Skills score:', analysisResult?.skills_score);
    }
  }, [analysisResult]);

  useEffect(() => {
    // If no result but we have inputs, perform analysis automatically
    if (!analysisResult && resumeData?.resumeFile && resumeData?.jdText && !loading && !error) {
      performAnalysis();
    }
  }, [analysisResult, resumeData]);

  const performAnalysis = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', resumeData.resumeFile);
      formData.append('jd_text', resumeData.jdText);
      formData.append('user_email', user.email);
      if (resumeData.domainName) {
        formData.append('domain_name', resumeData.domainName);
      }
      if (resumeData.sessionId) {
        formData.append('session_id', resumeData.sessionId);
      }

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/analyse-resume', {
        method: 'POST',
        headers: session?.access_token ? {
          'Authorization': `Bearer ${session.access_token}`
        } : undefined,
        // Next.js handles multipart form boundaries automatically when using FormData
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to analyze resume');
      }

      // Update context with the real result
      setResumeData(prev => ({
        ...prev,
        sessionId: result.sessionId,
        analysisResult: result
      }));
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If missing all data entirely
  if (!analysisResult && !resumeData?.resumeFile && !loading && !error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <div className="card text-center p-10" style={{ maxWidth: '600px', width: '100%' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No analysis results found
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Please submit your resume and job description to get started.
          </p>
          <Link href="/dashboard" className="btn-secondary inline-flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Loading state (when processing)
  if (loading || (!analysisResult && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <div className="card text-center p-10" style={{ maxWidth: '600px', width: '100%' }}>
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

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Analysing Your Resume
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
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
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <div className="card text-center p-10" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="flex justify-center mb-6">
            <Circle size={64} style={{ color: 'var(--error)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--error)' }}>
            Analysis Failed
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="btn-secondary inline-flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Return
            </Link>
            <button onClick={performAnalysis} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle keys from Python backend structure
  const { 
    ats_score = 0, 
    weight_mode = 'standard',
    skills_score = 0,
    semantic_score = 0,
    experience_score = 0,
    structure_score = 0,
    contextual_skills = [],
    isolated_skills = [],
    skill_gaps = [],
    domain_score = null,
    suggestions = [],
    explanation = ""
  } = analysisResult;

  // Grouping logic for AWS, Azure, Google Cloud
  const processSkillGaps = (gaps) => {
    if (!gaps || gaps.length === 0) return [];
    
    const SKILL_GROUPS = {
      'aws': ['aws ec2', 'aws lambda', 'aws s3', 'aws rds', 'aws sns', 'aws sqs', 'aws ecs', 'aws eks', 'aws cloudwatch', 'aws iam'],
      'azure': ['azure functions', 'azure devops', 'microsoft azure devops'],
      'google cloud': ['google cloud functions', 'google cloud platform'],
      'microservices': ['microservices architecture']
    };

    let remainingGaps = [...gaps];
    const result = [];

    const getPrefixLabel = (p) => {
      if (p === 'aws') return 'AWS';
      if (p === 'azure') return 'Azure';
      if (p === 'google cloud') return 'Google Cloud';
      return p;
    };

    const stripPrefix = (name, prefix) => {
      if (name.toLowerCase().startsWith(prefix + ' ')) {
        return name.substring(prefix.length + 1);
      }
      return name;
    };

    for (const [parent, relatedArr] of Object.entries(SKILL_GROUPS)) {
      const parentInGaps = remainingGaps.find(g => g.toLowerCase() === parent);
      
      const relatedInGaps = remainingGaps.filter(g => 
        relatedArr.includes(g.toLowerCase())
      );

      if (parentInGaps && relatedInGaps.length > 0) {
        // Parent + Related
        const stripped = relatedInGaps.map(r => stripPrefix(r, parent));
        const parentLabel = getPrefixLabel(parent);
        result.push(`${parentLabel} (and related: ${stripped.join(', ')})`);
        
        // Remove from remaining
        remainingGaps = remainingGaps.filter(g => 
          g.toLowerCase() !== parent && !relatedArr.includes(g.toLowerCase())
        );
      } 
      else if (!parentInGaps && relatedInGaps.length > 0) {
        // Only Related
        const stripped = relatedInGaps.map(r => stripPrefix(r, parent));
        const parentLabel = getPrefixLabel(parent);
        const postfix = parent === 'microservices' ? '' : ' services';
        
        result.push(`${parentLabel}${postfix} (${stripped.join(', ')})`);
        
        // Remove from remaining
        remainingGaps = remainingGaps.filter(g => !relatedArr.includes(g.toLowerCase()));
      }
    }

    result.push(...remainingGaps);
    return result;
  };

  const processedSkillGaps = processSkillGaps(skill_gaps);

  const weightModeBadge = weight_mode.includes('domain') ? 'Role-Based Analysis' : 'Standard Analysis';

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Resume Analysis Results
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Based on your resume and the job description
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1 — Score Overview */}
      <div className="card p-8 text-center sm:text-left grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Overall Score</h2>
          <CircularProgress value={ats_score} />
          <div className="mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {weightModeBadge}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Component Scores</h2>
          <ProgressBar label="Skills Match" percentage={skills_score} />
          <ProgressBar label="Semantic Match" percentage={semantic_score} />
          <ProgressBar label="Experience" percentage={experience_score} />
          <ProgressBar label="Resume Structure" percentage={structure_score} />
        </div>
      </div>

      {/* SECTION 2 — Skills Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6" style={{ borderTop: '4px solid var(--success)' }}>
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--success)' }}>Demonstrated Skills</h3>
          <p className="text-xs text-gray-500 mb-4">Found in your projects/experience</p>
          <div className="flex flex-wrap gap-2">
            {contextual_skills.length > 0 ? contextual_skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {skill}
              </span>
            )) : <span className="text-sm text-gray-400">No skills found</span>}
          </div>
        </div>

        <div className="card p-6" style={{ borderTop: '4px solid var(--warning)' }}>
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--warning)' }}>Listed Skills</h3>
          <p className="text-xs text-gray-500 mb-4">Listed but not demonstrated in projects</p>
          <div className="flex flex-wrap gap-2">
            {isolated_skills.length > 0 ? isolated_skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {skill}
              </span>
            )) : <span className="text-sm text-gray-400">No skills listed</span>}
          </div>
        </div>

        <div className="card p-6" style={{ borderTop: '4px solid var(--error)' }}>
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--error)' }}>Missing Skills</h3>
          <p className="text-xs text-gray-500 mb-4">Required by JD but not found</p>
          <div className="flex flex-wrap gap-2 items-center">
            {processedSkillGaps.length > 0 ? processedSkillGaps.map((skill, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {skill}
              </span>
            )) : <span className="text-sm text-gray-400">No missing skills</span>}
          </div>
        </div>
      </div>

      {/* SECTION 3 — Domain Match */}
      {domain_score && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Domain Match: {domain_score.domain_name || resumeData?.domainDisplayName || 'Role-Based'}
            </h2>
            <span className="font-bold text-lg" style={{ color: 'var(--primary-blue)' }}>
              {domain_score.domain_match_score || 0}%
            </span>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1 text-gray-600">
              <span>Required Topic Clusters</span>
              <span>{domain_score.clusters_satisfied || 0} / {domain_score.total_clusters || 0} Satisfied</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${( (domain_score.clusters_satisfied || 0) / Math.max(domain_score.total_clusters || 1, 1) ) * 100}%`, 
                  background: 'var(--primary-blue)' 
                }}
              ></div>
            </div>
          </div>

          <div className="mt-4">
            {(!domain_score.missing_clusters || domain_score.missing_clusters.length === 0) ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle size={20} className="text-green-600 shrink-0" />
                <span className="text-green-800 font-medium">✓ You satisfy all required skill clusters for this role</span>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--error)' }}>Missing Clusters</h4>
                <div className="space-y-3">
                  {domain_score.missing_clusters.map((cluster, i) => (
                    <div key={i} className="text-sm p-3 rounded bg-red-50 border border-red-100">
                      <span className="font-medium text-red-800 block mb-1">Missing from this cluster:</span>
                      <span className="text-red-600">
                        {Array.isArray(cluster) ? cluster.join(', ') : cluster}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4 — Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Improvement Suggestions
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{ background: 'var(--bg-surface)' }}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                  <Lightbulb size={18} />
                </span>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Suggestion #{index + 1}
                  </span>
                  <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    {suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5 — AI Explanation */}
      {explanation && (
        <div className="card p-6 bg-blue-50 border border-blue-200">
          <h2 className="mb-2 text-lg font-bold text-blue-900 flex items-center gap-2">
            Why you scored this way
          </h2>
          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
            {explanation}
          </p>
        </div>
      )}

      {/* SECTION 6 — Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link 
          href="/dashboard"
          className="btn-secondary flex-1 text-center justify-center py-3"
        >
          Back to Dashboard
        </Link>
        {resumeData?.userIntent === 'mock_interview' && (
          <Link 
            href="/interview-setup"
            className="btn-primary flex-1 text-center justify-center py-3"
          >
            Start Mock Interview
          </Link>
        )}
      </div>
    </div>
  );
}
