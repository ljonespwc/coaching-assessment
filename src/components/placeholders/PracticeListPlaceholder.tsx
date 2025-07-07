'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PracticeListPlaceholderProps {
  count?: number;
  className?: string;
}

export default function PracticeListPlaceholder({ 
  count = 3, 
  className = '' 
}: PracticeListPlaceholderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 border-dashed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium animate-pulse">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-blue-200 rounded animate-pulse w-full"></div>
            <div className="h-3 bg-blue-200 rounded animate-pulse w-4/5"></div>
            {index === 0 && (
              <div className="mt-2">
                <div className="inline-flex items-center space-x-2 px-2 py-1 bg-blue-100 border border-blue-300 rounded-full">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full opacity-60"></div>
                  <span className="text-xs font-medium text-blue-800 opacity-70">
                    Personalized Practices Coming Soon
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}