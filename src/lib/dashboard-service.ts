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
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface DashboardAssessment {
  id: string;
  assessment_type: string;
  status: string;
  total_score: number | null;
  percentage_score: number | null;
  score_category: string | null;
  started_at: string;
  completed_at: string | null;
  current_question_index: number | null;
}

export interface DashboardProgress {
  id: string;
  domain_id: number;
  domain_name: string;
  domain_color: string;
  domain_emoji: string;
  latest_score: number;
  previous_score: number | null;
  improvement_points: number | null;
  improvement_percentage: number | null;
  best_score: number;
  assessment_count: number;
  first_assessment_date: string;
  last_assessment_date: string;
}

export interface DashboardRecommendation {
  id: string;
  course_id: number;
  course_name: string;
  course_type: string;
  course_description: string;
  recommendation_type: string;
  priority_score: number;
  reason: string;
  target_domains: number[];
  created_at: string;
}

export interface DashboardAchievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  unlocked_at: string;
  related_assessment_id: string | null;
}

export interface DashboardData {
  assessments: DashboardAssessment[];
  progress: DashboardProgress[];
  recommendations: DashboardRecommendation[];
  achievements: DashboardAchievement[];
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number | null;
  latestScore: number | null;
}

/**
 * Fetch comprehensive dashboard data for a user
 */
export async function fetchDashboardData(userId: string, accessToken?: string): Promise<DashboardData> {
  try {
    // Fetch assessments
    const assessmentsData = await httpRequest(
      `/assessments?user_id=eq.${userId}&select=*&order=created_at.desc`,
      {},
      accessToken
    ) as DashboardAssessment[];

    // Fetch user progress with domain details
    const progressData = await httpRequest(
      `/user_progress?user_id=eq.${userId}&select=*,domains(name,color_hex,icon_emoji)&order=domain_id.asc`,
      {},
      accessToken
    ) as Array<{
      id: string;
      domain_id: number;
      latest_score: number;
      previous_score: number | null;
      improvement_points: number | null;
      improvement_percentage: number | null;
      best_score: number;
      assessment_count: number;
      first_assessment_date: string;
      last_assessment_date: string;
      domains: {
        name: string;
        color_hex: string;
        icon_emoji: string;
      } | null;
    }>;

    const progress: DashboardProgress[] = progressData.map(p => ({
      id: p.id,
      domain_id: p.domain_id,
      domain_name: p.domains?.name || 'Unknown Domain',
      domain_color: p.domains?.color_hex || '#6B7280',
      domain_emoji: p.domains?.icon_emoji || '📊',
      latest_score: p.latest_score,
      previous_score: p.previous_score,
      improvement_points: p.improvement_points,
      improvement_percentage: p.improvement_percentage,
      best_score: p.best_score,
      assessment_count: p.assessment_count,
      first_assessment_date: p.first_assessment_date,
      last_assessment_date: p.last_assessment_date
    }));

    // Fetch course recommendations with course details
    const recommendationsData = await httpRequest(
      `/course_recommendations?user_id=eq.${userId}&select=*,courses(name,type,description)&order=priority_score.desc`,
      {},
      accessToken
    ) as Array<{
      id: string;
      course_id: number;
      recommendation_type: string;
      priority_score: number;
      reason: string;
      target_domains: number[];
      created_at: string;
      courses: {
        name: string;
        type: string;
        description: string;
      } | null;
    }>;

    const recommendations: DashboardRecommendation[] = recommendationsData.map(r => ({
      id: r.id,
      course_id: r.course_id,
      course_name: r.courses?.name || 'Unknown Course',
      course_type: r.courses?.type || 'course',
      course_description: r.courses?.description || '',
      recommendation_type: r.recommendation_type,
      priority_score: r.priority_score,
      reason: r.reason,
      target_domains: r.target_domains || [],
      created_at: r.created_at
    }));

    // Fetch achievements
    const achievementsData = await httpRequest(
      `/user_achievements?user_id=eq.${userId}&select=*&order=unlocked_at.desc`,
      {},
      accessToken
    ) as DashboardAchievement[];

    // Calculate summary statistics
    const completedAssessments = assessmentsData.filter(a => a.status === 'completed');
    const totalAssessments = assessmentsData.length;
    const averageScore = completedAssessments.length > 0 
      ? completedAssessments.reduce((sum, a) => sum + (a.percentage_score || 0), 0) / completedAssessments.length
      : null;
    const latestScore = completedAssessments.length > 0 
      ? completedAssessments[0]?.percentage_score || null
      : null;

    return {
      assessments: assessmentsData,
      progress,
      recommendations,
      achievements: achievementsData,
      totalAssessments,
      completedAssessments: completedAssessments.length,
      averageScore,
      latestScore
    };

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw new Error('Failed to load dashboard data');
  }
}

