'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DomainRecommendation, CourseRecommendation } from '@/lib/recommendations-engine';
import { DomainScore } from '@/lib/score-calculator';
import PracticeListPlaceholder from '@/components/placeholders/PracticeListPlaceholder';
import CourseCardPlaceholder from '@/components/placeholders/CourseCardPlaceholder';
import RecommendationPlaceholder from '@/components/placeholders/RecommendationPlaceholder';

interface DomainDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainScore | null;
  recommendation: DomainRecommendation | null;
}

export default function DomainDetailModal({ 
  isOpen, 
  onClose, 
  domain, 
  recommendation 
}: DomainDetailModalProps) {
  if (!domain || !recommendation) return null;

  const getPriorityColor = (priority: DomainRecommendation['priority']) => {
    switch (priority) {
      case 'easiest_win': return 'bg-green-100 text-green-800 border-green-200';
      case 'biggest_opportunity': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'maintain_strength': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'continue_growth': return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getDifficultyColor = (difficulty: CourseRecommendation['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{domain.emoji}</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {domain.domainName}
                      </h2>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-600">
                          {domain.score} / {domain.maxScore} points
                        </span>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: domain.color }}
                        >
                          {domain.percentage.toFixed(0)}%
                        </span>
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(recommendation.priority)}`}
                        >
                          {recommendation.priorityLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-6 space-y-6">
                  
                  {/* Performance Overview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Performance Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Score</span>
                        <span className="font-medium">{domain.score} / {domain.maxScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-1000"
                          style={{ 
                            backgroundColor: domain.color,
                            width: `${domain.percentage}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Proficiency Level</span>
                        <span 
                          className="font-bold"
                          style={{ color: domain.color }}
                        >
                          {domain.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Why This Matters</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {recommendation.rationale}
                    </p>
                  </div>

                  {/* Practice Recommendations */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      🎯 Actionable Practice Recommendations
                    </h3>
                    {recommendation.isPlaceholder ? (
                      <PracticeListPlaceholder count={3} />
                    ) : (
                      <div className="space-y-3">
                        {recommendation.practiceRecommendations.map((practice, index) => (
                          <div 
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p className="text-blue-900 text-sm leading-relaxed">
                              {practice}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Course Recommendations */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      📚 Recommended Learning Opportunities
                    </h3>
                    {recommendation.isPlaceholder ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CourseCardPlaceholder />
                        <CourseCardPlaceholder />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendation.courseRecommendations.map((course) => (
                          <div 
                            key={course.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                {course.title}
                              </h4>
                              <span 
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}
                              >
                                {course.difficulty}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                              {course.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{course.duration}</span>
                              <span>{course.provider}</span>
                            </div>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">Relevance:</span>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= Math.round(course.relevanceScore * 5)
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              
                              {course.url && (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                  Learn More →
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Next Steps */}
                  {recommendation.isPlaceholder ? (
                    <RecommendationPlaceholder 
                      type="timeline" 
                      title="Your Next Steps"
                      description="Personalized action timelines and development milestones will be created based on your assessment results and learning goals."
                    />
                  ) : (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">
                        🚀 Your Next Steps
                      </h3>
                      <div className="text-green-800 text-sm space-y-2">
                        <p>
                          <strong>This week:</strong> Choose one practice recommendation to implement immediately.
                        </p>
                        <p>
                          <strong>This month:</strong> Research and enroll in a relevant learning opportunity.
                        </p>
                        <p>
                          <strong>This quarter:</strong> Seek feedback on your progress and adjust your development plan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement save to development plan
                      console.log('Save to development plan');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save to Development Plan
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
