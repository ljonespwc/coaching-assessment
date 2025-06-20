'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface AssessmentNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function AssessmentNavigation({
  currentQuestion,
  totalQuestions,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onSave,
  isSaving = false
}: AssessmentNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </Button>

        {/* Question Counter & Save Status */}
        <div className="flex items-center gap-4">
          {/* Auto-save indicator */}
          {isSaving && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </motion.div>
          )}

          {/* Manual save button (optional) */}
          {onSave && !isSaving && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="text-gray-600 hover:text-gray-800"
            >
              Save Progress
            </Button>
          )}

          {/* Question progress */}
          <div className="text-sm font-medium text-gray-700">
            {currentQuestion} of {totalQuestions}
          </div>
        </div>

        {/* Next Button */}
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2"
        >
          {currentQuestion === totalQuestions ? 'Complete Assessment' : 'Next'}
          {currentQuestion < totalQuestions && <ChevronRightIcon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <motion.div
            className="bg-blue-600 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Validation message */}
      {!canGoNext && currentQuestion < totalQuestions && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-amber-600 mt-2 text-center"
        >
          Please select an answer to continue
        </motion.p>
      )}
    </motion.div>
  );
}
