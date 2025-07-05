'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RecommendationsResult, DomainRecommendation } from '@/lib/recommendations-engine';

interface RecommendationsSummaryProps {
  recommendations: RecommendationsResult;
  onDomainClick: (domainId: number) => void;
}

export default function RecommendationsSummary({ 
  recommendations, 
  onDomainClick 
}: RecommendationsSummaryProps) {
  const getPriorityIcon = (priority: DomainRecommendation['priority']) => {
    switch (priority) {
      case 'easiest_win': return '🎯';
      case 'biggest_opportunity': return '🚀';
      case 'maintain_strength': return '💪';
      case 'continue_growth': return '📈';
    }
  };

  const getPriorityColor = (priority: DomainRecommendation['priority']) => {
    switch (priority) {
      case 'easiest_win': return 'border-green-200 bg-green-50';
      case 'biggest_opportunity': return 'border-orange-200 bg-orange-50';
      case 'maintain_strength': return 'border-blue-200 bg-blue-50';
      case 'continue_growth': return 'border-purple-200 bg-purple-50';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🎯 Your Development Roadmap
      </h2>

      {/* Overall Guidance */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Overall Guidance</h3>
        <p className="text-blue-800 leading-relaxed">
          {recommendations.overallGuidance}
        </p>
      </div>

      {/* Priority Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Easiest Win */}
        {recommendations.easiestWin && (
          <motion.div 
            className="border-2 border-green-200 bg-green-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onDomainClick(recommendations.easiestWin!.domainId)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🎯</span>
              <h3 className="font-semibold text-green-900">Easiest Win</h3>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">
              {recommendations.easiestWin.domainName}
            </h4>
            <p className="text-green-800 text-sm leading-relaxed mb-3">
              {recommendations.easiestWin.rationale}
            </p>
            <div className="text-green-700 text-sm font-medium">
              Click to see detailed recommendations →
            </div>
          </motion.div>
        )}

        {/* Biggest Opportunity */}
        {recommendations.biggestOpportunity && (
          <motion.div 
            className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onDomainClick(recommendations.biggestOpportunity!.domainId)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="font-semibold text-orange-900">Biggest Opportunity</h3>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">
              {recommendations.biggestOpportunity.domainName}
            </h4>
            <p className="text-orange-800 text-sm leading-relaxed mb-3">
              {recommendations.biggestOpportunity.rationale}
            </p>
            <div className="text-orange-700 text-sm font-medium">
              Click to see detailed recommendations →
            </div>
          </motion.div>
        )}
      </div>

      {/* All Domain Recommendations */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">All Domain Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.allRecommendations.map((rec, index) => (
            <motion.div
              key={rec.domainId}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(rec.priority)}`}
              onClick={() => onDomainClick(rec.domainId)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{getPriorityIcon(rec.priority)}</span>
                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                  {rec.priorityLabel}
                </span>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2 text-sm">
                {rec.domainName}
              </h4>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-600">
                  <strong>Practice Focus:</strong>
                </div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {rec.practiceRecommendations[0]}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {rec.courseRecommendations.length} courses available
                  </span>
                  <span className="text-xs font-medium text-blue-600">
                    View Details →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">🎯 Recommended Action Plan</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="font-medium text-blue-600">Week 1:</span>
            <span>
              {recommendations.easiestWin 
                ? `Start with ${recommendations.easiestWin.domainName} - implement one practice recommendation`
                : `Focus on ${recommendations.biggestOpportunity?.domainName} - begin with foundational skills`
              }
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-blue-600">Month 1:</span>
            <span>
              {recommendations.biggestOpportunity 
                ? `Address ${recommendations.biggestOpportunity.domainName} - enroll in a relevant course`
                : 'Continue building on your strongest areas while maintaining momentum'
              }
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-blue-600">Quarter 1:</span>
            <span>Seek feedback, measure progress, and adjust your development plan based on results</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
