"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/provider';
import { useRouter } from 'next/navigation';
import { FileText, Mic, ArrowRight } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch recent sessions
  useEffect(() => {
    const fetchRecentSessions = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);

        // Fetch last 5 interviews
        const { data: interviews, error } = await supabase
          .from('InterviewDetails')
          .select('interview_id, job_position, interview_time, created_at')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.log('Error fetching sessions:', error);
          return;
        }

        // For each interview, check if feedback exists
        const sessionsWithStatus = await Promise.all(
          (interviews || []).map(async (interview) => {
            const { data: feedback } = await supabase
              .from('postinterview')
              .select('interview_id')
              .eq('interview_id', interview.interview_id)
              .single();

            return {
              ...interview,
              status: feedback ? 'Completed' : 'Pending'
            };
          })
        );

        setRecentSessions(sessionsWithStatus);
      } catch (err) {
        console.log('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSessions();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px'
    }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          {getGreeting()}, {user?.Name || 'User'}.
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)'
        }}>
          Ready to prepare for your next placement?
        </p>
      </div>

      {/* Action Cards */}
      <div className="action-cards-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {/* Card 1: Resume + JD Analysis */}
        <div
          onClick={() => router.push('/upload')}
          className="action-card"
          style={{
            backgroundColor: 'var(--bg-white)',
            borderLeft: '3px solid var(--primary-blue)',
            borderRadius: '12px',
            padding: '32px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <FileText size={40} style={{ color: 'var(--primary-blue)', marginBottom: '16px' }} />
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Resume + JD Analysis
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Upload your resume and job description. Get your ATS score, skill gaps, and improvement suggestions.
          </p>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Start Analysis
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 2: Mock Interview */}
        <div
          onClick={() => router.push('/dashboard/create-interview')}
          className="action-card"
          style={{
            backgroundColor: 'var(--bg-white)',
            borderLeft: '3px solid var(--success)',
            borderRadius: '12px',
            padding: '32px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          <Mic size={40} style={{ color: 'var(--success)', marginBottom: '16px' }} />
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Mock Interview
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Practice with an AI interviewer tailored to your target role. Get real-time voice feedback.
          </p>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--success)' }}>
            Start Interview
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            Recent Sessions
          </h2>
          <button
            onClick={() => router.push('/all-interviews')}
            style={{
              color: 'var(--primary-blue)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--border-default)',
              borderTop: '3px solid var(--primary-blue)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }} />
          </div>
        ) : recentSessions.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--bg-white)',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            border: '1px solid var(--border-default)'
          }}>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              marginBottom: '8px'
            }}>
              No sessions yet.
            </p>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)'
            }}>
              Start your first analysis above.
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-white)',
            borderRadius: '12px',
            border: '1px solid var(--border-default)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>Role</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>Duration</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr
                    key={session.interview_id}
                    style={{
                      borderTop: '1px solid var(--border-default)',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/interview/${session.interview_id}`)}
                  >
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {session.job_position || 'Unknown Position'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {formatDate(session.created_at)}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {session.interview_time || 30} min
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: session.status === 'Completed' ? '#DCFCE7' : '#F1F5F9',
                        color: session.status === 'Completed' ? '#16A34A' : '#64748B'
                      }}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .action-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
