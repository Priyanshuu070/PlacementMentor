import { Button } from '@/components/ui/button';
import { supabase } from '@/services/supabaseClient';
import { History, Plus, Clock, User, Briefcase, Calendar, Eye, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/provider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function LatestInterviews() {
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

  const userData = useUser();
  const router = useRouter();
  const [interviewsList, setInterviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userEmail = userData?.user?.email;
      
      let { data: InterviewDetails, error } = await supabase
        .from('InterviewDetails')
        .select("interview_id, job_position, experience_level, interview_time, created_at")
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load interviews');
        return;
      }

      setInterviewsList(InterviewDetails || []);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData === undefined) {
      return;
    }
    
    if (userData === null) {
      setLoading(false);
      setError('Please log in to view your interviews');
      return;
    }
    
    if (userData?.user?.email) {
      setError(null);
      getInterviews();
    } else {
      setLoading(false);
      setError('User email not available. Please try refreshing the page.');
    }
  }, [userData]);

  const handleViewInterview = (interviewId) => {
    router.push(`/interview/${interviewId}/view`);
  };

  const handleDeleteInterview = async (interviewId, e) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this interview?')) {
      try {
        const { error } = await supabase
          .from('InterviewDetails')
          .delete()
          .eq('interview_id', interviewId);

        if (error) {
          alert('Failed to delete interview');
          return;
        }

        setInterviewsList(prev => prev.filter(interview => interview.interview_id !== interviewId));
      } catch (err) {
        alert('An error occurred while deleting');
      }
    }
  };
      
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className='my-5'>
        <h2 className='text-2xl font-bold mb-4'>Previously Created Interviews</h2>
        <div className='flex items-center justify-center p-8'>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <span className="ml-3 text-gray-600">Loading interviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='my-5'>
        <h2 className='text-2xl font-bold mb-4'>Previously Created Interviews</h2>
        <div className='mt-2 p-5 flex flex-col items-center justify-center rounded-lg bg-red-50 border border-red-200'>
          <p className='text-red-600 text-center'>{error}</p>
          <Button 
            onClick={getInterviews} 
            className='mt-4 bg-red-600 hover:bg-red-700'
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='my-5'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-2xl font-bold'>Previously Created Interviews</h2>
        <Button 
            onClick={() => router.push(`/dashboard/create-interview`)}
            className='flex items-center gap-2 cursor-pointer'
          >
          <Plus className="w-4 h-4" />
          Create New Interview
        </Button>
      </div>

      {interviewsList.length === 0 && (
        <div className='mt-2 p-8 flex flex-col items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm'>
          <History className='h-16 w-16 text-primary mx-auto mb-4' />
          <h3 className='text-gray-500 text-center text-lg font-medium mb-2'>
            No interviews created yet
          </h3>
          <p className='text-gray-400 text-center mb-6'>
            Start your interview preparation journey by creating your first interview
          </p>
          <Button 
            onClick={() => router.push('dashboard/create-interview')}
            className='flex items-center gap-2 cursor-pointer'
          >
            <Plus className="w-4 h-4" />
            Create New Interview
          </Button>
        </div>
      )}

      {interviewsList.length > 0 && ( 
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {interviewsList.map((interview, index) => (
            <div 
              key={interview.interview_id || index}
              className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden'
              onClick={() => handleViewInterview(interview.interview_id)}
              >
            <div className='relative h-32 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
              <Image 
                src={jobImageMap[interview?.job_position] || '/tech.jpg'} 
                alt={interview?.job_position || 'Job Position'} 
                width={120}
                height={80}
                className='object-contain rounded'
              />
              <div className='absolute top-2 right-2 flex gap-1'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewInterview(interview.interview_id);
                  }}
                  className='p-1.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors'
                  title="View Interview"
                >
                  <Eye className='w-4 h-4 text-white' />
                </button>
                <button
                  onClick={(e) => handleDeleteInterview(interview.interview_id, e)}
                  className='p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-full backdrop-blur-sm transition-colors'
                  title="Delete Interview"
                >
                  <Trash2 className='w-4 h-4 text-white' />
                </button>
              </div>
            </div>

              <div className='p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-2 line-clamp-1'>
                  {interview.job_position || 'Unknown Position'}
                </h3>
                
                <div className='space-y-2 mb-4'>
                  <div className='flex items-center text-sm text-gray-600'>
                    <User className='w-4 h-4 mr-2 text-gray-400' />
                    <span>{userData?.user?.Name || 'Unknown User'}</span>
                  </div>
                  
                  <div className='flex items-center text-sm text-gray-600'>
                    <Briefcase className='w-4 h-4 mr-2 text-gray-400' />
                    <span>{interview.experience_level || 'Not specified'} Experience</span>
                  </div>
                  
                  <div className='flex items-center text-sm text-gray-600'>
                    <Clock className='w-4 h-4 mr-2 text-gray-400' />
                    <span>{interview.interview_time || 30} minutes</span>
                  </div>
                  
                  <div className='flex items-center text-sm text-gray-600'>
                    <Calendar className='w-4 h-4 mr-2 text-gray-400' />
                    <span>Created {formatDate(interview.created_at)}</span>
                  </div>
                </div>

                <div className='flex gap-2'>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewInterview(interview.interview_id);
                    }}
                    size="sm" 
                    className='flex-1'
                  >
                    <Eye className='w-4 h-4 mr-1' />
                    View
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/interview/${interview.interview_id}/feedback`);
                    }}
                    variant="outline" 
                    size="sm"
                    className='flex-1'
                  >
                    Feedback
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviews;