// Assessment domain types
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

// Assessment response types
export interface AssessmentResponse {
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
  responses: AssessmentResponse[];
  completedAt: string;
}

// Assessment progress types
export interface AssessmentProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  responses: AssessmentResponse[];
  isComplete: boolean;
}
