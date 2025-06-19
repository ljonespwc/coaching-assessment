# Coaching Skills Assessment - Product Requirements Document

## 1. Product Overview

### 1.1 Product Vision
Build a comprehensive coaching skills assessment tool that evaluates coaches across 6 core competency domains, provides personalized feedback, and drives course enrollment for Precision Nutrition's educational programs.

### 1.2 Product Goals
- **Primary:** Generate qualified leads and convert them to course enrollments
- **Secondary:** Improve student retention and course completion rates
- **Tertiary:** Create data-driven marketing assets and social proof

### 1.3 Success Metrics
- **Assessment completion rate:** 75% (start to finish)
- **Assessment-to-enrollment conversion:** 18%
- **Course completion improvement:** 25% increase for users who take assessments
- **User satisfaction:** 4.5/5 rating for assessment experience

## 2. User Personas & Use Cases

### 2.1 Primary Users

**Persona 1: Aspiring Coach (Lead Generation Target)**
- New to coaching, seeking validation of skills
- Researching education options
- Needs: Objective skill assessment, clear development path

**Persona 2: Current PN Student**
- Already enrolled in PN courses
- Wants to track progress and stay motivated
- Needs: Progress visualization, next course recommendations

**Persona 3: Experienced Coach (Upsell Target)**
- Has some coaching experience
- Looking to formalize skills or advance career
- Needs: Advanced skill validation, specialized course recommendations

### 2.2 User Journey Map

**New User Flow:**
1. Discovers assessment through marketing/referral
2. Takes initial 55-question assessment (15-20 minutes)
3. Receives personalized results with course recommendations
4. Converts to course enrollment or saves results for later

**Returning User Flow:**
1. Logs into dashboard
2. Takes targeted skill assessments at course milestones
3. Views progress over time
4. Receives recommendations for next courses

## 3. Core Features & Requirements

### 3.1 Assessment Engine (Priority: P0)

**3.1.1 Question Framework**
- **Total Questions:** 55 across 6 domains
- **Question Types:** 5-point Likert scale (1 = strongly disagree, 5 = strongly agree)
- **Domain Breakdown:**
  - Personal Development: 10 questions (max 50 points)
  - Professional Development: 9 questions (max 45 points)
  - Client-Centeredness: 10 questions (max 50 points)
  - Change Facilitation: 10 questions (max 50 points)
  - Systems Thinking: 8 questions (max 40 points)
  - Scientific Literacy: 8 questions (max 40 points)
- **Total Possible Score:** 275 points

**3.1.2 Scoring Logic**
- Real-time score calculation as user progresses
- Domain-level scoring with individual breakdowns
- Overall coaching competency score
- Progress saving for incomplete assessments

**3.1.3 Assessment Types**
- **Full Assessment:** Complete 55-question evaluation
- **Domain Assessment:** Focus on specific skill area (8-10 questions)
- **Progress Assessment:** Retake subset of questions to track improvement

### 3.2 Results Visualization (Priority: P0)

**3.2.1 PN Hex Visual Display**
- Hexagonal radar chart showing 6 domain scores
- Interactive hover states with domain details
- Visual indicators for strength/improvement areas
- Responsive design for mobile/tablet/desktop

**3.2.2 Score Interpretation**
- **250+ points:** "World-class supercoach"
- **193-249 points:** "Solid skill set"
- **137-192 points:** "Doing okay"
- **<137 points:** "Room for growth"

**3.2.3 Personalized Recommendations**
- Domain-specific improvement suggestions
- 3 actionable practices per domain
- Direct links to relevant PN courses/resources
- Priority recommendations based on "easiest wins" and "biggest opportunities"

### 3.3 Course Recommendation Engine (Priority: P0)

**3.3.1 Recommendation Logic**
- Map domain weaknesses to specific PN courses
- Prioritize recommendations based on user score gaps
- Consider user's existing enrollments/completions
- Support for both certification and specialized course recommendations

**3.3.2 Course Mapping**
- **All Domains:** Level 1 Nutrition, Level 1 SSR, Level 2 Master Health
- **Personal Development:** Coaching Business Kickstarter, Change Psychology
- **Professional Development:** Coaching Business Kickstarter, PN Academy
- **Client-Centeredness:** Change Psychology, Athlete Nutrition
- **Change Facilitation:** Change Psychology, Coaching Dietary Strategies
- **Systems Thinking:** Nutrition for Metabolic Health, Athlete Nutrition
- **Scientific Literacy:** Nutrition for Metabolic Health, Coaching Dietary Strategies

### 3.4 Progress Tracking & History (Priority: P1)

**3.4.1 Historical Assessments**
- Store all assessment attempts with timestamps
- Display progress over time with trend visualization
- Compare scores before/after course completion
- Export capability for personal records

**3.4.2 Milestone Integration**
- Trigger assessments at specific course chapters
- **Full Assessments:** Post-Chapter 1, Post-Chapter 20
- **Targeted Assessments:** Chapters 3, 5, 8, 11, 14, 17
- Celebration animations for skill improvements

### 3.5 User Dashboard Integration (Priority: P1)

**3.5.1 Dashboard Components**
- Assessment results widget with latest scores
- Progress tracking charts
- Recommended actions/next steps
- Quick access to retake assessments

**3.5.2 Platform Integration**
- Integrate with existing PN user accounts
- Display alongside recertification and credentials sections
- Link to course enrollment pages
- Sync with course progress data

## 4. Technical Requirements

### 4.1 Technology Stack
- **Frontend:** React, Next.js, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Hosting:** Vercel (or similar)

### 4.2 Database Schema Requirements

