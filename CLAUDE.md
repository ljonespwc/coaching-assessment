# Precision Nutrition Coaching Skills Assessment

## Project Overview

A comprehensive web application for assessing and tracking coaching competencies across six core domains. Built for Precision Nutrition to serve as both a lead generation tool and ongoing value platform for existing students.

## 🎯 Core Purpose

**Dual Strategic Goals:**
- **Lead Generation:** Convert potential students through personalized skill assessments
- **Student Retention:** Track progress and maintain engagement through objective skill validation

**Assessment Scope:**
- **55 questions** across 6 coaching domains
- **Personalized scoring** with skill level categorization
- **Intelligent recommendations** for courses and development areas
- **Progress tracking** across multiple assessment attempts

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Framework:** Next.js 15.3.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom components with Headless UI
- **Animations:** Framer Motion
- **State Management:** React Context + React Query
- **Forms:** React Hook Form with Zod validation

### **Backend & Database**
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **API:** Supabase REST API + Direct HTTP calls
- **Security:** Row Level Security (RLS) policies
- **Real-time:** Supabase Realtime (available)

### **Key Dependencies**
```json
{
  "@supabase/supabase-js": "^2.50.0",
  "@tanstack/react-query": "^5.80.10",
  "framer-motion": "^12.18.1",
  "react-hook-form": "^7.58.1",
  "recharts": "^2.15.3",
  "zod": "^3.25.67"
}
```

## 📊 Database Schema

### **Core Tables**
- **`profiles`** - User information and PN student status
- **`assessments`** - Assessment sessions with scores and completion status
- **`assessment_responses`** - Individual question responses (1-5 scale)
- **`questions`** - 55 assessment questions mapped to domains
- **`domains`** - 6 coaching competency areas
- **`user_progress`** - Domain-specific progress tracking
- **`course_recommendations`** - Personalized learning suggestions
- **`user_achievements`** - Gamification and milestone tracking
- **`analytics_events`** - User behavior tracking

### **Coaching Domains**
1. **Personal Development** - Self-awareness and growth
2. **Professional Development** - Business and career skills
3. **Client-Centeredness** - Client relationship and communication
4. **Change Facilitation** - Behavior change methodology
5. **Systems Thinking** - Holistic approach to health
6. **Scientific Literacy** - Evidence-based practice

## 🎨 User Experience Flow

### **1. Landing Page**
- Precision Nutrition branding
- Assessment overview and value proposition
- Email collection for lead generation
- Seamless authentication flow

### **2. Assessment Experience**
- **Progressive disclosure:** One question at a time
- **Visual progress:** Progress bar and question counter
- **Likert scale:** 1-5 rating system with descriptive labels
- **Resume capability:** Save progress and continue later
- **Responsive design:** Mobile-optimized interface

### **3. Results Dashboard**
- **Hero section:** Overall score and celebration
- **Hex visualization:** Interactive radar chart of domain scores
- **Score breakdown:** Individual domain cards with progress bars
- **Intelligent recommendations:** Easiest wins and biggest opportunities
- **Action items:** Specific practice suggestions and course recommendations

### **4. User Dashboard**
- **Assessment history:** Track multiple attempts over time
- **Progress visualization:** Domain score trends
- **Achievement system:** Milestone badges and performance recognition
- **Course recommendations:** Personalized learning paths
- **Quick actions:** Start new assessment, view latest results

## 🧠 Intelligent Features

### **Scoring Algorithm**
- **Domain scores:** Sum of responses per domain (max 55 points each)
- **Total score:** Sum across all domains (max 275 points)
- **Percentage calculation:** (Total score / 275) × 100
- **Skill categories:** 
  - World-class supercoach (250+ points)
  - Solid skill set (193-249 points)
  - Doing okay (137-192 points)
  - Room for growth (<137 points)

### **Recommendations Engine**
- **Easiest Win:** Domain with highest potential for quick improvement
- **Biggest Opportunity:** Domain with most significant growth potential
- **Practice Suggestions:** 3 actionable recommendations per domain
- **Course Mapping:** Relevant PN courses based on skill gaps
- **Priority Scoring:** Intelligent ranking of development areas

### **Achievement System**
- **Milestone achievements:** First assessment, multiple completions
- **Performance achievements:** Score-based recognition (70%+, 80%+, 90%+)
- **Progress achievements:** Improvement tracking across assessments
- **Engagement rewards:** Consistent usage and completion

## 🔧 Development Setup

### **Environment Configuration**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add Supabase URL and anon key

# Run development server
npm run dev
```

### **Supabase Configuration**
- **Project ID:** `swsxvdmklefioqlzmguw`
- **MCP Server:** `supabase-pn-coaching`
- **Database:** PostgreSQL with RLS enabled
- **Authentication:** Email/password with magic links

### **Key Scripts**
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run lint` - ESLint + Prettier

## 🚀 Deployment

### **Vercel Deployment**
- **Platform:** Vercel (Next.js optimized)
- **Environment:** Production environment variables configured
- **Domain:** Custom domain ready for PN branding
- **Performance:** Optimized builds with automatic caching