/**
 * Fetch assessment history for a user
 */
export async function fetchAssessmentHistory(userId: string, accessToken?: string): Promise<DashboardAssessment[]> {
  try {
    const data = await httpRequest(
      `/assessments?user_id=eq.${userId}&select=*&order=created_at.desc`,
      {},
      accessToken
    ) as DashboardAssessment[];

    return data;
  } catch (error) {
    console.error('Failed to fetch assessment history:', error);
    throw new Error('Failed to load assessment history');
  }
}

/**
 * Delete an assessment and all related data
 * This will clean up:
 * - assessment_responses (CASCADE delete - automatic)
 * - user_progress records that reference this assessment
 * - course_recommendations for this assessment
 * - user_achievements related to this assessment
 * - the assessment record itself
 */
export async function deleteAssessment(assessmentId: string, userId: string, accessToken?: string): Promise<void> {
  try {
    console.log('Deleting assessment:', assessmentId, 'for user:', userId);
    
    // First verify the assessment belongs to the user
    const assessmentData = await httpRequest(
      `/assessments?id=eq.${assessmentId}&user_id=eq.${userId}&select=id`,
      {},
      accessToken
    ) as unknown[];
    
    if (!assessmentData || assessmentData.length === 0) {
      throw new Error('Assessment not found or access denied');
    }
    
    // Delete related data in the correct order
    // Note: assessment_responses will be deleted automatically due to CASCADE
    
    // 1. Delete course recommendations for this assessment
    await httpRequest(
      `/course_recommendations?assessment_id=eq.${assessmentId}`,
      { method: 'DELETE' },
      accessToken
    );
    console.log('Deleted course recommendations for assessment:', assessmentId);
    
    // 2. Delete user achievements related to this assessment
    await httpRequest(
      `/user_achievements?related_assessment_id=eq.${assessmentId}`,
      { method: 'DELETE' },
      accessToken
    );
    console.log('Deleted user achievements for assessment:', assessmentId);
    
    // 3. Update user_progress records that reference this assessment
    // Set latest_assessment_id to NULL where it matches this assessment
    try {
      await httpRequest(
        `/user_progress?latest_assessment_id=eq.${assessmentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ latest_assessment_id: null })
        },
        accessToken
      );
      console.log('Updated latest_assessment_id references for assessment:', assessmentId);
    } catch (error) {
      console.error('Failed to update latest_assessment_id references:', error);
      throw new Error('Failed to update user progress (latest assessment references)');
    }
    
    // Set previous_assessment_id to NULL where it matches this assessment
    try {
      await httpRequest(
        `/user_progress?previous_assessment_id=eq.${assessmentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ previous_assessment_id: null })
        },
        accessToken
      );
      console.log('Updated previous_assessment_id references for assessment:', assessmentId);
    } catch (error) {
      console.error('Failed to update previous_assessment_id references:', error);
      throw new Error('Failed to update user progress (previous assessment references)');
    }
    
    // 4. Finally, delete the assessment itself
    // This will also trigger CASCADE delete of assessment_responses
    await httpRequest(
      `/assessments?id=eq.${assessmentId}`,
      { method: 'DELETE' },
      accessToken
    );
    console.log('Deleted assessment:', assessmentId);
    
  } catch (error) {
    console.error('Failed to delete assessment:', error);
    throw new Error('Failed to delete assessment. Please try again.');
  }
}
