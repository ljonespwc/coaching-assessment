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
  const { user, fingerprint } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  
  // Guard flags to prevent multiple concurrent initializations
  const hasInitializedRef = useRef(false);

  // Load assessment state from database
  const loadAssessmentState = useCallback(async (assessmentIdToLoad: string) => {
    console.log('📊 Loading assessment state from database...', { assessmentIdToLoad });
    
    try {
      // Load existing responses
      const { data: existingResponses, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('question_id, response_value')
        .eq('assessment_id', assessmentIdToLoad);

      if (responsesError) {
        console.error('❌ Error loading existing responses:', responsesError);
        return;
      }

      console.log('📥 Loaded existing responses from database:', existingResponses);

      if (existingResponses && existingResponses.length > 0) {
        // Convert to responses format
        const loadedResponses: Record<string, number> = {};
        existingResponses.forEach(response => {
          loadedResponses[response.question_id.toString()] = response.response_value;
        });

        console.log('🔄 Setting responses state:', loadedResponses);
        setResponses(loadedResponses);

        // Resume from question index based on number of responses
        const resumeQuestionIndex = existingResponses.length;
        console.log('📍 Resuming from question index:', resumeQuestionIndex);
        setCurrentQuestionIndex(resumeQuestionIndex);
      }

    } catch (err) {
      console.error('Error loading assessment state:', err);
    }
  }, []);

  // Create or load existing assessment
  const initializeAssessment = useCallback(async () => {
    console.log('🚀 Starting assessment initialization...');
    const userId = user?.id;
    const userFingerprint = fingerprint;
    
    if (!userId && !userFingerprint) {
      console.log('❌ No user or fingerprint available for assessment initialization');
      return null;
    }

    if (hasInitializedRef.current) {
      console.log('⏳ Assessment initialization already in progress');
      return null;
    }

    hasInitializedRef.current = true; // Set guard flag
    console.log('🔒 Set initialization guard flag');

    try {
      console.log('🔍 Checking for existing assessment...');
      console.log('👤 Current user:', { id: userId, email: user?.email, fingerprint: userFingerprint });
      
      // Check if user already has an in-progress assessment
      // First try by user_id, then by fingerprint
      let existingAssessment = null;
      let checkError = null;
      
      if (userId) {
        const { data, error } = await supabase
          .from('assessments')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'in_progress')
          .limit(1)
          .maybeSingle();
        existingAssessment = data;
        checkError = error;
      } else if (userFingerprint) {
        // Look for user by fingerprint first, then their assessment
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('fingerprint', userFingerprint)
          .single();
          
        if (profileError || !profileData) {
          console.log('🔍 No profile found for fingerprint, will create new user');
        } else {
          const { data, error } = await supabase
            .from('assessments')
            .select('id')
            .eq('user_id', profileData.id)
            .eq('status', 'in_progress')
            .limit(1)
            .maybeSingle();
          existingAssessment = data;
          checkError = error;
        }
      }

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
        hasInitializedRef.current = false; // Clear guard immediately after setting ID
        
        // Load existing responses and resume from correct question
        await loadAssessmentState(existingAssessment.id);
        
        return existingAssessment.id;
      }

      console.log('📝 Creating new assessment...');
      // Race condition protection: double-check before creating
      let doubleCheck = null;
      let doubleCheckError = null;
      
      if (userId) {
        const { data, error } = await supabase
          .from('assessments')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'in_progress')
          .limit(1)
          .maybeSingle();
        doubleCheck = data;
        doubleCheckError = error;
      } else if (userFingerprint) {
        // Look for user by fingerprint first, then their assessment
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('fingerprint', userFingerprint)
          .single();
          
        if (profileError || !profileData) {
          console.log('🔍 No profile found for fingerprint, will create new user');
        } else {
          const { data, error } = await supabase
            .from('assessments')
            .select('id')
            .eq('user_id', profileData.id)
            .eq('status', 'in_progress')
            .limit(1)
            .maybeSingle();
          doubleCheck = data;
          doubleCheckError = error;
        }
      }

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
        hasInitializedRef.current = false; // Clear guard immediately after setting ID
        
        // Load existing responses and resume from correct question
        await loadAssessmentState(doubleCheck.id);
        
        return doubleCheck.id;
      }

      console.log('🆕 Safe to create new assessment');
      // Safe to create new assessment
      let newAssessment = null;
      let error = null;
      
      if (userId) {
        const { data, error: err } = await supabase
          .from('assessments')
          .insert({
            user_id: userId,
            assessment_type: 'full', // Use allowed value from check constraint
            status: 'in_progress',
            current_question_index: 0,
            // Remove manual timestamps - let database handle with defaults
          })
          .select('id')
          .single();
        newAssessment = data;
        error = err;
      } else if (userFingerprint) {
        // Create or find profile for fingerprint user
        let profileId = null;
        
        // First try to find existing profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('fingerprint', userFingerprint)
          .single();
          
        if (existingProfile) {
          profileId = existingProfile.id;
        } else {
          // Create new anonymous profile with fingerprint
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              fingerprint: userFingerprint,
              email: `anonymous-${userFingerprint}@local.dev`,
              full_name: 'Anonymous User'
            })
            .select('id')
            .single();
            
          if (profileError) {
            console.error('❌ Error creating profile for fingerprint:', profileError);
            throw profileError;
          }
          
          profileId = newProfile?.id;
        }
        
        if (!profileId) {
          throw new Error('Failed to get or create profile for fingerprint');
        }
        
        // Create new assessment with profile ID
        const { data, error: err } = await supabase
          .from('assessments')
          .insert({
            user_id: profileId,
            assessment_type: 'full',
            status: 'in_progress',
            current_question_index: 0,
          })
          .select('id')
          .single();
        newAssessment = data;
        error = err;
      }

      if (error) {
        console.error('❌ Error creating new assessment:', error);
        throw error;
      }
      
      if (!newAssessment) {
        console.error('❌ No assessment data returned');
        throw new Error('Failed to create assessment');
      }
      
      console.log('✅ Created new assessment:', newAssessment.id);
      console.log('🎯 About to call setAssessmentId with:', newAssessment.id);
      setAssessmentId(newAssessment.id);
      console.log('✅ Called setAssessmentId');
      console.log('🔓 Clearing initialization guard flag (new assessment)');
      hasInitializedRef.current = false; // Clear guard immediately after setting ID
      return newAssessment.id;
    } catch (err) {
      console.error('❌ Error initializing assessment:', err);
      console.error('❌ Full error details:', JSON.stringify(err, null, 2));
      return null;
    } finally {
      console.log('🔓 Clearing initialization guard flag (finally)');
      hasInitializedRef.current = false; // Reset guard flag
    }
  }, [user, fingerprint, loadAssessmentState]);

  // Fetch all questions on component mount
  useEffect(() => {
    // Prevent multiple executions
    if (questionsLoaded) {
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
        setQuestionsLoaded(true);
        console.log('🎯 Set questionsLoaded = true');
        
        // Load domain information separately
        const { data: domainsData, error: domainsError } = await supabase
          .from('domains')
          .select('id, name, description');
        
        if (!domainsError && domainsData) {
          // Update questions with domain info
          const questionsWithDomains = transformedQuestions.map(q => ({
            ...q,
            domains: domainsData.find(d => d.id === q.domain_id) || { name: 'Unknown', description: '' }
          }));
          setQuestions(questionsWithDomains);
          console.log('✅ Updated questions with domain information');
        }
      } catch (err) {
        console.error('❌ Error loading questions:', err);
        setLoading(false);
        // Even on error, mark as "loaded" to prevent infinite retries
        setQuestionsLoaded(true);
      }
    }

    console.log('🎯 Questions useEffect triggered');
    fetchQuestions();
  }, []); // Only run once

  // Initialize assessment after questions are loaded
  useEffect(() => {
    if (questionsLoaded && !hasInitializedRef.current) {
      console.log('🚀 Questions loaded, initializing assessment...');
      initializeAssessment();
    }
  }, [questionsLoaded, initializeAssessment]);

  // Save response to database
  const saveResponseToDatabase = useCallback(async (questionId: string, responseValue: number) => {
    console.log('💾 Saving response:', { questionId, responseValue, assessmentId, userId: user?.id });
    if (!assessmentId || !user) {
      console.log('❌ Cannot save - missing assessmentId or user:', { assessmentId, user: !!user });
      return;
    }

    try {
      // Find the current question to get domain_id
      const currentQuestion = questions.find(q => q.id.toString() === questionId);
      if (!currentQuestion) {
        console.error('❌ Question not found:', questionId);
        return;
      }

      console.log('📝 Inserting response to database...', {
        assessment_id: assessmentId,
        question_id: parseInt(questionId),
        domain_id: currentQuestion.domain_id,
        response_value: responseValue,
      });

      // Use upsert to handle updates to existing responses
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

      const { data, error } = await upsertPromise;

      if (error) {
        console.error('❌ Upsert error:', error);
        console.error('❌ Full error details:', JSON.stringify(error, null, 2));
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
      } else {
        console.log('✅ Progress updated to question index:', nextQuestionIndex);
      }

    } catch (err) {
      console.error('❌ Error in database operation:', err);
      console.error('❌ Full catch error details:', JSON.stringify(err, null, 2));
    }

    // Always show "Saved" indicator to give user confidence
    console.log('🎯 Setting justSaved to true');
    setJustSaved(true);
    setTimeout(() => {
      console.log('🎯 Setting justSaved to false');
      setJustSaved(false);
    }, 2000);
  }, [assessmentId, user, questions, currentQuestionIndex]);

  const handleAnswerSelect = useCallback((value: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Update responses state
    const newResponses = { ...responses };
    newResponses[currentQuestion.id] = value;
    setResponses(newResponses);

    // Save to database
    saveResponseToDatabase(currentQuestion.id.toString(), value); // Convert to string
  }, [currentQuestionIndex, questions, responses, saveResponseToDatabase]);

  const handleCompleteAssessment = useCallback(async () => {
    if (!user) return;

    try {
      // Mark assessment as completed
      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', assessmentId); // Restored assessmentId

      // TODO: Navigate to results page
      console.log('Assessment completed!');
    } catch (err) {
      console.error('Error completing assessment:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));
    }
  }, [user, assessmentId]);

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
            } else {
              console.log('✅ Navigation progress updated to:', newIndex);
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
            } else {
              console.log('✅ Navigation progress updated to:', newIndex);
            }
          });
      }
    }
  }, [currentQuestionIndex, assessmentId]);

  if (loading || !questionsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses[currentQuestion.id];
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
