'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
  domainProgress 
}: QuestionCardProps) {
  const domainColor = question.domains?.color_hex || '#6B7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header with progress and domain badge */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          {/* Overall progress */}
          <div className="text-sm text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="w-96 bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: domainColor,
                width: `${(questionNumber / totalQuestions) * 100}%` 
              }}
            />
          </div>
          
          {/* Domain-specific progress */}
          <div className="text-sm text-gray-600">
            {question.domains?.name}: {domainProgress.current} of {domainProgress.total}
          </div>
          <div className="w-96 bg-gray-200 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: domainColor,
                width: `${(domainProgress.current / domainProgress.total) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Domain badge with tooltip */}
        <div className="relative group">
          <div 
            className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2 cursor-help"
            style={{ backgroundColor: domainColor }}
          >
            <span>{question.domains?.icon_emoji}</span>
            <span>{question.domains?.name}</span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div className="font-medium mb-1">{question.domains?.name}</div>
            <div className="text-gray-300">{question.domains?.description}</div>
            <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
          {question.question_text}
        </h2>
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
    </motion.div>
  );
}
