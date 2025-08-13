from flask import Flask, send_from_directory, request, jsonify, g, session
import sqlite3
import os
import re
import traceback
import hashlib
import secrets
from datetime import datetime, timedelta

# Try to import CORS, but don't fail if not available
try:
    from flask_cors import CORS
    CORS_AVAILABLE = True
except ImportError:
    CORS_AVAILABLE = False
    print("flask-cors not installed. CORS headers will be added manually.")

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'ascended-tech-lab-secret-key-change-in-production')

# Enable CORS if available, otherwise add headers manually
if CORS_AVAILABLE:
    CORS(app)

@app.after_request
def after_request(response):
    if not CORS_AVAILABLE:
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

def hash_password(password):
    """Hash a password for storing"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return hashlib.sha256(password.encode()).hexdigest() == hashed

def generate_session_token():
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def init_db():
    """Initialize database with tables - simplified schema that works with existing code"""
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    
    # Create tables if they don't exist
    db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            user_id INTEGER,
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
    
    # Add columns if they don't exist (schema migration)
    cursor = db.cursor()
    
    # Check and add missing columns to users table
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        print("Added password_hash column")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
        print("Added role column")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")
        print("Added is_active column")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN last_login TIMESTAMP")
        print("Added last_login column")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN total_score INTEGER DEFAULT 0")
        print("Added total_score column")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0")
        print("Added current_streak column")
    except sqlite3.OperationalError:
        pass
    
    db.commit()
    db.close()

def get_user_columns():
    """Get the list of columns in the users table"""
    db = get_db()
    cursor = db.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    return columns

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        print(f"Registration attempt: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Use 'name' field to match existing schema
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        # Validate email format
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate username (alphanumeric and underscore only)
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            return jsonify({'error': 'Username must be 3-20 characters (letters, numbers, underscore only)'}), 400
        
        # Validate password strength
        if len(password) < 3:  # Simple validation for demo
            return jsonify({'error': 'Password must be at least 3 characters long'}), 400
        
        db = get_db()
        
        # Check if user already exists (using 'name' column)
        existing_user = db.execute(
            'SELECT id FROM users WHERE LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?)',
            (username, email)
        ).fetchone()
        
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 400
        
        # Get available columns
        columns = get_user_columns()
        
        # Build insert query based on available columns
        base_columns = ['name', 'email']
        base_values = [username, email]
        
        if 'password_hash' in columns and password:
            password_hash = hash_password(password)
            base_columns.append('password_hash')
            base_values.append(password_hash)
        
        if 'last_login' in columns:
            base_columns.append('last_login')
            placeholders = ', '.join(['?' if col != 'last_login' else 'CURRENT_TIMESTAMP' for col in base_columns])
            base_values = [v for v in base_values if v != 'CURRENT_TIMESTAMP']
        else:
            placeholders = ', '.join(['?' for _ in base_columns])
        
        query = f"INSERT INTO users ({', '.join(base_columns)}) VALUES ({placeholders})"
        print(f"Insert query: {query}")
        print(f"Values: {base_values}")
        
        cursor = db.execute(query, base_values)
        db.commit()
        user_id = cursor.lastrowid
        
        print(f"User registered successfully: ID {user_id}, Username: {username}")
        
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': user_id,
                'username': username,  # Return as username for frontend
                'email': email
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
            
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        db = get_db()
        columns = get_user_columns()
        
        # Find user by name or email (using 'name' column) - case-insensitive
        user_row = db.execute('''
            SELECT * FROM users 
            WHERE (LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?))
        ''', (username, username)).fetchone()
        
        if not user_row:
            print(f"User not found: {username}")
            return jsonify({'error': 'User not found'}), 404
        
        # Convert to dict for easier access
        user_dict = dict(user_row)
        
        # Check if user is active (if column exists)
        if 'is_active' in columns and user_dict.get('is_active') == 0:
            return jsonify({'error': 'Account is disabled'}), 401
        
        # Verify password - this is now required
        if 'password_hash' in columns and user_dict.get('password_hash'):
            if not verify_password(password, user_dict['password_hash']):
                print("Password verification failed")
                return jsonify({'error': 'Invalid credentials'}), 401
            print("Password verification successful")
        else:
            print("No password hash found for user - rejecting login")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login if column exists
        if 'last_login' in columns:
            db.execute('''
                UPDATE users 
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (user_dict['id'],))
            db.commit()
        
        print(f"Login successful for user: {user_dict['name']}")
        
        user_data = {
            'id': user_dict['id'],
            'username': user_dict['name'],  # Map 'name' to 'username' for frontend
            'email': user_dict['email'],
            'role': user_dict.get('role', 'user'),
            'total_score': user_dict.get('total_score', 0),
            'current_streak': user_dict.get('current_streak', 0)
        }
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

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
        columns = get_user_columns()
        
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
        
        # Build insert query based on available columns
        base_columns = ['name', 'email']
        base_values = [data['name'], data['email']]
        
        if 'last_login' in columns:
            base_columns.append('last_login')
            placeholders = ', '.join(['?' if col != 'last_login' else 'CURRENT_TIMESTAMP' for col in base_columns])
            base_values_filtered = [v for i, v in enumerate(base_values) if base_columns[i] != 'last_login']
        else:
            placeholders = ', '.join(['?' for _ in base_columns])
            base_values_filtered = base_values
        
        query = f"INSERT INTO users ({', '.join(base_columns)}) VALUES ({placeholders})"
        print(f"Insert query: {query}")
        print(f"Values: {base_values_filtered}")
        
        cursor = db.execute(query, base_values_filtered)
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

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(dict(user))

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        db.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            (data.get('name', user['name']), data.get('email', user['email']), user_id)
        )
        db.commit()
        return jsonify({'message': 'User updated successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    
    db.execute('DELETE FROM users WHERE id = ?', (user_id,))
    db.commit()
    return jsonify({'message': 'User deleted successfully'})

@app.route('/api/items', methods=['GET'])
def get_items():
    db = get_db()
    items = db.execute('''
        SELECT i.*, u.name as user_name 
        FROM items i 
        LEFT JOIN users u ON i.user_id = u.id 
        ORDER BY i.created_at DESC
    ''').fetchall()
    return jsonify([dict(item) for item in items])

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    db = get_db()
    cursor = db.execute(
        'INSERT INTO items (title, description, user_id) VALUES (?, ?, ?)',
        (data['title'], data.get('description'), data.get('user_id'))
    )
    db.commit()
    return jsonify({'id': cursor.lastrowid, 'message': 'Item created successfully'}), 201

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    db = get_db()
    item = db.execute('SELECT * FROM items WHERE id = ?', (item_id,)).fetchone()
    if item is None:
        return jsonify({'error': 'Item not found'}), 404
    
    db.execute('DELETE FROM items WHERE id = ?', (item_id,))
    db.commit()
    return jsonify({'message': 'Item deleted successfully'})

# User Progress API Routes
@app.route('/api/users/<int:user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    db = get_db()
    progress = db.execute('''
        SELECT up.*, lr.room_name, lr.display_name, lr.max_score
        FROM user_progress up
        JOIN learning_rooms lr ON up.room_id = lr.id
        WHERE up.user_id = ?
        ORDER BY up.last_accessed DESC
    ''', (user_id,)).fetchall()
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

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Serve index.html for root route
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Add health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'API is running'})

if __name__ == '__main__':
    # Always run database initialization to handle schema migration
    print("Checking/updating database schema...")
    init_db()
    print("Database schema up to date!")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
