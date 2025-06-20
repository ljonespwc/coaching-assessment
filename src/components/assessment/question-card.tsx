'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (value: number) => void;
  selectedValue?: number;
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
  questionNumber, 
  totalQuestions, 
  onAnswerSelect, 
  selectedValue 
}: QuestionCardProps) {
  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Question not found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {question.domains?.name}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
          {question.question_text}
        </h2>
        <p className="text-gray-600 text-sm">
          Domain: {question.domains?.name} • {question.domains?.description}
        </p>
      </div>

      {/* Likert Scale */}
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-800 text-center mb-6">
          How much do you agree with this statement?
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {LIKERT_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => onAnswerSelect(option.value)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${selectedValue === option.value
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              {/* Radio indicator */}
              <div className="flex items-center justify-center mb-2">
                <div className={`
                  w-4 h-4 rounded-full border-2 transition-all duration-200
                  ${selectedValue === option.value
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                  }
                `}>
                  {selectedValue === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"
                    />
                  )}
                </div>
              </div>
              
              {/* Option text */}
              <div className="text-center">
                <div className="font-medium text-sm mb-1">{option.value}</div>
                <div className="text-xs leading-tight">{option.label}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
