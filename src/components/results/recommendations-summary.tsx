'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RecommendationsResult } from '@/lib/recommendations-engine';
import RecommendationPlaceholder from '@/components/placeholders/RecommendationPlaceholder';

interface RecommendationsSummaryProps {
  recommendations: RecommendationsResult;
  onDomainClick: (domainId: number) => void;
}

export default function RecommendationsSummary({ 
  recommendations, 
  onDomainClick 
}: RecommendationsSummaryProps) {

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
      {recommendations.isPlaceholder ? (
        <RecommendationPlaceholder 
          type="guidance" 
          title="Overall Guidance"
          description={recommendations.overallGuidance}
          className="mb-6"
        />
      ) : (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Overall Guidance</h3>
          <p className="text-blue-800 leading-relaxed">
            {recommendations.overallGuidance}
          </p>
        </div>
      )}

      {/* Priority Recommendations */}
      {recommendations.isPlaceholder ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <RecommendationPlaceholder 
            type="priority" 
            title="Easiest Win"
            description="Your easiest win domain will be identified based on assessment performance and learning efficiency analysis."
          />
          <RecommendationPlaceholder 
            type="priority" 
            title="Biggest Opportunity"
            description="Your biggest opportunity domain will be identified based on skill gap analysis and impact potential."
          />
        </div>
      ) : (
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
      )}


      {/* Action Items */}
      {recommendations.isPlaceholder ? (
        <RecommendationPlaceholder 
          type="timeline" 
          title="Recommended Action Plan"
          description="A personalized development timeline with weekly, monthly, and quarterly goals will be created based on your assessment results and learning preferences."
          className="mt-6"
        />
      ) : (
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
      )}
    </motion.div>
  );
}
