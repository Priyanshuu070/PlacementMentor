import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabaseClient';

export async function POST(request) {
  try {
    // 2. Get user session from Supabase auth to verify authentication
    const authHeader = request.headers.get('authorization');
    let isAuthenticated = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) isAuthenticated = true;
    } else {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 1. Accept POST request with FormData
    const formData = await request.formData();
    const resumeFile = formData.get('resume');
    const jdText = formData.get('jd_text');
    const userEmail = formData.get('user_email');
    const domainName = formData.get('domain_name');
    const sessionId = formData.get('session_id');

    // Basic validation
    if (!resumeFile || !jdText || !userEmail || !domainName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF is allowed.' },
        { status: 400 }
      );
    }

    // 3. Forward to Python service
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let pythonResponse;
    try {
      pythonResponse = await fetch(`${pythonServiceUrl}/analyse`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // 4. If Python service is unreachable or times out
      return NextResponse.json(
        { success: false, error: 'Analysis service unavailable' },
        { status: 503 }
      );
    }

    if (!pythonResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Analysis service returned an error' },
        { status: pythonResponse.status }
      );
    }

    const result = await pythonResponse.json();

    // 5a. Save to Supabase resume_analysis table
    let insertedRowId = sessionId || null;
    
    try {
      const { data: savedData, error: saveError } = await supabase
        .from('resume_analysis')
        .insert([{
          user_email: userEmail,
          interview_id: null,
          resume_raw_text: result.resume_raw_text,
          jd_raw_text: jdText,
          job_position: result.job_position,
          detected_skills_resume: result.detected_skills_resume,
          detected_skills_jd: result.detected_skills_jd,
          skill_gaps: result.skill_gaps,
          coverage_score: result.coverage_score,
          ats_score: result.ats_score,
          suggestions: result.suggestions
        }])
        .select()
        .single();

      if (saveError) {
        console.error('Supabase save error:', saveError);
        // Do not fail the request, proceed to return results
      } else if (savedData) {
        // 5b. Get the inserted row id
        insertedRowId = savedData.id; 
      }
    } catch (dbError) {
      console.error('Unexpected DB error:', dbError);
    }

    // 5c. Return full response to frontend
    return NextResponse.json({
      success: true,
      sessionId: insertedRowId,
      ...result
    });

  } catch (error) {
    console.error('Error in analyse-resume route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

