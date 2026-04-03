// Application Constants
export const APP_CONFIG = {
  NAME: 'PlacementMentor',
  DESCRIPTION: 'AI-Powered Placement Preparation Platform',
  VERSION: '1.0.0',
};

// API Configuration
export const API_CONFIG = {
  OPENROUTER: {
    BASE_URL: 'https://openrouter.ai/api/v1',
    // DECISION: Using google/gemma-2-9b-it:free as it's a reliable free model
    DEFAULT_MODEL: 'google/gemma-2-9b-it:free',
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.7,
  },
  VAPI: {
    VOICE_PROVIDER: 'playht',
    VOICE_ID: 'jennifer',
    TRANSCRIBER_PROVIDER: 'deepgram',
    TRANSCRIBER_MODEL: 'nova-2',
    LANGUAGE: 'en-US',
  },
};

// Interview Configuration
export const INTERVIEW_CONFIG = {
  DEFAULT_DURATION: 30,
  MIN_DURATION: 10,
  MAX_DURATION: 60,
  DIFFICULTY_LEVELS: ['Easy', 'Medium', 'Hard'],
  EXPERIENCE_LEVELS: {
    'entry': 'Entry Level (0-2 years)',
    'mid': 'Mid Level (2-5 years)',
    'senior': 'Senior Level (5-8 years)',
    'expert': 'Expert Level (8+ years)'
  },
};

// Database Tables
export const DB_TABLES = {
  USERS: 'Users',
  INTERVIEWS: 'InterviewDetails',
  FEEDBACK: 'postinterview',
  RESUME_ANALYSIS: 'resume_analysis',
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
  AI_SERVICE: 'AI service is temporarily unavailable.',
  INSUFFICIENT_CREDITS: 'Insufficient credits. Please purchase more.',
};

// Success Messages  
export const SUCCESS_MESSAGES = {
  INTERVIEW_CREATED: 'Interview created successfully!',
  INTERVIEW_COMPLETED: 'Interview completed successfully!',
  FEEDBACK_GENERATED: 'Feedback generated successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Simplified exports for easier imports
export const EXPERIENCE_LEVELS = {
  'Fresher': 'entry',
  '1-3 Years': 'mid',
  '3-5 Years': 'senior',
  '5+ Years': 'expert'
};

export const INTERVIEW_DURATIONS = [10, 20, 30];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

export const MAX_JD_LENGTH = 5000;
export const MIN_JD_LENGTH = 100;
export const MAX_CREDITS_DEFAULT = 10;
