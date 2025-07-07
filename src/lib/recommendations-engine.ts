import { DomainScore } from './score-calculator';

export interface DomainRecommendation {
  domainId: number;
  domainName: string;
  priority: 'easiest_win' | 'biggest_opportunity' | 'maintain_strength' | 'continue_growth';
  priorityLabel: string;
  rationale: string;
  practiceRecommendations: string[];
  courseRecommendations: CourseRecommendation[];
  isPlaceholder: boolean; // Flag to indicate this is placeholder data
}

export interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  provider: string;
  url?: string;
  relevanceScore: number;
  isPlaceholder: boolean; // Flag to indicate this is placeholder data
}

export interface RecommendationsResult {
  easiestWin: DomainRecommendation | null;
  biggestOpportunity: DomainRecommendation | null;
  allRecommendations: DomainRecommendation[];
  overallGuidance: string;
  isPlaceholder: boolean; // Flag to indicate this is placeholder data
}

/**
 * Generate placeholder recommendations structure based on domain scores
 * All content is placeholder until dynamic recommendations are implemented
 */
export function generateRecommendations(domainScores: DomainScore[]): RecommendationsResult {
  const recommendations: DomainRecommendation[] = [];
  
  // Sort domains by percentage for analysis
  const sortedDomains = [...domainScores].sort((a, b) => a.percentage - b.percentage);
  
  // Identify easiest win (highest score that's not yet excellent)
  const easiestWin = findEasiestWin(domainScores);
  
  // Identify biggest opportunity (lowest score)
  const biggestOpportunity = sortedDomains[0];
  
  // Generate placeholder recommendations for each domain
  domainScores.forEach(domain => {
    const recommendation = generatePlaceholderDomainRecommendation(domain, domainScores);
    recommendations.push(recommendation);
  });
  
  // Generate placeholder overall guidance
  const overallGuidance = generatePlaceholderGuidance(domainScores);
  
  return {
    easiestWin: easiestWin ? generatePlaceholderDomainRecommendation(easiestWin, domainScores) : null,
    biggestOpportunity: generatePlaceholderDomainRecommendation(biggestOpportunity, domainScores),
    allRecommendations: recommendations,
    overallGuidance,
    isPlaceholder: true
  };
}

/**
 * Find the easiest win domain (good score but room for improvement)
 */
function findEasiestWin(domainScores: DomainScore[]): DomainScore | null {
  // Look for domains between 60-85% (good but not excellent)
  const candidates = domainScores.filter(d => d.percentage >= 60 && d.percentage < 85);
  
  if (candidates.length === 0) {
    // If no candidates in ideal range, pick highest score under 90%
    const alternatives = domainScores.filter(d => d.percentage < 90);
    return alternatives.length > 0 
      ? alternatives.reduce((max, current) => current.percentage > max.percentage ? current : max)
      : null;
  }
  
  // Return the highest scoring candidate
  return candidates.reduce((max, current) => current.percentage > max.percentage ? current : max);
}

/**
 * Generate placeholder recommendation for a specific domain
 */
function generatePlaceholderDomainRecommendation(domain: DomainScore, allDomains: DomainScore[]): DomainRecommendation {
  const priority = determinePriority(domain, allDomains);
  
  return {
    domainId: domain.domainId,
    domainName: domain.domainName,
    priority,
    priorityLabel: getPriorityLabel(priority),
    rationale: `Personalized guidance for ${domain.domainName} will be generated based on your ${domain.percentage.toFixed(0)}% proficiency level and individual learning preferences.`,
    practiceRecommendations: [
      'Personalized practice recommendations will be available soon',
      'AI-generated coaching practices based on your assessment results',
      'Customized development activities for your skill level'
    ],
    courseRecommendations: generatePlaceholderCourses(),
    isPlaceholder: true
  };
}

/**
 * Determine priority level for a domain
 */
function determinePriority(domain: DomainScore, allDomains: DomainScore[]): DomainRecommendation['priority'] {
  const sortedDomains = [...allDomains].sort((a, b) => a.percentage - b.percentage);
  const isLowest = domain.domainId === sortedDomains[0].domainId;
  const easiestWin = findEasiestWin(allDomains);
  const isEasiestWin = easiestWin && domain.domainId === easiestWin.domainId;
  
  if (domain.percentage >= 85) return 'maintain_strength';
  if (isLowest && domain.percentage < 50) return 'biggest_opportunity';
  if (isEasiestWin) return 'easiest_win';
  return 'continue_growth';
}

/**
 * Get human-readable priority label
 */
function getPriorityLabel(priority: DomainRecommendation['priority']): string {
  switch (priority) {
    case 'easiest_win': return 'Easiest Win';
    case 'biggest_opportunity': return 'Biggest Opportunity';
    case 'maintain_strength': return 'Maintain Strength';
    case 'continue_growth': return 'Continue Growth';
  }
}

/**
 * Generate placeholder course recommendations
 */
function generatePlaceholderCourses(): CourseRecommendation[] {
  return [
    {
      id: 'placeholder-1',
      title: 'Course recommendations will be personalized for you',
      description: 'Relevant learning opportunities will be suggested based on your assessment results and skill gaps.',
      duration: 'TBD',
      difficulty: 'Beginner',
      provider: 'Coming Soon',
      relevanceScore: 0,
      isPlaceholder: true
    },
    {
      id: 'placeholder-2', 
      title: 'AI-powered course matching coming soon',
      description: 'Advanced algorithms will match you with the most effective courses for your development goals.',
      duration: 'TBD',
      difficulty: 'Intermediate',
      provider: 'Coming Soon',
      relevanceScore: 0,
      isPlaceholder: true
    }
  ];
}

/**
 * Generate placeholder overall guidance message
 */
function generatePlaceholderGuidance(domainScores: DomainScore[]): string {
  const averageScore = domainScores.reduce((sum, d) => sum + d.percentage, 0) / domainScores.length;
  
  return `Your personalized development roadmap will be generated based on your assessment results. With an average score of ${averageScore.toFixed(0)}%, AI-powered guidance will provide targeted recommendations to accelerate your coaching effectiveness. This feature is coming soon and will include customized action plans, timeline recommendations, and progress tracking.`;
}