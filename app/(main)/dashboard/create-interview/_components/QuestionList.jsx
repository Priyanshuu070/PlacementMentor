"use client";
import React, { useState } from 'react';
import { CheckCircle, FileText, Play } from 'lucide-react';

function QuestionList({ questions = [], formData = {}, isLoading = false, onClose, interviewId, onStartInterview }) {
    const [activeQuestion, setActiveQuestion] = useState(null);
    
    // Parse the questions JSON if it's a string
    const parseQuestions = () => {
        if (!questions) return [];
        
        if (typeof questions === 'string') {
            try {
                // Remove any Markdown code block markers that might be present
                let cleanJson = questions;
                
                // Remove Markdown code block markers if present (```json and ```)
                cleanJson = cleanJson.replace(/```json\s*/, '');
                cleanJson = cleanJson.replace(/```\s*$/, '');
                cleanJson = cleanJson.replace(/```/, '');
                
                // Also handle any HTML tags that might have been included
                cleanJson = cleanJson.replace(/<\/?[^>]+(>|$)/g, '');
                
                // Try to parse the cleaned JSON
                return JSON.parse(cleanJson);
            } catch (firstError) {
                // Failed to parse cleaned JSON
                
                try {
                    // If that fails, try to extract just the array part
                    const arrayMatch = questions.match(/\[\s*\{.*\}\s*\]/s);
                    if (arrayMatch) {
                        return JSON.parse(arrayMatch[0]);
                    }
                } catch (secondError) {
                    // Failed to parse extracted array
                }
                
                // All parsing attempts failed
                return [];
            }
        }
        
        return Array.isArray(questions) ? questions : [];
    };
    
    const parsedQuestions = parseQuestions();
    
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">Generating Interview Questions</h2>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-6 text-lg text-gray-600">Our AI is crafting personalized questions for your interview...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!parsedQuestions.length) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6">Generated Content</h2>
                    <p className="mb-3">The AI generated content, but it couldn't be parsed into the expected format.</p>
                    
                    {/* Show the raw response */}
                    <div className="border border-gray-300 rounded-md p-4 mb-6 bg-gray-50 max-h-96 overflow-y-auto">
                        <h3 className="font-bold mb-2">Raw Response:</h3>
                        <pre className="whitespace-pre-wrap text-sm">
                            {typeof questions === 'string' ? questions : JSON.stringify(questions, null, 2)}
                        </pre>
                    </div>
                    
                    <div className="flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Interview Questions Generated!</h2>
                            <p className="text-gray-600">Your personalized interview is ready</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Interview Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-3">
                        <FileText className="w-5 h-5 text-green-600 mr-2" />
                        <h3 className="font-semibold text-green-900">Interview Summary</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white/50 p-3 rounded">
                            <span className="text-gray-600 font-medium block">Position:</span>
                            <p className="text-gray-800 font-semibold">{formData.jobPosition || 'Not specified'}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded">
                            <span className="text-gray-600 font-medium block">Experience:</span>
                            <p className="text-gray-800 font-semibold">
                                {{
                                    'entry': 'Entry Level',
                                    'mid': 'Mid Level', 
                                    'senior': 'Senior Level',
                                    'expert': 'Expert Level'
                                }[formData.experienceLevel] || formData.experienceLevel || 'Not specified'}
                            </p>
                        </div>
                        <div className="bg-white/50 p-3 rounded">
                            <span className="text-gray-600 font-medium block">Duration:</span>
                            <p className="text-gray-800 font-semibold">{formData.interviewDuration || 'Not specified'}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded">
                            <span className="text-gray-600 font-medium block">Difficulty:</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                formData.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-700' :
                                formData.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                formData.difficultyLevel === 'Hard' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {formData.difficultyLevel || 'Not specified'}
                            </span>
                        </div>
                    </div>
                    
                    
                    
                    <div className="mt-3 pt-3 border-t border-green-200">
                        <span className="text-gray-600 font-medium">Total Questions Generated: </span>
                        <span className="text-green-700 font-bold text-lg">{parsedQuestions.length}</span>
                    </div>
                </div>
                
                {/* Questions List */}
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">Your Interview Questions</h3>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            {parsedQuestions.length} Questions
                        </span>
                    </div>
                    <div className="h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        <div className="space-y-3">
                            {parsedQuestions.map((question, index) => (
                                <div 
                                    key={index}
                                    className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-md">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium leading-relaxed text-base">
                                                {question.question}
                                            </p>
                                            
                                            {/* Show additional question details if available */}
                                            {(question.tests || question.sampleAnswer) && (
                                                <div className="mt-3 space-y-2">
                                                    {question.tests && (
                                                        <div className="text-sm">
                                                            <span className="font-medium text-gray-600">Evaluates: </span>
                                                            <span className="text-gray-700">{question.tests}</span>
                                                        </div>
                                                    )}
                                                    {question.sampleAnswer && (
                                                        <details className="text-sm">
                                                            <summary className="font-medium text-gray-600 cursor-pointer hover:text-primary">
                                                                Sample Answer Guide
                                                            </summary>
                                                            <p className="text-gray-700 mt-1 pl-4 border-l-2 border-gray-300">
                                                                {question.sampleAnswer}
                                                            </p>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600 text-center sm:text-left">
                            🎉 <strong>Interview questions generated successfully!</strong> You can now start practicing or save this for later.
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    if (interviewId && onStartInterview) {
                                        onStartInterview(interviewId);
                                    } else {
                                        // Interview ID not found or onStartInterview not provided
                                        onClose();
                                    }
                                }}
                                className="px-8 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all flex items-center font-semibold shadow-lg hover:shadow-xl"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Start Interview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionList;