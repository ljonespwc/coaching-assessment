-- Clear Test Data Script
-- This script clears all user data for testing purposes
-- WARNING: This will delete ALL user data - use only in development!

-- Clear assessment responses first (has foreign keys)
DELETE FROM assessment_responses;

-- Clear assessments (has foreign keys to users)
DELETE FROM assessments;

-- Clear user progress (has foreign keys to users)
DELETE FROM user_progress;

-- Clear course recommendations (has foreign keys to users)
DELETE FROM course_recommendations;

-- Clear user achievements (has foreign keys to users)
DELETE FROM user_achievements;

-- Clear analytics events (has foreign keys to users)
DELETE FROM analytics_events;

-- Clear profiles (has foreign keys to auth.users)
DELETE FROM profiles;

-- Clear auth users (this is the main user table)
-- Note: This uses the auth schema, not public
DELETE FROM auth.users;

-- Reset any sequences if needed (optional)
-- ALTER SEQUENCE assessments_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 
  'auth.users' as table_name, COUNT(*) as remaining_records FROM auth.users
UNION ALL
SELECT 
  'profiles' as table_name, COUNT(*) as remaining_records FROM profiles
UNION ALL
SELECT 
  'assessments' as table_name, COUNT(*) as remaining_records FROM assessments
UNION ALL
SELECT 
  'assessment_responses' as table_name, COUNT(*) as remaining_records FROM assessment_responses
UNION ALL
SELECT 
  'user_progress' as table_name, COUNT(*) as remaining_records FROM user_progress
UNION ALL
SELECT 
  'course_recommendations' as table_name, COUNT(*) as remaining_records FROM course_recommendations
UNION ALL
SELECT 
  'user_achievements' as table_name, COUNT(*) as remaining_records FROM user_achievements
UNION ALL
SELECT 
  'analytics_events' as table_name, COUNT(*) as remaining_records FROM analytics_events
ORDER BY table_name;
