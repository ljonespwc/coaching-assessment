'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Domain } from '@/types/assessment';

interface QuestionCardProps {
  question: Question;
  currentAnswer: number | null;
  onAnswerSelect: (value: number) => void;
  questionNumber: number;
  totalQuestions: number;
  questionIndex: number;
  domains: Domain[];
  allQuestions: Question[];
  responses: Record<string, number>;
  celebratingDomains?: Set<number>;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  saveError?: string | null;
  onRetry?: () => void;
  isComplete?: boolean;
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
  responses,
  celebratingDomains = new Set(),
  saveStatus = 'idle',
  saveError = null,
  onRetry,
  isComplete = false
}: QuestionCardProps) {
  const domainColor = question.domains?.color_hex || '#6B7280';
  const [clickedButton, setClickedButton] = useState<number | null>(null);

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
      <div className="mb-8 grid grid-cols-2 gap-4">
        {sortedDomains.map((domain) => {
          const status = getDomainStatus(domain.id);
          const progress = getDomainProgress(domain.id);
          const isActive = domain.id === question.domain_id;
          const statusColor = getStatusColor(status, domain.color_hex);
          
          return (
            <motion.div
              key={domain.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 group cursor-help shadow-sm hover:shadow-md ${
                isActive 
                  ? 'border-current shadow-lg' 
                  : 'border-gray-200 bg-white'
              }`}
              style={{
                borderColor: isActive ? domain.color_hex : undefined,
                backgroundColor: status === 'complete' 
                  ? '#F0FDF4' // Light green for completed
                  : isActive 
                    ? `${domain.color_hex}10` 
                    : undefined
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
                  {status === 'complete' ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        delay: 0.1
                      }}
                    >
                      ✓
                    </motion.span>
                  ) : ''}
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

              {/* Hover tooltip overlay */}
              <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex flex-col justify-center border border-gray-200">
                <div className="font-semibold mb-1 text-gray-900">{domain.name}</div>
                <div className="text-gray-600 leading-tight">{domain.description}</div>
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

              {/* Celebration */}
              {celebratingDomains.has(domain.id) && (
                <div className="absolute inset-0 overflow-hidden rounded-lg z-20 pointer-events-none">
                  {/* Confetti particles */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: i % 3 === 0 ? domain.color_hex : 
                                       i % 3 === 1 ? '#FFD700' : '#FF6B6B',
                        left: '50%',
                        top: '50%'
                      }}
                      initial={{ 
                        scale: 0,
                        x: 0,
                        y: 0,
                        opacity: 1
                      }}
                      animate={{ 
                        scale: [0, 1, 0],
                        x: (Math.cos((i * 30) * Math.PI / 180) * (30 + Math.random() * 20)),
                        y: (Math.sin((i * 30) * Math.PI / 180) * (30 + Math.random() * 20)),
                        opacity: [1, 1, 0]
                      }}
                      transition={{ 
                        duration: 1.5,
                        ease: "easeOut",
                        delay: i * 0.05
                      }}
                    />
                  ))}
                  
                  {/* Additional sparkle particles */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`sparkle-${i}`}
                      className="absolute w-1 h-1 rounded-full bg-yellow-300"
                      style={{ 
                        left: '50%',
                        top: '50%'
                      }}
                      initial={{ 
                        scale: 0,
                        x: 0,
                        y: 0,
                        opacity: 1
                      }}
                      animate={{ 
                        scale: [0, 1.5, 0],
                        x: (Math.cos((i * 45 + 22.5) * Math.PI / 180) * (40 + Math.random() * 15)),
                        y: (Math.sin((i * 45 + 22.5) * Math.PI / 180) * (40 + Math.random() * 15)),
                        opacity: [1, 1, 0]
                      }}
                      transition={{ 
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.2 + i * 0.03
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-3">
          <div className="text-base font-medium text-gray-700">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-300 shadow-sm"
              style={{ 
                backgroundColor: '#3B82F6',
                width: `${(questionNumber / totalQuestions) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div 
        className="mb-8 rounded-xl shadow-sm border border-gray-100 p-8 min-h-[160px] flex items-center"
        style={{ backgroundColor: `${domainColor}80` }}
      >
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
            className="text-3xl font-semibold text-gray-900 leading-relaxed w-full text-center"
          >
            {question.question_text}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Likert Scale */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-medium text-gray-700 mb-8 text-center">
          How much do you agree with this statement?
        </h3>
        
        <div className="flex justify-between gap-4">
          {LIKERT_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => {
                if (!isComplete && saveStatus !== 'saving') {
                  setClickedButton(option.value);
                  setTimeout(() => setClickedButton(null), 600);
                  onAnswerSelect(option.value);
                }
              }}
              className={`relative overflow-hidden flex-1 p-4 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                currentAnswer === option.value
                  ? 'text-white border-transparent' 
                  : 'text-gray-700 border-gray-300 hover:border-gray-400 bg-white'
              } ${isComplete || saveStatus === 'saving' ? 'opacity-60' : ''}`}
              style={{
                backgroundColor: currentAnswer === option.value ? domainColor : 'transparent',
                borderColor: currentAnswer === option.value ? domainColor : undefined,
                cursor: isComplete || saveStatus === 'saving' ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isComplete && saveStatus !== 'saving' && currentAnswer !== option.value) {
                  e.currentTarget.style.backgroundColor = `${domainColor}15`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isComplete && saveStatus !== 'saving' && currentAnswer !== option.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              whileHover={{ scale: isComplete || saveStatus === 'saving' ? 1 : 1.02 }}
              whileTap={{ scale: isComplete || saveStatus === 'saving' ? 1 : 0.98 }}
            >
              <div className="text-center relative z-10">
                <div className="text-2xl font-bold mb-2">{option.value}</div>
                <div className="text-sm">{option.label}</div>
              </div>
              
              {/* Ripple effect */}
              <AnimatePresence>
                {clickedButton === option.value && (
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: `${domainColor}40` }}
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Save Status Indicator */}
      <AnimatePresence>
        {saveStatus === 'saving' && (
          <motion.div
            className="absolute top-0 right-0 p-2 rounded-lg bg-blue-100 text-blue-600 text-sm flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </motion.div>
        )}
        {saveStatus === 'saved' && (
          <motion.div
            className="absolute top-0 right-0 p-2 rounded-lg bg-green-100 text-green-600 text-sm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            ✓ Saved
          </motion.div>
        )}
        {saveStatus === 'error' && (
          <motion.div
            className="absolute top-0 right-0 p-2 rounded-lg bg-red-100 text-red-600 text-sm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2">
              <span>⚠ Save failed</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs underline hover:no-underline"
                >
                  Retry
                </button>
              )}
            </div>
            {saveError && (
              <div className="text-xs mt-1 text-red-500">{saveError}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
