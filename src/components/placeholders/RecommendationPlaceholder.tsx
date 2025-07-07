'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RecommendationPlaceholderProps {
  type: 'practice' | 'course' | 'guidance' | 'priority' | 'timeline';
  title?: string;
  description?: string;
  className?: string;
}

export default function RecommendationPlaceholder({ 
  type, 
  title, 
  description, 
  className = '' 
}: RecommendationPlaceholderProps) {
  const getPlaceholderContent = () => {
    switch (type) {
      case 'practice':
        return {
          icon: '🎯',
          defaultTitle: 'Practice Recommendations',
          defaultDescription: 'Personalized coaching practices will be recommended based on your assessment results and learning preferences.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'course':
        return {
          icon: '📚',
          defaultTitle: 'Course Recommendations', 
          defaultDescription: 'Relevant courses and learning opportunities will be suggested based on your skill gaps and development goals.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'guidance':
        return {
          icon: '🧭',
          defaultTitle: 'Personalized Guidance',
          defaultDescription: 'AI-powered coaching guidance and development roadmaps will be available to help accelerate your growth.',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800'
        };
      case 'priority':
        return {
          icon: '🚀',
          defaultTitle: 'Priority Recommendations',
          defaultDescription: 'Your easiest wins and biggest opportunities will be identified based on your assessment performance.',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800'
        };
      case 'timeline':
        return {
          icon: '📅',
          defaultTitle: 'Development Timeline',
          defaultDescription: 'A customized action plan with weekly, monthly, and quarterly development goals will be created.',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          textColor: 'text-indigo-800'
        };
    }
  };

  const content = getPlaceholderContent();
  const displayTitle = title || content.defaultTitle;
  const displayDescription = description || content.defaultDescription;

  return (
    <motion.div
      className={`${content.bgColor} ${content.borderColor} border-2 border-dashed rounded-lg p-6 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="text-4xl opacity-60">
          {content.icon}
        </div>
        
        <div className="space-y-2">
          <h3 className={`font-semibold ${content.textColor}`}>
            {displayTitle}
          </h3>
          <p className={`text-sm ${content.textColor} opacity-80 max-w-md mx-auto leading-relaxed`}>
            {displayDescription}
          </p>
        </div>
        
        <div className={`inline-flex items-center space-x-2 px-3 py-1 ${content.bgColor} ${content.borderColor} border rounded-full`}>
          <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
          <span className={`text-xs font-medium ${content.textColor} opacity-70`}>
            Coming Soon
          </span>
        </div>
      </div>
    </motion.div>
  );
}