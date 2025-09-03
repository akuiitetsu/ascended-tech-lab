from flask import Flask, send_from_directory, request, jsonify, g, session
import os
import re
import traceback
import hashlib
import secrets
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Supabase client (required)
try:
    from supabase import create_client
    SUPABASE_AVAILABLE = True
except ImportError as e:
    print(f"❌ Supabase library not installed: {e}")
    print("   Please install with: pip install supabase")
    exit(1)

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print('❌ Missing required environment variables:')
    print('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    print('   Please configure your Supabase project credentials')
    exit(1)

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print('✅ Supabase client initialized successfully')
except Exception as e:
    print(f'❌ Failed to initialize Supabase client: {str(e)}')
    exit(1)

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

# Supabase helper functions
def sb_select(table, select='*', filters=None, order=None, limit=None):
    """Select data from Supabase table"""
    try:
        query = supabase.table(table).select(select)
        
        if filters:
            for k, v in filters.items():
                if isinstance(v, list):
                    query = query.in_(k, v)
                else:
                    query = query.eq(k, v)
        
        if order:
            desc = order.startswith('-')
            column = order.lstrip('-')
            query = query.order(column, desc=desc)
        
        if limit:
            query = query.limit(limit)
            
        response = query.execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Supabase select error: {str(e)}")
        raise Exception(f"Database query failed: {str(e)}")

def sb_insert(table, row):
    """Insert a row into Supabase table"""
    try:
        response = supabase.table(table).insert(row).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Supabase insert error: {str(e)}")
        raise Exception(f"Database insert failed: {str(e)}")

def sb_update(table, row, match_column='id', match_value=None, filters=None):
    """Update rows in Supabase table"""
    try:
        query = supabase.table(table).update(row)
        
        if filters:
            for k, v in filters.items():
                query = query.eq(k, v)
        elif match_column and match_value is not None:
            query = query.eq(match_column, match_value)
        
        response = query.execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Supabase update error: {str(e)}")
        raise Exception(f"Database update failed: {str(e)}")

def sb_delete(table, match_column='id', match_value=None, filters=None):
    """Delete rows from Supabase table"""
    try:
        query = supabase.table(table).delete()
        
        if filters:
            for k, v in filters.items():
                query = query.eq(k, v)
        elif match_column and match_value is not None:
            query = query.eq(match_column, match_value)
        
        response = query.execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Supabase delete error: {str(e)}")
        raise Exception(f"Database delete failed: {str(e)}")

def hash_password(password):
    """Hash a password for storing"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return hashlib.sha256(password.encode()).hexdigest() == hashed

def generate_session_token():
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def create_admin_user():
    """Create default admin user in Supabase if none exists"""
    try:
        # Check if admin exists
        admin_users = sb_select('users', filters={'role': 'admin'})
        
        if not admin_users:
            print("Creating default admin user in Supabase...")
            admin_password = hash_password("admin123")
            admin_data = {
                'name': 'admin',
                'email': 'admin@ascended.tech',
                'password_hash': admin_password,
                'role': 'admin',
                'is_active': True,
                'total_score': 0,
                'current_streak': 0,
                'created_at': datetime.now().isoformat()
            }
            
            sb_insert('users', admin_data)
            print("✅ Default admin user created in Supabase:")
            print("   Username: admin")
            print("   Email: admin@ascended.tech")
            print("   Password: admin123")
            print("   Role: admin")
            print("\n🚨 IMPORTANT: Change the default admin password immediately!")
        else:
            print("✅ Admin user already exists in Supabase")
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")

# Initialize Supabase connection and admin user
def init_supabase():
    """Initialize Supabase connection and create admin user if needed"""
    try:
        # Test connection
        sb_select('users', limit=1)
        print('✅ Supabase connection verified')
        
        # Create admin user if needed
        create_admin_user()
        
        return True
    except Exception as e:
        print(f'❌ Supabase initialization failed: {str(e)}')
        print('   Please ensure your database schema is properly set up')
        return False

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not username or not email or not password:
            return jsonify({'error': 'Missing required fields'}), 400

        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({'error': 'Invalid email format'}), 400

        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            return jsonify({'error': 'Invalid username format'}), 400

        if len(password) < 3:
            return jsonify({'error': 'Password too short'}), 400

        # Check existing username/email
        existing = sb_select('users', select='id', filters={'email': email})
        if existing:
            return jsonify({'error': 'Email already registered'}), 400
        
        existing_name = sb_select('users', select='id', filters={'name': username})
        if existing_name:
            return jsonify({'error': 'Username already taken'}), 400

        row = {
            'name': username,
            'email': email,
            'password_hash': hash_password(password),
            'role': 'user',
            'is_active': True,
            'total_score': 0,
            'current_streak': 0,
            'created_at': datetime.now().isoformat()
        }
        inserted = sb_insert('users', row)
        user_id = inserted[0].get('id') if inserted else None

        return jsonify({'message': 'Registration successful', 'user': {'id': user_id, 'username': username, 'email': email}}), 201
    
    except Exception as e:
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
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
        
        # Try to find by email or name
        users_by_email = sb_select('users', filters={'email': username})
        user_row = users_by_email[0] if users_by_email else None
        
        if not user_row:
            users_by_name = sb_select('users', filters={'name': username})
            user_row = users_by_name[0] if users_by_name else None

        if not user_row:
            return jsonify({'error': 'Invalid credentials'}), 401

        user_role = user_row.get('role', 'user')

        # Ensure admin role preserved for admin name
        if user_row.get('name', '').lower() == 'admin' and user_role != 'admin':
            sb_update('users', {'role': 'admin'}, match_column='id', match_value=user_row['id'])
            user_role = 'admin'

        if not user_row.get('password_hash'):
            return jsonify({'error': 'Account setup incomplete'}), 401

        if not verify_password(password, user_row.get('password_hash')):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Check if user is active
        if not user_row.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 401

        # Update last_login
        sb_update('users', {'last_login': datetime.now().isoformat()}, match_column='id', match_value=user_row['id'])

        user_data = {
            'id': user_row.get('id'),
            'username': user_row.get('name'),
            'email': user_row.get('email'),
            'role': user_role,
            'total_score': user_row.get('total_score', 0),
            'current_streak': user_row.get('current_streak', 0)
        }

        return jsonify({'message': 'Login successful', 'user': user_data}), 200
        
    except Exception as e:
        print(f"💥 Login error: {str(e)}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

# API Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = sb_select('users', order='-created_at', limit=100)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        print(f"Received user creation data: {data}")  # Debug logging
        
        if not data:
            print("No data received")
            return jsonify({'error': 'No data provided'}), 400
        
        if not data.get('name') or not data.get('email'):
            print(f"Missing required fields - name: {data.get('name')}, email: {data.get('email')}")
            return jsonify({'error': 'Missing required fields: name and email'}), 400
        
        # Validate email format
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, data['email']):
            print(f"Invalid email format: {data['email']}")
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check duplicates
        existing_email = sb_select('users', filters={'email': data['email']})
        if existing_email:
            return jsonify({'error': 'Email already exists'}), 400
            
        existing_name = sb_select('users', filters={'name': data['name']})
        if existing_name:
            return jsonify({'error': 'Username already exists'}), 400

        row = {
            'name': data['name'],
            'email': data['email'],
            'role': data.get('role', 'user'),
            'is_active': data.get('is_active', True),
            'total_score': data.get('total_score', 0),
            'current_streak': data.get('current_streak', 0),
            'created_at': datetime.now().isoformat()
        }
        inserted = sb_insert('users', row)
        user_id = inserted[0].get('id') if inserted else None
        return jsonify({'id': user_id, 'message': 'User created successfully', 'user': {'id': user_id, 'name': data['name'], 'email': data['email']}}), 201
        
    except Exception as e:
        print(f"Unexpected error during user creation: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        users = sb_select('users', filters={'id': user_id})
        if not users:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(users[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Check if user exists
        users = sb_select('users', filters={'id': user_id})
        if not users:
            return jsonify({'error': 'User not found'}), 404
            
        # Update user
        update_data = {}
        for field in ['name', 'email', 'role', 'is_active', 'total_score', 'current_streak']:
            if field in data:
                update_data[field] = data[field]
                
        if update_data:
            sb_update('users', update_data, match_column='id', match_value=user_id)
            
        return jsonify({'message': 'User updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Check if user exists
        users = sb_select('users', filters={'id': user_id})
        if not users:
            return jsonify({'error': 'User not found'}), 404
            
        sb_delete('users', match_column='id', match_value=user_id)
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Progress API Routes
@app.route('/api/users/<int:user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    try:
        # Ensure user exists
        users = sb_select('users', filters={'id': user_id})
        if not users:
            return jsonify({'error': 'User not found'}), 404

        progress = sb_select('user_progress', filters={'user_id': user_id}, order='-last_accessed')
        
        return jsonify(progress), 200
        
    except Exception as e:
        print(f"Get user progress error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/progress', methods=['POST'])
def update_user_progress(user_id):
    try:
        data = request.get_json()
        if not data or not data.get('room_name'):
            return jsonify({'error': 'Missing room_name'}), 400

        # Check if user exists
        users = sb_select('users', filters={'id': user_id})
        if not users:
            return jsonify({'error': 'User not found'}), 404

        # Check if progress record already exists
        existing_progress = sb_select('user_progress', filters={'user_id': user_id, 'room_name': data['room_name']})
        
        row = {
            'user_id': user_id,
            'room_name': data['room_name'],
            'progress_percentage': data.get('progress_percentage', 0),
            'completed': bool(data.get('completed', False)),
            'last_accessed': datetime.now().isoformat()
        }
        
        if existing_progress:
            sb_update('user_progress', row, filters={'user_id': user_id, 'room_name': data['room_name']})
        else:
            sb_insert('user_progress', row)
            
        return jsonify({'message': 'Progress updated successfully'})
            
    except Exception as e:
        print(f"Update user progress error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Badges API Routes
@app.route('/api/users/<int:user_id>/badges', methods=['GET'])
def get_user_badges(user_id):
    try:
        # Ensure user exists
        users = sb_select('users', filters={'id': user_id})
        if not users:
            return jsonify({'error': 'User not found'}), 404
            
        badges = sb_select('badges', filters={'user_id': user_id}, order='-earned_at')
        return jsonify(badges), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/badges', methods=['POST'])
def award_badge(user_id):
    try:
        data = request.get_json()
        if not data or not data.get('badge_name'):
            return jsonify({'error': 'Missing badge_name'}), 400

        # Check if user exists
        users = sb_select('users', filters={'id': user_id})
        if not users:
            return jsonify({'error': 'User not found'}), 404

        row = {
            'user_id': user_id, 
            'badge_name': data['badge_name'], 
            'badge_type': data.get('badge_type', 'achievement'), 
            'earned_at': datetime.now().isoformat()
        }
        inserted = sb_insert('badges', row)
        badge_id = inserted[0].get('id') if inserted else None
        return jsonify({'message': 'Badge awarded successfully', 'badge_id': badge_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = 'OK' if supabase else 'Not configured'
    return jsonify({
        'status': 'OK', 
        'message': 'API is running',
        'database': 'Supabase',
        'db_status': db_status
    })

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Serve index.html for root route
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Initialize the application
print("🚀 Starting Ascended Tech Lab API...")
print("📊 Initializing Supabase connection...")

# Only initialize when not in serverless environment
if __name__ == '__main__':
    if init_supabase():
        print("✅ Supabase initialized successfully!")
        
        port = int(os.environ.get('PORT', 5000))
        print(f"🌐 Starting server on port {port}...")
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        print("❌ Failed to initialize Supabase. Exiting...")
        exit(1)
else:
    # In serverless environment (like Vercel), just initialize without starting server
    try:
        init_supabase()
        print("✅ Supabase initialized for serverless deployment")
    except Exception as e:
        print(f"⚠️  Warning: Supabase initialization failed: {str(e)}")

# Export the app for WSGI servers (like Vercel)
application = app
