/**
 * Utility helper functions for PlacementMentor
 */

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15, 2025")
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  })
}

/**
 * Format timestamp to "Member since" format
 * @param {string|number} timestamp - Timestamp or date string
 * @returns {string} Formatted date (e.g., "January 2025")
 */
export const formatMemberSince = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('default', { month: 'long' }) + ' ' + date.getFullYear()
}

/**
 * Get time-based greeting
 * @returns {string} Greeting based on current time
 */
export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Get color CSS variable based on score
 * @param {number} score - Score value
 * @param {number} max - Maximum score value (default 10)
 * @returns {string} CSS variable for color
 */
export const getScoreColor = (score, max = 10) => {
  const pct = (score / max) * 100
  if (pct >= 70) return 'var(--success)'
  if (pct >= 50) return 'var(--warning)'
  return 'var(--error)'
}

/**
 * Calculate interview score from ratings object
 * @param {Object} ratings - Rating object with numeric values
 * @returns {number} Average score out of 10
 */
export const calcInterviewScore = (ratings) => {
  if (!ratings) return 0
  const vals = Object.values(ratings)
  if (vals.length === 0) return 0
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

/**
 * Calculate placement readiness score
 * @param {number} atsScore - ATS score (0-100)
 * @param {number} interviewScore - Interview score (0-10)
 * @returns {number} Combined readiness score (0-100)
 */
export const calcPlacementReadiness = (atsScore, interviewScore) => {
  const normATS = atsScore || 0
  const normInterview = (interviewScore / 10) * 100
  return Math.round((normATS + normInterview) / 2)
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} mins`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`
  return `${hours} hr${hours > 1 ? 's' : ''} ${mins} mins`
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
