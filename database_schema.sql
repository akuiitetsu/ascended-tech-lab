-- AscendEd Tech Lab Breakout Database Schema
-- Complete SQLite schema for user management, authentication, progress tracking, and gamification

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS room_completions;
DROP TABLE IF EXISTS learning_items;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS leaderboard;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- Users table - Core user authentication and profile
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- For future password implementation
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT 1,
    email_verified BOOLEAN DEFAULT 0,
    profile_image TEXT,
    bio TEXT,
    skill_level TEXT DEFAULT 'beginner' CHECK(skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    total_score INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for login management
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning rooms/modules configuration
CREATE TABLE learning_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK(difficulty_level BETWEEN 1 AND 5),
    icon TEXT,
    color_theme TEXT,
    prerequisites TEXT, -- JSON array of required room completions
    estimated_time INTEGER, -- in minutes
    max_score INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking for each room
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK(progress_percentage BETWEEN 0 AND 100),
    current_level INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in minutes
    attempts INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES learning_rooms(id) ON DELETE CASCADE,
    UNIQUE(user_id, room_id)
);

-- Room completions tracking
CREATE TABLE room_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    completion_time INTEGER, -- time taken in minutes
    score_achieved INTEGER,
    attempts_taken INTEGER DEFAULT 1,
    perfect_score BOOLEAN DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES learning_rooms(id) ON DELETE CASCADE
);

-- Achievement definitions
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    achievement_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    badge_color TEXT,
    points INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common' CHECK(rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    category TEXT DEFAULT 'general',
    requirements TEXT, -- JSON object with achievement criteria
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements/badges earned
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_data TEXT, -- JSON for tracking partial progress
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- Learning content items (challenges, tutorials, etc.)
CREATE TABLE learning_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK(item_type IN ('challenge', 'tutorial', 'quiz', 'project', 'reading')),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- JSON or HTML content
    difficulty INTEGER DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5),
    points INTEGER DEFAULT 10,
    time_limit INTEGER, -- in minutes, NULL for no limit
    sort_order INTEGER DEFAULT 0,
    prerequisites TEXT, -- JSON array of required item completions
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES learning_rooms(id) ON DELETE CASCADE
);

-- User item completions
CREATE TABLE user_item_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    time_taken INTEGER, -- in seconds
    attempts INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT 0,
    completion_data TEXT, -- JSON with answers, code, etc.
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES learning_items(id) ON DELETE CASCADE
);

-- Leaderboard/ranking system
CREATE TABLE leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT DEFAULT 'overall', -- overall, weekly, monthly, room-specific
    rank_position INTEGER,
    score INTEGER DEFAULT 0,
    period_start DATE,
    period_end DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System configuration
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, preference_key)
);

-- Insert default learning rooms
INSERT INTO learning_rooms (room_name, display_name, description, difficulty_level, icon, color_theme, max_score) VALUES
('flowchart', 'Flowchart Logic', 'Master the art of flowchart design and logical thinking', 1, 'bi-diagram-3', '#A069FF', 100),
('networking', 'Network Engineering', 'Dive deep into network protocols and infrastructure', 2, 'bi-hdd-network', '#10a1fa', 100),
('ai-training', 'AI & Machine Learning', 'Train AI models and understand machine learning concepts', 3, 'bi-robot', '#FFD700', 100),
('database', 'Database Management', 'Design and optimize database systems', 2, 'bi-database', '#4CAF50', 100),
('programming', 'Advanced Programming', 'Master programming concepts and algorithms', 4, 'bi-code-slash', '#FF5722', 100);

-- Insert default achievements
INSERT INTO achievements (achievement_key, title, description, icon, badge_color, points, rarity, category) VALUES
('first_login', 'Welcome to AscendEd', 'Complete your first login', 'bi-door-open', '#4CAF50', 10, 'common', 'onboarding'),
('first_room', 'Room Explorer', 'Complete your first learning room', 'bi-trophy', '#FFD700', 25, 'common', 'progress'),
('perfect_score', 'Perfectionist', 'Achieve 100% score in any room', 'bi-star-fill', '#FF6B35', 50, 'uncommon', 'achievement'),
('speed_demon', 'Speed Demon', 'Complete a room in under 30 minutes', 'bi-lightning-fill', '#E74C3C', 75, 'rare', 'achievement'),
('all_rooms', 'Master Graduate', 'Complete all available rooms', 'bi-mortarboard-fill', '#8E44AD', 200, 'legendary', 'completion'),
('weekly_streak', 'Consistent Learner', 'Maintain a 7-day learning streak', 'bi-calendar-check', '#3498DB', 100, 'epic', 'streak'),
('tech_master', 'Tech Master', 'Achieve expert level in all categories', 'bi-cpu-fill', '#2C3E50', 500, 'legendary', 'mastery');

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_daily_attempts', '10', 'Maximum attempts per user per day'),
('leaderboard_update_interval', '300', 'Leaderboard update interval in seconds'),
('achievement_check_enabled', '1', 'Enable automatic achievement checking'),
('maintenance_mode', '0', 'System maintenance mode flag'),
('registration_enabled', '1', 'Allow new user registrations');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_activity ON users(last_activity);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_room_id ON user_progress(room_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_leaderboard_category ON leaderboard(category);
CREATE INDEX idx_learning_items_room_id ON learning_items(room_id);

-- Create triggers for automatic updates
CREATE TRIGGER update_user_timestamp 
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_user_score_on_completion
    AFTER INSERT ON room_completions
    FOR EACH ROW
    BEGIN
        UPDATE users 
        SET total_score = total_score + NEW.score_achieved,
            last_activity = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
    END;

-- Clean up expired sessions
CREATE TRIGGER cleanup_expired_sessions
    AFTER INSERT ON user_sessions
    FOR EACH ROW
    BEGIN
        DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    END;
