'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import QuestionCard from './question-card';
import AssessmentNavigation from './assessment-navigation';
import CompletionCelebration from './completion-celebration';
import AssessmentWelcomeModal from './assessment-welcome-modal';
import DomainIntroModal from './domain-intro-modal';

import { Domain, Assessment, AssessmentResponse, Question } from '@/types/assessment';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session.access_token !== accessToken) {
        response = await makeRequest(session.access_token);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

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
  
  // Get assessment ID from URL parameters if provided
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const resumeAssessmentId = urlParams?.get('id');
  
  const [state, setState] = useState<AssessmentState>({
    assessment: null,
    questions: [],
    responses: {},
    currentIndex: 0,
    loading: true,
    error: null,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [celebratingDomains, setCelebratingDomains] = useState<Set<number>>(new Set());
  const [alreadyCelebratedDomains, setAlreadyCelebratedDomains] = useState<Set<number>>(new Set());
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  
  // Modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDomainIntroModal, setShowDomainIntroModal] = useState(false);
  const [currentDomainIntro, setCurrentDomainIntro] = useState<number | null>(null);
  const [seenDomainIntros, setSeenDomainIntros] = useState<Set<number>>(new Set());
  const [skipAllDomainIntros, setSkipAllDomainIntros] = useState(false);
  
  // Prevent multiple simultaneous initialization calls
  const initializingRef = useRef(false);

  const initialize = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (initializingRef.current) {
      console.log('Initialize already in progress, skipping...');
      return;
    }
    
    initializingRef.current = true;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const accessToken = session?.access_token;
      
      // Load questions with domain information, sorted by domain_id then question_order
      const questionsData = await httpRequest('/questions?select=id,question_text,question_order,domain_id,domains(*)&order=domain_id.asc,question_order.asc', {}, accessToken) as unknown[];
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
          if (resumeAssessmentId) {
            // Load specific assessment by ID
            console.log('Resuming assessment:', resumeAssessmentId);
            const specificAssessmentData = await httpRequest(`/assessments?id=eq.${resumeAssessmentId}&user_id=eq.${user.id}&status=eq.in_progress&select=*`, {}, accessToken) as unknown[];
            
            if (specificAssessmentData.length > 0) {
              assessment = specificAssessmentData[0] as Assessment;
              console.log('Found specific assessment to resume:', assessment.id);
            } else {
              console.log('Specific assessment not found or not in progress, falling back to latest');
              // Fall back to latest in-progress assessment
              const existingData = await httpRequest(`/assessments?user_id=eq.${user.id}&status=eq.in_progress&select=*&order=updated_at.desc`, {}, accessToken) as unknown[];
              if (existingData.length > 0) {
                assessment = existingData[0] as Assessment;
              }
            }
          } else {
            // Look for any in-progress assessment
            const existingData = await httpRequest(`/assessments?user_id=eq.${user.id}&status=eq.in_progress&select=*&order=updated_at.desc`, {}, accessToken) as unknown[];
            
            if (existingData.length > 0) {
              assessment = existingData[0] as Assessment;
            }
          }
          
          // Create new assessment if none found
          if (!assessment) {
            console.log('Creating new assessment');
            
            // Check if this is the user's first assessment (for welcome modal)
            const completedAssessments = await httpRequest(`/assessments?user_id=eq.${user.id}&status=eq.completed&select=id`, {}, accessToken) as unknown[];
            const isFirstAssessment = completedAssessments.length === 0;
            
            if (isFirstAssessment) {
              setShowWelcomeModal(true);
            }
            try {
              assessment = await httpRequest('/assessments', {
                method: 'POST',
                body: JSON.stringify({
                  user_id: user.id,
                  assessment_type: 'full',
                  status: 'in_progress',
                  current_question_index: 0
                })
              }, accessToken) as Assessment;
            } catch (createError) {
              // If creation fails (possibly due to race condition), try to find an assessment that was just created
              console.log('Assessment creation failed, checking for recently created assessment:', createError);
              const recentlyCreated = await httpRequest(`/assessments?user_id=eq.${user.id}&status=eq.in_progress&select=*&order=created_at.desc&limit=1`, {}, accessToken) as unknown[];
              if (recentlyCreated.length > 0) {
                assessment = recentlyCreated[0] as Assessment;
                console.log('Found recently created assessment:', assessment.id);
              } else {
                throw createError; // Re-throw if we still can't find an assessment
              }
            }
          }
        } catch (error) {
          console.error('Assessment creation failed:', error);
        }

        if (assessment && assessment.id) {
          // Load existing responses for this assessment
          const existingResponses = await httpRequest(`/assessment_responses?assessment_id=eq.${assessment.id}&select=question_id,response_value,domain_id`, {}, accessToken) as AssessmentResponse[];
          
          responses = existingResponses.reduce((acc: Record<string, number>, response: AssessmentResponse) => {
            acc[response.question_id.toString()] = response.response_value;
            return acc;
          }, {});
          
          // Use the saved current_question_index from the database
          currentIndex = Math.max(0, assessment.current_question_index || 0);
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
    } finally {
      // Reset the flag regardless of success or failure
      initializingRef.current = false;
    }
  }, [user?.id, session?.access_token, resumeAssessmentId]);

  const retryLastSave = async () => {
    if (saveStatus !== 'error') return;
    
    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion) return;
    
    const currentValue = state.responses[currentQuestion.id];
    if (currentValue === undefined) return;
    
    await handleAnswerSelect(currentValue);
  };

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
    if (state.loading || isAdvancing || saveStatus === 'saving') return;
    
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

    setSaveStatus('saving');
    setSaveError(null);

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
        
        // Only show saved and advance if save was successful
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Failed to save response:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to save response');
      return; // Don't advance if save failed
    }

    checkDomainCompletion(currentQuestion.id, updatedResponses);
    
    // Only advance if save was successful
    setIsAdvancing(true);

    if (state.currentIndex < state.questions.length - 1) {
      setTimeout(async () => {
        const newIndex = state.currentIndex + 1;
        const nextQuestion = state.questions[newIndex];
        const currentDomainId = currentQuestion.domain_id;
        const nextDomainId = nextQuestion?.domain_id;
        
        setState(prev => ({ ...prev, currentIndex: newIndex }));
        
        // Check if we're transitioning to a new domain
        if (nextQuestion && nextDomainId !== currentDomainId && !seenDomainIntros.has(nextDomainId) && !skipAllDomainIntros) {
          setCurrentDomainIntro(nextDomainId);
          setShowDomainIntroModal(true);
          setSeenDomainIntros(prev => new Set([...prev, nextDomainId]));
        }
        
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
        
        setSaveStatus('idle');
        setIsAdvancing(false);
      }, 800);
    } else {
      // Final question - complete assessment then show trophy celebration
      setTimeout(async () => {
        setSaveStatus('idle');
        setIsAdvancing(false);
        
        // Complete the assessment before showing celebration
        await completeAssessment();
        
        setShowCompletionCelebration(true);
      }, 800);
    }
  };

  const completeAssessment = async () => {
    try {
      if (state.assessment) {
        // Calculate final scores
        const { calculateScoreResults } = await import('@/lib/score-calculator');
        const scoreResults = calculateScoreResults(state.responses, state.questions, domains);
        
        // Update assessment with completion status and scores
        await httpRequest(`/assessments?id=eq.${state.assessment.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'completed',
            completed_at: new Date().toISOString(),
            total_score: scoreResults.totalScore,
            percentage_score: scoreResults.percentage,
            score_category: scoreResults.category
          })
        }, session?.access_token);
        
        // Update user progress using database function for accurate scoring
        await httpRequest(`/rpc/update_user_progress`, {
          method: 'POST',
          body: JSON.stringify({
            user_uuid: state.assessment.user_id,
            assessment_uuid: state.assessment.id
          })
        }, session?.access_token);
        
        // Get the correct total score from user_progress after RPC call
        const progressData = await httpRequest(
          `/user_progress?user_id=eq.${state.assessment.user_id}&select=latest_score`,
          {},
          session?.access_token
        ) as Array<{ latest_score: number }>;
        
        const correctTotalScore = progressData.reduce((sum, domain) => sum + domain.latest_score, 0);
        const correctPercentage = (correctTotalScore / 275) * 100;
        
        // Update assessment with correct scores from database calculation
        await httpRequest(`/assessments?id=eq.${state.assessment.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            total_score: correctTotalScore,
            percentage_score: Math.round(correctPercentage * 10) / 10
          })
        }, session?.access_token);
        
        console.log('Assessment completed successfully:', {
          frontendCalculation: scoreResults.totalScore,
          databaseCalculation: correctTotalScore,
          correctedPercentage: correctPercentage,
          category: scoreResults.category
        });
      }
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    }
  };

  const handleComplete = () => {
    // Assessment is already completed, just navigate to results
    window.location.href = '/results';
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          saveStatus={saveStatus}
          saveError={saveError}
          onRetry={retryLastSave}
          isComplete={isOnFinalQuestion && finalQuestionAnswered}
        />

        {isOnFinalQuestion && finalQuestionAnswered && !isAdvancing && saveStatus !== 'saving' && (
          <AssessmentNavigation
            onComplete={handleComplete}
            justSaved={saveStatus === 'saved'}
            domainColor={currentQuestion?.domains?.color_hex || '#6B7280'}
          />
        )}

        <CompletionCelebration
          isComplete={showCompletionCelebration}
          onComplete={() => setShowCompletionCelebration(false)}
        />

        {/* Welcome Modal for First-Time Users */}
        <AssessmentWelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          onStart={() => setShowWelcomeModal(false)}
        />

        {/* Domain Introduction Modal */}
        <DomainIntroModal
          isOpen={showDomainIntroModal}
          onClose={() => setShowDomainIntroModal(false)}
          onContinue={() => setShowDomainIntroModal(false)}
          onSkipAll={() => {
            setSkipAllDomainIntros(true);
            setShowDomainIntroModal(false);
          }}
          domainId={currentDomainIntro || 1}
        />
      </div>
    </div>
  );
}