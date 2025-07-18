'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchLatestAssessmentResults, fetchAssessmentResults, AssessmentResultsData } from '@/lib/results-service';
import { ScoreResults, DomainScore } from '@/lib/score-calculator';
import { generateRecommendations, RecommendationsResult, DomainRecommendation } from '@/lib/recommendations-engine';
import HexChart from '@/components/charts/hex-chart';
import DomainDetailModal from '@/components/results/domain-detail-modal';
import RecommendationsSummary from '@/components/results/recommendations-summary';
import { motion } from 'framer-motion';

interface ResultsPageState {
  loading: boolean;
  error: string | null;
  results: ScoreResults | null;
  recommendations: RecommendationsResult | null;
  selectedDomain: DomainScore | null;
  selectedRecommendation: DomainRecommendation | null;
  isModalOpen: boolean;
}

export default function ResultsPage() {
  const { user, session, loading: authLoading } = useAuth();
  const [state, setState] = useState<ResultsPageState>({
    loading: true,
    error: null,
    results: null,
    recommendations: null,
    selectedDomain: null,
    selectedRecommendation: null,
    isModalOpen: false
  });
  
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [isRetryingResults, setIsRetryingResults] = useState(false);
  
  // Get assessment ID from URL parameters
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const specificAssessmentId = urlParams?.get('assessment');

  useEffect(() => {
    const loadResults = async (retryCount = 0) => {
      // Wait for auth to finish loading before checking user
      if (authLoading) {
        return;
      }
      
      if (!user) {
        setState(prev => ({ ...prev, loading: false, error: 'Please log in to view results' }));
        return;
      }

      try {
        console.log('Loading results for user:', user.id);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
        });
        
        const assessmentPromise = specificAssessmentId 
          ? fetchAssessmentResults(specificAssessmentId, session?.access_token)
          : fetchLatestAssessmentResults(user.id, session?.access_token);
        const assessmentData = await Promise.race([assessmentPromise, timeoutPromise]) as AssessmentResultsData | null;
        
        console.log('Assessment data received:', assessmentData);
        const results = assessmentData?.scoreResults || null;
        console.log('Score results:', results);
        
        
        // If no results found and this is the first attempt, wait and retry
        // This handles the case where assessment completion is still processing
        if (!results && retryCount === 0) {
          console.log('No results found, retrying in 2 seconds...');
          setTimeout(() => loadResults(1), 2000);
          return;
        }
        
        // If still no results after retry, show appropriate message
        if (!results) {
          setState({ 
            loading: false, 
            error: 'No completed assessments found. Please complete an assessment first.', 
            results: null,
            recommendations: null,
            selectedDomain: null,
            selectedRecommendation: null,
            isModalOpen: false
          });
          return;
        }
        
        const recommendations = generateRecommendations(results.domainScores);
        
        setState({ 
          loading: false, 
          error: null, 
          results,
          recommendations,
          selectedDomain: null,
          selectedRecommendation: null,
          isModalOpen: false
        });
      } catch (error) {
        console.error('Failed to load results:', error);
        
        // Better error handling with specific messages
        let errorMessage = 'Failed to load assessment results. Please try again.';
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please check your connection and try again.';
          } else if (error.message.includes('Assessment not found')) {
            errorMessage = 'No completed assessments found. Please complete an assessment first.';
          }
        }
        
        setState({ 
          loading: false, 
          error: errorMessage, 
          results: null,
          recommendations: null,
          selectedDomain: null,
          selectedRecommendation: null,
          isModalOpen: false
        });
      }
    };

    loadResults();
  }, [user, session, authLoading, specificAssessmentId]);

  const handleRetryResults = async () => {
    if (isRetryingResults) return;
    
    setIsRetryingResults(true);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      
      const assessmentPromise = specificAssessmentId 
        ? fetchAssessmentResults(specificAssessmentId, session?.access_token)
        : fetchLatestAssessmentResults(user?.id || '', session?.access_token);
      const assessmentData = await Promise.race([assessmentPromise, timeoutPromise]) as AssessmentResultsData | null;
      
      const results = assessmentData?.scoreResults || null;
      
      if (!results) {
        setState({ 
          loading: false, 
          error: 'No completed assessments found. Please complete an assessment first.', 
          results: null,
          recommendations: null,
          selectedDomain: null,
          selectedRecommendation: null,
          isModalOpen: false
        });
        return;
      }
      
      const recommendations = generateRecommendations(results.domainScores);
      
      setState({ 
        loading: false, 
        error: null, 
        results,
        recommendations,
        selectedDomain: null,
        selectedRecommendation: null,
        isModalOpen: false
      });
    } catch (error) {
      console.error('Retry failed:', error);
      let errorMessage = 'Failed to load assessment results. Please try again.';
      if (error instanceof Error && error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      }
      
      setState({ 
        loading: false, 
        error: errorMessage, 
        results: null,
        recommendations: null,
        selectedDomain: null,
        selectedRecommendation: null,
        isModalOpen: false
      });
    } finally {
      setIsRetryingResults(false);
    }
  };

  const handleDomainClick = (domainId: number) => {
    if (!state.results || !state.recommendations) return;
    
    const domain = state.results.domainScores.find(d => d.domainId === domainId);
    const recommendation = state.recommendations.allRecommendations.find(r => r.domainId === domainId);
    
    if (domain && recommendation) {
      setState(prev => ({
        ...prev,
        selectedDomain: domain,
        selectedRecommendation: recommendation,
        isModalOpen: true
      }));
    }
  };

  const handleCloseModal = () => {
    setState(prev => ({
      ...prev,
      selectedDomain: null,
      selectedRecommendation: null,
      isModalOpen: false
    }));
  };

  const handleRetakeAssessment = () => {
    if (isStartingAssessment) return; // Prevent double-clicks
    
    setIsStartingAssessment(true);
    window.location.href = '/assessment';
  };



  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Results</h2>
              <p className="text-gray-600 mb-6">{state.error}</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={handleRetryResults}
                  disabled={isRetryingResults}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    isRetryingResults 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRetryingResults ? 'Retrying...' : 'Retry Loading'}
                </button>
                <button 
                  onClick={handleRetakeAssessment}
                  disabled={isStartingAssessment}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    isStartingAssessment 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isStartingAssessment ? 'Starting...' : 'Take Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
              <p className="text-gray-600 mb-6">You haven&apos;t completed an assessment yet.</p>
              <button 
                onClick={handleRetakeAssessment}
                disabled={isStartingAssessment}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  isStartingAssessment 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isStartingAssessment ? 'Starting...' : 'Start Assessment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { results } = state;
  
  // Use current date for now (we'll need to restructure state to access assessment data)
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const completionTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.location.href = '/'}
                className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Home
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/results'}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Latest Results
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {specificAssessmentId ? 'Assessment Results' : 'Assessment Complete!'}
              </h1>
              <p className="text-gray-600">
                Completed on {completionDate} at {completionTime}
              </p>
              {specificAssessmentId && (
                <p className="text-sm text-gray-500 mt-1">
                  Viewing specific assessment results
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {results.totalScore}/{results.maxPossibleScore}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {results.percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Overall Performance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600 mb-1">
                  {results.category}
                </div>
                <div className="text-sm text-gray-600">Skill Level</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">{results.categoryMessage}</p>
            </div>
          </motion.div>

          {/* Hex Visualization Section */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Your Coaching Profile
            </h2>
            
            <div className="flex justify-center">
              <HexChart
                domainScores={results.domainScores}
                size={400}
                onDomainClick={handleDomainClick}
                className="mx-auto"
              />
            </div>
          </motion.div>

          {/* Score Summary Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {results.domainScores.map((domain, index) => (
              <motion.div
                key={domain.domainId}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                onClick={() => handleDomainClick(domain.domainId)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{domain.emoji}</div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: domain.color }}
                  ></div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  {domain.domainName}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="font-medium">
                      {domain.score} / {domain.maxScore}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        backgroundColor: domain.color,
                        width: `${domain.percentage}%`
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Performance</span>
                    <span 
                      className="font-bold text-lg"
                      style={{ color: domain.color }}
                    >
                      {domain.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Strength Level Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Strength Level</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full ${
                            level <= Math.ceil(domain.percentage / 20)
                              ? 'bg-current'
                              : 'bg-gray-200'
                          }`}
                          style={{ 
                            color: level <= Math.ceil(domain.percentage / 20) 
                              ? domain.color 
                              : undefined 
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recommendations Summary */}
          {state.recommendations && (
            <RecommendationsSummary
              recommendations={state.recommendations}
              onDomainClick={handleDomainClick}
            />
          )}

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="flex justify-center">
              <button 
                onClick={handleRetakeAssessment}
                disabled={isStartingAssessment}
                className={`px-8 py-3 rounded-lg transition-colors font-medium ${
                  isStartingAssessment 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isStartingAssessment ? 'Starting...' : 'Start New Assessment'}
              </button>
            </div>
          </motion.div>
          </div>
        </div>
      </div>

      {/* Domain Detail Modal */}
      <DomainDetailModal
        isOpen={state.isModalOpen}
        onClose={handleCloseModal}
        domain={state.selectedDomain}
        recommendation={state.selectedRecommendation}
      />
    </div>
  );
}
