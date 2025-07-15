import { Assessment, AssessmentResponse, Domain, Question } from '@/types';
import { ScoreResults, calculateScoreResults } from './score-calculator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * HTTP request helper for Supabase REST API
 */
async function httpRequest(endpoint: string, options: RequestInit = {}, accessToken?: string): Promise<unknown> {
  const makeRequest = async (token?: string) => {
    return await fetch(`${supabaseUrl}/rest/v1${endpoint}`, {
      ...options,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token || supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers,
      },
    });
  };

  let response = await makeRequest(accessToken);

  // If auth failure, try to get fresh token and retry once
  if (!response.ok && (response.status === 401 || response.status === 403) && accessToken) {
    try {
      const { supabase } = await import('./supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session.access_token !== accessToken) {
        response = await makeRequest(session.access_token);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  return null;
}

export interface AssessmentResultsData {
  assessment: Assessment;
  responses: AssessmentResponse[];
  questions: Question[];
  domains: Domain[];
  scoreResults: ScoreResults;
}

/**
 * Fetch complete assessment results data
 */
export async function fetchAssessmentResults(
  assessmentId: string,
  accessToken?: string
): Promise<AssessmentResultsData> {
  try {
    console.log('Fetching assessment results for ID:', assessmentId);
    
    // Fetch assessment details
    const assessmentData = await httpRequest(
      `/assessments?id=eq.${assessmentId}&select=*`,
      {},
      accessToken
    ) as unknown[];

    if (!assessmentData || assessmentData.length === 0) {
      throw new Error('Assessment not found');
    }

    const assessment = assessmentData[0] as Assessment;
    console.log('Assessment loaded:', assessment.id, 'status:', assessment.status);

    // Fetch assessment responses
    const responsesData = await httpRequest(
      `/assessment_responses?assessment_id=eq.${assessmentId}&select=*`,
      {},
      accessToken
    ) as AssessmentResponse[];
    
    console.log('Responses loaded:', responsesData.length);
    
    if (responsesData.length === 0) {
      throw new Error('No responses found for this assessment');
    }

    // Fetch questions with domain information
    const questionsData = await httpRequest(
      '/questions?select=id,question_text,question_order,domain_id,domains(*)&order=domain_id.asc,question_order.asc',
      {},
      accessToken
    ) as unknown[];

    const questions: Question[] = questionsData.map((q: unknown) => {
      const question = q as Record<string, unknown>;
      return {
        id: question.id as number,
        question_text: question.question_text as string,
        question_order: question.question_order as number,
        domain_id: question.domain_id as number,
        domains: question.domains as Domain || null
      };
    });
    
    console.log('Questions loaded:', questions.length);

    // Fetch domain data
    const domainsData = await httpRequest(
      '/domains?select=*&order=display_order.asc',
      {},
      accessToken
    ) as Domain[];
    
    console.log('Domains loaded:', domainsData.length);

    // Convert responses to lookup format
    const responsesLookup: Record<string, number> = {};
    responsesData.forEach(response => {
      responsesLookup[response.question_id.toString()] = response.response_value;
    });

    // Calculate score results
    console.log('Calculating scores...');
    const scoreResults = calculateScoreResults(responsesLookup, questions, domainsData);
    console.log('Score calculation complete:', scoreResults.totalScore);

    return {
      assessment,
      responses: responsesData,
      questions,
      domains: domainsData,
      scoreResults
    };

  } catch (error) {
    console.error('Failed to fetch assessment results:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Assessment not found')) {
        throw new Error('Assessment not found');
      }
      if (error.message.includes('No responses found')) {
        throw new Error('Assessment has no responses - please complete the assessment first');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Request timed out while loading results');
      }
    }
    
    throw new Error('Failed to load assessment results. Please try again.');
  }
}

/**
 * Fetch assessment results for the current user's latest completed assessment
 */
export async function fetchLatestAssessmentResults(
  userId: string,
  accessToken?: string
): Promise<AssessmentResultsData | null> {
  try {
    console.log('Fetching latest assessment for user:', userId);
    console.log('Access token provided:', !!accessToken);
    
    // Find the latest completed assessment for the user
    const assessmentData = await httpRequest(
      `/assessments?user_id=eq.${userId}&status=eq.completed&select=*&order=completed_at.desc&limit=1`,
      {},
      accessToken
    ) as unknown[];

    console.log('Assessment query result:', assessmentData);

    if (!assessmentData || assessmentData.length === 0) {
      console.log('No completed assessments found');
      
      // Check if user has any assessments at all
      const anyAssessments = await httpRequest(
        `/assessments?user_id=eq.${userId}&select=id,status,created_at&order=created_at.desc&limit=1`,
        {},
        accessToken
      ) as unknown[];
      
      if (anyAssessments && anyAssessments.length > 0) {
        const assessment = anyAssessments[0] as { id: string; status: string; created_at: string };
        console.log('Found incomplete assessment:', assessment.id, 'status:', assessment.status);
        throw new Error(`Assessment found but not completed (status: ${assessment.status}). Please complete your assessment first.`);
      }
      
      return null;
    }

    const assessment = assessmentData[0] as Assessment;
    console.log('Found assessment:', assessment.id);
    
    // Validate assessment has required data
    if (!assessment.total_score) {
      console.warn('Assessment missing total_score, attempting to recalculate');
    }
    
    const result = await fetchAssessmentResults(assessment.id, accessToken);
    console.log('Assessment results loaded successfully');
    return result;

  } catch (error) {
    console.error('Failed to fetch latest assessment results:', error);
    throw error; // Re-throw to provide better error handling upstream
  }
}

/**
 * Fetch domain data for visualization
 */
export async function fetchDomainData(accessToken?: string): Promise<Domain[]> {
  try {
    const domainsData = await httpRequest(
      '/domains?select=*&order=display_order.asc',
      {},
      accessToken
    ) as Domain[];

    return domainsData;
  } catch (error) {
    console.error('Failed to fetch domain data:', error);
    throw new Error('Failed to load domain data');
  }
}

/**
 * Update assessment with calculated scores
 */
export async function updateAssessmentScores(
  assessmentId: string,
  scoreResults: ScoreResults,
  accessToken?: string
): Promise<void> {
  try {
    await httpRequest(
      `/assessments?id=eq.${assessmentId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          total_score: scoreResults.totalScore,
          percentage_score: scoreResults.percentage,
          score_category: scoreResults.category,
          updated_at: new Date().toISOString()
        })
      },
      accessToken
    );
  } catch (error) {
    console.error('Failed to update assessment scores:', error);
    // Don't throw here - this is not critical for user experience
  }
}

/**
 * Check if user has any completed assessments
 */
export async function hasCompletedAssessments(
  userId: string,
  accessToken?: string
): Promise<boolean> {
  try {
    const assessmentData = await httpRequest(
      `/assessments?user_id=eq.${userId}&status=eq.completed&select=id&limit=1`,
      {},
      accessToken
    ) as unknown[];

    return assessmentData && assessmentData.length > 0;
  } catch (error) {
    console.error('Failed to check completed assessments:', error);
    return false;
  }
}
