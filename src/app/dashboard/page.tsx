'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchDashboardData, DashboardData, deleteAssessment } from '@/lib/dashboard-service';
import { motion } from 'framer-motion';
import RecommendationPlaceholder from '@/components/placeholders/RecommendationPlaceholder';

interface DashboardState {
  loading: boolean;
  error: string | null;
  data: DashboardData | null;
}

interface DeleteConfirmationState {
  isOpen: boolean;
  assessmentId: string | null;
  assessmentTitle: string | null;
  isDeleting: boolean;
}

export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth();
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    data: null
  });
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    isOpen: false,
    assessmentId: null,
    assessmentTitle: null,
    isDeleting: false
  });
  
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      // Wait for auth to finish loading before checking user
      if (authLoading) {
        return;
      }
      
      if (!user) {
        setState({ 
          loading: false, 
          error: 'Please log in to view dashboard', 
          data: null 
        });
        return;
      }

      try {
        const dashboardData = await fetchDashboardData(user.id, session?.access_token);
        setState({ loading: false, error: null, data: dashboardData });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        setState({ 
          loading: false, 
          error: 'Failed to load dashboard data. Please try again.', 
          data: null 
        });
      }
    };

    loadDashboard();
  }, [user, session, authLoading]);

  const handleStartAssessment = () => {
    if (isStartingAssessment) return; // Prevent double-clicks
    
    setIsStartingAssessment(true);
    window.location.href = '/assessment';
  };

  const handleViewResults = (assessmentId: string) => {
    window.location.href = `/results?assessment=${assessmentId}`;
  };
  
  const handleDeleteClick = (assessmentId: string, assessmentTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      assessmentId,
      assessmentTitle,
      isDeleting: false
    });
  };
  
  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      assessmentId: null,
      assessmentTitle: null,
      isDeleting: false
    });
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.assessmentId || !user) return;
    
    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));
    
    try {
      await deleteAssessment(deleteConfirmation.assessmentId, user.id, session?.access_token);
      
      // Refresh dashboard data
      const dashboardData = await fetchDashboardData(user.id, session?.access_token);
      setState({ loading: false, error: null, data: dashboardData });
      
      // Close confirmation dialog
      setDeleteConfirmation({
        isOpen: false,
        assessmentId: null,
        assessmentTitle: null,
        isDeleting: false
      });
      
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
      // Could add a toast notification here
      alert('Failed to delete assessment. Please try again.');
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Dashboard Error</p>
          </div>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { data } = state;
  if (!data) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>;
      case 'abandoned':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Abandoned</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage: number | null) => {
    if (!percentage) return 'text-gray-500';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Precision Nutrition
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => window.location.href = '/results'}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Latest Results
              </button>
              <button
                onClick={handleStartAssessment}
                disabled={isStartingAssessment}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isStartingAssessment 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isStartingAssessment ? 'Starting...' : 'New Assessment'}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coaching Skills Dashboard
          </h1>
          <p className="text-gray-600">
            Track your progress, view recommendations, and continue your coaching development journey.
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalAssessments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{data.completedAssessments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Latest Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(data.latestScore)}`}>
                  {data.latestScore ? `${data.latestScore.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(data.averageScore)}`}>
                  {data.averageScore ? `${data.averageScore.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Assessment History */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Assessment History</h2>
                  <button
                    onClick={handleStartAssessment}
                    disabled={isStartingAssessment}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      isStartingAssessment 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isStartingAssessment ? 'Starting...' : 'New Assessment'}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {data.assessments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No assessments yet</p>
                    <button
                      onClick={handleStartAssessment}
                      disabled={isStartingAssessment}
                      className={`px-6 py-3 rounded-md transition-colors ${
                        isStartingAssessment 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isStartingAssessment ? 'Starting...' : 'Take Your First Assessment'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.assessments.map((assessment, index) => (
                      <motion.div
                        key={assessment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => assessment.status === 'completed' && handleViewResults(assessment.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {assessment.status === 'completed' ? '🏆' : 
                               assessment.status === 'in_progress' ? '⏳' : '❌'}
                            </span>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {assessment.assessment_type === 'full' ? 'Full Assessment' : 'Domain Assessment'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Started {formatDate(assessment.started_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(assessment.status)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(
                                  assessment.id, 
                                  `${assessment.assessment_type === 'full' ? 'Full Assessment' : 'Domain Assessment'} from ${formatDate(assessment.started_at)}`
                                );
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete assessment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {assessment.status === 'completed' && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm">
                                <span className="text-gray-500">Score: </span>
                                <span className={`font-medium ${getScoreColor(assessment.percentage_score)}`}>
                                  {assessment.total_score}/{assessment.assessment_type === 'full' ? '275' : 'N/A'} 
                                  ({assessment.percentage_score?.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Category: </span>
                                <span className="font-medium text-gray-900">{assessment.score_category}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => window.location.href = '/results'}
                              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              View Results →
                            </button>
                          </div>
                        )}
                        
                        {assessment.status === 'in_progress' && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Progress: {assessment.current_question_index || 0}/55 questions
                            </div>
                            <button
                              onClick={() => window.location.href = `/assessment?id=${assessment.id}`}
                              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              Continue →
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Info */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            
            {/* Progress Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Progress</h3>
              {data.progress.length === 0 ? (
                <p className="text-gray-500 text-sm">Complete an assessment to see your domain progress.</p>
              ) : (
                <div className="space-y-3">
                  {data.progress.slice(0, 6).map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{domain.domain_emoji}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {domain.domain_name}
                        </span>
                      </div>
                      <div className="text-sm font-medium" style={{ color: domain.domain_color }}>
                        {domain.latest_score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
              <RecommendationPlaceholder 
                type="course" 
                title="Personalized Course Recommendations"
                description="AI-powered course recommendations will be available based on your assessment results and learning goals."
              />
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h3>
              {data.achievements.length === 0 ? (
                <p className="text-gray-500 text-sm">Complete assessments to unlock achievements.</p>
              ) : (
                <div className="space-y-3">
                  {data.achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-sm">🏆</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{achievement.achievement_name}</p>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Assessment</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{deleteConfirmation.assessmentTitle}</strong>? 
              This will permanently remove all assessment data, responses, recommendations, and related achievements.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteConfirmation.isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmation.isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {deleteConfirmation.isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Assessment'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
