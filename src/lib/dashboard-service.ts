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
 * Database CASCADE constraints automatically handle:
 * - assessment_responses (CASCADE DELETE)
 * - user_achievements (CASCADE DELETE)
 * - user_progress foreign key references (SET NULL)
 * 
 * Special handling: If this is the user's only completed assessment,
 * we also delete all user_progress records.
 */
export async function deleteAssessment(assessmentId: string, userId: string, accessToken?: string): Promise<void> {
  try {
    console.log('Deleting assessment:', assessmentId, 'for user:', userId);
    
    // First verify the assessment belongs to the user and get its status
    const assessmentData = await httpRequest(
      `/assessments?id=eq.${assessmentId}&user_id=eq.${userId}&select=id,status`,
      {},
      accessToken
    ) as unknown[];
    
    if (!assessmentData || assessmentData.length === 0) {
      throw new Error('Assessment not found or access denied');
    }
    
    const assessment = assessmentData[0] as { id: string; status: string };
    const isCompletedAssessment = assessment.status === 'completed';
    
    // Check if this is the user's only completed assessment
    const remainingAssessments = await httpRequest(
      `/assessments?user_id=eq.${userId}&status=eq.completed&id=neq.${assessmentId}&select=id`,
      {},
      accessToken
    ) as unknown[];
    
    const hasOtherCompletedAssessments = remainingAssessments.length > 0;
    
    // If this is the user's only completed assessment, delete all progress records
    // Otherwise, database constraints will handle the foreign key updates automatically
    if (!hasOtherCompletedAssessments) {
      try {
        await httpRequest(
          `/user_progress?user_id=eq.${userId}`,
          { method: 'DELETE' },
          accessToken
        );
        console.log('Deleted all user progress data (was only completed assessment):', assessmentId);
      } catch (error) {
        console.error('Failed to delete user progress data:', error);
        throw new Error('Failed to delete user progress data');
      }
    } else if (isCompletedAssessment) {
      // If this is a completed assessment but not the only one, decrement the assessment count
      try {
        // First get the current assessment count
        const currentProgressData = await httpRequest(
          `/user_progress?user_id=eq.${userId}&select=assessment_count`,
          {},
          accessToken
        ) as Array<{ assessment_count: number }>;
        
        if (currentProgressData && currentProgressData.length > 0) {
          const currentCount = currentProgressData[0].assessment_count;
          const newCount = Math.max(0, currentCount - 1);
          
          await httpRequest(
            `/user_progress?user_id=eq.${userId}`,
            {
              method: 'PATCH',
              body: JSON.stringify({
                assessment_count: newCount
              })
            },
            accessToken
          );
          console.log(`Decremented assessment count for user ${userId}: ${currentCount} -> ${newCount}`);
        }
      } catch (error) {
        console.error('Failed to decrement assessment count:', error);
        // Don't throw here as the assessment deletion should still proceed
      }
    }
    
    // Delete the assessment itself
    // Database CASCADE constraints will now automatically handle:
    // - assessment_responses (CASCADE DELETE)
    // - user_achievements (CASCADE DELETE)
    // - user_progress latest_assessment_id/previous_assessment_id (SET NULL)
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
