class AuthService {
    constructor() {
        this.baseURL = '/api/auth';
        this.currentUser = null;
        this.sessionToken = null;
        this.loadUserFromStorage();
    }

    async register(userData) {
        try {
            console.log('Attempting registration:', userData);
            
            if (userData.password !== userData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (!userData.username || !userData.email || !userData.password) {
                throw new Error('Username, email, and password are required');
            }

            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password
                })
            });

            const result = await response.json();
            console.log('Registration response:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            return result;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(username, password = '') {
        try {
            console.log(`Attempting login for: ${username}, with password: ${password ? 'yes' : 'no'}`);
            
            // Always require a password for proper authentication
            if (!password) {
                throw new Error('Password is required for login');
            }

            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            console.log('Login response status:', response.status);
            
            const result = await response.json();
            console.log('Login response:', result);
            
            if (!response.ok) {
                console.error('Login failed with status:', response.status, result);
                
                // Provide specific error messages
                if (response.status === 401) {
                    if (result.error === 'Invalid credentials') {
                        throw new Error('Invalid username or password. Please check your credentials and try again.');
                    } else if (result.error === 'User not found') {
                        throw new Error('User not found. Please check your username or register a new account.');
                    }
                }
                
                throw new Error(result.error || 'Login failed');
            }

            this.currentUser = result.user;
            this.sessionToken = result.session_token || 'demo-session';
            this.saveUserToStorage();
            
            console.log('Login successful:', this.currentUser);
            return this.currentUser;
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        this.sessionToken = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentEmail');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('isAdmin');
    }

    isAuthenticated() {
        return this.currentUser !== null && this.sessionToken !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUser() {
        return this.getCurrentUser();
    }

    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', this.currentUser.username);
            localStorage.setItem('currentEmail', this.currentUser.email);
            localStorage.setItem('sessionToken', this.sessionToken);
            
            // Check if admin
            if (this.currentUser.role === 'admin') {
                localStorage.setItem('isAdmin', 'true');
            }
        }
    }

    loadUserFromStorage() {
        const username = localStorage.getItem('currentUser');
        const email = localStorage.getItem('currentEmail');
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (username && email && sessionToken) {
            this.currentUser = { 
                username, 
                email,
                role: localStorage.getItem('isAdmin') ? 'admin' : 'user'
            };
            this.sessionToken = sessionToken;
        }
    }

    // Get authorization headers for API requests
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.sessionToken}`,
            'Content-Type': 'application/json'
        };
    }
}

// Function to handle successful login
function handleSuccessfulLogin(userData) {
    console.log('🎯 handleSuccessfulLogin called with:', userData);
    
    // Clear any existing auth data first
    localStorage.clear();
    
    // Store user data with explicit role handling
    localStorage.setItem('currentUser', userData.username);
    localStorage.setItem('currentEmail', userData.email);
    localStorage.setItem('userRole', userData.role || 'user');
    localStorage.setItem('userId', userData.id.toString());
    localStorage.setItem('totalScore', (userData.total_score || 0).toString());
    localStorage.setItem('currentStreak', (userData.current_streak || 0).toString());
    
    console.log('💾 Stored data:', {
        currentUser: localStorage.getItem('currentUser'),
        userRole: localStorage.getItem('userRole'),
        userId: localStorage.getItem('userId')
    });
    
    // CRITICAL: Handle admin users with multiple checks
    const isAdminUser = userData.role === 'admin' || 
                       userData.username === 'admin' || 
                       userData.username.toLowerCase() === 'admin';
    
    if (isAdminUser) {
        console.log('🔐 ADMIN USER LOGIN DETECTED!');
        console.log('   • Setting admin flags...');
        
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userRole', 'admin');
        
        console.log('   • Admin flags set:', {
            isAdmin: localStorage.getItem('isAdmin'),
            userRole: localStorage.getItem('userRole')
        });
        
        console.log('🚀 Redirecting admin to admin dashboard...');
        
        // Use replace to prevent back button issues
        window.location.replace('/src/pages/dashboard/admin-dashboard.html');
    } else {
        console.log('👤 Regular user, redirecting to user dashboard...');
        window.location.replace('/src/pages/dashboard/user-dashboard.html');
    }
}

// Update the login form handler to use the new function
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Login successful:', data);
            showSuccess('Login successful! Redirecting...');
            
            // Use the centralized login handler
            setTimeout(() => {
                handleSuccessfulLogin(data.user);
            }, 500);
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    } finally {
        setLoading(false);
    }
}

const auth = new AuthService();
export default auth;