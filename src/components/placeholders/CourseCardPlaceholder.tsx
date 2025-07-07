'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CourseCardPlaceholderProps {
  className?: string;
  animate?: boolean;
}

export default function CourseCardPlaceholder({ 
  className = '',
  animate = true 
}: CourseCardPlaceholderProps) {
  const MotionDiv = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  } : {};

  return (
    <MotionDiv
      className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`}
      {...animationProps}
    >
      <div className="space-y-3">
        {/* Course Title Placeholder */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
          <div className="h-5 bg-gray-300 rounded-full px-2 py-1 animate-pulse w-16 ml-2"></div>
        </div>
        
        {/* Description Placeholder */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
        </div>
        
        {/* Meta Info Placeholder */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
        
        {/* Action Area */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="h-3 bg-gray-300 rounded animate-pulse w-20"></div>
        </div>
      </div>
      
      {/* Coming Soon Overlay */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
          <div className="w-2 h-2 bg-blue-600 rounded-full opacity-60"></div>
          <span className="text-xs font-medium text-blue-800 opacity-70">
            Course Data Coming Soon
          </span>
        </div>
      </div>
    </MotionDiv>
  );
}