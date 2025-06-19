# Coaching Skills Assessment - Database Schema & API Endpoints

## 1. Database Schema (Supabase/PostgreSQL)

### 1.1 Core Tables

#### Users Table (Supabase Auth)
```sql
-- Users table is managed by Supabase Auth
-- We'll reference auth.users.id in our custom tables
-- Additional user profile data stored in profiles table

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_pn_student BOOLEAN DEFAULT FALSE,
  current_courses JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Domains Table
```sql
CREATE TABLE domains (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  max_score INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  color_hex TEXT DEFAULT '#6B7280',
  icon_emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default domains
INSERT INTO domains (name, slug, description, max_score, display_order, color_hex, icon_emoji) VALUES
('Personal Development', 'personal-development', 'Key underlying skills that help you get better at everything else', 50, 1, '#EF4444', '🎯'),
('Professional Development', 'professional-development', 'Skills for building and running a thriving coaching business', 45, 2, '#F59E0B', '💼'),
('Client-Centeredness', 'client-centeredness', 'Most important skills for actual coaching and building rapport', 50, 3, '#10B981', '❤️'),
('Change Facilitation', 'change-facilitation', 'Skills for helping people change in their real, messy lives', 50, 4, '#3B82F6', '🔄'),
('Systems Thinking', 'systems-thinking', 'Understanding clients as complex systems with multiple influences', 40, 5, '#8B5CF6', '🧠'),
('Scientific Literacy', 'scientific-literacy', 'Ability to understand, interpret, and convey complex information', 40, 6, '#06B6D4', '🔬');
```

#### Questions Table
```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  domain_id INTEGER REFERENCES domains(id) NOT NULL,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index for ordering within domains
CREATE UNIQUE INDEX questions_domain_order_idx ON questions(domain_id, question_order) WHERE is_active = TRUE;
```

#### Assessments Table
```sql
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('full', 'domain', 'progress')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  target_domain_id INTEGER REFERENCES domains(id), -- NULL for full assessments
  total_score INTEGER,
  percentage_score NUMERIC(5,2),
  score_category TEXT, -- 'world-class', 'solid', 'doing-okay', 'room-for-growth'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  context JSONB DEFAULT '{}', -- metadata like course_chapter, milestone, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX assessments_user_id_idx ON assessments(user_id);
CREATE INDEX assessments_status_idx ON assessments(status);
CREATE INDEX assessments_completed_at_idx ON assessments(completed_at) WHERE completed_at IS NOT NULL;
```

#### Assessment Responses Table
```sql
CREATE TABLE assessment_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  question_id INTEGER REFERENCES questions(id) NOT NULL,
  domain_id INTEGER REFERENCES domains(id) NOT NULL,
  response_value INTEGER NOT NULL CHECK (response_value BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint to prevent duplicate responses
CREATE UNIQUE INDEX assessment_responses_unique_idx ON assessment_responses(assessment_id, question_id);

-- Indexes for performance
CREATE INDEX assessment_responses_assessment_id_idx ON assessment_responses(assessment_id);
CREATE INDEX assessment_responses_domain_id_idx ON assessment_responses(domain_id);
```

#### User Progress Table
```sql
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  domain_id INTEGER REFERENCES domains(id) NOT NULL,
  latest_score INTEGER NOT NULL,
  latest_assessment_id UUID REFERENCES assessments(id) NOT NULL,
  previous_score INTEGER,
  previous_assessment_id UUID REFERENCES assessments(id),
  improvement_points INTEGER GENERATED ALWAYS AS (latest_score - COALESCE(previous_score, 0)) STORED,
  improvement_percentage NUMERIC(5,2),
  best_score INTEGER NOT NULL,
  assessment_count INTEGER DEFAULT 1,
  first_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for user-domain combinations
CREATE UNIQUE INDEX user_progress_user_domain_idx ON user_progress(user_id, domain_id);
```

### 1.2 Course & Recommendation Tables

#### Courses Table
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('certification', 'specialized', 'series')),
  description TEXT,
  primary_domains INTEGER[] DEFAULT '{}', -- Array of domain IDs this course primarily addresses
  secondary_domains INTEGER[] DEFAULT '{}', -- Array of domain IDs this course secondarily addresses
  enrollment_url TEXT,
  learn_more_url TEXT,
  price_usd INTEGER, -- Price in cents
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default courses
INSERT INTO courses (name, slug, type, description, primary_domains, secondary_domains, enrollment_url) VALUES
('Level 1 Nutrition Coaching Certification', 'l1-nutrition', 'certification', 'Comprehensive nutrition coaching certification', '{1,2,3,4,5,6}', '{}', '/courses/l1-nutrition'),
('Level 1 Sleep, Stress & Recovery Coaching', 'l1-ssr', 'certification', 'Sleep, stress management, and recovery coaching', '{1,2,3,4,5,6}', '{}', '/courses/l1-ssr'),
('Level 2 Master Health Coaching', 'l2-master', 'certification', 'Advanced health coaching certification', '{1,2,3,4,5,6}', '{}', '/courses/l2-master'),
('Coaching Business Kickstarter', 'business-kickstarter', 'specialized', 'Build and grow your coaching business', '{1,2}', '{3,4}', '/courses/business-kickstarter'),
('Change Psychology Course Series', 'change-psychology', 'series', 'Deep dive into psychology of behavior change', '{3,4}', '{1,5}', '/courses/change-psychology');
```

#### Course Recommendations Table
```sql
CREATE TABLE course_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  assessment_id UUID REFERENCES assessments(id) NOT NULL,
  course_id INTEGER REFERENCES courses(id) NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('easiest_win', 'biggest_opportunity', 'primary', 'secondary')),
  priority_score NUMERIC(5,2) NOT NULL, -- 0-100 score for recommendation strength
  reason TEXT, -- Why this course was recommended
  target_domains INTEGER[] DEFAULT '{}', -- Which domains this rec addresses
  clicked_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX course_recommendations_user_id_idx ON course_recommendations(user_id);
CREATE INDEX course_recommendations_assessment_id_idx ON course_recommendations(assessment_id);
```

### 1.3 Achievements & Analytics Tables

#### User Achievements Table
```sql
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  requirements JSONB NOT NULL, -- What was needed to unlock this
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_assessment_id UUID REFERENCES assessments(id),
  metadata JSONB DEFAULT '{}'
);

-- Define common achievements
INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, requirements) 
SELECT auth.uid(), 'milestone', 'First Assessment', 'Completed your first coaching skills assessment', '{"assessments_completed": 1}'
WHERE FALSE; -- This is a template, actual achievements created via triggers
```

#### Analytics Events Table
```sql
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX analytics_events_timestamp_idx ON analytics_events(timestamp);
```

### 1.4 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Assessments policies
CREATE POLICY "Users can view own assessments" ON assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assessments" ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON assessments FOR UPDATE USING (auth.uid() = user_id);

-- Assessment responses policies
CREATE POLICY "Users can view own responses" ON assessment_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create own responses" ON assessment_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own responses" ON assessment_responses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND user_id = auth.uid())
);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert progress" ON user_progress FOR INSERT WITH CHECK (TRUE); -- Handled by functions

