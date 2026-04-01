"use client";
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Updated to single form layout
function FormContainer({ formData, updateFormData, errors = {} }) {
  // This ensures our component can render even if props aren't provided
  const data = formData || {};
  const updateData = updateFormData || (() => {});

  // Helper function to display error message
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm border border-gray-100'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold mb-2 text-gray-800'>Create Your Interview</h2>
        <p className='text-gray-600'>Fill in the essential details below to generate customized interview questions</p>
      </div>
      
      {/* Single Form with Essential Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Position */}
        <div className="md:col-span-2">
          <h3 className='text-lg font-semibold mb-2'>Job Position *</h3>
          <Input 
            placeholder="e.g., Frontend Developer, Data Scientist, Product Manager" 
            value={data.jobPosition || ''} 
            onChange={(e) => updateData('jobPosition', e.target.value)}
            className={errors.jobPosition ? 'border-red-500' : ''}
          />
          <ErrorMessage field="jobPosition" />
        </div>

        {/* Experience Level */}
        <div>
          <h3 className='text-lg font-semibold mb-2'>Experience Level *</h3>
          <Select 
            value={data.experienceLevel || ''} 
            onValueChange={(value) => updateData('experienceLevel', value)}
          >
            <SelectTrigger className={`w-full ${errors.experienceLevel ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
              <SelectItem value="senior">Senior Level (5-8 years)</SelectItem>
              <SelectItem value="expert">Expert Level (8+ years)</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="experienceLevel" />
        </div>

        {/* Interview Duration */}
        <div>
          <h3 className='text-lg font-semibold mb-2'>Interview Duration *</h3>
          <Select
            value={data.interviewDuration || ''}
            onValueChange={(value) => updateData('interviewDuration', value)}
          >
            <SelectTrigger className={`w-full ${errors.interviewDuration ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5 Min">5 minutes</SelectItem>
              <SelectItem value="15 Min">15 minutes</SelectItem>
              <SelectItem value="30 Min">30 minutes</SelectItem>
              <SelectItem value="45 Min">45 minutes</SelectItem>
              <SelectItem value="60 Min">1 hour</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="interviewDuration" />
        </div>

        {/* Job Description */}
        <div className="md:col-span-2">
          <h3 className='text-lg font-semibold mb-2'>Job Description *</h3>
          <Textarea 
            placeholder="Briefly describe the role, key responsibilities, and main requirements..." 
            className={`min-h-[120px] ${errors.jobDescription ? 'border-red-500' : ''}`}
            value={data.jobDescription || ''} 
            onChange={(e) => updateData('jobDescription', e.target.value)}
          />
          <ErrorMessage field="jobDescription" />
        </div>
        {/* Difficulty Level */}
        <div className="md:col-span-2">
          <h3 className='text-lg font-semibold mb-2'>Difficulty Level *</h3>
          <div className={`grid grid-cols-3 gap-4 ${errors.difficultyLevel ? 'border border-red-500 p-3 rounded-md' : ''}`}>
            {["Easy", "Medium", "Hard"].map((level) => (
              <div 
                key={level} 
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:scale-105
                  ${data.difficultyLevel === level
                    ? 'bg-primary/10 border-primary shadow-md' 
                    : 'border-gray-200 hover:bg-gray-50'}`}
                onClick={() => updateData('difficultyLevel', level)}
              >
                <div className={`font-semibold ${data.difficultyLevel === level ? 'text-primary' : 'text-gray-700'}`}>
                  {level}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {level === 'Easy' && 'Basic concepts'}
                  {level === 'Medium' && 'Intermediate skills'}
                  {level === 'Hard' && 'Advanced topics'}
                </div>
              </div>
            ))}
          </div>
          <ErrorMessage field="difficultyLevel" />
        </div>
      </div>

      {/* Summary Section */}
      {(data.jobPosition || data.experienceLevel || data.interviewDuration) && (
        <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Interview Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {data.jobPosition && (
              <div>
                <span className="font-medium text-gray-600">Position:</span>
                <p className="text-gray-800">{data.jobPosition}</p>
              </div>
            )}
            {data.experienceLevel && (
              <div>
                <span className="font-medium text-gray-600">Level:</span>
                <p className="text-gray-800">
                  {{
                    'entry': 'Entry Level',
                    'mid': 'Mid Level',
                    'senior': 'Senior Level',
                    'expert': 'Expert Level'
                  }[data.experienceLevel]}
                </p>
              </div>
            )}
            {data.interviewDuration && (
              <div>
                <span className="font-medium text-gray-600">Duration:</span>
                <p className="text-gray-800">{data.interviewDuration}</p>
              </div>
            )}
            {data.difficultyLevel && (
              <div>
                <span className="font-medium text-gray-600">Difficulty:</span>
                <p className="text-gray-800">{data.difficultyLevel}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Status */}
      {data.jobPosition && data.experienceLevel && data.interviewDuration && data.jobDescription && 
       data.difficultyLevel && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <span className="text-lg">✅</span>
            <span className="font-medium">All required fields completed! Ready to create your interview.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormContainer