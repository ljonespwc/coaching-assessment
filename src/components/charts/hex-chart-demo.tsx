'use client';

import React from 'react';
import HexChart from './hex-chart';
import { DomainScore } from '@/lib/score-calculator';

// Sample data for testing the hex chart
const sampleDomainScores: DomainScore[] = [
  {
    domainId: 1,
    domainName: 'Personal Development',
    score: 18,
    maxScore: 25,
    percentage: 72,
    color: '#f59e0b',
    emoji: '🌱'
  },
  {
    domainId: 2,
    domainName: 'Professional Development',
    score: 22,
    maxScore: 25,
    percentage: 88,
    color: '#10b981',
    emoji: '💼'
  },
  {
    domainId: 3,
    domainName: 'Client Centeredness',
    score: 15,
    maxScore: 25,
    percentage: 60,
    color: '#f59e0b',
    emoji: '🎯'
  },
  {
    domainId: 4,
    domainName: 'Change Facilitation',
    score: 20,
    maxScore: 25,
    percentage: 80,
    color: '#10b981',
    emoji: '🔄'
  },
  {
    domainId: 5,
    domainName: 'Systems Thinking',
    score: 12,
    maxScore: 25,
    percentage: 48,
    color: '#ef4444',
    emoji: '🧠'
  },
  {
    domainId: 6,
    domainName: 'Scientific Literacy',
    score: 16,
    maxScore: 25,
    percentage: 64,
    color: '#f59e0b',
    emoji: '🔬'
  }
];

export default function HexChartDemo() {
  const handleDomainClick = (domainId: number) => {
    const domain = sampleDomainScores.find(d => d.domainId === domainId);
    console.log('Clicked domain:', domain?.domainName);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          PN Hex Chart Demo
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Coaching Assessment Results
          </h2>
          
          <div className="flex justify-center">
            <HexChart
              domainScores={sampleDomainScores}
              size={400}
              onDomainClick={handleDomainClick}
              className="mx-auto"
            />
          </div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {sampleDomainScores.map((domain) => (
              <div key={domain.domainId} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{domain.domainName}</div>
                <div className="text-sm text-gray-600">
                  {domain.score} / {domain.maxScore} points
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {domain.percentage.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Chart Features
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>Interactive:</strong> Hover over data points for details</li>
            <li>• <strong>Animated:</strong> Smooth draw-in animation on load</li>
            <li>• <strong>Color-coded:</strong> Red (low) to Green (high) scores</li>
            <li>• <strong>Responsive:</strong> Adapts to different screen sizes</li>
            <li>• <strong>Accessible:</strong> ARIA labels and keyboard navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
