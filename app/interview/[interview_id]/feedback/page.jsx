"use client";
import { supabase } from '@/services/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Code, MessageCircle, Lightbulb, Briefcase, Target, TrendingUp } from 'lucide-react';
import { useResumeAnalysis } from '@/context/ResumeAnalysis.context';

// Circular Progress Component for ATS Score
const CircularProgress = ({ value, max = 100, size = 120 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  
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
        stroke="var(--primary-blue)"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" textAnchor="middle" 
            dy="0.35em" fontSize="18" fontWeight="700"
            fill="var(--text-primary)">
        {value}
      </text>
    </svg>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, max, color }) => {
  const percentage = (value / max) * 100;
  return (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${percentage}%`,
        height: '100%',
        backgroundColor: color,
        transition: 'width 0.3s ease'
      }} />
    </div>
  );
};

// Score Card Component
const ScoreCard = ({ icon: Icon, label, score, maxScore = 10 }) => {
  const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return 'var(--success)';
    if (percentage >= 50) return '#FFA500';
    return 'var(--error)';
  };

  const color = getScoreColor(score, maxScore);

  return (
    <div style={{
      backgroundColor: 'var(--bg-white)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <Icon size={24} style={{ color: 'var(--primary-blue)' }} />
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-secondary)'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: 700,
        color: 'var(--text-primary)'
      }}>
        {score}/{maxScore}
      </div>
      <ProgressBar value={score} max={maxScore} color={color} />
    </div>
  );
};

// Recommendation Chip Component
const RecommendationChip = ({ recommendation }) => {
  const getRecommendationStyle = (rec) => {
    const recLower = rec?.toLowerCase() || '';
    if (recLower.includes('strong hire')) {
      return { bg: '#D4EDDA', color: '#155724', border: '#C3E6CB' };
    }
    if (recLower.includes('hire')) {
      return { bg: 'var(--primary-blue-light)', color: 'var(--primary-blue)', border: 'var(--primary-blue)' };
    }
    return { bg: '#F8D7DA', color: '#721C24', border: '#F5C6CB' };
  };

  const style = getRecommendationStyle(recommendation);

  return (
    <div style={{
      display: 'inline-block',
      backgroundColor: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      padding: '8px 20px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 600
    }}>
      {recommendation || 'N/A'}
    </div>
  );
};

function Feedback() {
  const { interview_id } = useParams();
  const router = useRouter();
  const { resumeData } = useResumeAnalysis();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFullPrep = resumeData?.userIntent === 'full_prep';

  const getFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let { data, error } = await supabase
        .from('postinterview')
        .select("interview_id, interview_review")
        .eq('interview_id', interview_id)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Multiple feedback entries found. Please contact support.');
        } else {
          setError(`Database error: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      const feedbackEntry = data;
      
      if (feedbackEntry && feedbackEntry.interview_review) {
        const reviewData = typeof feedbackEntry.interview_review === 'string' 
          ? JSON.parse(feedbackEntry.interview_review) 
          : feedbackEntry.interview_review;
        
        setFeedbackData({
          ...feedbackEntry,
          interview_review: reviewData
        });
      } else {
        setError('No feedback data found');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interview_id) {
      getFeedback();
    }
  }, [interview_id]);

  // Score calculations
  const calculateInterviewScore = (ratings) => {
    if (!ratings) return 0;
    const scores = Object.values(ratings);
    const average = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    return Math.round(average * 10) / 10;
  };

  const calculatePlacementReadiness = (atsScore, interviewScore) => {
    const normalizedATS = atsScore || 0;
    const normalizedInterview = (interviewScore / 10) * 100;
    return Math.round((normalizedATS + normalizedInterview) / 2);
  };

  const getPlacementReadinessColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return '#D97706';
    return 'var(--error)';
  };

  const getNextSteps = (recommendation) => {
    const recLower = recommendation?.toLowerCase() || '';
    if (recLower.includes('hire')) {
      return [
        'Polish your resume with the suggestions above',
        'Apply to similar roles with confidence',
        'Practice one more mock interview to stay sharp'
      ];
    }
    return [
      'Review the skill gaps identified above',
      'Retake the interview after more preparation',
      'Focus on the lowest-scoring areas first'
    ];
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-default)',
            borderTop: '4px solid var(--primary-blue)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-white)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '480px',
          textAlign: 'center'
        }}>
          <div style={{
            color: 'var(--error)',
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ⚠️
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            Feedback Not Available
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px'
          }}>
            {error}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => {
                setError(null);
                getFeedback();
              }}
              className="btn-primary"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const feedback = feedbackData?.interview_review?.feedback || feedbackData?.interview_review;

  if (!feedback) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-white)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>No feedback data available</p>
          <button 
            onClick={() => router.back()}
            className="btn-primary"
            style={{ marginTop: '16px' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const interviewScore = calculateInterviewScore(feedback.rating);
  const placementReadiness = isFullPrep 
    ? calculatePlacementReadiness(resumeData?.analysisResult?.atsScore || 0, interviewScore)
    : null;

  const skillIcons = {
    technicalSkills: Code,
    communication: MessageCircle,
    problemSolving: Lightbulb,
    experience: Briefcase
  };

  const skillLabels = {
    technicalSkills: 'Technical Skills',
    communication: 'Communication',
    problemSolving: 'Problem Solving',
    experience: 'Experience'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-surface)'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--bg-white)',
        borderBottom: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              Your Results
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Here's how you performed
            </p>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        {isFullPrep ? (
          /* MODE B: Full Prep Layout */
          <>
            {/* Placement Readiness Score */}
            <div style={{
              backgroundColor: 'var(--bg-white)',
              border: `3px solid ${getPlacementReadinessColor(placementReadiness)}`,
              borderRadius: '16px',
              textAlign: 'center',
              padding: '48px',
              marginBottom: '40px'
            }}>
              <div style={{
                fontSize: '72px',
                fontWeight: 700,
                color: getPlacementReadinessColor(placementReadiness)
              }}>
                {placementReadiness}%
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Placement Readiness Score
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                Combined resume + interview performance
              </p>
            </div>

            {/* Two Column Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px'
            }}>
              {/* LEFT COLUMN: Resume Analysis */}
              <div style={{
                backgroundColor: 'var(--bg-white)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '32px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '24px'
                }}>
                  Resume Analysis
                </h3>

                {resumeData?.analysisResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* ATS Score */}
                    <div style={{ textAlign: 'center' }}>
                      <CircularProgress 
                        value={resumeData.analysisResult.atsScore || 0} 
                        max={100} 
                        size={120} 
                      />
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginTop: '12px'
                      }}>
                        ATS Score
                      </div>
                    </div>

                    {/* Skill Coverage */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)'
                        }}>
                          Skill Coverage
                        </span>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)'
                        }}>
                          {resumeData.analysisResult.skillCoverage || 0}%
                        </span>
                      </div>
                      <ProgressBar 
                        value={resumeData.analysisResult.skillCoverage || 0} 
                        max={100} 
                        color="var(--primary-blue)" 
                      />
                    </div>

                    {/* Skill Gaps */}
                    {resumeData.analysisResult.skillGaps && resumeData.analysisResult.skillGaps.length > 0 && (
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          marginBottom: '12px'
                        }}>
                          Skill Gaps
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          {resumeData.analysisResult.skillGaps.map((gap, index) => (
                            <span key={index} style={{
                              backgroundColor: '#FFA500',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '13px',
                              fontWeight: 500
                            }}>
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Suggestions */}
                    {resumeData.analysisResult.suggestions && resumeData.analysisResult.suggestions.length > 0 && (
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          marginBottom: '12px'
                        }}>
                          Top Suggestions
                        </div>
                        <ol style={{
                          margin: 0,
                          paddingLeft: '20px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {resumeData.analysisResult.suggestions.map((suggestion, index) => (
                            <li key={index} style={{ marginBottom: '8px' }}>{suggestion}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Placeholder State */
                  <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px dashed var(--border-default)',
                    borderRadius: '12px',
                    padding: '48px 24px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid var(--border-default)',
                      borderTop: '3px solid var(--primary-blue)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 16px'
                    }} />
                    <p style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginBottom: '8px'
                    }}>
                      Resume analysis is being processed
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)'
                    }}>
                      Check back in a few moments
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Interview Performance */}
              <div style={{
                backgroundColor: 'var(--bg-white)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '32px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '24px'
                }}>
                  Interview Performance
                </h3>

                {/* Score Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {feedback.rating && Object.entries(feedback.rating).map(([skill, score]) => (
                    <ScoreCard
                      key={skill}
                      icon={skillIcons[skill] || Code}
                      label={skillLabels[skill] || skill}
                      score={score}
                      maxScore={10}
                    />
                  ))}
                </div>

                {/* Summary */}
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Performance Summary
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {feedback.summary || 'No summary available'}
                  </p>
                </div>

                {/* Recommendation */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '12px'
                  }}>
                    Recommendation
                  </div>
                  <RecommendationChip recommendation={feedback.recommendation} />
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    marginTop: '12px',
                    lineHeight: '1.6'
                  }}>
                    {feedback.recommendationMsg || 'No recommendation message available'}
                  </p>
                </div>

                {/* What to do next */}
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '12px'
                  }}>
                    What to do next
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: '1.8'
                  }}>
                    {getNextSteps(feedback.recommendation).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Download Full Report Button */}
            <button
              className="btn-primary"
              disabled
              title="Coming soon"
              style={{
                width: '100%',
                marginTop: '32px',
                opacity: 0.5,
                cursor: 'not-allowed'
              }}
            >
              <Download size={20} style={{ marginRight: '8px' }} />
              Download Full Report
            </button>
          </>
        ) : (
          /* MODE A: Interview Only Layout */
          <>
            {/* Performance Score Banner */}
            <div style={{
              backgroundColor: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
              textAlign: 'center',
              padding: '48px',
              borderRadius: '12px',
              marginBottom: '32px'
            }}>
              <div style={{
                fontSize: '64px',
                fontWeight: 700,
                color: interviewScore >= 7 ? 'var(--success)' : interviewScore >= 5 ? '#FFA500' : 'var(--error)'
              }}>
                {interviewScore}/10
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '8px'
              }}>
                Interview Score
              </div>
            </div>

            {/* Score Breakdown Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {feedback.rating && Object.entries(feedback.rating).map(([skill, score]) => (
                <ScoreCard
                  key={skill}
                  icon={skillIcons[skill] || Code}
                  label={skillLabels[skill] || skill}
                  score={score}
                  maxScore={10}
                />
              ))}
            </div>

            {/* Summary Section */}
            <div style={{
              backgroundColor: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                Performance Summary
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: '1.8',
                margin: 0
              }}>
                {feedback.summary || 'No summary available'}
              </p>
            </div>

            {/* Recommendation Section */}
            <div style={{
              backgroundColor: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                Recommendation
              </h3>
              <RecommendationChip recommendation={feedback.recommendation} />
              <p style={{
                fontSize: '14px',
                color: 'var(--text-primary)',
                marginTop: '16px',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                {feedback.recommendationMsg || 'No recommendation message available'}
              </p>

              {/* What to do next */}
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '12px'
                }}>
                  What to do next
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.8'
                }}>
                  {getNextSteps(feedback.recommendation).map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Download Transcript Button */}
            <button
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                padding: '16px 24px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '16px',
                cursor: 'not-allowed',
                opacity: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              disabled
              title="Coming soon"
            >
              <Download size={20} />
              Download Transcript
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Feedback;