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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const initializingRef = useRef(false); // Use ref instead of state for guard
  const hasInitializedRef = useRef(false); // Track if we've ever initialized

  // Create or load existing assessment
  const initializeAssessment = useCallback(async () => {
    if (!user || initializingRef.current || hasInitializedRef.current) return null; // Add guard condition

    initializingRef.current = true; // Set guard flag to true

    try {
      // Check for existing incomplete assessment
      const { data: existingAssessment, error: fetchError } = await supabase
        .from('assessments')
        .select('id, current_question_index')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing assessment:', fetchError);
        console.error('Full error details:', JSON.stringify(fetchError, null, 2));
        // Continue to create new assessment
      }

      if (existingAssessment) {
        // Resume existing assessment
        setAssessmentId(existingAssessment.id);
        setCurrentQuestionIndex(existingAssessment.current_question_index || 0);
        
        // Load existing responses
        const { data: existingResponses } = await supabase
          .from('assessment_responses')
          .select('question_id, response_value')
          .eq('assessment_id', existingAssessment.id);

        if (existingResponses) {
          const responseMap = new Map();
          existingResponses.forEach(r => responseMap.set(r.question_id, r.response_value));
          setResponses(responseMap);
        }

        return existingAssessment.id;
      } else {
        // Create new assessment - double-check no assessment exists
        const { data: doubleCheck } = await supabase
          .from('assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .limit(1)
          .maybeSingle();

        if (doubleCheck) {
          // Another process already created one, use it
          setAssessmentId(doubleCheck.id);
          return doubleCheck.id;
        }

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

        if (error) throw error;
        
        setAssessmentId(newAssessment.id);
        return newAssessment.id;
      }
    } catch (err) {
      console.error('Error initializing assessment:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));
      return null;
    } finally {
      initializingRef.current = false; // Reset guard flag
      hasInitializedRef.current = true; // Set initialized flag to true
    }
  }, [user]);

  // Fetch all questions on component mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            domain_id,
            question_order,
            domains!inner (
              name,
              description
            )
          `)
          .eq('is_active', true)
          .order('domain_id', { ascending: true })
          .order('question_order', { ascending: true });

        if (error) throw error;

        // Transform the data to handle domains relationship
        const transformedQuestions: Question[] = data.map(q => ({
          ...q,
          domains: Array.isArray(q.domains) ? q.domains[0] : q.domains
        }));

        setQuestions(transformedQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        console.error('Full error details:', JSON.stringify(err, null, 2));
        setError('Failed to load assessment questions');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((currentQuestionIndex: number, responses: Map<string, number>) => {
    const progressData = {
      currentQuestionIndex,
      responses: Array.from(responses.entries()),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('assessment_progress', JSON.stringify(progressData));
  }, []);

  // Save response to database
  const saveResponseToDatabase = useCallback(async (questionId: string, responseValue: number) => {
    console.log('💾 Saving response:', { questionId, responseValue });
    
    if (!assessmentId || !user) {
      console.log('❌ Cannot save - missing assessmentId or user');
      return;
    }

    try {
      setIsSaving(true);
      
      // Find the question to get domain_id
      const currentQuestion = questions.find(q => q.id === parseInt(questionId));
      if (!currentQuestion) {
        throw new Error(`Question not found: ${questionId}`);
      }

      console.log('📝 Inserting response to database...');
      
      // Insert response with timeout
      const insertPromise = supabase
        .from('assessment_responses')
        .insert({
          assessment_id: assessmentId,
          question_id: parseInt(questionId),
          domain_id: currentQuestion.domain_id,
          response_value: responseValue,
        });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 10000);
      });

      const { error } = await Promise.race([insertPromise, timeoutPromise]) as { error: Error };

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }

      console.log('✅ Response saved successfully');

      // Update assessment progress
      await supabase
        .from('assessments')
        .update({
          current_question_index: currentQuestionIndex,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);

      console.log('✅ Progress updated');

    } catch (err) {
      console.error('❌ Error saving response:', err);
      // Continue with localStorage as fallback
    } finally {
      setIsSaving(false);
    }
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

    // Save to localStorage as backup
    saveProgress(currentQuestionIndex, newResponses);
  }, [currentQuestionIndex, questions, responses, saveResponseToDatabase, saveProgress]);

  const handleSaveProgress = useCallback(async () => {
    if (responses.size === 0) return;

    try {
      setIsSaving(true);
      // TODO: Implement actual save to database
      // For now, just save to localStorage
      const progressData = {
        currentQuestionIndex,
        responses: Array.from(responses.entries()),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('assessment_progress', JSON.stringify(progressData));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Error saving progress:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));
    } finally {
      setIsSaving(false);
    }
  }, [currentQuestionIndex, responses]);

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

      // Clear localStorage since assessment is complete
      localStorage.removeItem('assessment_progress');
      
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
      saveProgress(newIndex, responses);
      
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
  }, [currentQuestionIndex, questions.length, responses, saveProgress, assessmentId, handleCompleteAssessment]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      saveProgress(newIndex, responses);
      
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
  }, [currentQuestionIndex, responses, saveProgress, assessmentId]);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('assessment_progress');
    if (savedProgress) {
      try {
        const { currentQuestionIndex: savedIndex, responses: savedResponses } = JSON.parse(savedProgress);
        setCurrentQuestionIndex(savedIndex);
        setResponses(new Map(savedResponses));
      } catch (err) {
        console.error('Error loading saved progress:', err);
        console.error('Full error details:', JSON.stringify(err, null, 2));
      }
    }
  }, []);

  useEffect(() => {
    if (user && !assessmentId && !initializingRef.current && !hasInitializedRef.current) {
      initializeAssessment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, assessmentId]); // Intentionally excluding initializeAssessment to prevent re-runs

  if (loading) {
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
          onSave={handleSaveProgress}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
