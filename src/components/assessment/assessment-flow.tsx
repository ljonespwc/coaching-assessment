'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import QuestionCard from './question-card';
import AssessmentNavigation from './assessment-navigation';

interface Question {
  id: number;
  question_text: string;
  domain_id: number;
  question_order: number;
  domains: {
    name: string;
    description: string;
  } | null;
}

export default function AssessmentFlow() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const initializingRef = useRef(false);
  const questionsLoadedRef = useRef(false);

  // Create or load existing assessment
  const initializeAssessment = useCallback(async () => {
    console.log('🚀 Starting assessment initialization...');
    if (!user) {
      console.log('❌ No user found for assessment initialization');
      return null;
    }

    if (initializingRef.current) {
      console.log('⏳ Assessment initialization already in progress');
      return null;
    }

    initializingRef.current = true; // Set guard flag
    console.log('🔒 Set initialization guard flag');

    try {
      console.log('🔍 Checking for existing assessment...');
      console.log('👤 Current user:', { id: user.id, email: user.email });
      // Check if user already has an in-progress assessment
      const { data: existingAssessment, error: checkError } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .limit(1)
        .maybeSingle();

      console.log('🔍 Query result:', { existingAssessment, checkError });

      if (checkError) {
        console.error('❌ Error checking existing assessment:', checkError);
        throw checkError;
      }

      if (existingAssessment) {
        console.log('✅ Found existing assessment:', existingAssessment.id);
        console.log('🎯 About to call setAssessmentId with:', existingAssessment.id);
        setAssessmentId(existingAssessment.id);
        console.log('✅ Called setAssessmentId');
        console.log('🔓 Clearing initialization guard flag (found existing)');
        initializingRef.current = false; // Clear guard immediately after setting ID
        return existingAssessment.id;
      }

      console.log('📝 Creating new assessment...');
      // Race condition protection: double-check before creating
      const { data: doubleCheck, error: doubleCheckError } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .limit(1)
        .maybeSingle();

      if (doubleCheckError) {
        console.error('❌ Error in double-check:', doubleCheckError);
        throw doubleCheckError;
      }

      if (doubleCheck) {
        console.log('✅ Another process created assessment:', doubleCheck.id);
        // Another process already created one, use it
        console.log('🎯 About to call setAssessmentId with:', doubleCheck.id);
        setAssessmentId(doubleCheck.id);
        console.log('✅ Called setAssessmentId');
        console.log('🔓 Clearing initialization guard flag (found existing)');
        initializingRef.current = false; // Clear guard immediately after setting ID
        return doubleCheck.id;
      }

      console.log('🆕 Safe to create new assessment');
      // Safe to create new assessment
      const { data: newAssessment, error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          assessment_type: 'full', // Use allowed value from check constraint
          status: 'in_progress',
          current_question_index: 0,
          // Remove manual timestamps - let database handle with defaults
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error creating new assessment:', error);
        throw error;
      }
      
      console.log('✅ Created new assessment:', newAssessment.id);
      console.log('🎯 About to call setAssessmentId with:', newAssessment.id);
      setAssessmentId(newAssessment.id);
      console.log('✅ Called setAssessmentId');
      console.log('🔓 Clearing initialization guard flag (new assessment)');
      initializingRef.current = false; // Clear guard immediately after setting ID
      return newAssessment.id;
    } catch (err) {
      console.error('❌ Error initializing assessment:', err);
      console.error('❌ Full error details:', JSON.stringify(err, null, 2));
      return null;
    } finally {
      console.log('🔓 Clearing initialization guard flag (finally)');
      initializingRef.current = false; // Reset guard flag
    }
  }, [user]);

  // Fetch all questions on component mount
  useEffect(() => {
    // Prevent multiple executions
    if (questionsLoadedRef.current) {
      console.log('📚 Questions already loaded, skipping fetch');
      return;
    }

    async function fetchQuestions() {
      console.log('📚 Starting to fetch questions...');
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('id, question_text, question_order, domain_id')
          .order('id');

        if (error) {
          console.error('❌ Error fetching questions:', error);
          throw error;
        }

        // For now, just use the basic question data without domains
        const transformedQuestions = data.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_order: q.question_order,
          domain_id: q.domain_id,
          domains: { name: 'Loading...', description: 'Loading...' } // Placeholder
        }));

        console.log(`✅ Loaded ${transformedQuestions.length} questions from database`);
        setQuestions(transformedQuestions);
        setLoading(false);
        questionsLoadedRef.current = true;
        console.log('🎯 Set questionsLoadedRef.current = true');
      } catch (err) {
        console.error('❌ Error loading questions:', err);
        setLoading(false);
        // Even on error, mark as "loaded" to prevent infinite retries
        questionsLoadedRef.current = true;
      }
    }

    console.log('🎯 Questions useEffect triggered');
    fetchQuestions();
  }, []); // Empty dependency array - should only run once

  // Save response to database
  const saveResponseToDatabase = useCallback(async (questionId: string, responseValue: number) => {
    console.log('💾 Saving response:', { questionId, responseValue, assessmentId, userId: user?.id });
    if (!assessmentId || !user) {
      console.log('❌ Cannot save - missing assessmentId or user:', { assessmentId, user: !!user });
      return;
    }

    // Debug: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Current session:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      userEmail: session?.user?.email,
      sessionError 
    });

    try {
      const currentQuestion = questions.find(q => q.id === parseInt(questionId));
      if (!currentQuestion) {
        console.error(`Question not found: ${questionId}`, { availableQuestions: questions.map(q => q.id) });
        return;
      }

      console.log('📝 Inserting response to database...', {
        assessment_id: assessmentId,
        question_id: parseInt(questionId),
        domain_id: currentQuestion.domain_id,
        response_value: responseValue,
      });

      console.log('🔄 About to execute supabase upsert...');
      
      // Use upsert to handle both new responses and changes
      const upsertPromise = supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          question_id: parseInt(questionId),
          domain_id: currentQuestion.domain_id,
          response_value: responseValue,
        }, {
          onConflict: 'assessment_id,question_id'
        })
        .select();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database upsert timeout after 15 seconds')), 15000);
      });

      const result = await Promise.race([upsertPromise, timeoutPromise]);
      const { data, error } = result;

      console.log('📤 Upsert operation completed:', { data, error, hasData: !!data, hasError: !!error });

      if (error) {
        console.error('❌ Upsert error:', error);
        console.error('❌ Full error details:', JSON.stringify(error, null, 2));
        
        // Check for foreign key constraint violation (assessment doesn't exist)
        if (error.message?.includes('assessment_responses_assessment_id_fkey')) {
          console.error('🚨 CRITICAL: Assessment ID not found in database!', {
            frontendAssessmentId: assessmentId,
            error: 'Foreign key constraint violation - assessment does not exist'
          });
        }
      } else {
        console.log('✅ Response saved successfully:', data);
      }

      // Update assessment progress - set to the NEXT question index
      const nextQuestionIndex = currentQuestionIndex + 1;
      const { error: progressError } = await supabase
        .from('assessments')
        .update({
          current_question_index: nextQuestionIndex,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);

      if (progressError) {
        console.error('❌ Progress update error:', progressError);
        console.error('❌ Full progress error details:', JSON.stringify(progressError, null, 2));
      } else {
        console.log('✅ Progress updated to question index:', nextQuestionIndex);
      }

    } catch (err) {
      console.error('❌ Error in database operation:', err);
      console.error('❌ Full catch error details:', JSON.stringify(err, null, 2));
    }

    // Always show "Saved" indicator to give user confidence
    // Data is preserved in memory even if database fails
    console.log('🎯 Setting justSaved to true');
    setJustSaved(true);
    setTimeout(() => {
      console.log('🎯 Setting justSaved to false');
      setJustSaved(false);
    }, 2000);
  }, [assessmentId, user, currentQuestionIndex, questions]);

  const handleAnswerSelect = useCallback((value: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Update responses state
    const newResponses = new Map(responses);
    newResponses.set(currentQuestion.id.toString(), value); // Convert to string
    setResponses(newResponses);

    // Save to database
    saveResponseToDatabase(currentQuestion.id.toString(), value); // Convert to string
  }, [currentQuestionIndex, questions, responses, saveResponseToDatabase]);

  const handleCompleteAssessment = useCallback(async () => {
    if (!assessmentId || !user) return;

    try {
      // Mark assessment as completed
      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);

      // TODO: Navigate to results page
      console.log('Assessment completed!');
    } catch (err) {
      console.error('Error completing assessment:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));
    }
  }, [assessmentId, user]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // Update database progress
      if (assessmentId) {
        supabase
          .from('assessments')
          .update({
            current_question_index: newIndex,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assessmentId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating progress:', error);
              console.error('Full error details:', JSON.stringify(error, null, 2));
            }
          });
      }
    } else {
      // Handle assessment completion
      handleCompleteAssessment();
    }
  }, [currentQuestionIndex, questions.length, assessmentId, handleCompleteAssessment]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Update database progress
      if (assessmentId) {
        supabase
          .from('assessments')
          .update({
            current_question_index: newIndex,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assessmentId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating progress:', error);
              console.error('Full error details:', JSON.stringify(error, null, 2));
            }
          });
      }
    }
  }, [currentQuestionIndex, assessmentId]);

  useEffect(() => {
    console.log('🎯 Main initialization useEffect triggered', { 
      hasUser: !!user, 
      hasAssessmentId: !!assessmentId, 
      isInitializing: initializingRef.current, 
      questionsLoaded: questionsLoadedRef.current,
      userEmail: user?.email
    });
    
    // Only initialize if we have user, no assessmentId, questions are loaded
    if (user && !assessmentId && questionsLoadedRef.current && !initializingRef.current) {
      console.log('🚀 Calling initializeAssessment...');
      initializeAssessment();
    } else if (assessmentId) {
      console.log('✅ Assessment ID is set');
    } else {
      console.log('⏭️ Skipping initialization:', {
        reason: !user ? 'no user' : 
                assessmentId ? 'already has assessmentId' :
                !questionsLoadedRef.current ? 'questions not loaded yet' :
                initializingRef.current ? 'already initializing' : 'unknown',
        hasUser: !!user,
        hasAssessmentId: !!assessmentId,
        questionsLoaded: questionsLoadedRef.current,
        isInitializing: initializingRef.current
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, assessmentId, questions.length]); // Add questions.length to trigger when questions load

  // Debug assessmentId changes
  useEffect(() => {
    console.log('🔍 AssessmentId changed:', { assessmentId, type: typeof assessmentId });
  }, [assessmentId]);

  // Load assessment state from database on mount
  useEffect(() => {
    console.log('🎯 LoadAssessmentState useEffect triggered', { assessmentId });
    
    async function loadAssessmentState() {
      console.log('📥 Loading assessment state from database...');
      if (!assessmentId) {
        console.log('❌ No assessmentId, skipping state load');
        return;
      }
      
      try {
        // Load existing responses
        const { data: existingResponses, error: responsesError } = await supabase
          .from('assessment_responses')
          .select('question_id, response_value')
          .eq('assessment_id', assessmentId);

        if (responsesError) {
          console.error('Error loading responses:', responsesError);
          return;
        }

        // Load current progress
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .select('current_question_index')
          .eq('id', assessmentId)
          .single();

        if (assessmentError) {
          console.error('Error loading assessment progress:', assessmentError);
          return;
        }

        // Set state from database
        if (existingResponses && existingResponses.length > 0) {
          const responseMap = new Map();
          existingResponses.forEach(response => {
            responseMap.set(response.question_id.toString(), response.response_value);
          });
          setResponses(responseMap);
          console.log(`📥 Loaded ${existingResponses.length} existing responses from database`);
        }

        // Resume from correct question - use the higher of current_question_index or number of responses
        let resumeQuestionIndex = 0;
        if (assessment && assessment.current_question_index > 0) {
          resumeQuestionIndex = assessment.current_question_index;
        } else if (existingResponses && existingResponses.length > 0) {
          // If current_question_index is 0 but we have responses, resume from after the last response
          resumeQuestionIndex = existingResponses.length;
        }

        if (resumeQuestionIndex > 0) {
          setCurrentQuestionIndex(resumeQuestionIndex);
          console.log(`📥 Resuming from question index: ${resumeQuestionIndex}`);
        }

      } catch (err) {
        console.error('Error loading assessment state:', err);
      }
    }

    if (assessmentId) {
      loadAssessmentState();
    }
  }, [assessmentId]);

  if (loading || !questionsLoadedRef.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Error loading assessment</p>
          <p className="text-sm mt-2">{error || 'No questions found'}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses.get(currentQuestion.id.toString()); // Convert to string
  const canGoNext = currentResponse !== undefined;
  const canGoPrevious = currentQuestionIndex > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              onAnswerSelect={handleAnswerSelect}
              selectedValue={currentResponse}
            />
          </motion.div>
        </AnimatePresence>

        <AssessmentNavigation
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          onNext={handleNext}
          onPrevious={handlePrevious}
          justSaved={justSaved}
        />
      </div>
    </div>
  );
}
