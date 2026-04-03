import { NextResponse } from "next/server";
import { API_CONFIG } from '@/lib/constants';

/**
 * Constructs the evaluation prompt for interview feedback
 */
function constructFeedbackPrompt() {
  return `You are an AI Interview Evaluator.

Analyze the following interview conversation between the candidate and the interviewer (provided as {{conversation}}). Evaluate the candidate's performance across technical and soft skills.

Return your evaluation in this exact JSON format:
{
  "feedback": {
    "rating": {
      "technicalSkills": X,
      "communication": Y,
      "problemSolving": Z,
      "experience": W
    },
    "summary": "Realistic 3-line overview of the candidate's performance. Mention specific strengths, weaknesses, technical depth, and the tone (e.g. confident, unsure, generic, articulate).",
    "recommendation": "Hire" or "Reject",
    "recommendationMsg": "A sharp, one-line explanation for your decision, based on actual performance."
  }
}

Scoring Guidance:
0–3: Weak or no understanding
4–5: Basic, needs improvement
6–7: Average to good, but incomplete
8–9: Strong, confident grasp
10: Exceptional and in-depth

Critical Instructions:
If the candidate gives poor or vague answers, reflect it with low scores and a constructive summary.
Avoid default high ratings or fluff. Be brutally honest but fair.
Summarize in clear, interviewer-style language, as if giving post-interview notes to a hiring manager.

Only output a valid JSON object with the structure above. Do not include explanations or any extra text outside the JSON.`;
}

export async function POST(req) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    
    if (!body?.conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation data is required" },
        { status: 400 }
      );
    }

    const prompt = constructFeedbackPrompt();
    
    // Convert conversation to string if it's an object
    const conversationString = typeof body.conversation === 'object' 
      ? JSON.stringify(body.conversation) 
      : body.conversation;
    
    const finalPrompt = prompt.replace("{{conversation}}", conversationString);
    
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
            content: finalPrompt
          }
        ],
        temperature: API_CONFIG.OPENROUTER.TEMPERATURE,
        max_tokens: API_CONFIG.OPENROUTER.MAX_TOKENS
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: `API Error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    let cleanedContent = data.choices[0].message.content;
    
    // Clean the response content - remove markdown code blocks
    cleanedContent = cleanedContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .replace(/```/g, "")
      .trim();
    
    try {
      const parsedJson = JSON.parse(cleanedContent);
      
      // Validate the response structure
      if (!parsedJson.feedback || !parsedJson.feedback.rating) {
        return NextResponse.json(
          { success: false, error: "Invalid feedback structure from AI" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        ...parsedJson
      });
    } catch (parseError) {
      // Try to extract JSON from the response if direct parse fails
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            ...extracted
          });
        } catch {
          // Fall through to error response
        }
      }
      
      return NextResponse.json(
        { success: false, error: "Invalid AI response format" },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
