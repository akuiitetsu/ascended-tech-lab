-- AscendEd Tech Lab PostgreSQL Database Schema
-- Converted from SQLite schema to PostgreSQL-compatible DDL
-- Updated to match application expectations

-- Drop tables if they exist (fresh setup)
DROP TABLE IF EXISTS verification_codes CASCADE;
DROP TABLE IF EXISTS temp_registrations CASCADE;
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS user_item_completions CASCADE;
DROP TABLE IF EXISTS learning_items CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS room_completions CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS learning_rooms CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table - Core user authentication and profile
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image TEXT,
    bio TEXT,
    skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner','intermediate','advanced','expert')),
    total_score INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email verification codes table
CREATE TABLE verification_codes (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Temporary registrations table (stores user data until email is verified)
CREATE TABLE temp_registrations (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for login management
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin sessions for admin authentication
CREATE TABLE admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin actions audit log
CREATE TABLE admin_actions (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items/content table (for learning materials and user-generated content)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simple badges table (compatible with existing app logic)
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_type TEXT DEFAULT 'achievement',
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning rooms/modules configuration
CREATE TABLE learning_rooms (
    id SERIAL PRIMARY KEY,
    room_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    icon TEXT,
    color_theme TEXT,
    prerequisites JSONB,
    estimated_time INTEGER,
    max_score INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking for each room
-- Simplified to match application expectations - using room_name directly instead of foreign key
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,  -- Direct room name instead of foreign key
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    current_level INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(user_id, room_name)
);

-- Room completions tracking
CREATE TABLE room_completions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
    completion_time INTEGER,
    score_achieved INTEGER,
    attempts_taken INTEGER DEFAULT 1,
    perfect_score BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievement definitions
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    achievement_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    badge_color TEXT,
    points INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
    category TEXT DEFAULT 'general',
    requirements JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User achievements/badges earned
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress_data JSONB,
    UNIQUE(user_id, achievement_id)
);

-- Learning content items (challenges, tutorials, etc.)
CREATE TABLE learning_items (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES learning_rooms(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('challenge','tutorial','quiz','project','reading')),
    title TEXT NOT NULL,
    description TEXT,
    content JSONB,
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    points INTEGER DEFAULT 10,
    time_limit INTEGER,
    sort_order INTEGER DEFAULT 0,
    prerequisites JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User item completions
CREATE TABLE user_item_completions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES learning_items(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    time_taken INTEGER,
    attempts INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    completion_data JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard/ranking system
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'overall',
    rank_position INTEGER,
    score INTEGER DEFAULT 0,
    period_start DATE,
    period_end DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key TEXT NOT NULL,
    preference_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Insert default learning rooms
INSERT INTO learning_rooms (room_name, display_name, description, difficulty_level, icon, color_theme, max_score) VALUES
('flowchart', 'Flowchart Logic', 'Master the art of flowchart design and logical thinking', 1, 'bi-diagram-3', '#A069FF', 100),
('networking', 'Network Engineering', 'Dive deep into network protocols and infrastructure', 2, 'bi-hdd-network', '#10a1fa', 100),
('ai-training', 'AI & Machine Learning', 'Train AI models and understand machine learning concepts', 3, 'bi-robot', '#FFD700', 100),
('database', 'Database Management', 'Design and optimize database systems', 2, 'bi-database', '#4CAF50', 100),
('programming', 'Advanced Programming', 'Master programming concepts and algorithms', 4, 'bi-code-slash', '#FF5722', 100)
ON CONFLICT (room_name) DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (achievement_key, title, description, icon, badge_color, points, rarity, category) VALUES
('first_login', 'Welcome to AscendEd', 'Complete your first login', 'bi-door-open', '#4CAF50', 10, 'common', 'onboarding'),
('first_room', 'Room Explorer', 'Complete your first learning room', 'bi-trophy', '#FFD700', 25, 'common', 'progress'),
('perfect_score', 'Perfectionist', 'Achieve 100% score in any room', 'bi-star-fill', '#FF6B35', 50, 'uncommon', 'achievement'),
('speed_demon', 'Speed Demon', 'Complete a room in under 30 minutes', 'bi-lightning-fill', '#E74C3C', 75, 'rare', 'achievement'),
('all_rooms', 'Master Graduate', 'Complete all available rooms', 'bi-mortarboard-fill', '#8E44AD', 200, 'legendary', 'completion'),
('weekly_streak', 'Consistent Learner', 'Maintain a 7-day learning streak', 'bi-calendar-check', '#3498DB', 100, 'epic', 'streak'),
('tech_master', 'Tech Master', 'Achieve expert level in all categories', 'bi-cpu-fill', '#2C3E50', 500, 'legendary', 'mastery')
ON CONFLICT (achievement_key) DO NOTHING;

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_daily_attempts', '10', 'Maximum attempts per user per day'),
('leaderboard_update_interval', '300', 'Leaderboard update interval in seconds'),
('achievement_check_enabled', '1', 'Enable automatic achievement checking'),
('maintenance_mode', '0', 'System maintenance mode flag'),
('registration_enabled', '1', 'Allow new user registrations')
ON CONFLICT (config_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);  -- Changed from username to name
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_room_name ON user_progress(room_name);  -- Changed from room_id
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard(category);
CREATE INDEX IF NOT EXISTS idx_learning_items_room_id ON learning_items(room_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_used ON verification_codes(used);
CREATE INDEX IF NOT EXISTS idx_temp_registrations_email ON temp_registrations(email);
CREATE INDEX IF NOT EXISTS idx_temp_registrations_expires ON temp_registrations(expires_at);

-- Triggers: use PL/pgSQL functions and triggers in PostgreSQL
-- Update 'updated_at' BEFORE UPDATE on users
CREATE OR REPLACE FUNCTION trg_update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_timestamp ON users;
CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trg_update_users_updated_at();

-- When a room completion is inserted, add score to user's total_score
CREATE OR REPLACE FUNCTION trg_update_user_score_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET total_score = COALESCE(total_score, 0) + COALESCE(NEW.score_achieved, 0),
        last_activity = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_score_on_completion ON room_completions;
CREATE TRIGGER update_user_score_on_completion
AFTER INSERT ON room_completions
FOR EACH ROW
EXECUTE FUNCTION trg_update_user_score_on_completion();

-- Cleanup expired sessions after a session is inserted
CREATE OR REPLACE FUNCTION trg_cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_expired_sessions ON user_sessions;
CREATE TRIGGER cleanup_expired_sessions
AFTER INSERT ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION trg_cleanup_expired_sessions();

-- =====================================================
-- PERMISSIONS AND SECURITY CONFIGURATION
-- =====================================================

-- Grant necessary permissions to service_role for all operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant permissions to authenticated users for regular operations  
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to anonymous users for registration
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON users TO anon;
GRANT SELECT ON learning_rooms TO anon;

-- Disable RLS for admin tables to allow service_role full access
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions DISABLE ROW LEVEL SECURITY;

-- Enable RLS for user data tables but allow service_role bypass
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_completions ENABLE ROW LEVEL SECURITY;

-- Create policies that allow service_role to bypass RLS
CREATE POLICY "Service role can do everything on users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage all user_progress" ON user_progress
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage their own progress" ON user_progress
    FOR ALL USING (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage all sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage all achievements" ON user_achievements
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage all completions" ON room_completions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage their own completions" ON room_completions
    FOR ALL USING (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

-- Public read access for reference tables
ALTER TABLE learning_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_config DISABLE ROW LEVEL SECURITY;

-- Email verification tables - disable RLS for service role access
ALTER TABLE verification_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE temp_registrations DISABLE ROW LEVEL SECURITY;

-- Refresh permissions for any new objects
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

