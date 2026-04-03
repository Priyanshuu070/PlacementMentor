"use client"
import { createContext, useContext, useState } from "react";

const initialState = {
  resumeFile: null,
  resumeFileName: '',
  resumeText: '',
  jdText: '',
  jobPosition: '',
  userIntent: null, // 'analysis_only' | 'mock_interview'
  analysisResult: null,
  sessionId: null
};

export const ResumeAnalysisContext = createContext(null);

export function ResumeAnalysisProvider({ children }) {
  const [resumeData, setResumeData] = useState(initialState);

  return (
    <ResumeAnalysisContext.Provider value={{ resumeData, setResumeData }}>
      {children}
    </ResumeAnalysisContext.Provider>
  );
}

export function useResumeAnalysis() {
  const context = useContext(ResumeAnalysisContext);
  if (!context) {
    throw new Error('useResumeAnalysis must be used within a ResumeAnalysisProvider');
  }
  return context;
}
