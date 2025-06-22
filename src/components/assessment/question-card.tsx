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
  questionIndex: number;
  domains: Array<{
    id: number;
    name: string;
    description: string;
    color_hex: string;
    icon_emoji: string;
    display_order: number;
  }>;
  allQuestions: Array<{ id: number; domain_id: number; }>;
  responses: Record<number, number>;
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
  questionIndex,
  domains,
  allQuestions,
  responses
}: QuestionCardProps) {
  const domainColor = question.domains?.color_hex || '#6B7280';

  const getDomainStatus = (domainId: number): 'not-started' | 'in-progress' | 'complete' => {
    const domainQuestions = allQuestions.filter(q => q.domain_id === domainId);
    const answeredCount = domainQuestions.filter(q => responses[q.id] !== undefined).length;
    
    if (answeredCount === 0) return 'not-started';
    if (answeredCount === domainQuestions.length) return 'complete';
    return 'in-progress';
  };

  const getDomainProgress = (domainId: number) => {
    const domainQuestions = allQuestions.filter(q => q.domain_id === domainId);
    const answeredCount = domainQuestions.filter(q => responses[q.id] !== undefined).length;
    return {
      current: answeredCount,
      total: domainQuestions.length,
      percentage: domainQuestions.length > 0 ? (answeredCount / domainQuestions.length) * 100 : 0
    };
  };

  const getStatusColor = (status: 'not-started' | 'in-progress' | 'complete', domainColor: string) => {
    switch (status) {
      case 'complete':
        return '#10B981'; // Green for completed
      case 'in-progress':
        return domainColor;
      case 'not-started':
        return '#D1D5DB'; // Grey for not started
    }
  };

  // Sort domains by display_order
  const sortedDomains = [...domains].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Domain Progress Boxes */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {sortedDomains.map((domain) => {
          const status = getDomainStatus(domain.id);
          const progress = getDomainProgress(domain.id);
          const isActive = domain.id === question.domain_id;
          const statusColor = getStatusColor(status, domain.color_hex);
          
          return (
            <motion.div
              key={domain.id}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                isActive 
                  ? 'border-current shadow-md' 
                  : 'border-gray-200'
              }`}
              style={{
                borderColor: isActive ? domain.color_hex : undefined,
                backgroundColor: isActive ? `${domain.color_hex}10` : undefined
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: domain.display_order * 0.05 }}
            >
              {/* Domain header */}
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: statusColor }}
                >
                  {status === 'complete' ? '✓' : ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">
                    {domain.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {progress.current} of {progress.total}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: domain.color_hex,
                    width: `${progress.percentage}%` 
                  }}
                />
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                  <div 
                    className="w-2 h-8 rounded-r"
                    style={{ backgroundColor: domain.color_hex }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Displaying: Question {questionNumber} of {totalQuestions}
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
      <div className="mb-6 min-h-[120px] flex items-center">
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
      <div className="mb-6">
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
