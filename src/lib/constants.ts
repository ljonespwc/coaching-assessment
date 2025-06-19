import { AssessmentDomain } from '@/types';

// Assessment configuration
export const ASSESSMENT_CONFIG = {
  TOTAL_QUESTIONS: 55,
  SCORE_RANGE: { MIN: 1, MAX: 5 },
  DOMAINS: [
    'personal_development',
    'professional_development', 
    'client_centeredness',
    'change_facilitation',
    'systems_thinking',
    'scientific_literacy'
  ] as const,
} as const;

// Domain display names
export const DOMAIN_LABELS: Record<AssessmentDomain, string> = {
  personal_development: 'Personal Development',
  professional_development: 'Professional Development',
  client_centeredness: 'Client-Centeredness',
  change_facilitation: 'Change Facilitation',
  systems_thinking: 'Systems Thinking',
  scientific_literacy: 'Scientific Literacy',
};

// Domain descriptions
export const DOMAIN_DESCRIPTIONS: Record<AssessmentDomain, string> = {
  personal_development: 'Self-awareness, emotional intelligence, and personal growth as a coach',
  professional_development: 'Continuous learning, skill building, and professional competency',
  client_centeredness: 'Putting client needs first and creating supportive relationships',
  change_facilitation: 'Helping clients navigate behavior change and overcome obstacles',
  systems_thinking: 'Understanding complex relationships and environmental factors',
  scientific_literacy: 'Evidence-based practice and critical evaluation of information',
};

// Local storage keys
export const STORAGE_KEYS = {
  ASSESSMENT_PROGRESS: 'coaching_assessment_progress',
  ASSESSMENT_RESULTS: 'coaching_assessment_results',
} as const;
