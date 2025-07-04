'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import QuestionCard from './question-card';
import AssessmentNavigation from './assessment-navigation';
import CompletionCelebration from './completion-celebration';

type Question = {
  id: number;
  question_text: string;
  domain_id: number;
  question_order: number;
  domains: Domain | null;
};

type Domain = {
  id: number;
  name: string;
  description: string;
  color_hex: string;
  icon_emoji: string;
  display_order: number;
};

type Assessment = {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed';
  current_question_index: number;
};

type AssessmentResponse = {
  question_id: number;
  response_value: number;
  domain_id: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

  // Handle empty responses (204 No Content, etc.)
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || response.status === 204) {
    return null;
  }

  // Check if response has JSON content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  return null;
}

interface AssessmentState {
  assessment: Assessment | null;
  questions: Question[];
  responses: Record<string, number>;
  currentIndex: number;
  loading: boolean;
  error: string | null;
}

export default function AssessmentFlow() {
  const { user, session } = useAuth();
  
  const [state, setState] = useState<AssessmentState>({
    assessment: null,
    questions: [],
    responses: {},
    currentIndex: 0,
    loading: true,
    error: null,
  });

  const [showSaved, setShowSaved] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [celebratingDomains, setCelebratingDomains] = useState<Set<number>>(new Set());
  const [alreadyCelebratedDomains, setAlreadyCelebratedDomains] = useState<Set<number>>(new Set());
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const accessToken = session?.access_token;
      
      // Load questions with domain information
      const questionsData = await httpRequest('/questions?select=id,question_text,question_order,domain_id,domains(*)', {}, accessToken) as unknown[];
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
      
      let assessment: Assessment | null = null;
      let responses: Record<string, number> = {};
      let currentIndex = 0;

      if (user?.id) {
        // Find or create assessment for the current user
        try {
          const existingData = await httpRequest(`/assessments?user_id=eq.${user.id}&status=eq.in_progress`, {}, accessToken) as unknown[];
          
          if (existingData.length > 0) {
            assessment = existingData[0] as Assessment;
          } else {
            assessment = await httpRequest('/assessments', {
              method: 'POST',
              body: JSON.stringify({
                user_id: user.id,
                assessment_type: 'full',
                status: 'in_progress',
                current_question_index: 0
              })
            }, accessToken) as Assessment;
          }
        } catch (error) {
          console.error('Assessment creation failed:', error);
        }

        if (assessment) {
          // Load existing responses for this assessment
          const existingResponses = await httpRequest(`/assessment_responses?assessment_id=eq.${assessment.id}&select=question_id,response_value,domain_id`, {}, accessToken) as AssessmentResponse[];
          
          responses = existingResponses.reduce((acc: Record<string, number>, response: AssessmentResponse) => {
            acc[response.question_id.toString()] = response.response_value;
            return acc;
          }, {});
          
          currentIndex = Math.max(0, assessment.current_question_index || 0);
          
          if (existingResponses.length > 0) {
            currentIndex = Math.min(existingResponses.length, questions.length - 1);
          }
        }
      }

      setState({
        assessment,
        questions,
        responses,
        currentIndex,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Failed to initialize assessment:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load assessment',
      }));
    }
  }, [user?.id, session?.access_token]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const domains = useMemo(() => {
    const uniqueDomains = state.questions.reduce((acc, question) => {
      if (question.domains && !acc.find(d => d.id === question.domains!.id)) {
        acc.push(question.domains);
      }
      return acc;
    }, [] as Domain[]);
    return uniqueDomains.sort((a, b) => a.display_order - b.display_order);
  }, [state.questions]);

  const checkDomainCompletion = useCallback((questionId: number, updatedResponses: Record<string, number>) => {
    const currentQuestion = state.questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    const currentDomain = domains.find(d => d.id === currentQuestion.domain_id);
    if (!currentDomain) return;
    
    const domainQuestions = state.questions.filter(q => q.domain_id === currentDomain.id);
    const answeredCount = domainQuestions.filter(q => updatedResponses[q.id] !== undefined).length;
    
    if (answeredCount === domainQuestions.length && 
        domainQuestions.length > 0 &&
        !alreadyCelebratedDomains.has(currentDomain.id)) {
      
      setAlreadyCelebratedDomains(prev => new Set([...prev, currentDomain.id]));
      setCelebratingDomains(prev => new Set([...prev, currentDomain.id]));
      
      setTimeout(() => {
        setCelebratingDomains(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentDomain.id);
          return newSet;
        });
      }, 2000);
    }
  }, [state.questions, domains, alreadyCelebratedDomains]);

  const handleAnswerSelect = async (value: number) => {
    if (state.loading || isAdvancing) return;
    
    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion) return;

    const updatedResponses = {
      ...state.responses,
      [currentQuestion.id]: value
    };

    setState(prev => ({
      ...prev,
      responses: updatedResponses
    }));

    setIsAdvancing(true);
    setShowSaved(true);

    try {
      if (state.assessment) {
        await httpRequest('/assessment_responses', {
          method: 'POST',
          headers: {
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            assessment_id: state.assessment.id,
            question_id: currentQuestion.id,
            domain_id: currentQuestion.domain_id,
            response_value: value
          })
        }, session?.access_token);
      }
    } catch (error) {
      console.error('Failed to save response:', error);
    }

    checkDomainCompletion(currentQuestion.id, updatedResponses);

    if (state.currentIndex < state.questions.length - 1) {
      setTimeout(async () => {
        const newIndex = state.currentIndex + 1;
        setState(prev => ({ ...prev, currentIndex: newIndex }));
        
        try {
          if (state.assessment) {
            await httpRequest(`/assessments?id=eq.${state.assessment.id}`, {
              method: 'PATCH',
              body: JSON.stringify({
                current_question_index: newIndex,
                updated_at: new Date().toISOString()
              })
            }, session?.access_token);
          }
        } catch (error) {
          console.error('Failed to update progress:', error);
        }
        
        setShowSaved(false);
        setIsAdvancing(false);
      }, 800);
    } else {
      setTimeout(() => {
        setShowSaved(false);
        setIsAdvancing(false);
      }, 800);
    }
  };

  const handleComplete = async () => {
    setShowCompletionCelebration(true);
    
    try {
      if (state.assessment) {
        await httpRequest(`/assessments?id=eq.${state.assessment.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
        }, session?.access_token);
      }
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Error Loading Assessment</p>
          </div>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={initialize}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No questions available.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentIndex];
  const currentResponse = state.responses[currentQuestion.id];
  const isOnFinalQuestion = state.currentIndex === state.questions.length - 1;
  const finalQuestionAnswered = isOnFinalQuestion && currentResponse !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <QuestionCard
          question={currentQuestion}
          currentAnswer={currentResponse || null}
          onAnswerSelect={handleAnswerSelect}
          questionNumber={state.currentIndex + 1}
          totalQuestions={state.questions.length}
          questionIndex={state.currentIndex}
          domains={domains}
          allQuestions={state.questions}
          responses={state.responses}
          celebratingDomains={celebratingDomains}
          showSaved={showSaved}
          isComplete={isOnFinalQuestion && finalQuestionAnswered}
        />

        {isOnFinalQuestion && finalQuestionAnswered && !isAdvancing && (
          <AssessmentNavigation
            onComplete={handleComplete}
            justSaved={showSaved}
            domainColor={currentQuestion?.domains?.color_hex || '#6B7280'}
          />
        )}

        <CompletionCelebration
          isComplete={showCompletionCelebration}
          onComplete={() => setShowCompletionCelebration(false)}
        />
      </div>
    </div>
  );
}