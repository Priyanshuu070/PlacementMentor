import { VALIDATION_RULES } from './constants';

/**
 * Validation utility functions
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateJobTitle = (title) => {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  return trimmed.length >= VALIDATION_RULES.MIN_JOB_TITLE_LENGTH && 
         trimmed.length <= VALIDATION_RULES.MAX_JOB_TITLE_LENGTH;
};

export const validateExperience = (years) => {
  const num = parseInt(years);
  return !isNaN(num) && 
         num >= VALIDATION_RULES.MIN_EXPERIENCE_YEARS && 
         num <= VALIDATION_RULES.MAX_EXPERIENCE_YEARS;
};

export const validateDescription = (description) => {
  if (!description || typeof description !== 'string') return false;
  const trimmed = description.trim();
  return trimmed.length >= VALIDATION_RULES.MIN_DESCRIPTION_LENGTH && 
         trimmed.length <= VALIDATION_RULES.MAX_DESCRIPTION_LENGTH;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Form validation for interview creation
 */
export const validateInterviewForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.jobPosition)) {
    errors.jobPosition = 'Job position is required';
  } else if (!validateJobTitle(formData.jobPosition)) {
    errors.jobPosition = `Job position must be between ${VALIDATION_RULES.MIN_JOB_TITLE_LENGTH} and ${VALIDATION_RULES.MAX_JOB_TITLE_LENGTH} characters`;
  }
  
  if (!validateRequired(formData.jobExperience)) {
    errors.jobExperience = 'Experience level is required';
  } else if (!validateExperience(formData.jobExperience)) {
    errors.jobExperience = `Experience must be between ${VALIDATION_RULES.MIN_EXPERIENCE_YEARS} and ${VALIDATION_RULES.MAX_EXPERIENCE_YEARS} years`;
  }
  
  if (formData.jobDescription && !validateDescription(formData.jobDescription)) {
    errors.jobDescription = `Description must be between ${VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} and ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} characters`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * API request validation
 */
export const validateAPIRequest = (body, requiredFields) => {
  const errors = [];
  
  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Invalid request body'] };
  }
  
  for (const field of requiredFields) {
    if (!validateRequired(body[field])) {
      errors.push(`${field} is required`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Environment variable validation
 */
export const validateEnvironmentVariables = (requiredVars) => {
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
};