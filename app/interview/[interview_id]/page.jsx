"use client";
import { InterviewDetailsContext } from '@/context/InterviewDetails.context';
import { supabase } from '@/services/supabaseClient';
import { CheckCircle2Icon, Clock, LucideMessageCircleQuestion, Video, Mic, Wifi, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

function Interview() {
  const [name, setName] = useState('');
  const {interview_id} = useParams();
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [interviewData, setInterviewData] = useContext(InterviewDetailsContext);
  useEffect(() => {
    getInterviewDetails();
  }, [interview_id]);

  const getInterviewDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('InterviewDetails')
        .select("job_position, interview_questions, interview_time") 
        .eq('interview_id', interview_id)
        .single();
      
      if (error) {
        // Error fetching interview details
      } else {
        // Retrieved interview data successfully
        setInterviewDetails(data);
      }
    } catch (error) {
      // Error fetching interview details
    } finally {
      setLoading(false); 
    }
  }
  // Function to handle starting the interview
  const handleStartInterview = async () => {
  try {
    setLoading(true);
    const { data: Interviewdata, error } = await supabase
      .from('InterviewDetails')
      .select("*")
      .eq('interview_id', interview_id);
      
    if (error) {
      // Error fetching interview data
      setLoading(false);
      return;
    }
    
    if (!Interviewdata || Interviewdata.length === 0) {
      // No interview data found
      setLoading(false);
      return;
    }
    
    // Interview data fetched successfully
    
    setInterviewData({
      username: name,
      interviewData: Interviewdata[0]
    });

    // Short delay to ensure context updates before navigation
    setTimeout(() => {
      // Then navigate to the next page
      router.push(`/interview/${interview_id}/start`);
    }, 300);

  } catch (error) {
    // Error in handleStartInterview
    setLoading(false);
  }};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="flex flex-col items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (!interviewDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the interview you're looking for.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate question count safely
  const questionCount = interviewDetails?.interview_questions?.length || 0;

  // Get duration from interview_time (appears to be duration in minutes)
  const duration = interviewDetails?.interview_time || 30;

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle2Icon className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-center mt-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Your Interview is Ready!
          </h1>
          
          <p className="text-gray-600 text-center mt-1 text-sm max-w-md">
            Everything has been prepared according to your requirements.
          </p>
        </div>

        <div className="mt-4 px-4">
          <div className="bg-white border-2 border-secondary rounded-xl shadow-md overflow-hidden">
            <div className="p-3 flex items-center justify-center">
              <Image src="/2.png" alt="Interview Header" width={200} height={150} className="w-[120px]" />
            </div>
            
            <div className="px-6 py-4">
              <h2 className="text-xl font-bold text-center mb-1">AI-Powered Interview Session</h2>
              
              <div className="flex justify-center my-3">
                <Image 
                  src="/interview_cover.jpg" 
                  alt="Interview Icon" 
                  width={400} 
                  height={300} 
                  className="w-[220px] rounded-lg shadow-sm" 
                />
              </div>
              
              <p className="text-base text-center text-gray-700 font-medium mb-3">
                You are interviewing for the position of {interviewDetails.job_position || "Software Developer"}
              </p>
              
              <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg mb-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <Clock className="text-primary w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{duration} Minutes</span>
                </div>
                
                <div className="h-6 w-px bg-gray-300"></div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{questionCount} Questions</span>
                  <div className="bg-purple-100 p-1.5 rounded-full">
                    <LucideMessageCircleQuestion className="text-purple-600 w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Your Name
                </label>
                <input 
                  type="text" 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex- John Doe" 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-2">Before You Begin</h2>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { icon: <Mic className="w-4 h-4 text-primary" />, text: "Test your Microphone" },
                    { icon: <LucideMessageCircleQuestion className="w-4 h-4 text-primary" />, text: "Ensure you are in a quiet environment" },
                    { icon: <Wifi className="w-4 h-4 text-primary" />, text: "Make sure you have a stable internet connection" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="bg-white p-1 rounded-full shadow-sm">
                        {item.icon}
                      </div>
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            
              <button 
                onClick={handleStartInterview}
                className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white text-base font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all"
                disabled={!name.trim()}
              >
                <Video className="mr-2 w-4 h-4" />
                Start Interview
              </button>
              
              {name.trim() === '' && (
                <p className="text-center text-amber-600 mt-1 text-xs">
                  Please enter your name to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;