from flask import Flask, send_from_directory, request, jsonify, g
import sqlite3
import os
import re
import traceback
from datetime import datetime
import hashlib

app = Flask(__name__)

# Add CORS headers manually
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Database configuration
DATABASE = 'database.db'

def get_db():
    """Get database connection"""
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    """Close database connection"""
    db = g.pop('db', None)
    if db is not None:
        db.close()

@app.teardown_appcontext
def close_db_handler(error):
    close_db()

def init_db():
    """Initialize database with tables"""
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            role TEXT DEFAULT 'user',
            is_active BOOLEAN DEFAULT 1,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            user_id INTEGER,
            item_type TEXT DEFAULT 'progress',
            data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
        
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            room_name TEXT NOT NULL,
            progress_percentage INTEGER DEFAULT 0,
            completed BOOLEAN DEFAULT 0,
            last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, room_name)
        );
        
        CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            badge_name TEXT NOT NULL,
            badge_type TEXT DEFAULT 'achievement',
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    ''')
    db.commit()
    db.close()

def hash_password(password):
    """Hash a password for storing"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return hashlib.sha256(password.encode()).hexdigest() == hashed

# API Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    db = get_db()
    users = db.execute('SELECT * FROM users ORDER BY created_at DESC').fetchall()
    return jsonify([dict(user) for user in users])

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        print(f"Received registration data: {data}")  # Debug logging
        
        if not data:
            print("No data received")
            return jsonify({'error': 'No data provided'}), 400
        
        if not data.get('name') or not data.get('email'):
            print(f"Missing required fields - name: {data.get('name')}, email: {data.get('email')}")
            return jsonify({'error': 'Name and email are required'}), 400
        
        # Validate email format
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, data['email']):
            print(f"Invalid email format: {data['email']}")
            return jsonify({'error': 'Invalid email format'}), 400
        
        db = get_db()
        
        # Check if user already exists
        existing_user = db.execute(
            'SELECT * FROM users WHERE name = ? OR email = ?',
            (data['name'], data['email'])
        ).fetchone()
        
        if existing_user:
            if existing_user['name'].lower() == data['name'].lower():
                print(f"Username already exists: {data['name']}")
                return jsonify({'error': 'Username already exists'}), 400
            else:
                print(f"Email already exists: {data['email']}")
                return jsonify({'error': 'Email already exists'}), 400
        
        # Insert new user
        cursor = db.execute(
            'INSERT INTO users (name, email, last_login) VALUES (?, ?, CURRENT_TIMESTAMP)',
            (data['name'], data['email'])
        )
        db.commit()
        
        user_id = cursor.lastrowid
        print(f"User created successfully with ID: {user_id}")
        
        return jsonify({
            'id': user_id, 
            'message': 'User created successfully',
            'user': {'id': user_id, 'name': data['name'], 'email': data['email']}
        }), 201
        
    except sqlite3.IntegrityError as e:
        print(f"Database integrity error: {str(e)}")
        return jsonify({'error': f'Database constraint error: {str(e)}'}), 400
    except Exception as e:
        print(f"Unexpected error during user creation: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Add OPTIONS handler for CORS preflight
@app.route('/api/auth/login', methods=['OPTIONS'])
def login_options():
    return '', 200

# Add a login endpoint for existing users
@app.route('/api/auth/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        print(f"Login attempt received: {data}")
        
        if not data:
            print("No JSON data received")
            return jsonify({'error': 'No data provided'}), 400
        
        # Handle both 'username' (from frontend) and 'name' (legacy)
        username = data.get('username', '').strip() or data.get('name', '').strip()
        password = data.get('password', '')
        
        print(f"Extracted username: '{username}', password provided: {bool(password)}")
        
        if not username:
            print("No username provided")
            return jsonify({'error': 'Username is required'}), 400
            
        if not password:
            print("No password provided")
            return jsonify({'error': 'Password is required'}), 400
        
        db = get_db()
        
        # Find user by name or email (case-insensitive search)
        print(f"Searching for user: {username}")
        user_row = db.execute(
            'SELECT * FROM users WHERE (LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?))',
            (username, username)
        ).fetchone()
        
        if not user_row:
            print(f"User not found in database: {username}")
            # Let's also check what users exist for debugging
            all_users = db.execute('SELECT name, email FROM users LIMIT 10').fetchall()
            print(f"Available users: {[dict(u) for u in all_users]}")
            return jsonify({'error': 'User not found'}), 404
        
        # Convert Row object to dict immediately
        user_dict = dict(user_row)
        print(f"Found user: {user_dict['name']} ({user_dict['email']})")
        
        # Check if user is active (if column exists)
        if user_dict.get('is_active') == 0:
            print("User account is disabled")
            return jsonify({'error': 'Account is disabled'}), 401
        
        # Verify password - this is now required
        if user_dict.get('password_hash'):
            if not verify_password(password, user_dict['password_hash']):
                print("Password verification failed")
                return jsonify({'error': 'Invalid credentials'}), 401
            print("Password verification successful")
        else:
            print("No password hash found for user - rejecting login")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login timestamp
        try:
            db.execute(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                (user_dict['id'],)
            )
            db.commit()
            print("Updated last login timestamp")
        except Exception as update_error:
            print(f"Warning: Could not update last login: {update_error}")
            # Don't fail login if we can't update timestamp
        
        print(f"Login successful for user: {user_dict['name']}")
        
        response_data = {
            'message': 'Login successful',
            'user': {
                'id': user_dict['id'],
                'username': user_dict['name'],  # Map 'name' to 'username' for frontend
                'email': user_dict['email'],
                'role': user_dict.get('role', 'user')
            }
        }
        
        print(f"Sending response: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

# Add registration endpoint using new auth pattern
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        print(f"Registration attempt: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        # Validate email format
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate username
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            return jsonify({'error': 'Username must be 3-20 characters (letters, numbers, underscore only)'}), 400
        
        # Validate password strength
        if len(password) < 3:  # Simple validation for demo
            return jsonify({'error': 'Password must be at least 3 characters long'}), 400
        
        db = get_db()
        
        # Check if user already exists
        existing_user = db.execute(
            'SELECT * FROM users WHERE LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?)',
            (username, email)
        ).fetchone()
        
        if existing_user:
            existing_user_dict = dict(existing_user)
            if existing_user_dict['name'].lower() == username.lower():
                return jsonify({'error': 'Username already exists'}), 400
            else:
                return jsonify({'error': 'Email already exists'}), 400
        
        # Hash the password before storing
        password_hash = hash_password(password)
        
        # Create user (store username in 'name' field to match existing schema)
        cursor = db.execute(
            'INSERT INTO users (name, email, password_hash, last_login) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            (username, email, password_hash)
        )
        db.commit()
        
        user_id = cursor.lastrowid
        print(f"User registered successfully: ID {user_id}, Username: {username}")
        
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

# User Progress API Routes
@app.route('/api/users/<int:user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    db = get_db()
    progress = db.execute(
        'SELECT * FROM user_progress WHERE user_id = ? ORDER BY last_accessed DESC',
        (user_id,)
    ).fetchall()
    return jsonify([dict(p) for p in progress])

@app.route('/api/users/<int:user_id>/progress', methods=['POST'])
def update_user_progress(user_id):
    data = request.get_json()
    if not data or not data.get('room_name'):
        return jsonify({'error': 'Room name is required'}), 400
    
    db = get_db()
    db.execute('''
        INSERT OR REPLACE INTO user_progress 
        (user_id, room_name, progress_percentage, completed, last_accessed)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ''', (
        user_id,
        data['room_name'],
        data.get('progress_percentage', 0),
        data.get('completed', 0)
    ))
    db.commit()
    return jsonify({'message': 'Progress updated successfully'})

# Badges API Routes
@app.route('/api/users/<int:user_id>/badges', methods=['GET'])
def get_user_badges(user_id):
    db = get_db()
    badges = db.execute(
        'SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC',
        (user_id,)
    ).fetchall()
    return jsonify([dict(b) for b in badges])

@app.route('/api/users/<int:user_id>/badges', methods=['POST'])
def award_badge(user_id):
    data = request.get_json()
    if not data or not data.get('badge_name'):
        return jsonify({'error': 'Badge name is required'}), 400
    
    db = get_db()
    cursor = db.execute(
        'INSERT INTO badges (user_id, badge_name, badge_type) VALUES (?, ?, ?)',
        (user_id, data['badge_name'], data.get('badge_type', 'achievement'))
    )
    db.commit()
    return jsonify({'id': cursor.lastrowid, 'message': 'Badge awarded successfully'}), 201

# Add health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'API is running'})

# Add OPTIONS handler for CORS preflight
@app.route('/api/auth/register', methods=['OPTIONS'])
def register_options():
    return '', 200

# Serve static files - fix path resolution
@app.route('/<path:path>')
def serve_static(path):
    # Look for files in the parent directory (where the frontend files are)
    parent_dir = os.path.join(os.path.dirname(__file__), '../..')
    return send_from_directory(parent_dir, path)

# Serve index.html for root route - fix path resolution  
@app.route('/')
def serve_index():
    # Look for index.html in the parent directory
    parent_dir = os.path.join(os.path.dirname(__file__), '../..')
    return send_from_directory(parent_dir, 'index.html')

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
