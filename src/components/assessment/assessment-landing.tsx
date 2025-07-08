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
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800">
              Powered by Precision Nutrition
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl md:text-7xl leading-tight">
            Discover Your <span className="text-blue-600">Nutrition Coaching</span> Potential
          </h1>
          <p className="mt-8 text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Whether you&apos;re exploring coaching as a career, looking to level up your skills, or measuring your certification progress—this assessment reveals exactly where you stand across the core competencies that matter most.
          </p>
          
          <div className="mt-12">
            <Button 
              variant="primary"
              size="lg" 
              className="px-10 py-5 text-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              onClick={handleStartAssessment}
              disabled={isStartingAssessment}
            >
              {isStartingAssessment ? 'STARTING ASSESSMENT...' : 'DISCOVER WHERE I STAND'}
            </Button>
            <p className="mt-6 text-base text-gray-500">
              ⏱️ Takes about 15 minutes  •  🔒 Results are private  •  📊 Instant detailed analysis
            </p>
          </div>
        </div>

        {/* Credibility Section */}
        <div className="mt-32 py-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg text-white">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              The Gold Standard in Nutrition Coaching Assessment
            </h2>
            <p className="text-lg text-orange-100 max-w-3xl mx-auto">
              Built on 18+ years of coaching excellence, this assessment has guided over 150,000 professionals from career exploration to mastery—whether you&apos;re just starting out or advancing your expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">150,000+</div>
              <div className="text-orange-100">Professionals Guided</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">18+</div>
              <div className="text-orange-100">Years Proven</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-orange-100">Countries Worldwide</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-orange-200 mb-4">Trusted by leading organizations worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
              <div className="text-orange-100 font-semibold">Nike</div>
              <div className="text-orange-100 font-semibold">NBA</div>
              <div className="text-orange-100 font-semibold">Women&apos;s Health</div>
              <div className="text-orange-100 font-semibold">Men&apos;s Health</div>
              <div className="text-orange-100 font-semibold">TIME</div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 py-20 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl text-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works for You
            </h2>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              A comprehensive evaluation that meets you where you are—whether you&apos;re exploring the field, growing your practice, or measuring your progress through certification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { 
                step: '1', 
                title: 'Self-Evaluate', 
                description: 'Answer 55 questions about real coaching scenarios and challenges',
                benefit: 'Know where you stand'
              },
              { 
                step: '2', 
                title: 'Rate Yourself', 
                description: 'Honestly assess your confidence across 6 core competency areas',
                benefit: 'Identify your gaps'
              },
              { 
                step: '3', 
                title: 'See Your Results', 
                description: 'Get a detailed breakdown of your strengths and growth areas',
                benefit: 'Understand your profile'
              },
              { 
                step: '4', 
                title: 'Track Progress', 
                description: 'Retake to measure improvement after training or experience',
                benefit: 'See your growth'
              },
              { 
                step: '5', 
                title: 'Take Action', 
                description: 'Use insights to guide career decisions or skill development',
                benefit: 'Make informed choices'
              },
            ].map((item) => (
              <div key={item.step} className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-white text-teal-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {item.description}
                </p>
                <div className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
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
              Perfect for Every Stage of Your Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you&apos;re considering nutrition coaching as a career path, building your existing practice, or validating your certification progress—this assessment provides the clarity you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤔</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Exploring Coaching?</h3>
              <p className="text-gray-300 text-sm">Find out if you have the natural aptitude and interests for nutrition coaching before making a career commitment</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Growing Your Practice?</h3>
              <p className="text-gray-300 text-sm">Identify exactly which skills to focus on for maximum impact on your coaching effectiveness and client results</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Measuring Progress?</h3>
              <p className="text-gray-300 text-sm">Track how your certification or training improved your competencies with before-and-after assessment comparisons</p>
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
              {isStartingAssessment ? 'STARTING ASSESSMENT...' : 'TAKE THE ASSESSMENT'}
            </Button>
            <p className="mt-4 text-gray-400">
              Join 150,000+ professionals who have discovered their path in nutrition coaching
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
