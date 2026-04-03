import { NextResponse } from "next/server";
import { API_CONFIG } from '@/lib/constants';

export async function POST(req) {
  try {
    // Check for API key
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Parse the form data from the request
    const formData = await req.json();
    
    // Construct the prompt based on form data
    const prompt = constructInterviewPrompt(formData);
    
    // Retry logic for rate limiting
    let responseText;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        // Call OpenRouter REST API
        const response = await fetch(`${API_CONFIG.OPENROUTER.BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: API_CONFIG.OPENROUTER.DEFAULT_MODEL,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: API_CONFIG.OPENROUTER.TEMPERATURE,
            max_tokens: API_CONFIG.OPENROUTER.MAX_TOKENS
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        responseText = data.choices[0].message.content;
        break; // Success, exit retry loop
      } catch (error) {
        attempts++;
        if (error.status === 429 && attempts < maxAttempts) {
          // Rate limit hit, wait and retry with exponential backoff
          const waitTime = Math.pow(2, attempts) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error;
        }
      }
    }
    
    if (!responseText) {
      throw new Error("Failed to generate content after retries");
    }
    
    let questionsData;
    
    try {
      // Clean the raw text to ensure it is a valid JSON array
      const cleanText = responseText.replace(/^```json\s*/, "")
                                   .replace(/```$/, "")
                                   .trim();
      
      questionsData = JSON.parse(cleanText);
      
    } catch (initialError) {
      // If that fails, try to extract just the array part
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        throw initialError;
      }
    }
    
    // Validate the parsed questions to ensure they have the expected structure
    if (Array.isArray(questionsData)) {
      questionsData = questionsData.map(q => ({
        question: q.question || "Question text missing",
        tests: q.tests || "Evaluation criteria not provided",
        sampleAnswer: q.sampleAnswer || "Sample answer not provided",
        followUps: Array.isArray(q.followUps) ? q.followUps : []
      }));
    }
    
    // Return the generated questions
    return NextResponse.json({ 
      success: true, 
      questions: questionsData,
      metadata: {
        model: API_CONFIG.OPENROUTER.DEFAULT_MODEL,
        jobPosition: formData.jobPosition,
        difficultyLevel: formData.difficultyLevel
      }
    });
    
  } catch (error) {
    // Provide user-friendly error messages
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.status === 429) {
      errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      statusCode = 429;
    } else if (error.status === 404) {
      errorMessage = "AI model not found. Please contact support.";
      statusCode = 500;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage, 
        details: error.toString(),
        code: error.status 
      },
      { status: statusCode }
    );
  }
}

/**
 * Constructs a detailed prompt for the AI based on the interview form data
 */
function constructInterviewPrompt(formData) {
  const {
    jobPosition,
    jobDescription,
    experienceLevel,
    interviewDuration,
    difficultyLevel
  } = formData;
  
  // Convert experience level to human-readable format
  const experienceLevelText = {
    'entry': 'Entry Level (0-2 years)',
    'mid': 'Mid Level (2-5 years)',
    'senior': 'Senior Level (5-8 years)',
    'expert': 'Expert Level (8+ years)'
  }[experienceLevel] || experienceLevel;

  // Calculate approximate number of questions based on duration
  const durationString = interviewDuration || '30';
  const durationMatch = String(durationString).match(/(\d+)/);
  const durationInMinutes = durationMatch ? parseInt(durationMatch[1]) : 30;
  const suggestedQuestionCount = Math.max(5, Math.floor(durationInMinutes / 5));
  
  return `
You are an experienced AI Interview Engineer at a top-tier tech company.

Your task is to generate a curated list of ${suggestedQuestionCount} high-quality interview questions designed for the role of "${jobPosition}". These questions will be used in an AI-powered mock interview platform to assess and improve candidates' skills before actual interviews.

Use the details below to craft questions that are relevant, fair, and structured according to the role and interview strategy.

CANDIDATE PROFILE AND ROLE DETAILS:
- Job Position: ${jobPosition}
- Role Description: ${jobDescription}
- Candidate Experience Level: ${experienceLevelText}

INTERVIEW DESIGN PARAMETERS:
- Total Interview Duration: ${interviewDuration}
- Difficulty Level: ${difficultyLevel}

OBJECTIVE:
Generate a balanced set of interview questions that reflect real-world scenarios and expectations for the role. Your questions should help assess both core competencies and soft skills relevant to the position.

GUIDELINES:
1. Create a mix of question types appropriate for the role:
   - Technical: code-related, architecture, tools, or best practices.
   - Behavioral: mindset, communication, decision-making.
   - Experience-based: past roles, responsibilities, challenges.
   - Problem Solving: analytical and creative approaches.
   - Leadership: initiative, team handling, strategic thinking.

2. Tailor your questions to suit ${experienceLevelText} level candidates and match the overall ${(difficultyLevel || 'medium').toLowerCase()} difficulty.

3. Focus on testing skills and responsibilities relevant to the role based on the job description provided.

4. For each question, return an object with the following structure:
   {
     "question": "Write the question text here.",
     "tests": "Clearly explain what skill or knowledge this question evaluates.",
     "sampleAnswer": "Provide a sample answer or describe what a strong response should include.",
     "followUps": ["Optional follow-up question 1", "Optional follow-up 2"]
   }

OUTPUT FORMAT:
Return a JSON array of question objects. Do not include any extra commentary or explanations outside the array.
`;
}
