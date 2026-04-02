"use client";
import React, { createContext, useContext, useState } from 'react';

// Create the context
export const ResumeAnalysisContext = createContext();

// Provider component
export function ResumeAnalysisProvider({ children }) {
  const [resumeData, setResumeData] = useState({
    resumeFile: null,        // File object
    resumeFileName: '',      // Filename for display
    resumeText: '',          // Extracted text (populated later)
    jdText: '',              // Pasted job description
    jobPosition: '',         // Auto-extracted or manual
    userIntent: null,        // 'analysis_only' | 'full_prep'
    analysisResult: null,    // Populated after scoring
    sessionId: null          // Links to resume_analysis table
  });

  return (
    <ResumeAnalysisContext.Provider value={{ resumeData, setResumeData }}>
      {children}
    </ResumeAnalysisContext.Provider>
  );
}

// Custom hook for easy consumption
export function useResumeAnalysis() {
  const context = useContext(ResumeAnalysisContext);
  if (!context) {
    throw new Error('useResumeAnalysis must be used within ResumeAnalysisProvider');
  }
  return context;
}
