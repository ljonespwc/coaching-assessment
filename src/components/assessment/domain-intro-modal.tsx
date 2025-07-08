'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DomainIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  domainId: number;
}

// Domain-specific content
const domainContent = {
  1: {
    emoji: '🎯',
    title: 'Personal Development',
    subtitle: 'The Foundation of Everything',
    description: 'Before you can guide others, you need to master yourself. These 10 skills - from time management to emotional regulation - are what separate good coaches from transformational ones.',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    questionRange: '1-10'
  },
  2: {
    emoji: '💼',
    title: 'Professional Development',
    subtitle: 'Building a Thriving Practice',
    description: 'Having great coaching skills means nothing if you can\'t build a sustainable business. These 9 skills cover everything from ethics to client flow to working within your scope.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    questionRange: '11-19'
  },
  3: {
    emoji: '❤️',
    title: 'Client-Centeredness',
    subtitle: 'The Heart of Great Coaching',
    description: 'This is where the magic happens. These 10 skills determine whether your clients feel truly seen, heard, and supported. It\'s the difference between advice-giving and life-changing coaching.',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-900',
    questionRange: '20-29'
  },
  4: {
    emoji: '🔄',
    title: 'Change Facilitation',
    subtitle: 'Where Transformation Lives',
    description: 'Real change is messy and complex. These 10 skills help you guide clients through resistance, set meaningful goals, and create lasting transformation in their real, complicated lives.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    questionRange: '30-39'
  },
  5: {
    emoji: '🧠',
    title: 'Systems Thinking',
    subtitle: 'Seeing the Bigger Picture',
    description: 'Great coaches don\'t just focus on symptoms - they see the whole system. These 8 skills help you understand your clients as complex humans with interconnected influences.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-900',
    questionRange: '40-47'
  },
  6: {
    emoji: '🔬',
    title: 'Scientific Literacy',
    subtitle: 'Evidence-Based Excellence',
    description: 'In a world full of fads and misinformation, these final 8 skills help you stay grounded in science while communicating complex ideas in ways your clients can actually use.',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-900',
    questionRange: '48-55'
  }
};

export default function DomainIntroModal({ 
  isOpen, 
  onClose, 
  onContinue,
  domainId
}: DomainIntroModalProps) {
  if (!isOpen) return null;

  const content = domainContent[domainId as keyof typeof domainContent];
  if (!content) return null;

  const handleContinue = () => {
    onContinue();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className={`relative bg-gradient-to-br ${content.color} text-white p-6 rounded-t-xl`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="text-4xl mb-3">{content.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">
                {content.title}
              </h2>
              <p className="text-white/90 font-medium">
                {content.subtitle}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className={`${content.bgColor} ${content.borderColor} border rounded-lg p-4 mb-6`}>
              <p className={`${content.textColor} leading-relaxed`}>
                {content.description}
              </p>
            </div>

            {/* Question Info */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gray-100 rounded-full px-4 py-2">
                <span className="text-sm font-medium text-gray-700">
                  Questions {content.questionRange} of 55
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinue}
                className={`flex-1 bg-gradient-to-r ${content.color} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]`}
              >
                Continue Assessment
              </button>
              <button
                onClick={onClose}
                className="sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip intro
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}