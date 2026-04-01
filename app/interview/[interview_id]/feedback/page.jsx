"use client";
import { supabase } from '@/services/supabaseClient';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react';

function Feedback() {
  const { interview_id } = useParams();
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Supabase error occurred
        if (error.code === 'PGRST116') {
          setError('Multiple feedback entries found. Please contact support.');
        } else {
          setError(`Database error: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      // Handle the array response from limit(1)
      const feedbackEntry = data; // maybeSingle returns single object, not array
      
      if (feedbackEntry && feedbackEntry.interview_review) {
        // Parse the interview_review JSON if it's a string
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
      // Error fetching feedback
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

  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRecommendationColor = (recommendation) => {
    return recommendation?.toLowerCase() === 'hire' 
      ? 'text-green-500' 
      : 'text-red-500';
  };

  const getRecommendationIcon = (recommendation) => {
    return recommendation?.toLowerCase() === 'hire' 
      ? <CheckCircle className="w-6 h-6 text-green-500" />
      : <XCircle className="w-6 h-6 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-white">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md text-center">
          <div className="text-red-500 mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-500/20">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Feedback Not Available</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                setError(null);
                getFeedback();
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg"
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md text-center">
          <p className="text-gray-300">No feedback data available</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Interview
          </button>
          <h1 className="text-2xl font-bold">Interview Feedback</h1>
          <button className="flex items-center text-gray-300 hover:text-white transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Overall Result */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image 
                src="/feedback.jpg" 
                alt="Feedback" 
                width={80} 
                height={80} 
                className="rounded-full mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
                <p className="text-gray-300">Here's your detailed performance feedback</p>
              </div>
            </div>
            <div className="text-center">
              {getRecommendationIcon(feedback.recommendation)}
              <p className={`text-xl font-bold mt-2 ${getRecommendationColor(feedback.recommendation)}`}>
                {feedback.recommendation || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Performance Ratings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.rating && Object.entries(feedback.rating).map(([skill, rating]) => (
              <div key={skill} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">
                    {skill.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-lg font-bold text-primary">{rating}/10</span>
                </div>
                <div className="flex space-x-1">
                  {renderStars(rating)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Performance Summary</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-200 leading-relaxed">
              {feedback.summary || 'No summary available'}
            </p>
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Final Recommendation</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              {getRecommendationIcon(feedback.recommendation)}
              <span className={`ml-3 text-lg font-bold ${getRecommendationColor(feedback.recommendation)}`}>
                {feedback.recommendation || 'N/A'}
              </span>
            </div>
            <p className="text-gray-200">
              {feedback.recommendationMsg || 'No recommendation message available'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Print Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default Feedback;