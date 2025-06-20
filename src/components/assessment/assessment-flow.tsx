'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import QuestionCard from './question-card';
import AssessmentNavigation from './assessment-navigation';

interface Question {
  id: string;
  question_text: string;
  domain_id: string;
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

  // Create or load existing assessment
  const initializeAssessment = useCallback(async () => {
    if (!user) return null;

    try {
      // Check for existing incomplete assessment
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('id, current_question_index')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

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
        // Create new assessment
        const { data: newAssessment, error } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            status: 'in_progress',
            current_question_index: 0,
            started_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        
        setAssessmentId(newAssessment.id);
        return newAssessment.id;
      }
    } catch (err) {
      console.error('Error initializing assessment:', err);
      return null;
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
    if (!assessmentId || !user) return;

    try {
      setIsSaving(true);
      
      // Upsert response (insert or update if exists)
      const { error } = await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          question_id: questionId,
          response_value: responseValue,
          answered_at: new Date().toISOString(),
        }, {
          onConflict: 'assessment_id,question_id'
        });

      if (error) throw error;

      // Update assessment progress
      await supabase
        .from('assessments')
        .update({
          current_question_index: currentQuestionIndex,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);

    } catch (err) {
      console.error('Error saving response to database:', err);
      // Continue with localStorage as fallback
    } finally {
      setIsSaving(false);
    }
  }, [assessmentId, user, currentQuestionIndex]);

  const handleAnswerSelect = useCallback((value: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Update responses state
    const newResponses = new Map(responses);
    newResponses.set(currentQuestion.id, value);
    setResponses(newResponses);

    // Save to database
    saveResponseToDatabase(currentQuestion.id, value);

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
            if (error) console.error('Error updating progress:', error);
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
            if (error) console.error('Error updating progress:', error);
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
      }
    }
  }, []);

  useEffect(() => {
    initializeAssessment();
  }, [initializeAssessment]);

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
  const currentResponse = responses.get(currentQuestion.id);
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
