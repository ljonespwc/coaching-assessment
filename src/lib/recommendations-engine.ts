import { DomainScore } from './score-calculator';

export interface DomainRecommendation {
  domainId: number;
  domainName: string;
  priority: 'easiest_win' | 'biggest_opportunity' | 'maintain_strength' | 'continue_growth';
  priorityLabel: string;
  rationale: string;
  practiceRecommendations: string[];
  courseRecommendations: CourseRecommendation[];
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
}

export interface RecommendationsResult {
  easiestWin: DomainRecommendation | null;
  biggestOpportunity: DomainRecommendation | null;
  allRecommendations: DomainRecommendation[];
  overallGuidance: string;
}

/**
 * Generate comprehensive recommendations based on domain scores
 */
export function generateRecommendations(domainScores: DomainScore[]): RecommendationsResult {
  const recommendations: DomainRecommendation[] = [];
  
  // Sort domains by percentage for analysis
  const sortedDomains = [...domainScores].sort((a, b) => a.percentage - b.percentage);
  
  // Identify easiest win (highest score that's not yet excellent)
  const easiestWin = findEasiestWin(domainScores);
  
  // Identify biggest opportunity (lowest score)
  const biggestOpportunity = sortedDomains[0];
  
  // Generate recommendations for each domain
  domainScores.forEach(domain => {
    const recommendation = generateDomainRecommendation(domain, domainScores);
    recommendations.push(recommendation);
  });
  
  // Generate overall guidance
  const overallGuidance = generateOverallGuidance(domainScores, easiestWin, biggestOpportunity);
  
  return {
    easiestWin: easiestWin ? generateDomainRecommendation(easiestWin, domainScores) : null,
    biggestOpportunity: generateDomainRecommendation(biggestOpportunity, domainScores),
    allRecommendations: recommendations,
    overallGuidance
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
 * Generate detailed recommendation for a specific domain
 */
function generateDomainRecommendation(domain: DomainScore, allDomains: DomainScore[]): DomainRecommendation {
  const priority = determinePriority(domain, allDomains);
  const rationale = generateRationale(domain, priority);
  const practiceRecommendations = generatePracticeRecommendations(domain);
  const courseRecommendations = generateCourseRecommendations(domain);
  
  return {
    domainId: domain.domainId,
    domainName: domain.domainName,
    priority,
    priorityLabel: getPriorityLabel(priority),
    rationale,
    practiceRecommendations,
    courseRecommendations
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
 * Generate rationale for domain recommendation
 */
function generateRationale(domain: DomainScore, priority: DomainRecommendation['priority']): string {
  const percentage = domain.percentage.toFixed(0);
  
  switch (priority) {
    case 'easiest_win':
      return `With ${percentage}% proficiency, you're already performing well in ${domain.domainName}. A focused effort here could quickly elevate you to excellence with relatively modest investment.`;
    
    case 'biggest_opportunity':
      return `At ${percentage}% proficiency, ${domain.domainName} represents your greatest opportunity for improvement. Developing this area will have the most significant impact on your overall coaching effectiveness.`;
    
    case 'maintain_strength':
      return `Excellent work! At ${percentage}% proficiency, ${domain.domainName} is one of your strongest areas. Focus on maintaining this level while applying these skills to support growth in other domains.`;
    
    case 'continue_growth':
      return `With ${percentage}% proficiency in ${domain.domainName}, you have a solid foundation. Continue building on this strength with targeted practice and learning opportunities.`;
  }
}

/**
 * Generate practice recommendations for a domain
 */
function generatePracticeRecommendations(domain: DomainScore): string[] {
  const domainSlug = domain.domainName.toLowerCase().replace(/\s+/g, '_');
  
  const practiceMap: Record<string, string[]> = {
    'personal_development': [
      'Set aside 15 minutes daily for self-reflection and journaling about your coaching experiences',
      'Seek feedback from colleagues or mentors on your coaching approach and areas for growth',
      'Practice mindfulness techniques to enhance self-awareness during coaching sessions'
    ],
    'professional_development': [
      'Join a professional coaching association or community of practice',
      'Attend coaching workshops, webinars, or conferences to stay current with best practices',
      'Pursue additional coaching certifications or specialized training in your areas of interest'
    ],
    'client_centeredness': [
      'Practice active listening techniques by summarizing and reflecting back what clients share',
      'Develop a pre-session routine to center yourself and focus entirely on your client',
      'Create personalized approaches for each client based on their unique needs and preferences'
    ],
    'change_facilitation': [
      'Study change management frameworks and practice applying them in coaching contexts',
      'Role-play challenging change scenarios with colleagues or in supervision',
      'Develop a toolkit of change-focused questions and interventions to use with clients'
    ],
    'systems_thinking': [
      'Practice mapping client challenges within their broader organizational and personal systems',
      'Ask questions that explore interconnections and ripple effects of potential changes',
      'Study systems theory and complexity science as they apply to organizational development'
    ],
    'scientific_literacy': [
      'Stay current with coaching research by reading peer-reviewed journals and evidence-based studies',
      'Practice integrating research findings into your coaching approach and client conversations',
      'Develop skills in evaluating the quality and relevance of coaching research and methodologies'
    ]
  };
  
  return practiceMap[domainSlug] || [
    'Identify specific skills within this domain that need development',
    'Practice these skills in low-stakes situations before applying them with clients',
    'Seek feedback and guidance from experienced coaches or mentors'
  ];
}

/**
 * Generate course recommendations for a domain
 */
function generateCourseRecommendations(domain: DomainScore): CourseRecommendation[] {
  const domainSlug = domain.domainName.toLowerCase().replace(/\s+/g, '_');
  
  const courseMap: Record<string, CourseRecommendation[]> = {
    'personal_development': [
      {
        id: 'pd-1',
        title: 'Mindful Coaching: Developing Presence and Awareness',
        description: 'Learn to cultivate mindfulness and presence as foundational coaching skills.',
        duration: '4 weeks',
        difficulty: 'Beginner',
        provider: 'Coaching Institute',
        relevanceScore: 0.95
      },
      {
        id: 'pd-2',
        title: 'The Reflective Coach: Self-Awareness in Practice',
        description: 'Develop advanced self-reflection skills for continuous professional growth.',
        duration: '6 weeks',
        difficulty: 'Intermediate',
        provider: 'Professional Development Academy',
        relevanceScore: 0.90
      }
    ],
    'professional_development': [
      {
        id: 'prof-1',
        title: 'Advanced Coaching Certification Program',
        description: 'Comprehensive program covering advanced coaching methodologies and ethics.',
        duration: '12 weeks',
        difficulty: 'Advanced',
        provider: 'International Coach Federation',
        relevanceScore: 0.95
      },
      {
        id: 'prof-2',
        title: 'Coaching Supervision and Mentoring Skills',
        description: 'Learn to provide effective supervision and mentoring to other coaches.',
        duration: '8 weeks',
        difficulty: 'Intermediate',
        provider: 'Coaching Excellence Institute',
        relevanceScore: 0.85
      }
    ],
    'client_centeredness': [
      {
        id: 'cc-1',
        title: 'Person-Centered Coaching Approaches',
        description: 'Master the art of truly client-centered coaching conversations.',
        duration: '6 weeks',
        difficulty: 'Intermediate',
        provider: 'Humanistic Coaching Institute',
        relevanceScore: 0.95
      },
      {
        id: 'cc-2',
        title: 'Cultural Competency in Coaching',
        description: 'Develop skills for coaching across diverse cultural contexts.',
        duration: '4 weeks',
        difficulty: 'Beginner',
        provider: 'Diversity & Inclusion Academy',
        relevanceScore: 0.80
      }
    ],
    'change_facilitation': [
      {
        id: 'cf-1',
        title: 'Change Management for Coaches',
        description: 'Apply proven change management frameworks in coaching practice.',
        duration: '8 weeks',
        difficulty: 'Intermediate',
        provider: 'Change Leadership Institute',
        relevanceScore: 0.95
      },
      {
        id: 'cf-2',
        title: 'Facilitating Organizational Transformation',
        description: 'Advanced skills for coaching leaders through major organizational changes.',
        duration: '10 weeks',
        difficulty: 'Advanced',
        provider: 'Executive Coaching Academy',
        relevanceScore: 0.90
      }
    ],
    'systems_thinking': [
      {
        id: 'st-1',
        title: 'Systems Thinking for Coaches',
        description: 'Learn to see and work with the systems that influence your clients.',
        duration: '6 weeks',
        difficulty: 'Intermediate',
        provider: 'Systems Coaching Institute',
        relevanceScore: 0.95
      },
      {
        id: 'st-2',
        title: 'Complexity and Emergence in Coaching',
        description: 'Advanced exploration of complexity science applications in coaching.',
        duration: '8 weeks',
        difficulty: 'Advanced',
        provider: 'Complexity Institute',
        relevanceScore: 0.85
      }
    ],
    'scientific_literacy': [
      {
        id: 'sl-1',
        title: 'Evidence-Based Coaching Practice',
        description: 'Learn to integrate research findings into your coaching approach.',
        duration: '6 weeks',
        difficulty: 'Intermediate',
        provider: 'Research-Based Coaching Institute',
        relevanceScore: 0.95
      },
      {
        id: 'sl-2',
        title: 'Coaching Research Methods and Evaluation',
        description: 'Develop skills in conducting and evaluating coaching research.',
        duration: '10 weeks',
        difficulty: 'Advanced',
        provider: 'Academic Coaching Consortium',
        relevanceScore: 0.80
      }
    ]
  };
  
  return courseMap[domainSlug] || [
    {
      id: 'general-1',
      title: 'Foundational Coaching Skills',
      description: 'Build core competencies in this essential coaching domain.',
      duration: '6 weeks',
      difficulty: 'Beginner',
      provider: 'General Coaching Institute',
      relevanceScore: 0.70
    }
  ];
}

/**
 * Generate overall guidance message
 */
function generateOverallGuidance(
  domainScores: DomainScore[], 
  easiestWin: DomainScore | null, 
  biggestOpportunity: DomainScore
): string {
  const averageScore = domainScores.reduce((sum, d) => sum + d.percentage, 0) / domainScores.length;
  
  if (averageScore >= 80) {
    return `Excellent work! You're performing at a high level across all coaching domains. Focus on maintaining your strengths while continuing to refine your expertise. Consider taking on mentoring or supervision roles to share your knowledge with developing coaches.`;
  }
  
  if (averageScore >= 65) {
    return `You have a solid foundation in coaching with particular strength in several areas. ${easiestWin ? `Focus on ${easiestWin.domainName} as your easiest win, then` : 'Next,'} address ${biggestOpportunity.domainName} for maximum impact on your overall effectiveness.`;
  }
  
  if (averageScore >= 50) {
    return `You're developing well as a coach with room for growth across multiple domains. Prioritize ${biggestOpportunity.domainName} for the greatest impact, while building confidence through smaller wins in your stronger areas.`;
  }
  
  return `You're in the early stages of your coaching development journey. Focus intensively on ${biggestOpportunity.domainName} while building foundational skills across all domains. Consider seeking additional training, supervision, or mentoring support.`;
}
