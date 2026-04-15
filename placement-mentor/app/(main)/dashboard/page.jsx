"use client"
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, FileText, Mic, X, AlertCircle } from "lucide-react";
import { useUser } from "@/app/provider";
import { useResumeAnalysis } from "@/context/ResumeAnalysis.context";
import { supabase } from "@/services/supabaseClient";
import Link from "next/link";

const DOMAINS = [
  { value: "frontend_developer", label: "Frontend Developer" },
  { value: "backend_developer", label: "Backend Developer" },
  { value: "fullstack_developer", label: "Fullstack Developer" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "data_scientist", label: "Data Scientist" },
  { value: "machine_learning_engineer", label: "Machine Learning Engineer" },
  { value: "devops_engineer", label: "DevOps Engineer" },
  { value: "android_developer", label: "Android Developer" },
  { value: "ios_developer", label: "iOS Developer" },
  { value: "cloud_engineer", label: "Cloud Engineer" },
  { value: "cybersecurity_analyst", label: "Cybersecurity Analyst" },
  { value: "database_administrator", label: "Database Administrator" },
  { value: "qa_engineer", label: "QA Engineer" },
  { value: "blockchain_developer", label: "Blockchain Developer" },
  { value: "embedded_systems_engineer", label: "Embedded Systems Engineer" },
  { value: "react_native_developer", label: "React Native Developer" },
  { value: "flutter_developer", label: "Flutter Developer" },
  { value: "ai_engineer", label: "AI Engineer" },
  { value: "game_developer", label: "Game Developer" },
  { value: "site_reliability_engineer", label: "Site Reliability Engineer" },
  { value: "data_engineer", label: "Data Engineer" }
];

