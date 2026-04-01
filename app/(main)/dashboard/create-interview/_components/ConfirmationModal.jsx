"use client";
import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, formData, isSubmitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          🎯 Confirm Interview Creation
        </h2>
        
        {isSubmitting ? (
          <div className="text-center py-8">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Your Interview Questions</h3>
            <p className="text-gray-600 mb-2">Our AI is crafting personalized questions for you...</p>
            <p className="text-sm text-gray-500">Please wait..</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 text-center mb-4">
                Review your interview details below and confirm to generate questions
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Position:</span>
                    <span className="text-gray-900 font-semibold">{formData.jobPosition}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Experience Level:</span>
                    <span className="text-gray-900">
                      {{
                        'entry': 'Entry Level (0-2 years)',
                        'mid': 'Mid Level (2-5 years)',
                        'senior': 'Senior Level (5-8 years)',
                        'expert': 'Expert Level (8+ years)'
                      }[formData.experienceLevel]}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="text-gray-900">{formData.interviewDuration}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Difficulty:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      formData.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800' :
                      formData.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {formData.difficultyLevel}
                    </span>
                  </div>                                
                  {formData.jobDescription && (
                    <div className="pt-2 border-t border-blue-200">
                      <span className="font-medium text-gray-700 block mb-1">Description:</span>
                      <p className="text-gray-600 text-sm max-h-20 overflow-y-auto">
                        {formData.jobDescription.length > 100 
                          ? `${formData.jobDescription.substring(0, 100)}...` 
                          : formData.jobDescription
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                ← Back to Edit
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all font-semibold shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                🚀 Create Interview
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
