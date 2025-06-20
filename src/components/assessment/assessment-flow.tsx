'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAnswerSelect = useCallback((value: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      setResponses(prev => new Map(prev.set(currentQuestion.id, value)));
    }
  }, [questions, currentQuestionIndex]);

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
    try {
      setIsSaving(true);
      // TODO: Implement assessment completion logic
      // Calculate scores, save final results, redirect to results page
      console.log('Assessment completed with responses:', Array.from(responses.entries()));
      
      // For now, just save final results
      await handleSaveProgress();
      
      // TODO: Redirect to results page
      alert('Assessment completed! (Results page coming soon)');
    } catch (err) {
      console.error('Error completing assessment:', err);
    } finally {
      setIsSaving(false);
    }
  }, [responses, handleSaveProgress]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Handle assessment completion
      handleCompleteAssessment();
    }
  }, [currentQuestionIndex, questions.length, handleCompleteAssessment]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Auto-save every 5 questions
  useEffect(() => {
    const shouldAutoSave = (currentQuestionIndex + 1) % 5 === 0 && responses.size > 0;
    if (shouldAutoSave) {
      handleSaveProgress();
    }
  }, [currentQuestionIndex, responses.size, handleSaveProgress]);

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
