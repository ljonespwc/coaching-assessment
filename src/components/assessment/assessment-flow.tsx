'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import QuestionCard from './question-card';
import AssessmentNavigation from './assessment-navigation';
import CompletionCelebration from './completion-celebration';

interface Question {
  id: number;
  question_text: string;
  domain_id: number;
  question_order: number;
  domains: {
    id: number;
    name: string;
    description: string;
    color_hex: string;
    icon_emoji: string;
    display_order: number;
  } | null;
}

interface AssessmentResponse {
  question_id: number;
  response_value: number;
}

interface AssessmentState {
  id: string | null;
  responses: Record<string, number>;
  currentIndex: number;
  isReady: boolean;
}

export default function AssessmentFlowV2() {
  const { user } = useAuth();
  
  // Test auto-deploy after making repo public and reconnecting
  // Simple state - no complex flags
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessment, setAssessment] = useState<AssessmentState>({
    id: null,
    responses: {},
    currentIndex: 0,
    isReady: false
  });
  const [loading, setLoading] = useState(true);

  // Auto-advance state
  const [showSaved, setShowSaved] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Guard to prevent multiple initializations
  const initializationRef = useRef(false);

  // Initialize on mount
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    async function initialize() {
      initializationRef.current = true;
      
      try {
        // Step 1: Load questions (this always works)
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            question_order,
            domain_id,
            domains (
              id,
              name,
              description,
              color_hex,
              icon_emoji,
              display_order
            )
          `)
          .order('id');

        if (questionsError) {
          console.error('❌ Error loading questions:', questionsError);
          throw questionsError;
        }

        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions found in database');
        }

        // Transform the data to match our Question interface
        const transformedQuestions: Question[] = questionsData.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_order: q.question_order,
          domain_id: q.domain_id,
          domains: Array.isArray(q.domains) ? q.domains[0] : q.domains
        }));
        
        setQuestions(transformedQuestions);

        // Step 2: Try to load/create assessment (can fail gracefully)
        let assessmentId = null;
        let existingResponses: AssessmentResponse[] = [];
        let startIndex = 0;

        const userId = user?.id;

        if (userId) {
          try {
            // Find existing assessment
            let existingAssessment = null;
            
            if (userId) {
              const { data } = await supabase
                .from('assessments')
                .select('id')
                .eq('user_id', userId)
                .eq('status', 'in_progress')
                .limit(1)
                .maybeSingle();
              existingAssessment = data;
            }

            if (existingAssessment) {
              assessmentId = existingAssessment.id;
              
              // Load existing responses with timeout protection
              try {
                const responsesResult = await Promise.race([
                  supabase
                    .from('assessment_responses')
                    .select('question_id, response_value')
                    .eq('assessment_id', assessmentId),
                  new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout loading responses')), 5000)
                  )
                ]);

                const responsesData: AssessmentResponse[] = responsesResult.data || [];
                if (responsesData && responsesData.length > 0) {
                  existingResponses = responsesData;
                  startIndex = responsesData.length; // Resume from next unanswered question
                }
              } catch (err) {
                console.error('⚠️ Failed to load existing responses, starting fresh:', err);
                // Continue with empty responses - user can still take assessment
              }
            } else {
              // Create new assessment with race condition protection
              try {
                const { data: newAssessment, error: insertError } = await supabase
                  .from('assessments')
                  .insert({
                    user_id: userId,
                    assessment_type: 'full',
                    status: 'in_progress',
                    current_question_index: 0
                  })
                  .select('id')
                  .single();

                if (insertError) {
                  // Check if it's a duplicate key error (another process created one)
                  if (insertError.code === '23505') {
                    const { data: existingAssessment } = await supabase
                      .from('assessments')
                      .select('id')
                      .eq('user_id', userId)
                      .eq('status', 'in_progress')
                      .limit(1)
                      .single();
                    
                    if (existingAssessment) {
                      assessmentId = existingAssessment.id;
                    }
                  } else {
                    throw insertError;
                  }
                } else if (newAssessment) {
                  assessmentId = newAssessment.id;
                }
              } catch (createError) {
                console.error('⚠️ Failed to create assessment:', createError);
                // Continue without database - user can still take assessment
              }
            }
          } catch (err) {
            console.error('⚠️ Assessment initialization failed, continuing without database:', err);
            // Continue without database - user can still take assessment
          }
        } else {
        }

        // Step 3: Set final state
        setQuestions(transformedQuestions);
        setAssessment({
          id: assessmentId,
          responses: existingResponses.reduce((acc: Record<string, number>, response: AssessmentResponse) => {
            acc[response.question_id.toString()] = response.response_value;
            return acc;
          }, {}),
          currentIndex: startIndex,
          isReady: true
        });

      } catch (err) {
        console.error('❌ Critical error during initialization:', err);
        // Reset guard so user can retry if needed
        initializationRef.current = false;
        // Even on error, show questions so user can still take assessment
        setAssessment(prev => ({ ...prev, isReady: true }));
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [user]);

  // Save response to database (only called on navigation)
  const saveResponse = async (questionId: string, responseValue: number) => {
    if (!assessment.id) {
      return;
    }

    try {
      const question = questions.find(q => q.id.toString() === questionId);
      if (!question) return;

      await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessment.id,
          question_id: parseInt(questionId),
          domain_id: question.domain_id,
          response_value: responseValue
        }, {
          onConflict: 'assessment_id,question_id'
        });

    } catch (err) {
      console.error('⚠️ Failed to save response:', err);
      // Continue anyway - don't block user
    }
  };

  // Update progress in database
  const updateProgress = async (newIndex: number) => {
    if (!assessment.id) return;

    try {
      await supabase
        .from('assessments')
        .update({
          current_question_index: newIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

    } catch (err) {
      console.error('⚠️ Failed to update progress:', err);
    }
  };

  // Handle answer selection (no saving - just update state)
  const handleAnswerSelect = async (value: number) => {
    const currentQuestion = questions[assessment.currentIndex];
    if (!currentQuestion || isAdvancing) return;

    // Update response in state
    const updatedResponses = {
      ...assessment.responses,
      [currentQuestion.id]: value
    };

    setAssessment(prev => ({
      ...prev,
      responses: updatedResponses
    }));

    // Show saved indicator and start auto-advance
    setIsAdvancing(true);
    setShowSaved(true);

    // Save response to database
    await saveResponse(currentQuestion.id.toString(), value);

    // Check for domain completion
    checkDomainCompletion(currentQuestion.id, updatedResponses);

    // Auto-advance after delay (except on final question)
    if (assessment.currentIndex < questions.length - 1) {
      setTimeout(async () => {
        const newIndex = assessment.currentIndex + 1;
        setAssessment(prev => ({ ...prev, currentIndex: newIndex }));
        await updateProgress(newIndex);
        setShowSaved(false);
        setIsAdvancing(false);
      }, 800);
    } else {
      // Final question - just clear the advancing state
      setTimeout(() => {
        setShowSaved(false);
        setIsAdvancing(false);
      }, 800);
    }
  };

  // Handle final assessment completion
  const handleComplete = async () => {
    setShowCompletionCelebration(true);
    
    if (!assessment.id) {
      return;
    }

    try {
      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', assessment.id);
    } catch (err) {
      console.error('⚠️ Failed to mark assessment complete:', err);
    }
  };

  // Get unique domains from questions
  const domains = useMemo(() => {
    const uniqueDomains = questions.reduce((acc, question) => {
      if (question.domains && !acc.find(d => d.id === question.domains!.id)) {
        acc.push(question.domains);
      }
      return acc;
    }, [] as Array<{
      id: number;
      name: string;
      description: string;
      color_hex: string;
      icon_emoji: string;
      display_order: number;
    }>);
    return uniqueDomains.sort((a, b) => a.display_order - b.display_order);
  }, [questions]);

  // Track domain completion for celebrations
  const [celebratingDomains, setCelebratingDomains] = useState<Set<number>>(new Set());
  const [alreadyCelebratedDomains, setAlreadyCelebratedDomains] = useState<Set<number>>(new Set());
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

  // Function to check and trigger domain completion celebrations
  const checkDomainCompletion = useCallback((questionId: number, updatedResponses: Record<string, number>) => {
    const newlyCompleted: number[] = [];
    
    // Find which domain this question belongs to
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    const currentDomain = domains.find(d => d.id === currentQuestion.domain_id);
    if (!currentDomain) return;
    
    // Check if this domain is now complete
    const domainQuestions = questions.filter(q => q.domain_id === currentDomain.id);
    const answeredCount = domainQuestions.filter(q => updatedResponses[q.id] !== undefined).length;
    
    // If this domain is now complete and we haven't celebrated it yet
    if (answeredCount === domainQuestions.length && 
        domainQuestions.length > 0 &&
        !alreadyCelebratedDomains.has(currentDomain.id)) {
      newlyCompleted.push(currentDomain.id);
    }

    if (newlyCompleted.length > 0) {
      
      // Mark these domains as celebrated
      setAlreadyCelebratedDomains(prev => new Set([...prev, ...newlyCompleted]));
      
      // Trigger celebrations
      setCelebratingDomains(prev => new Set([...prev, ...newlyCompleted]));
      
      // Clear celebrations after 2 seconds
      setTimeout(() => {
        setCelebratingDomains(prev => {
          const newSet = new Set(prev);
          newlyCompleted.forEach(id => newSet.delete(id));
          return newSet;
        });
      }, 2000);
    }
  }, [domains, questions, alreadyCelebratedDomains]);

  // Loading state
  if (loading || !assessment.isReady || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[assessment.currentIndex];
  const currentResponse = assessment.responses[currentQuestion.id];
  
  // Check if we're on the final question and it's been answered
  const isOnFinalQuestion = assessment.currentIndex === questions.length - 1;
  const finalQuestionAnswered = isOnFinalQuestion && currentResponse !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <QuestionCard
          question={currentQuestion}
          currentAnswer={currentResponse || null}
          onAnswerSelect={handleAnswerSelect}
          questionNumber={assessment.currentIndex + 1}
          totalQuestions={questions.length}
          questionIndex={assessment.currentIndex}
          domains={domains}
          allQuestions={questions}
          responses={assessment.responses}
          celebratingDomains={celebratingDomains}
          showSaved={showSaved}
          isComplete={isOnFinalQuestion && finalQuestionAnswered}
        />

        {/* Only show navigation on final question */}
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
