
import { NextResponse } from "next/server";
import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

function constructInterviewPrompt() {
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
    "summary": "Realistic 3-line overview of the candidate’s performance. Mention specific strengths, weaknesses, technical depth, and the tone (e.g. confident, unsure, generic, articulate).",
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
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const body = await req.json(); // Parse the request body
    if (!body?.conversation) {
      return NextResponse.json({ error: "Conversation data is required" }, { status: 400 });
    }

    const prompt = constructInterviewPrompt();
    
    const conversationString = typeof body.conversation === 'object' 
      ? JSON.stringify(body.conversation) 
      : body.conversation;  
    const finalprompt = prompt.replace("{{conversation}}", conversationString);
    // Final Prompt prepared
    
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
            content: finalprompt
          }
        ],
        temperature: API_CONFIG.OPENROUTER.TEMPERATURE,
        max_tokens: API_CONFIG.GEMINI.MAX_TOKENS
      })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    let cleanedContent = data.choices[0].message.content;
    
    // Clean the response content
    cleanedContent = cleanedContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .replace(/```/g, "");
    
    try {
      const parsedJson = JSON.parse(cleanedContent);
      return NextResponse.json(parsedJson);
    } catch (e) {
      // Failed to parse JSON response
      return NextResponse.json({ error: "Invalid AI response format", cleanedContent }, { status: 500 });
    }

  } catch (error) {
    // Error during AI feedback generation
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  
}