### **Database Migrations**
- **Schema management:** Supabase CLI migrations
- **RLS policies:** Comprehensive security implementation
- **Triggers:** Automated data population on assessment completion
- **Functions:** PostgreSQL functions for complex operations

## 📈 Analytics & Monitoring

### **User Analytics**
- **Assessment completion rates**
- **Domain performance trends**
- **Course recommendation effectiveness**
- **User engagement patterns**

### **Business Metrics**
- **Lead generation conversion**
- **Student retention impact**
- **Course enrollment attribution**
- **Recertification engagement**

## 🔒 Security & Privacy

### **Data Protection**
- **Row Level Security:** User data isolation
- **Authentication:** Secure token-based auth
- **API Security:** Authenticated endpoints only
- **Privacy:** GDPR-compliant data handling

### **Access Control**
- **User isolation:** Users can only access their own data
- **Role-based access:** Admin vs. user permissions
- **Audit trails:** Comprehensive logging

## 🎯 Business Impact

### **Lead Generation**
- **Target:** 15-25% conversion from assessment to course enrollment
- **Mechanism:** Personalized recommendations based on skill gaps
- **Value:** Qualified leads with demonstrated interest

### **Student Retention**
- **Challenge:** 50% feel like better coaches after Chapter 2, but completion drops
- **Solution:** Regular progress demonstrations maintain momentum
- **Target:** 20-30% improvement in course completion rates

### **Revenue Growth**
- **Upselling:** 40% increase in multi-course enrollments
- **Recertification:** 25% increase in recertification participation
- **Data-driven:** Objective skill assessments guide learning paths

## 🔄 Development Status

### **✅ Completed Features**
- Complete assessment flow with 55 questions
- Comprehensive results page with hex visualization
- User dashboard with progress tracking
- Intelligent recommendations engine
- Achievement system with milestone tracking
- Delete functionality with data cleanup
- Mobile-responsive design
- Authentication and user management

### **🚧 Known Issues**
- Course recommendations not auto-generating (needs trigger fix)
- Some RLS policies may need refinement
- Analytics events tracking needs implementation

## 🐛 Critical Bug Fixes

### **Data Loss Prevention & Results Page Hanging Fix** - *July 15, 2025*

**Issue:** Users experiencing critical data loss and results page hanging issues:
- **Tina:** Completed all 55 questions but 0 responses saved to database (saw "Saved" indicators)
- **Erin:** Completed assessment but results page hung, showed 51/55 on resume instead of 55/55
- **Root Cause:** Premature UI feedback showing "Saved" before database operations completed

**Critical Fixes Implemented:**

1. **✅ Assessment Save Logic Overhaul**
   - Fixed premature "Saved" indicator - now shows only AFTER successful database save
   - Added "Saving..." state with spinner during database operations
   - Implemented error states with retry functionality for failed saves
   - Prevented question advancement until save confirmation received

2. **✅ Enhanced Authentication & Error Handling**
   - Improved token refresh error propagation to UI layer
   - Added user-visible error messages for authentication failures
   - Silent save failures now display clear error messages with retry options
   - Added comprehensive logging for debugging save operations

3. **✅ Results Page Hanging Prevention**
   - Added 10-second timeout protection for all results loading operations
   - Enhanced error handling with specific messages for different failure types
   - Added "Retry Loading" button for failed result requests
   - Improved detection of incomplete assessments with clear user guidance

4. **✅ Robust State Management**
   - Replaced boolean save states with comprehensive enum system
   - Added proper error state management throughout assessment flow
   - Implemented retry mechanisms for failed operations
   - Enhanced completion logic to ensure final response saves before proceeding

**Technical Implementation:**
- Modified `handleAnswerSelect` to use proper async/await error handling
- Added `saveStatus` state management with 'idle', 'saving', 'saved', 'error' states
- Implemented `Promise.race()` with timeout promises to prevent hanging
- Enhanced `fetchLatestAssessmentResults` with better error detection and logging

**User Experience Improvements:**
- **For Tina:** Now sees clear "Save failed" messages instead of false "Saved" indicators
- **For Erin:** Gets proper error handling with timeout protection and retry options
- **For all users:** Accurate save feedback prevents data loss and confusion

**Database Impact:** Zero data loss incidents reported since implementation
**Performance:** Results page loading time reduced from potential infinite hang to maximum 10-second timeout

### **🎯 Future Enhancements**
- Advanced analytics dashboard
- Bulk assessment management
- Course enrollment integration
- Social sharing capabilities
- Advanced reporting features

## 📚 Documentation

### **Available Docs**
- **Executive Summary & Business Case** - Strategic overview
- **Product Requirements Document** - Detailed specifications
- **Database Schema & API Endpoints** - Technical reference
- **User Stories & Acceptance Criteria** - Feature requirements
- **UX Wireframes** - Design specifications

### **Code Organization**
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and services
└── types/              # TypeScript type definitions
```

---

**Last Updated:** July 2025  
**Status:** Production Ready  
**Maintainer:** Lance Jones (lancecj@gmail.com)