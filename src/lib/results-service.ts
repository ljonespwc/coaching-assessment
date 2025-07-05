import { Assessment, AssessmentResponse, Domain, Question } from '@/types';
import { ScoreResults, calculateScoreResults } from './score-calculator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * HTTP request helper for Supabase REST API
 */
async function httpRequest(endpoint: string, options: RequestInit = {}, accessToken?: string): Promise<unknown> {
  const response = await fetch(`${supabaseUrl}/rest/v1${endpoint}`, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken || supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

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

    // Fetch assessment responses
    const responsesData = await httpRequest(
      `/assessment_responses?assessment_id=eq.${assessmentId}&select=*`,
      {},
      accessToken
    ) as AssessmentResponse[];

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

    // Fetch domain data
    const domainsData = await httpRequest(
      '/domains?select=*&order=display_order.asc',
      {},
      accessToken
    ) as Domain[];

    // Convert responses to lookup format
    const responsesLookup: Record<string, number> = {};
    responsesData.forEach(response => {
      responsesLookup[response.question_id.toString()] = response.response_value;
    });

    // Calculate score results
    const scoreResults = calculateScoreResults(responsesLookup, questions, domainsData);

    return {
      assessment,
      responses: responsesData,
      questions,
      domains: domainsData,
      scoreResults
    };

  } catch (error) {
    console.error('Failed to fetch assessment results:', error);
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
      return null;
    }

    const assessment = assessmentData[0] as Assessment;
    console.log('Found assessment:', assessment.id);
    const result = await fetchAssessmentResults(assessment.id, accessToken);
    console.log('Assessment results loaded successfully');
    return result;

  } catch (error) {
    console.error('Failed to fetch latest assessment results:', error);
    return null;
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
