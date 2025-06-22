'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssessmentNavigationProps {
  onComplete: () => void;
  justSaved?: boolean;
  domainColor?: string;
}

export default function AssessmentNavigation({
  onComplete,
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

        {/* See My Score Button */}
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 text-lg"
          style={{ 
            backgroundColor: domainColor
          }}
        >
          See My Score
        </button>
      </div>
    </motion.div>
  );
}