export default function DashboardPage() {
  const { user } = useUser();
  const { resumeData, setResumeData } = useResumeAnalysis();
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [jdText, setJdText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileTouched, setFileTouched] = useState(false);
  const [jdTouched, setJdTouched] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Recent activity
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user?.email) {
        setLoadingActivity(false);
        return;
      }

      try {
        const { data: interviews, error } = await supabase
          .from('InterviewDetails')
          .select('interview_id, job_position, created_at, interview_time')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching activity:', error);
          setLoadingActivity(false);
          return;
        }

        // Fetch status from postinterview for each
        const activityWithStatus = await Promise.all(
          (interviews || []).map(async (interview) => {
            const { data: feedback } = await supabase
              .from('postinterview')
              .select('interview_review')
              .eq('interview_id', interview.interview_id)
              .maybeSingle();

            let score = null;
            if (feedback?.interview_review) {
              try {
                const review = typeof feedback.interview_review === 'string'
                  ? JSON.parse(feedback.interview_review)
                  : feedback.interview_review;
                const ratings = review?.feedback?.rating;
                if (ratings) {
                  const vals = Object.values(ratings).filter(v => typeof v === 'number');
                  score = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
                }
              } catch (e) {
                // Parse error, ignore
              }
            }

            return {
              ...interview,
              status: feedback ? 'Completed' : 'Pending',
              score
            };
          })
        );

        setRecentActivity(activityWithStatus);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, [user?.email]);

  // File handling
  const handleFileSelect = (file) => {
    setFileTouched(true);
    setFileError('');

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFileError('Please upload a PDF file only');
      setResumeFile(null);
      setResumeFileName('');
      return;
    }

    setResumeFile(file);
    setResumeFileName(file.name);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeFileName('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Validation
  const isInputsValid = resumeFile && jdText.trim().length >= 100 && resumeData?.domainName;

  // Option handlers
  const handleOptionA = () => {
    if (!isInputsValid) return;
    setResumeData(prev => ({
      ...prev,
      resumeFile,
      resumeFileName,
      resumeText: '', // Will be extracted later
      jdText,
      jobPosition: '', // Will be detected
      userIntent: 'analysis_only',
      analysisResult: null,
      sessionId: null
    }));
    router.push('/results');
  };

  const handleOptionB = () => {
    if (!isInputsValid) return;
    setResumeData(prev => ({
      ...prev,
      resumeFile,
      resumeFileName,
      resumeText: '',
      jdText,
      jobPosition: '',
      userIntent: 'mock_interview',
      analysisResult: null,
      sessionId: null
    }));
    router.push('/interview-setup');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {getGreeting()}, {user?.Name || 'there'}.
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upload your resume and job description to get started.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Resume Upload Zone */}
          <div>
            <label 
              className="block mb-2"
              style={{ fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Your Resume
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="cursor-pointer rounded-xl p-8 transition-all"
              style={{
                border: fileError 
                  ? '2px dashed var(--error)'
                  : resumeFile
                    ? '2px solid var(--success)'
                    : isDragging
                      ? '2px dashed var(--primary-blue)'
                      : '2px dashed var(--border-default)',
                background: isDragging 
                  ? 'var(--primary-blue-light)' 
                  : resumeFile 
                    ? 'var(--bg-white)' 
                    : 'var(--bg-surface)',
                animation: isDragging ? 'pulse-border 1s infinite' : 'none'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                className="hidden"
              />

              {resumeFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {resumeFileName}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatFileSize(resumeFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    Drag & drop your PDF here
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    or click to browse
                  </p>
                </div>
              )}
            </div>

            {fileTouched && fileError && (
              <p className="mt-2 flex items-center gap-1 text-sm" style={{ color: 'var(--error)' }}>
                <AlertCircle size={14} />
                {fileError}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label 
              className="block mb-2"
              style={{ fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Job Description
            </label>
            <div className="relative">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value.slice(0, 5000))}
                onBlur={() => setJdTouched(true)}
                placeholder="Paste the full job description here..."
                className="w-full rounded-lg p-4 resize-none transition-colors"
                style={{
                  minHeight: '200px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-white)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                onBlurCapture={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
              <span 
                className="absolute bottom-3 right-3 text-sm"
                style={{ 
                  color: jdText.length > 4500 ? 'var(--error)' : 'var(--text-muted)'
                }}
              >
                {jdText.length} / 5000
              </span>
            </div>
            {jdTouched && jdText.length > 0 && jdText.length < 100 && (
              <p className="mt-2 flex items-center gap-1 text-sm" style={{ color: 'var(--warning)' }}>
                <AlertCircle size={14} />
                Please paste a more complete job description (minimum 100 characters)
              </p>
            )}
          </div>

          {/* Domain Selection */}
          <div>
            <label 
              className="block mb-2"
              style={{ fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Target Role
            </label>
            <select
              value={resumeData?.domainName || ''}
              onChange={(e) => {
                const value = e.target.value;
                const label = DOMAINS.find(d => d.value === value)?.label || '';
                setResumeData(prev => ({ 
                  ...prev, 
                  domainName: value, 
                  domainDisplayName: label 
                }));
              }}
              className="w-full rounded-lg p-4 transition-colors"
              style={{
                border: '1px solid var(--border-default)',
                background: 'var(--bg-white)',
                color: resumeData?.domainName ? 'var(--text-primary)' : 'var(--text-muted)',
                outline: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
              onBlurCapture={(e) => e.target.style.borderColor = 'var(--border-default)'}
            >
              <option value="" disabled>Select your target role...</option>
              {DOMAINS.map(domain => (
                <option key={domain.value} value={domain.value}>
                  {domain.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Can't find your role? We're adding more soon.
            </p>
          </div>
        </div>

        {/* Right Column - Options */}
        <div>
          <h2 
            className="mb-4"
            style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '18px' }}
          >
            Choose Your Path
          </h2>

          <div 
            className="space-y-4"
            style={{
              opacity: isInputsValid ? 1 : 0.5,
              pointerEvents: isInputsValid ? 'auto' : 'none'
            }}
            title={!isInputsValid ? 'Please upload your resume, job description, and select a target role first' : undefined}
          >
            {/* Option A - Analyse Resume */}
            <div 
              className="card p-7 cursor-pointer transition-shadow hover:shadow-md"
              style={{ borderLeft: '3px solid var(--primary-blue)' }}
              onClick={handleOptionA}
            >
              <div className="flex items-start gap-4">
                <FileText size={32} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                <div className="flex-1">
                  <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Analyse Resume Only
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                    Get your ATS score, skill coverage report, and improvement suggestions.
                  </p>
                  <button className="btn-primary w-full">
                    Run Analysis
                  </button>
                </div>
              </div>
            </div>

            {/* Option B - Mock Interview */}
            <div 
              className="card p-7 cursor-pointer transition-shadow hover:shadow-md"
              style={{ borderLeft: '3px solid var(--success)' }}
              onClick={handleOptionB}
            >
              <div className="flex items-start gap-4">
                <Mic size={32} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div className="flex-1">
                  <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Mock Interview
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                    Resume analysis runs in background. Practice with an AI interviewer tailored to your skill gaps.
                  </p>
                  <button 
                    className="btn-primary w-full"
                    style={{ background: 'var(--success)' }}
                  >
                    Start Interview
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!isInputsValid && (
            <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              Upload your resume and paste a job description (min 100 chars) to continue.
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '18px' }}>
            Recent Activity
          </h2>
          <Link 
            href="/history"
            className="text-sm font-medium no-underline"
            style={{ color: 'var(--primary-blue)' }}
          >
            View All →
          </Link>
        </div>

        {loadingActivity ? (
          <div className="flex items-center justify-center py-8">
            <div 
              className="w-6 h-6 border-2 rounded-full"
              style={{ 
                borderColor: 'var(--primary-blue)',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }}
            />
          </div>
        ) : recentActivity.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
            No sessions yet. Start above to begin.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Role</th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Date</th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Score</th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr 
                    key={item.interview_id}
                    className="cursor-pointer hover:bg-gray-50"
                    style={{ borderBottom: '1px solid var(--border-default)' }}
                    onClick={() => router.push(`/interview/${item.interview_id}/feedback`)}
                  >
                    <td className="py-3 px-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {item.job_position}
                    </td>
                    <td className="py-3 px-2" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                      {item.score ? `${item.score}/10` : '—'}
                    </td>
                    <td className="py-3 px-2">
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: item.status === 'Completed' ? '#D1FAE5' : '#F3F4F6',
                          color: item.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)'
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