-- Course recommendations policies
CREATE POLICY "Users can view own recommendations" ON course_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON course_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Read-only tables (domains, questions, courses) - public read access
CREATE POLICY "Anyone can read domains" ON domains FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can read active questions" ON questions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Anyone can read active courses" ON courses FOR SELECT USING (is_active = TRUE);
```

### 1.5 Database Functions

#### Function to Calculate Assessment Score
```sql
CREATE OR REPLACE FUNCTION calculate_assessment_score(assessment_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_score INTEGER;
  max_possible_score INTEGER;
  percentage NUMERIC(5,2);
  category TEXT;
BEGIN
  -- Calculate total score
  SELECT SUM(response_value) INTO total_score
  FROM assessment_responses 
  WHERE assessment_id = assessment_uuid;
  
  -- Get max possible score (275 for full assessment)
  SELECT SUM(d.max_score) INTO max_possible_score
  FROM domains d
  JOIN assessment_responses ar ON ar.domain_id = d.id
  WHERE ar.assessment_id = assessment_uuid
  GROUP BY ar.assessment_id;
  
  -- Calculate percentage
  percentage := (total_score::NUMERIC / max_possible_score) * 100;
  
  -- Determine category
  CASE 
    WHEN total_score >= 250 THEN category := 'world-class';
    WHEN total_score >= 193 THEN category := 'solid';
    WHEN total_score >= 137 THEN category := 'doing-okay';
    ELSE category := 'room-for-growth';
  END CASE;
  
  -- Update assessment
  UPDATE assessments 
  SET 
    total_score = total_score,
    percentage_score = percentage,
    score_category = category,
    completed_at = NOW(),
    status = 'completed'
  WHERE id = assessment_uuid;
END;
$$ LANGUAGE plpgsql;
```

#### Function to Update User Progress
```sql
CREATE OR REPLACE FUNCTION update_user_progress(user_uuid UUID, assessment_uuid UUID)
RETURNS VOID AS $$
DECLARE
  domain_record RECORD;
  current_score INTEGER;
  prev_score INTEGER;
  prev_assessment UUID;
BEGIN
  -- Loop through each domain
  FOR domain_record IN 
    SELECT DISTINCT domain_id FROM assessment_responses WHERE assessment_id = assessment_uuid
  LOOP
    -- Calculate current domain score
    SELECT SUM(response_value) INTO current_score
    FROM assessment_responses 
    WHERE assessment_id = assessment_uuid AND domain_id = domain_record.domain_id;
    
    -- Get previous score and assessment
    SELECT latest_score, latest_assessment_id INTO prev_score, prev_assessment
    FROM user_progress 
    WHERE user_id = user_uuid AND domain_id = domain_record.domain_id;
    
    -- Insert or update progress
    INSERT INTO user_progress (
      user_id, domain_id, latest_score, latest_assessment_id, 
      previous_score, previous_assessment_id, assessment_count,
      best_score, last_assessment_date
    ) VALUES (
      user_uuid, domain_record.domain_id, current_score, assessment_uuid,
      prev_score, prev_assessment, 1,
      current_score, NOW()
    )
    ON CONFLICT (user_id, domain_id) DO UPDATE SET
      previous_score = user_progress.latest_score,
      previous_assessment_id = user_progress.latest_assessment_id,
      latest_score = current_score,
      latest_assessment_id = assessment_uuid,
      assessment_count = user_progress.assessment_count + 1,
      best_score = GREATEST(user_progress.best_score, current_score),
      last_assessment_date = NOW(),
      improvement_percentage = CASE 
        WHEN user_progress.previous_score > 0 
        THEN ((current_score - user_progress.previous_score)::NUMERIC / user_progress.previous_score) * 100
        ELSE 0
      END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 2. API Endpoints (Next.js API Routes)

### 2.1 Assessment Management

#### POST /api/assessments/start
```typescript
// Request
interface StartAssessmentRequest {
  type: 'full' | 'domain' | 'progress';
  targetDomainId?: number;
  context?: {
    courseChapter?: number;
    milestone?: string;
  };
}

// Response
interface StartAssessmentResponse {
  assessmentId: string;
  questions: Array<{
    id: number;
    text: string;
    domain: string;
    order: number;
  }>;
  totalQuestions: number;
}
```

#### POST /api/assessments/:id/responses
```typescript
// Request
interface SaveResponseRequest {
  questionId: number;
  domainId: number;
  responseValue: number; // 1-5
}

// Response
interface SaveResponseResponse {
  success: boolean;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}
```

#### POST /api/assessments/:id/complete
```typescript
// Request - No body needed

// Response
interface CompleteAssessmentResponse {
  assessmentId: string;
  totalScore: number;
  percentageScore: number;
  scoreCategory: string;
  domainScores: Array<{
    domainId: number;
    domainName: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  recommendations: {
    easiestWin: DomainRecommendation;
    biggestOpportunity: DomainRecommendation;
  };
  courseRecommendations: CourseRecommendation[];
}
```

### 2.2 Results & Progress

#### GET /api/assessments/:id/results
```typescript
// Response
interface AssessmentResultsResponse {
  assessment: {
    id: string;
    totalScore: number;
    scoreCategory: string;
    completedAt: string;
  };
  domainScores: DomainScore[];
  hexChartData: HexChartData;
  recommendations: {
    easiestWin: DomainRecommendation;
    biggestOpportunity: DomainRecommendation;
    practices: Array<{
      domainId: number;
      practices: string[];
    }>;
  };
  courseRecommendations: CourseRecommendation[];
}
```

#### GET /api/user/progress
```typescript
// Response
interface UserProgressResponse {
  overallProgress: {
    firstAssessment: string;
    latestAssessment: string;
    totalAssessments: number;
    overallImprovement: number;
  };
  domainProgress: Array<{
    domainId: number;
    domainName: string;
    currentScore: number;
    previousScore: number;
    bestScore: number;
    improvementPercentage: number;
    assessmentHistory: Array<{
      assessmentId: string;
      score: number;
      date: string;
    }>;
  }>;
  achievements: Achievement[];
}
```

### 2.3 Course Recommendations

#### GET /api/recommendations/:assessmentId
```typescript
// Response
interface RecommendationsResponse {
  courseRecommendations: Array<{
    courseId: number;
    courseName: string;
    courseType: string;
    description: string;
    recommendationType: 'easiest_win' | 'biggest_opportunity' | 'primary' | 'secondary';
    priorityScore: number;
    reason: string;
    targetDomains: string[];
    enrollmentUrl: string;
    learnMoreUrl: string;
  }>;
  practiceRecommendations: Array<{
    domainId: number;
    domainName: string;
    practices: Array<{
      title: string;
      description: string;
      resourceUrl?: string;
    }>;
  }>;
}
```

#### POST /api/recommendations/:id/click
```typescript
// Request
interface TrackRecommendationClickRequest {
  courseId: number;
  actionType: 'enroll' | 'learn_more' | 'bookmark';
}

// Response
interface TrackRecommendationClickResponse {
  success: boolean;
  redirectUrl?: string;
}
```

### 2.4 Dashboard Integration

#### GET /api/user/dashboard
```typescript
// Response
interface DashboardResponse {
  user: {
    id: string;
    name: string;
    isPnStudent: boolean;
    currentCourses: string[];
  };
  latestAssessment?: {
    id: string;
    totalScore: number;
    scoreCategory: string;
    completedAt: string;
    hexChartData: HexChartData;
  };
  recommendedActions: Array<{
    type: 'assessment' | 'course' | 'practice';
    title: string;
    description: string;
    actionUrl: string;
  }>;
  achievements: Array<{
    name: string;
    description: string;
    unlockedAt: string;
  }>;
}
```

### 2.5 Analytics & Tracking

#### POST /api/analytics/track
```typescript
// Request
interface TrackEventRequest {
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
  sessionId?: string;
}

// Response
interface TrackEventResponse {
  success: boolean;
}
```

---

## 3. Supabase Client Configuration

### 3.1 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3.2 Supabase Client Setup
```typescript
// lib/supabase.ts
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => createClientComponentClient()

export const createServerClient = () => createServerComponentClient({ cookies })

// Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          is_pn_student: boolean;
          current_courses: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_pn_student?: boolean;
          current_courses?: string[];
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_pn_student?: boolean;
          current_courses?: string[];
        };
      };
      // ... other table types
    };
  };
};
```

### 3.3 Real-time Subscriptions
```typescript
// hooks/useAssessmentProgress.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useAssessmentProgress(assessmentId: string) {
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const subscription = supabase
      .channel('assessment_progress')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assessment_responses',
          filter: `assessment_id=eq.${assessmentId}`,
        },
        (payload) => {
          // Update progress when new responses are added
          setProgress(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [assessmentId])

  return progress
}
```

---

## 4. Database Migration Scripts

### 4.1 Initial Migration
```sql
-- migration_001_initial_schema.sql
-- Run this in Supabase SQL editor

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (use the table definitions from section 1.1)
-- Create RLS policies (use the policies from section 1.4)
-- Create functions (use the functions from section 1.5)
-- Insert seed data (domains, courses)
```

### 4.2 Sample Data Migration
```sql
-- migration_002_sample_questions.sql
INSERT INTO questions (domain_id, question_text, question_order) VALUES
-- Personal Development (domain_id = 1)
(1, 'I allocate my time efficiently and effectively, and am clear on what I''m doing when.', 1),
(1, 'I consistently and deliberately look ahead, anticipate obstacles, and put a strategy in place to overcome or work around those obstacles.', 2),
(1, 'I prioritize what is most important to me, and ensure my daily actions align with those priorities.', 3),
-- ... continue for all 55 questions
```

This database schema and API specification provides a complete foundation for building the coaching skills assessment with Supabase and Next.js, optimized for AI-assisted development.