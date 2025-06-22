'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface AssessmentNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  justSaved?: boolean;
  domainColor?: string;
}

export default function AssessmentNavigation({
  currentQuestion,
  totalQuestions,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  justSaved = false,
  domainColor = '#3B82F6'
}: AssessmentNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="flex items-center justify-center gap-8">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`w-32 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 border-2 ${
            !canGoPrevious ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-300' : 'hover:opacity-90'
          }`}
          style={{
            borderColor: canGoPrevious ? domainColor : undefined,
            color: canGoPrevious ? domainColor : undefined
          }}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </button>

        {/* Auto-save indicator */}
        <AnimatePresence>
          {justSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 text-sm text-green-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Saved
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`w-32 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 text-white ${
            !canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ 
            backgroundColor: canGoNext ? domainColor : '#9CA3AF',
            borderColor: canGoNext ? domainColor : '#9CA3AF'
          }}
        >
          {currentQuestion === totalQuestions ? 'See My Score' : 'Next'}
          {currentQuestion < totalQuestions && <ChevronRightIcon className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}
