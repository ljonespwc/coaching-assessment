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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Powered by Precision Nutrition
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl md:text-7xl leading-tight">
            Discover Your <span className="text-blue-600">Coaching Superpowers</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            The same comprehensive assessment framework trusted by Precision Nutrition&apos;s world-class coaching network. 
            Uncover your unique strengths, identify growth opportunities, and unlock your full potential as a nutrition coach.
          </p>
          
          <div className="mt-12">
            <Button 
              variant="primary"
              size="lg" 
              className="px-10 py-5 text-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              onClick={handleStartAssessment}
              disabled={isStartingAssessment}
            >
              {isStartingAssessment ? 'UNLOCKING YOUR PROFILE...' : 'UNLOCK MY COACHING PROFILE'}
            </Button>
            <p className="mt-6 text-base text-gray-500">
              ⏱️ Takes about 15 minutes  •  🔒 Results are private  •  📊 Instant detailed analysis
            </p>
          </div>
        </div>

        {/* Credibility Section */}
        <div className="mt-32 py-16 bg-white rounded-2xl shadow-lg">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by World-Class Coaching Professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This assessment is built on the same framework that has certified over 150,000 nutrition coaches worldwide since 2005.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">150,000+</div>
              <div className="text-gray-600">Certified Coaches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">18+</div>
              <div className="text-gray-600">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Trusted by leading organizations worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-gray-400 font-semibold">Nike</div>
              <div className="text-gray-400 font-semibold">NBA</div>
              <div className="text-gray-400 font-semibold">Women&apos;s Health</div>
              <div className="text-gray-400 font-semibold">Men&apos;s Health</div>
              <div className="text-gray-400 font-semibold">TIME</div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 py-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Path to Coaching Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, science-backed process that reveals your coaching DNA and accelerates your professional growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { 
                step: '1', 
                title: 'Self-Assess', 
                description: 'Reflect on 55 coaching scenarios across 6 core domains',
                benefit: 'Gain deep self-awareness'
              },
              { 
                step: '2', 
                title: 'Rate Skills', 
                description: 'Honestly evaluate your current abilities using our validated scale',
                benefit: 'Identify blind spots'
              },
              { 
                step: '3', 
                title: 'See Your Profile', 
                description: 'Receive your unique coaching strengths visualization',
                benefit: 'Understand your superpower'
              },
              { 
                step: '4', 
                title: 'Track Growth', 
                description: 'Monitor your skill development with retakes over time',
                benefit: 'Measure real progress'
              },
              { 
                step: '5', 
                title: 'Level Up', 
                description: 'Get personalized recommendations for skill enhancement',
                benefit: 'Accelerate your career'
              },
            ].map((item) => (
              <div key={item.step} className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {item.description}
                </p>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {item.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Value Proposition Section */}
        <div className="mt-32 py-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Top Coaches Choose This Assessment
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of elite nutrition coaches who use this assessment to accelerate their careers and transform their coaching practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Identify Your Unique Edge</h3>
              <p className="text-gray-300 text-sm">Discover what makes you different from other coaches in the market</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Accelerate Career Growth</h3>
              <p className="text-gray-300 text-sm">Focus your development where it will have the biggest impact</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Gain Client Confidence</h3>
              <p className="text-gray-300 text-sm">Know exactly where you excel and how to communicate your value</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Stand Out in the Market</h3>
              <p className="text-gray-300 text-sm">Use your assessment results to differentiate your coaching services</p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-5 text-xl font-semibold"
              onClick={handleStartAssessment}
              disabled={isStartingAssessment}
            >
              {isStartingAssessment ? 'UNLOCKING YOUR POTENTIAL...' : 'START YOUR ASSESSMENT NOW'}
            </Button>
            <p className="mt-4 text-gray-400">
              Join 150,000+ coaches who have discovered their coaching superpowers
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
