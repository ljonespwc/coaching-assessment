'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

interface AssessmentResult {
  id: string;
  total_score: number;
  percentage_score: number;
  score_category: string;
  completed_at: string;
}

export default function ResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      // TODO: Fetch assessment results from Supabase
      // For now, show a placeholder
      setResult({
        id: 'placeholder',
        total_score: 0,
        percentage_score: 0,
        score_category: 'Developing',
        completed_at: new Date().toISOString()
      });
      setIsLoading(false);
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No results found.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Assessment Results
            </h1>
            <p className="text-gray-600">
              Completed on {new Date(result.completed_at).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {result.total_score}
              </div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {result.percentage_score}%
              </div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {result.score_category}
              </div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Detailed results and recommendations coming soon!
            </p>
            
            <div className="space-x-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Home
              </button>
              
              <button
                onClick={() => router.push('/assessment')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
