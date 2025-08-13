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

const auth = new AuthService();
export default auth;

