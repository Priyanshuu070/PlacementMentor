"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Briefcase, FileText, TrendingUp, Eye, Star, Filter, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { useUser } from '@/app/provider';
import Image from 'next/image';

function AllInterviews() {
  const router = useRouter();
  const user = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'score'

  const jobImageMap = {
    'Frontend Developer': '/fd.jpg',
    'Frontend Engineer': '/fd.jpg',
    'Backend Developer': '/bd.png',
    'Backend Engineer': '/bd.png',
    'Product Manager': '/devops.png',
    'Software Developer': '/sd.png',
    'Devops Engineer': '/devops.png',
    'Devops': '/devops.png',
    'Full Stack Developer': '/sd.png',
    'Data Scientist': '/tech.jpg',
    'UI/UX Designer': '/tech.jpg',
  };

  useEffect(() => {
    if (user?.user?.email) {
      fetchUserInterviews();
    }
  }, [user]);

  const fetchUserInterviews = async () => {
    try {
      setLoading(true);
      
      // Fetch interviews for the current user
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('InterviewDetails')
        .select('*')
        .eq('user_email', user.user.email)
        .order('created_at', { ascending: false });

      if (interviewsError) {
        throw interviewsError;
      }

      // Fetch feedback data for each interview
      const interviewsWithFeedback = await Promise.all(
        interviewsData.map(async (interview) => {
          const { data: feedbackData } = await supabase
            .from('postinterview')
            .select('interview_review')
            .eq('interview_id', interview.interview_id)
            .maybeSingle();

          let parsedFeedback = null;
          if (feedbackData?.interview_review) {
            try {
              parsedFeedback = typeof feedbackData.interview_review === 'string' 
                ? JSON.parse(feedbackData.interview_review)
                : feedbackData.interview_review;
            } catch (parseError) {
              // Error parsing feedback
            }
          }

          return {
            ...interview,
            feedback: parsedFeedback,
            status: parsedFeedback ? 'completed' : 'pending'
          };
        })
      );

      setInterviews(interviewsWithFeedback);
    } catch (err) {
      // Error fetching interviews
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAverageScore = (feedback) => {
    if (!feedback?.feedback?.rating) return null;
    
    const ratings = feedback.feedback.rating;
    const scores = [
      ratings.technicalSkills,
      ratings.communication,
      ratings.problemSolving,
      ratings.experience
    ].filter(score => score !== undefined);
    
    if (scores.length === 0) return null;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Convert from 10-point scale to 5-point scale if needed
    const normalizedScore = average > 5 ? (average / 2) : average;
    
    // Ensure the score doesn't exceed 5
    return Math.min(normalizedScore, 5).toFixed(1);
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'hire':
      case 'accept':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maybe':
      case 'consider':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort interviews
  const filteredAndSortedInterviews = interviews
    .filter(interview => {
      const matchesSearch = interview.job_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           interview.job_description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || interview.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'score':
          const scoreA = getAverageScore(a.feedback) || 0;
          const scoreB = getAverageScore(b.feedback) || 0;
          return scoreB - scoreA;
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your interviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUserInterviews}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Interviews</h1>
        <p className="text-gray-600">Track your interview progress and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const completedInterviews = interviews.filter(i => i.feedback);
                  if (completedInterviews.length === 0) return 'N/A';
                  
                  const avgScore = completedInterviews
                    .map(i => parseFloat(getAverageScore(i.feedback) || 0))
                    .reduce((sum, score) => sum + score, 0) / completedInterviews.length;
                  
                  return avgScore.toFixed(1);
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job position or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score">Highest Score</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Interviews List */}
      {filteredAndSortedInterviews.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
          <p className="text-gray-500 mb-6">
            {interviews.length === 0 
              ? "You haven't taken any interviews yet." 
              : "No interviews match your current filters."}
          </p>
          <Button onClick={() => router.push('/dashboard/create-interview')}>
            Create Your First Interview
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedInterviews.map((interview) => (
            <div key={interview.interview_id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Job Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={jobImageMap[interview.job_position] || '/tech.jpg'}
                        alt={interview.job_position}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Interview Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {interview.job_position}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          interview.status === 'completed' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {interview.status === 'completed' ? 'Completed' : 'Pending'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(interview.created_at)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {interview.interview_time} minutes
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {interview.experience_level}
                        </div>
                      </div>

                      {/* Performance Summary */}
                      {interview.feedback && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-4">
                            {/* Average Score */}
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium">
                                {getAverageScore(interview.feedback)}/5
                              </span>
                            </div>

                            {/* Recommendation */}
                            {interview.feedback.feedback?.recommendation && (
                              <div className={`px-2 py-1 rounded text-xs font-medium border ${
                                getRecommendationColor(interview.feedback.feedback.recommendation)
                              }`}>
                                {interview.feedback.feedback.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Job Description Preview */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {interview.job_description}
                      </p>

                      {/* Action Button */}
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => router.push(`/interview/${interview.interview_id}/view`)}
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        {interview.status === 'pending' && (
                          <Button
                            onClick={() => router.push(`/interview/${interview.interview_id}/start`)}
                            size="sm"
                            className="flex items-center"
                          >
                            Continue Interview
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllInterviews;