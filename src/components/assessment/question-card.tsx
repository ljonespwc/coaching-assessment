'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: number;
  question_text: string;
  question_order: number;
  domain_id: number;
  domains: {
    id: number;
    name: string;
    description: string;
    color_hex: string;
    icon_emoji: string;
    display_order: number;
  } | null;
}

interface QuestionCardProps {
  question: Question;
  currentAnswer: number | null;
  onAnswerSelect: (value: number) => void;
  questionNumber: number;
  totalQuestions: number;
  domainProgress: {
    current: number;
    total: number;
  };
  questionIndex: number;
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export default function QuestionCard({ 
  question, 
  currentAnswer, 
  onAnswerSelect, 
  questionNumber, 
  totalQuestions,
  domainProgress,
  questionIndex 
}: QuestionCardProps) {
  const domainColor = question.domains?.color_hex || '#6B7280';

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with progress */}
      <div className="mb-8">
        <div className="space-y-2">
          {/* Overall progress */}
          <div className="text-sm text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: '#3B82F6',
                width: `${(questionNumber / totalQuestions) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 min-h-[120px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key={questionIndex}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ 
              duration: 0.25,
              ease: "easeInOut"
            }}
            className="text-2xl font-semibold text-gray-900 leading-relaxed w-full"
          >
            {question.question_text}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Likert Scale */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-6 text-center">
          How much do you agree with this statement?
        </h3>
        
        <div className="flex justify-between gap-4">
          {LIKERT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onAnswerSelect(option.value)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                currentAnswer === option.value
                  ? 'border-current text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
              style={{
                backgroundColor: currentAnswer === option.value ? domainColor : 'transparent',
                borderColor: currentAnswer === option.value ? domainColor : undefined
              }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{option.value}</div>
                <div className="text-sm">{option.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
