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

function FormContainer({ formData, updateFormData, errors = {}, isFromUpload = false }) {
  const data = formData || {};
  const updateData = updateFormData || (() => {});

  // Helper function to display error message
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '4px' }}>{errors[field]}</p>;
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-white)',
      borderRadius: '12px',
      border: '1px solid var(--border-default)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          Interview Details
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Fill in the details to generate personalized interview questions
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* Job Position */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Job Position *
          </label>
          {isFromUpload ? (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>
              {data.jobPosition || 'Not specified'}
            </div>
          ) : (
            <Input 
              placeholder="e.g., Frontend Developer, Data Scientist, Product Manager" 
              value={data.jobPosition || ''} 
              onChange={(e) => updateData('jobPosition', e.target.value)}
              style={{
                borderColor: errors.jobPosition ? 'var(--error)' : 'var(--border-default)'
              }}
            />
          )}
          <ErrorMessage field="jobPosition" />
        </div>

        {/* Job Description */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Job Description *
          </label>
          {isFromUpload ? (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              color: 'var(--text-primary)',
              minHeight: '100px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {data.jobDescription 
                ? (data.jobDescription.length > 200 
                    ? data.jobDescription.substring(0, 200) + '...' 
                    : data.jobDescription)
                : 'Not specified'}
            </div>
          ) : (
            <Textarea 
              placeholder="Paste the full job description here..." 
              value={data.jobDescription || ''} 
              onChange={(e) => updateData('jobDescription', e.target.value)}
              style={{
                minHeight: '120px',
                borderColor: errors.jobDescription ? 'var(--error)' : 'var(--border-default)'
              }}
            />
          )}
          <ErrorMessage field="jobDescription" />
        </div>

        {/* Experience Level */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Experience Level *
          </label>
          <Select 
            value={data.experienceLevel || ''} 
            onValueChange={(value) => updateData('experienceLevel', value)}
          >
            <SelectTrigger style={{
              borderColor: errors.experienceLevel ? 'var(--error)' : 'var(--border-default)'
            }}>
              <SelectValue placeholder="Select Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fresher">Fresher</SelectItem>
              <SelectItem value="1-3 Years">1-3 Years</SelectItem>
              <SelectItem value="3-5 Years">3-5 Years</SelectItem>
              <SelectItem value="5+ Years">5+ Years</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="experienceLevel" />
        </div>

        {/* Interview Duration */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Interview Duration *
          </label>
          <Select
            value={data.interviewDuration || ''}
            onValueChange={(value) => updateData('interviewDuration', value)}
          >
            <SelectTrigger style={{
              borderColor: errors.interviewDuration ? 'var(--error)' : 'var(--border-default)'
            }}>
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10 mins">10 mins</SelectItem>
              <SelectItem value="20 mins">20 mins</SelectItem>
              <SelectItem value="30 mins">30 mins</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="interviewDuration" />
        </div>

        {/* Difficulty Level */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Difficulty Level *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {["Easy", "Medium", "Hard"].map((level) => (
              <div 
                key={level}
                onClick={() => updateData('difficultyLevel', level)}
                style={{
                  border: `2px solid ${data.difficultyLevel === level ? 'var(--primary-blue)' : 'var(--border-default)'}`,
                  backgroundColor: data.difficultyLevel === level ? 'var(--primary-blue-light)' : 'var(--bg-white)',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (data.difficultyLevel !== level) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (data.difficultyLevel !== level) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-white)';
                  }
                }}
              >
                <div style={{
                  fontWeight: 600,
                  color: data.difficultyLevel === level ? 'var(--primary-blue)' : 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  {level}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
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
    </div>
  )
}

export default FormContainer
