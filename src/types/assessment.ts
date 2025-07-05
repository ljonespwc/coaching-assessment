// Database-matching types
export interface Domain {
  id: number;
  name: string;
  description: string;
  color_hex: string;
  icon_emoji: string;
  display_order: number;
  slug?: string;
  max_score?: number;
  created_at?: string;
}

export interface Question {
  id: number;
  domain_id: number;
  question_text: string;
  question_order: number;
  is_active?: boolean;
  version?: number;
  created_at?: string;
  updated_at?: string;
  domains?: Domain | null | undefined;
}

export interface Assessment {
  id: string;
  user_id: string;
  assessment_type: string;
  status: 'in_progress' | 'completed';
  target_domain_id?: number;
  total_score?: number;
  percentage_score?: number;
  score_category?: string;
  started_at: string;
  completed_at?: string;
  context?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  current_question_index?: number;
}

export interface AssessmentResponse {
  id: string;
  assessment_id: string;
  question_id: number;
  domain_id: number;
  response_value: number;
  created_at: string;
  updated_at: string;
}

// Legacy assessment domain types (keeping for backward compatibility)
export type AssessmentDomain = 
  | 'personal_development'
  | 'professional_development'
  | 'client_centeredness'
  | 'change_facilitation'
  | 'systems_thinking'
  | 'scientific_literacy';

// Assessment question types
export interface AssessmentQuestion {
  id: string;
  domain: AssessmentDomain;
  statement: string;
  order: number;
}

// Legacy assessment response types (keeping for backward compatibility)
export interface LegacyAssessmentResponse {
  questionId: string;
  score: number; // 1-5 scale
}

// Assessment results types
export interface DomainScore {
  domain: AssessmentDomain;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AssessmentResult {
  id: string;
  userId?: string;
  totalScore: number;
  maxTotalScore: number;
  overallPercentage: number;
  domainScores: DomainScore[];
  responses: LegacyAssessmentResponse[];
  completedAt: string;
}

// Assessment progress types
export interface AssessmentProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  responses: LegacyAssessmentResponse[];
  isComplete: boolean;
}
