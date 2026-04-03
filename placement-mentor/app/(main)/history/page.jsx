"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Star, FileText } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import Link from "next/link";

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'interviews'

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all interviews for the user
        const { data: interviewsData, error } = await supabase
          .from('InterviewDetails')
          .select('*')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching interviews:', error);
          setLoading(false);
          return;
        }

        // Fetch status from postinterview for each
        const interviewsWithStatus = await Promise.all(
          (interviewsData || []).map(async (interview) => {
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
                  score = vals.length > 0 
                    ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) 
                    : null;
                }
              } catch (e) {
                // Parse error
              }
            }

            return {
              ...interview,
              status: feedback ? 'Completed' : 'Pending',
              score
            };
          })
        );

        setInterviews(interviewsWithStatus);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.email]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter based on active tab
  // DECISION: "Interviews Only" filters to show only completed interviews
  const filteredInterviews = activeTab === 'interviews'
    ? interviews.filter(i => i.status === 'Completed')
    : interviews;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your past analyses and interviews
        </p>
      </div>

      {/* Tabs */}
      <div 
        className="flex gap-1 p-1 rounded-lg mb-6"
        style={{ background: 'var(--bg-surface)', display: 'inline-flex' }}
      >
        <button
          onClick={() => setActiveTab('all')}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            background: activeTab === 'all' ? 'var(--bg-white)' : 'transparent',
            color: activeTab === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          All Sessions
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            background: activeTab === 'interviews' ? 'var(--bg-white)' : 'transparent',
            color: activeTab === 'interviews' ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'interviews' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Interviews Only
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div 
            className="w-8 h-8 border-3 rounded-full"
            style={{ 
              borderColor: 'var(--primary-blue)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText 
            size={48} 
            style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} 
          />
          <h2 
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            No sessions yet.
          </h2>
          <p 
            className="mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            Go to Dashboard to start your first session.
          </p>
          <Link href="/dashboard" className="btn-primary inline-block">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Role
                </th>
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Date
                </th>
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Duration
                </th>
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Score
                </th>
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.map((item) => (
                <tr 
                  key={item.interview_id}
                  className="cursor-pointer transition-colors"
                  style={{ borderTop: '1px solid var(--border-default)' }}
                  onClick={() => router.push(`/interview/${item.interview_id}/feedback`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td 
                    className="py-4 px-4"
                    style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  >
                    {item.job_position}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      {formatDate(item.created_at)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Clock size={14} />
                      {item.interview_time} mins
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {item.score ? (
                      <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Star size={14} style={{ color: 'var(--warning)' }} />
                        {item.score}/10
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
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
  );
}
