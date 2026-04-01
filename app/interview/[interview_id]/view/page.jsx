"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, Briefcase, FileText, Play, CheckCircle, XCircle, Target, TrendingUp, Star, AlertCircle } from 'lucide-react';
import Image from 'next/image';

function ViewInterview() {
  const params = useParams();
  const interviewId = params.interview_id;
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const jobImageMap = {
    'Frontend Developer': '/fd.jpg',
    'Frontend Engineer': '/fd.jpg',
    'Backend Developer': '/bd.png',
    'Backend Engineer': '/bd.png',
    'Product Manager': '/devops.png',
    'Software Developer': '/sd.png',
    'Devops Engineer': '/devops.png',
    'Devops': '/devops.png',
  };

  useEffect(() => {
    if (interviewId) {
      fetchInterviewDetails();
    }
  }, [interviewId]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch interview details
      const { data: interviewData, error: interviewError } = await supabase
        .from('InterviewDetails')
        .select('*')
        .eq('interview_id', interviewId)
        .single();

      if (interviewError) {
        setError('Failed to load interview details');
        return;
      }

      setInterview(interviewData);

      // Parse questions from the JSON column
      if (interviewData.interview_questions) {
        try {
          const parsedQuestions = typeof interviewData.interview_questions === 'string' 
            ? JSON.parse(interviewData.interview_questions)
            : interviewData.interview_questions;
          setQuestions(parsedQuestions || []);
        } catch (parseError) {
          // Error parsing questions
          setQuestions([]);
        }
      }

      // Fetch feedback if exists
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('postinterview')
        .select("interview_id, interview_review")
        .eq('interview_id', interviewId)
        .maybeSingle();

      if (feedbackData && feedbackData.interview_review) {
        try {
          const parsedFeedback = typeof feedbackData.interview_review === 'string' 
            ? JSON.parse(feedbackData.interview_review)
            : feedbackData.interview_review;
          setFeedback(parsedFeedback);
        } catch (parseError) {
          // Error parsing feedback
        }
      }

    } catch (err) {
      // Error occurred
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startInterview = () => {
    router.push(`/interview/${interviewId}`);
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'hire':
      case 'accept':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'reject':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'maybe':
      case 'consider':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'hire':
      case 'accept':
        return <CheckCircle className="w-5 h-5" />;
      case 'reject':
        return <XCircle className="w-5 h-5" />;
      case 'maybe':
      case 'consider':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <span className="ml-3 text-gray-600">Loading interview details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Interview not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Interview Report</h1>
      </div>

      {/* Interview Overview Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="relative h-48 overflow-hidden">
          <Image 
            src={jobImageMap[interview.job_position] || '/tech.jpg'} 
            alt={interview.job_position} 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h2 className="text-3xl font-bold text-white">{interview.job_position}</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Candidate</p>
                <p className="font-medium">{interview.user_email || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Experience Level</p>
                <p className="font-medium capitalize">{interview.experience_level}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{interview.interview_time} minutes</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(interview.created_at)}</p>
              </div>
            </div>
          </div>

          {interview.job_description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{interview.job_description}</p>
            </div>
          )}

          {!feedback && (
            <div className="flex gap-4">
              <Button 
                onClick={startInterview}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Interview
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary (if feedback exists) */}
      {feedback && feedback.feedback && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-semibold">Performance Summary</h3>
          </div>
          
          {/* Rating Scores */}
          {feedback.feedback.rating && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < feedback.feedback.rating.technicalSkills ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-blue-600">{feedback.feedback.rating.technicalSkills}/5</div>
                <div className="text-sm text-gray-600">Technical Skills</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < feedback.feedback.rating.communication ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-green-600">{feedback.feedback.rating.communication}/5</div>
                <div className="text-sm text-gray-600">Communication</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < feedback.feedback.rating.problemSolving ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-purple-600">{feedback.feedback.rating.problemSolving}/5</div>
                <div className="text-sm text-gray-600">Problem Solving</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < feedback.feedback.rating.experience ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-orange-600">{feedback.feedback.rating.experience}/5</div>
                <div className="text-sm text-gray-600">Experience</div>
              </div>
            </div>
          )}

          {/* Overall Feedback Summary */}
          {feedback.feedback.summary && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-lg">Interview Summary</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
                {feedback.feedback.summary}
              </p>
            </div>
          )}

          {/* Recommendation */}
          {feedback.feedback.recommendation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${getRecommendationColor(feedback.feedback.recommendation)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getRecommendationIcon(feedback.feedback.recommendation)}
                  <h4 className="font-semibold">Recommendation</h4>
                </div>
                <p className="font-medium text-lg capitalize">{feedback.feedback.recommendation}</p>
              </div>
              
              {feedback.feedback.recommendationMsg && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold mb-2 text-gray-700">Reasoning</h4>
                  <p className="text-gray-600">{feedback.feedback.recommendationMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Questions Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-semibold">Interview Questions ({questions.length})</h3>
        </div>
        
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-800 mb-2">{question.question}</h4>
                  
                  {question.tests && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">What this tests: </span>
                      <span className="text-sm text-gray-600">{question.tests}</span>
                    </div>
                  )}

                  {question.sampleAnswer && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-green-600">Sample Answer: </span>
                      <div className="text-sm text-gray-600 bg-green-50 p-3 rounded mt-1">
                        {question.sampleAnswer}
                      </div>
                    </div>
                  )}

                  {question.followUps && question.followUps.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-600">Follow-up Questions:</span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1 ml-4">
                        {question.followUps.map((followUp, idx) => (
                          <li key={idx}>{followUp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {!feedback && (
        <div className="mt-6 flex justify-center gap-4">
          <Button 
            onClick={startInterview}
            size="lg"
            className="flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Interview
          </Button>
        </div>
      )}
    </div>
  );
}

export default ViewInterview;