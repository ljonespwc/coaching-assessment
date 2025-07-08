'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import EmailGate from '@/components/auth/email-gate';

export function AssessmentLanding() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);

  const handleStartAssessment = () => {
    if (isStartingAssessment) return; // Prevent double-clicks
    
    if (user) {
      // User is already authenticated, go directly to assessment
      setIsStartingAssessment(true);
      router.push('/assessment');
    } else {
      // Show email collection
      setShowEmailGate(true);
    }
  };

  const handleEmailGateBack = () => {
    setShowEmailGate(false);
  };

  // Show email gate if requested
  if (showEmailGate) {
    return (
      <EmailGate 
        onBack={handleEmailGateBack}
      />
    );
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Home
              </button>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/results')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Latest Results
                </button>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Tell us about your coaching skills
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Coaching is a complex role. A good coach develops their skills in many areas.
            This assessment will help you understand your strengths and identify areas for growth.
          </p>
          
          <div className="mt-10">
            <Button 
              variant="primary"
              size="lg" 
              className="px-8 py-4 text-lg font-semibold"
              onClick={handleStartAssessment}
              disabled={isStartingAssessment}
            >
              {isStartingAssessment ? 'STARTING...' : 'START ASSESSMENT'}
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              Takes about 15 minutes
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: '1', title: 'Take Quiz', description: 'Answer 55 questions about your coaching approach' },
              { step: '2', title: 'Rate Yourself', description: 'Use a 1-5 scale to assess your skills' },
              { step: '3', title: 'Get Results', description: 'See your personalized skill profile' },
              { step: '4', title: 'See Progress', description: 'Track your development over time' },
              { step: '5', title: 'Take Action', description: 'Get targeted recommendations' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Details */}
        <div className="mt-24 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            How to complete this assessment
          </h2>
          <div className="space-y-4 text-lg text-gray-700">
            <div className="flex items-start">
              <span className="text-blue-600 mr-3">•</span>
              <span>55 questions across 6 skill domains</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-3">•</span>
              <span>Rate yourself 1-5 on each statement</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-3">•</span>
              <span>Progress saved automatically</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-3">•</span>
              <span>Get personalized recommendations</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleStartAssessment}
              disabled={isStartingAssessment}
            >
              {isStartingAssessment ? 'STARTING...' : 'BEGIN ASSESSMENT'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