**4.2.1 Core Tables**
```sql
assessments (
  id, user_id, assessment_type, status, started_at, completed_at, total_score
)

assessment_responses (
  id, assessment_id, question_id, domain, response_value, created_at
)

questions (
  id, domain, question_text, order_index, active
)

user_progress (
  id, user_id, domain, latest_score, previous_score, improvement_percentage
)

course_recommendations (
  id, user_id, course_name, priority_level, recommended_at, clicked_at
)
```

**4.2.2 Data Relationships**
- Users (1:many) Assessments
- Assessments (1:many) Assessment Responses
- Users (1:many) Course Recommendations
- Track assessment history and progress over time

### 4.3 Performance Requirements
- **Page Load Time:** <3 seconds for assessment start
- **Question Navigation:** <500ms response time
- **Results Generation:** <2 seconds for score calculation
- **Mobile Responsive:** Support for iOS/Android browsers
- **Offline Capability:** Save partial progress locally

### 4.4 Security & Privacy
- Secure user authentication via Supabase
- GDPR compliance for user data
- Assessment data encryption at rest
- User consent for data usage in aggregate marketing

## 5. User Experience Requirements

### 5.1 Assessment Flow UX

**5.1.1 Pre-Assessment**
- Clear explanation of assessment purpose and time commitment
- Progress indicator showing 6 domains and question count
- Option to save progress and return later
- Mobile-optimized question layout

**5.1.2 During Assessment**
- Progress bar with domain transitions
- Question numbering (e.g., "Question 15 of 55")
- Previous/next navigation with confirmation
- Auto-save functionality every 5 questions

**5.1.3 Post-Assessment**
- Immediate results display with congratulatory messaging
- Social sharing options for results
- Clear call-to-action for next steps
- Email capture for non-authenticated users

### 5.2 Results Page UX

**5.2.1 Visual Hierarchy**
- Overall score prominently displayed
- PN Hex visualization as primary focal point
- Domain cards with expand/collapse functionality
- Progressive disclosure of detailed recommendations

**5.2.2 Actionability**
- Clear "What's Next?" section with specific actions
- One-click enrollment links for recommended courses
- Bookmark functionality for resources
- Print/PDF export of results

### 5.3 Mobile Experience
- Touch-friendly rating interface
- Optimized hex visualization for small screens
- Simplified navigation between sections
- Fast loading with minimal data usage

## 6. Integration Requirements

### 6.1 PN Platform Integration
- Single sign-on with existing PN accounts
- Course enrollment tracking and correlation
- Student progress data access
- Marketing automation triggers

### 6.2 Analytics & Tracking
- Google Analytics event tracking for assessment completion
- Conversion tracking for course enrollments
- A/B testing capability for recommendation algorithms
- Performance monitoring and error tracking

### 6.3 Marketing Tools
- Email integration for lead nurturing sequences
- CRM data sync for sales team follow-up
- Social media sharing with branded graphics
- Lead scoring based on assessment results

## 7. Content Management

### 7.1 Question Management
- Admin interface for editing questions
- Version control for assessment changes
- A/B testing different question sets
- Analytics on question completion rates

### 7.2 Course Recommendation Updates
- Dynamic course catalog integration
- Seasonal promotion incorporation
- Recommendation algorithm tuning
- Performance tracking for different recommendation strategies

## 8. Launch Strategy & Phases

### 8.1 Phase 1: MVP (P0 Features)
- Basic 55-question assessment
- PN Hex results visualization
- Static course recommendations
- Basic progress tracking

### 8.2 Phase 2: Enhanced Features (P1 Features)
- Full dashboard integration
- Historical progress tracking
- Dynamic recommendations
- Course milestone assessments

### 8.3 Phase 3: Advanced Analytics (P2 Features)
- Predictive modeling for course success
- Advanced reporting for marketing team
- Cohort analysis and benchmarking
- Social features and community integration

## 9. Acceptance Criteria

### 9.1 Functional Requirements
- [ ] User can complete 55-question assessment in single session
- [ ] System calculates accurate domain and total scores
- [ ] Results page displays PN Hex visualization correctly
- [ ] Course recommendations match user's score profile
- [ ] User can retake assessments and view progress over time
- [ ] Assessment integrates with existing PN user accounts

### 9.2 Technical Requirements
- [ ] Application loads in <3 seconds on 3G connection
- [ ] Assessment works on mobile devices (iOS Safari, Android Chrome)
- [ ] Data persists correctly in Supabase database
- [ ] User authentication works seamlessly with PN platform
- [ ] Assessment progress saves automatically every 5 questions

### 9.3 Business Requirements
- [ ] Assessment captures leads with email/contact information
- [ ] Course recommendation clicks track to conversion attribution
- [ ] Results shareable on social media with proper branding
- [ ] Admin can update questions and course mappings
- [ ] Analytics track key success metrics (completion rate, conversion rate)

## 10. Risk Mitigation

### 10.1 Technical Risks
- **Risk:** Assessment too long/complex for users
- **Mitigation:** Progress saving, mobile optimization, clear time expectations

### 10.2 Business Risks
- **Risk:** Low conversion from assessment to course enrollment
- **Mitigation:** A/B testing of recommendations, follow-up email sequences

### 10.3 User Experience Risks
- **Risk:** Results feel generic or unhelpful
- **Mitigation:** Personalized recommendations, specific actionable advice, course mapping validation

## 11. Future Enhancements

### 11.1 Advanced Features (Future Releases)
- AI-powered personalized learning paths
- Peer comparison and benchmarking
- Coach marketplace integration with skill profiles
- Advanced analytics dashboard for PN team
- Integration with third-party coaching tools

### 11.2 Monetization Opportunities
- Premium assessment features
- Coach certification based on assessment scores
- White-label assessment for other organizations
- Data insights as a service for coaching industry