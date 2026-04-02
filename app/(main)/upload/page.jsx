"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, FileText, Award, ArrowRight } from 'lucide-react';
import { useResumeAnalysis } from '@/context/ResumeAnalysis.context';

export default function UploadPage() {
  const router = useRouter();
  const { resumeData, setResumeData } = useResumeAnalysis();
  const fileInputRef = useRef(null);

  // Local state
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileTouched, setFileTouched] = useState(false);
  const [jdTouched, setJdTouched] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Process file
  const processFile = (file) => {
    setFileTouched(true);

    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      setFileError('Please upload a PDF file only');
      setResumeFile(null);
      return;
    }

    // Valid PDF
    setFileError('');
    setResumeFile(file);
  };

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  // File input handler
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  // Remove file
  const handleRemoveFile = () => {
    setResumeFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // JD change handler
  const handleJdChange = (e) => {
    setJdTouched(true);
    const value = e.target.value;
    if (value.length <= 5000) {
      setJdText(value);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const hasFile = resumeFile !== null;
    const hasValidJd = jdText.trim().length >= 100;
    const hasIntent = selectedIntent !== null;
    return hasFile && hasValidJd && hasIntent;
  };

  // Continue handler
  const handleContinue = () => {
    if (!isFormValid()) return;

    // Save to context
    setResumeData({
      ...resumeData,
      resumeFile: resumeFile,
      resumeFileName: resumeFile.name,
      jdText: jdText.trim(),
      userIntent: selectedIntent
    });

    // Temporary console.log for verification
    console.log('Saved to context:', {
      fileName: resumeFile.name,
      jdLength: jdText.trim().length,
      intent: selectedIntent
    });

    // Route based on intent
    if (selectedIntent === 'analysis_only') {
      router.push('/analysis-loading');
    } else if (selectedIntent === 'full_prep') {
      router.push('/create-interview');
    }
  };

  const intentOptions = [
    {
      id: 'analysis_only',
      icon: FileText,
      title: 'Analyse Resume Only',
      description: 'Get your ATS score, skill coverage report, and improvement suggestions.'
    },
    {
      id: 'full_prep',
      icon: Award,
      title: 'Full Placement Prep',
      description: 'Resume analysis + tailored mock interview session based on your skill gaps.'
    }
  ];

  const continueButtonDisabled = !isFormValid();

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 24px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          Upload Your Resume & Job Description
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)'
        }}>
          We'll analyse your fit and prepare you for the interview
        </p>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* LEFT: Resume Upload */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Your Resume
          </label>

          {/* Drag and Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: resumeFile && !fileError
                ? '2px solid var(--success)'
                : isDragging
                ? '2px dashed var(--primary-blue)'
                : '2px dashed var(--border-default)',
              borderRadius: '12px',
              backgroundColor: resumeFile && !fileError
                ? 'var(--bg-white)'
                : isDragging
                ? 'var(--primary-blue-light)'
                : 'var(--bg-surface)',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              animation: isDragging ? 'pulse-border 1s ease-in-out infinite' : 'none'
            }}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {resumeFile && !fileError ? (
              // File selected state
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                width: '100%'
              }}>
                <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {resumeFile.name}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    {formatFileSize(resumeFile.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  style={{
                    color: 'var(--error)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              // Empty state
              <div style={{
                textAlign: 'center',
                padding: '24px'
              }}>
                <Upload
                  size={40}
                  style={{
                    color: isDragging ? 'var(--primary-blue)' : 'var(--text-muted)',
                    marginBottom: '12px'
                  }}
                />
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  Drag & drop your PDF here
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>
                  or click to browse
                </p>
              </div>
            )}
          </div>

          {/* File error */}
          {fileTouched && fileError && (
            <p style={{
              color: 'var(--error)',
              fontSize: '14px',
              marginTop: '8px'
            }}>
              {fileError}
            </p>
          )}
        </div>

        {/* RIGHT: Job Description */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Job Description
          </label>

          <textarea
            value={jdText}
            onChange={handleJdChange}
            placeholder="Paste the full job description here..."
            style={{
              width: '100%',
              minHeight: '200px',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, system-ui, sans-serif',
              resize: 'vertical',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-blue)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-default)';
            }}
          />

          {/* Character counter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px'
          }}>
            <div>
              {/* Validation hint */}
              {jdTouched && jdText.length > 0 && jdText.length < 100 && (
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}>
                  Please paste a more complete job description (min 100 characters)
                </p>
              )}
            </div>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              {jdText.length} / 5000
            </p>
          </div>
        </div>
      </div>

      {/* Intent Selection */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '16px'
        }}>
          What would you like to do?
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          {intentOptions.map(option => {
            const isSelected = selectedIntent === option.id;
            const Icon = option.icon;

            return (
              <div
                key={option.id}
                onClick={() => setSelectedIntent(option.id)}
                style={{
                  padding: '24px',
                  border: isSelected
                    ? '2px solid var(--primary-blue)'
                    : '2px solid var(--border-default)',
                  borderRadius: '12px',
                  backgroundColor: isSelected
                    ? 'var(--primary-blue-light)'
                    : 'var(--bg-white)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon
                  size={32}
                  style={{
                    color: isSelected ? 'var(--primary-blue)' : 'var(--text-secondary)',
                    marginBottom: '12px'
                  }}
                />
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {option.title}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  {option.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleContinue}
          disabled={continueButtonDisabled}
          onMouseEnter={() => setIsHoveringButton(true)}
          onMouseLeave={() => setIsHoveringButton(false)}
          className="btn-primary"
          style={{
            opacity: continueButtonDisabled ? 0.5 : 1,
            cursor: continueButtonDisabled ? 'not-allowed' : 'pointer',
            backgroundColor: continueButtonDisabled ? 'var(--border-default)' : 'var(--primary-blue)',
            color: continueButtonDisabled ? 'var(--text-muted)' : 'white',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 32px',
            fontSize: '16px'
          }}
        >
          Continue
          {!continueButtonDisabled && isHoveringButton && (
            <ArrowRight size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
