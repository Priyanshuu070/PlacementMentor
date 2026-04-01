// Application Constants
export const APP_CONFIG = {
  NAME: 'NexPrep',
  DESCRIPTION: 'AI-Powered Interview Preparation Platform',
  VERSION: '2.0.0',
  COMPANY: 'NexPrep Technologies',
};

// API Configuration
export const API_CONFIG = {
  OPENROUTER: {
    BASE_URL: 'https://openrouter.ai/api/v1',
    DEFAULT_MODEL: 'tngtech/deepseek-r1t2-chimera:free',
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.7,
  },
  GEMINI: {
    BASE_URL: 'https://generativelanguage.googleapis.com/v1',
    MODEL: 'gemini-pro',
    MAX_TOKENS: 2000,
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
  DEFAULT_DURATION: 30, // minutes
  MIN_DURATION: 15,
  MAX_DURATION: 120,
  DIFFICULTY_LEVELS: ['Easy', 'Medium', 'Hard'],
  INTERVIEW_TYPES: [
    'Technical Interview',
    'Behavioral Interview', 
    'System Design',
    'Coding Challenge',
    'Experience-based',
    'Leadership Interview'
  ],
  MAX_QUESTIONS: 10,
};

// Billing Configuration
export const BILLING_CONFIG = {
  CURRENCY: '₹',
  PLANS: {
    STARTER: { credits: 5, price: 99 },
    GROWTH: { credits: 15, price: 249 },
    PRO: { credits: 30, price: 449 },
    UNLIMITED: { price: 699, isMonthly: true },
  },
};

// Database Tables
export const DB_TABLES = {
  USERS: 'users',
  INTERVIEWS: 'InterviewDetails',
  FEEDBACK: 'postinterview',
  CREDITS: 'user_credits',
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
  PAYMENT_SUCCESS: 'Payment processed successfully!',
};

// Validation Rules
export const VALIDATION_RULES = {
  MIN_JOB_TITLE_LENGTH: 2,
  MAX_JOB_TITLE_LENGTH: 100,
  MIN_EXPERIENCE_YEARS: 0,
  MAX_EXPERIENCE_YEARS: 50,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
};

// UI Constants
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  LOADING_TIMEOUT: 10000,
};