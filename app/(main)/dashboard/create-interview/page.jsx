"use client";
import { ArrowLeft, Info } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import FormContainer from './_components/FormContainer';
import ConfirmationModal from './_components/ConfirmationModal';
import QuestionList from './_components/QuestionList';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/services/supabaseClient';
import { useUser } from '@/app/provider';
import { toast } from 'sonner';
import { useResumeAnalysis } from '@/context/ResumeAnalysis.context';

// Helper function to extract numeric value from duration string
const extractDurationMinutes = (durationString) => {
  if (!durationString) return 30; // default
  const match = durationString.match(/\d+/);
  return match ? parseInt(match[0]) : 30;
};

// Experience level mapping
const experienceLevelMap = {
  'Fresher': 'entry',
  '1-3 Years': 'mid',
  '3-5 Years': 'senior',
  '5+ Years': 'expert'
};

// Duration mapping
const durationMap = {
  '10 mins': 10,
  '20 mins': 20,
  '30 mins': 30
};

function CreateInterview() {
  const user = useUser()
  const router = useRouter();
  const { resumeData } = useResumeAnalysis();
  const isFromUpload = resumeData?.userIntent === 'full_prep';

  const [errors, setErrors] = React.useState({});
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    jobPosition: "",
    jobDescription: "",
    experienceLevel: "",
    interviewDuration: "",
    difficultyLevel: ""
  });

  // Pre-fill fields if coming from upload page
  useEffect(() => {
    if (isFromUpload && resumeData) {
      setFormData(prev => ({
        ...prev,
        jobPosition: resumeData.jobPosition || '',
        jobDescription: resumeData.jdText || ''
      }));
    }
  }, [isFromUpload, resumeData]);

  const updateFormData = (field, value) => {
    // Clear any error for this field when user updates it
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
  
  // Validate all required form fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.jobPosition.trim()) {
      newErrors.jobPosition = "Job position is required";
      isValid = false;
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
      isValid = false;
    }
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required";
      isValid = false;
    }
    if (!formData.interviewDuration) {
      newErrors.interviewDuration = "Interview duration is required";
      isValid = false;
    }
    if (!formData.difficultyLevel) {
      newErrors.difficultyLevel = "Difficulty level is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check user credits
  const checkUserCredits = () => {
    if (!user || !user.user) {
      toast.error("Please login to create an interview");
      return false;
    }

    const userCredits = user.user.credits || 0;
    
    if (userCredits <= 0) {
      toast.error("You don't have enough credits to create an interview. Please add credits to continue.", {
        duration: 5000,
        action: {
          label: "Add Credits",
          onClick: () => router.push('/billing') 
        }
      });
      return false;
    }

    return true;
  };

  const handleCreateInterview = () => {
    // Validate form and check credits
    if (validateForm()) {
      if (checkUserCredits()) {
        setShowConfirmationModal(true);
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generationError, setGenerationError] = React.useState(null);
  const [generatedQuestions, setGeneratedQuestions] = React.useState(null);
  const [showQuestionList, setShowQuestionList] = React.useState(false);
  const [currentInterviewId, setCurrentInterviewId] = React.useState(null);

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Double-check credits before proceeding with API call
      if (!checkUserCredits()) {
        return;
      }
      
      // Map display values to API values
      const apiExperienceLevel = experienceLevelMap[formData.experienceLevel] || formData.experienceLevel;
      const apiDuration = durationMap[formData.interviewDuration] || extractDurationMinutes(formData.interviewDuration);
      
      // Prepare the form data for API
      const submissionData = {
        jobPosition: formData.jobPosition,
        jobDescription: formData.jobDescription,
        experienceLevel: apiExperienceLevel,
        interviewDuration: `${apiDuration} Min`,
        difficultyLevel: formData.difficultyLevel
      };
      
      console.log('Submitting to API:', submissionData);
      
      // Submit the form data to the API
      const response = await fetch('/api/ai-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Interview questions generated successfully!');
        
        // Generate a unique interview ID
        const interviewId = uuidv4();
        
        // Get the current user's email
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email || user?.user?.email || 'anonymous@example.com';
        
        // Save to Supabase
        const { data, error } = await supabase
          .from('InterviewDetails')
          .insert({
            interview_id: interviewId,
            job_position: submissionData.jobPosition,
            job_description: submissionData.jobDescription,
            experience_level: submissionData.experienceLevel,
            interview_time: apiDuration,
            interview_questions: result.questions,
            user_email: userEmail
          })
          .select();
          
        if (error) {
          console.error("Error saving to Supabase:", error);
          toast.error("Questions were generated but there was an error saving them to the database.");
        } else {
          console.log("Interview saved to database:", data);
          
          // Deduct 1 credit from user
          try {
            const { error: creditError } = await supabase
              .from('Users')
              .update({ 
                credits: user.user.credits - 1 
              })
              .eq('email', userEmail);
              
            if (creditError) {
              console.error("Error updating credits:", creditError);
              toast.warning("Interview created but failed to update credits");
            } else {
              toast.success("Interview created successfully! 1 credit used.");
            }
          } catch (creditUpdateError) {
            console.error("Credit update failed:", creditUpdateError);
          }
        }
        
        // Store the generated questions and interview ID
        setGeneratedQuestions(result.questions);
        setCurrentInterviewId(interviewId);
        
        // Close the confirmation modal and show the questions list
        setShowConfirmationModal(false);
        setShowQuestionList(true);
      } else {
        throw new Error(result.error || "Failed to generate interview questions");
      }
    } catch (error) {
      console.error("Error submitting interview:", error);
      setGenerationError(error.message);
      toast.error(`Error creating interview: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      if (!showQuestionList) {
        setShowConfirmationModal(false);
      }
    }
  };
  
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-surface)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={24} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            Create Interview
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Generate personalized questions for your interview practice
          </p>
        </div>
      </div>

      {/* Banner - only shown when coming from upload */}
      {isFromUpload && (
        <div style={{
          backgroundColor: 'var(--primary-blue-light)',
          borderLeft: '3px solid var(--primary-blue)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Info size={20} style={{ color: 'var(--primary-blue)' }} />
          <p style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Your resume is queued for analysis. Interview questions will be tailored to your skill gaps.
          </p>
        </div>
      )}

      {/* Display user credits */}
      {user?.user && (
        <div style={{
          backgroundColor: 'var(--primary-blue-light)',
          border: '1px solid var(--primary-blue-accent)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--primary-blue)'
            }}>
              Available Credits: <strong style={{ fontSize: '18px' }}>{user.user.credits || 0}</strong>
            </span>
            <span style={{
              fontSize: '12px',
              color: 'var(--primary-blue)',
              backgroundColor: 'var(--primary-blue-accent)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              1 credit per interview
            </span>
          </div>
          {(user.user.credits || 0) <= 0 && (
            <button
              onClick={() => router.push('/billing')}
              className="btn-primary"
              style={{
                fontSize: '12px',
                padding: '8px 16px'
              }}
            >
              Add Credits
            </button>
          )}
        </div>
      )}
      
      <FormContainer 
        formData={formData} 
        updateFormData={updateFormData}
        errors={errors}
        isFromUpload={isFromUpload}
      />
      
      <div style={{
        marginTop: '32px',
        textAlign: 'center'
      }}>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          Ready to create your interview? Make sure all required fields are filled out.
        </p>
        <button 
          onClick={handleCreateInterview}
          className="btn-primary"
          disabled={!user?.user || user.user.credits <= 0}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            fontWeight: 600,
            opacity: (!user?.user || user.user.credits <= 0) ? 0.5 : 1,
            cursor: (!user?.user || user.user.credits <= 0) ? 'not-allowed' : 'pointer'
          }}
        >
          Generate Interview Questions
        </button>
        {(!user?.user || user.user.credits <= 0) && (
          <p style={{
            color: 'var(--error)',
            fontSize: '14px',
            marginTop: '8px'
          }}>
            You need at least 1 credit to create an interview
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmationModal}
        onClose={() => !isSubmitting && setShowConfirmationModal(false)}
        onConfirm={handleFinalSubmit}
        formData={formData}
        isSubmitting={isSubmitting}
      />
      
      {/* Questions List Modal */}
      {showQuestionList && (
        <QuestionList 
          questions={generatedQuestions}
          formData={formData}
          isLoading={isSubmitting}
          interviewId={currentInterviewId}
          onClose={() => {
            setShowQuestionList(false);
            router.push('/dashboard');
          }}
          onStartInterview={(interviewId) => {
            setShowQuestionList(false);
            router.push(`/interview/${interviewId}`);
          }}
        />
      )}
    </div>
  )
}

export default CreateInterview