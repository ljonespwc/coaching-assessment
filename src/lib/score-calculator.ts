import { Question, Domain } from '@/types/assessment';

export interface DomainScore {
  domainId: number;
  domainName: string;
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
  emoji: string;
}

export interface ScoreResults {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  category: string;
  categoryMessage: string;
  domainScores: DomainScore[];
  easiestWin: DomainScore | null;
  biggestOpportunity: DomainScore | null;
}

export interface RecommendationPriority {
  type: 'easiest_win' | 'biggest_opportunity';
  domain: DomainScore;
  rationale: string;
}

/**
 * Calculate domain scores from assessment responses
 */
export function calculateDomainScores(
  responses: Record<string, number>,
  questions: Question[],
  domains: Domain[]
): DomainScore[] {
  const domainScores: DomainScore[] = [];

  for (const domain of domains) {
    // Get all questions for this domain
    const domainQuestions = questions.filter(q => q.domain_id === domain.id);
    
    // Calculate total score for this domain
    let domainScore = 0;
    
    for (const question of domainQuestions) {
      const response = responses[question.id];
      if (response !== undefined) {
        domainScore += response;
      }
    }

    // Calculate percentage (responses are 1-5, so max per question is 5)
    const maxPossibleForDomain = domainQuestions.length * 5;
    const percentage = maxPossibleForDomain > 0 ? (domainScore / maxPossibleForDomain) * 100 : 0;

    domainScores.push({
      domainId: domain.id,
      domainName: domain.name,
      score: domainScore,
      maxScore: maxPossibleForDomain,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
      color: domain.color_hex,
      emoji: domain.icon_emoji || '📊'
    });
  }

  return domainScores.sort((a, b) => a.domainId - b.domainId);
}

/**
 * Calculate total assessment score
 */
export function calculateTotalScore(domainScores: DomainScore[]): number {
  return domainScores.reduce((total, domain) => total + domain.score, 0);
}

/**
 * Get score category and message based on total score
 */
export function getScoreCategory(totalScore: number): { category: string; message: string } {
  if (totalScore >= 250) {
    return {
      category: 'World-class supercoach',
      message: 'Outstanding! You demonstrate exceptional coaching skills across all domains.'
    };
  } else if (totalScore >= 193) {
    return {
      category: 'Solid skill set',
      message: 'Great work! You have strong coaching fundamentals with room to excel further.'
    };
  } else if (totalScore >= 137) {
    return {
      category: 'Doing okay',
      message: 'Good foundation! Focus on key areas to strengthen your coaching impact.'
    };
  } else {
    return {
      category: 'Room for growth',
      message: 'Excellent starting point! Targeted development will significantly boost your skills.'
    };
  }
}

/**
 * Identify recommendation priorities based on domain scores
 */
export function identifyRecommendationPriorities(domainScores: DomainScore[]): {
  easiestWin: DomainScore | null;
  biggestOpportunity: DomainScore | null;
} {
  if (domainScores.length === 0) {
    return { easiestWin: null, biggestOpportunity: null };
  }

  // Easiest Win: Domain with highest percentage but still room for improvement (< 90%)
  const easiestWin = domainScores
    .filter(domain => domain.percentage < 90 && domain.percentage > 60)
    .sort((a, b) => b.percentage - a.percentage)[0] || null;

  // Biggest Opportunity: Domain with lowest percentage (most room for improvement)
  const biggestOpportunity = domainScores
    .sort((a, b) => a.percentage - b.percentage)[0] || null;

  return { easiestWin, biggestOpportunity };
}

/**
 * Calculate complete score results for an assessment
 */
export function calculateScoreResults(
  responses: Record<string, number>,
  questions: Question[],
  domains: Domain[]
): ScoreResults {
  const domainScores = calculateDomainScores(responses, questions, domains);
  const totalScore = calculateTotalScore(domainScores);
  const maxPossibleScore = domainScores.reduce((total, domain) => total + domain.maxScore, 0);
  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const { category, message } = getScoreCategory(totalScore);
  const { easiestWin, biggestOpportunity } = identifyRecommendationPriorities(domainScores);

  return {
    totalScore,
    maxPossibleScore,
    percentage: Math.round(percentage * 10) / 10,
    category,
    categoryMessage: message,
    domainScores,
    easiestWin,
    biggestOpportunity
  };
}

/**
 * Get strength level description based on percentage
 */
export function getStrengthLevel(percentage: number): {
  level: 'excellent' | 'good' | 'developing' | 'needs_focus';
  description: string;
  color: string;
} {
  if (percentage >= 85) {
    return {
      level: 'excellent',
      description: 'Excellent - You excel in this area',
      color: '#10B981' // green
    };
  } else if (percentage >= 70) {
    return {
      level: 'good',
      description: 'Good - Strong foundation with room to grow',
      color: '#F59E0B' // yellow
    };
  } else if (percentage >= 55) {
    return {
      level: 'developing',
      description: 'Developing - Building competency in this area',
      color: '#EF4444' // orange
    };
  } else {
    return {
      level: 'needs_focus',
      description: 'Needs Focus - Priority area for development',
      color: '#DC2626' // red
    };
  }
}
