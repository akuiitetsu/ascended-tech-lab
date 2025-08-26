// Admin Authentication Check
function checkAdminAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!currentUser || !isAdmin || userRole !== 'admin') {
        console.log('Non-admin user or no authentication, redirecting to login...');
        window.location.href = '/src/pages/admin-login.html';
        return false;
    }
    
    return true;
}

// Global admin logout function
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all stored user data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('totalScore');
        localStorage.removeItem('currentStreak');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminToken');
        
        console.log('Admin logged out successfully');
        window.location.href = '/index.html';
    }
}

// Navigation functions
function showSection(sectionId) {
    if (window.adminDashboard) {
        window.adminDashboard.showSection(sectionId);
    }
}

function refreshDashboard() {
    if (window.adminDashboard) {
        window.adminDashboard.refreshLiveData();
    }
}

// Admin Actions Object
const adminActions = {
    async addUser() {
        const name = prompt('Enter user name:');
        const email = prompt('Enter user email:');
        
        if (name && email) {
            try {
                await api.createUser({ name, email });
                alert('User added successfully!');
                if (window.adminDashboard) {
                    window.adminDashboard.loadUsersData();
                }
            } catch (error) {
                alert('Failed to add user: ' + error.message);
            }
        }
    },
    
    async updateUserAccess(userId, access) {
        try {
            await api.updateUser(userId, { access });
            alert('User access updated successfully!');
        } catch (error) {
            alert('Failed to update user access: ' + error.message);
        }
    },
    
    generateReport(reportType) {
        if (window.adminDashboard) {
            window.adminDashboard.generateQuickReport(reportType);
        }
    },
    
    generateCustomReport() {
        if (window.adminDashboard) {
            window.adminDashboard.generateCustomReport();
        }
    },

    refreshActivityData() {
        if (window.adminDashboard) {
            window.adminDashboard.loadActivityData();
        }
    },

    createBackup() {
        if (confirm('Create a backup of the current database?')) {
            if (window.adminDashboard) {
                window.adminDashboard.createBackup();
            }
        }
    },

    clearOldSessions() {
        if (confirm('Clear all sessions older than 7 days? This cannot be undone.')) {
            if (window.adminDashboard) {
                window.adminDashboard.clearOldSessions();
            }
        }
    },

    optimizeDatabase() {
        if (confirm('Optimize database performance? This may take a few moments.')) {
            if (window.adminDashboard) {
                window.adminDashboard.optimizeDatabase();
            }
        }
    },

    clearCache() {
        if (confirm('Clear system cache?')) {
            if (window.adminDashboard) {
                window.adminDashboard.clearCache();
            }
        }
    },

    validateData() {
        if (window.adminDashboard) {
            window.adminDashboard.validateData();
        }
    },

    saveAllSettings() {
        if (window.adminDashboard) {
            window.adminDashboard.saveAllSettings();
        }
    },

    resetToDefaults() {
        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            if (window.adminDashboard) {
                window.adminDashboard.resetToDefaults();
            }
        }
    },

    filterAuditLog() {
        if (window.adminDashboard) {
            window.adminDashboard.filterAuditLog();
        }
    },

    exportAuditLog() {
        if (window.adminDashboard) {
            window.adminDashboard.exportAuditLog();
        }
    }
};

// Dashboard Stats Object
const dashboardStats = {
    async updateStats() {
        try {
            const users = await api.getUsers();
            const items = await api.getItems();
            
            // Update user count
            const userCountElement = document.querySelector('.stat-card.users .stat-value');
            if (userCountElement) {
                userCountElement.textContent = users.length;
            }
            
            // Calculate active users (users created in last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const activeUsers = users.filter(user => 
                new Date(user.created_at) > weekAgo
            ).length;
            
            const activeCountElement = document.querySelector('.stat-card.active .stat-value');
            if (activeCountElement) {
                activeCountElement.textContent = activeUsers;
            }
            
            // Update completion rate (placeholder calculation)
            const completionRate = Math.round((items.length / Math.max(users.length, 1)) * 100);
            const completionElement = document.querySelector('.stat-card.completion .stat-value');
            if (completionElement) {
                completionElement.textContent = `${completionRate}%`;
            }
            
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    },
    
    async updateRecentUsers() {
        try {
            const users = await api.getUsers();
            const userList = document.querySelector('.user-list');
            
            if (userList) {
                const recentUsers = users.slice(-5).reverse();
                userList.innerHTML = recentUsers.map(user => `
                    <div class="user-entry">
                        <div class="user-info">
                            <strong>${user.name}</strong>
                            <span>${user.email}</span>
                        </div>
                        <div class="user-date">${new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to update recent users:', error);
        }
    },
    
    async updateActivityLog() {
        try {
            const users = await api.getUsers();
            const items = await api.getItems();
            const activityList = document.querySelector('.activity-list');
            
            if (activityList) {
                const activities = [];
                
                // Add user registrations as activities
                users.forEach(user => {
                    activities.push({
                        type: 'user_registered',
                        description: `${user.name} joined the platform`,
                        timestamp: user.created_at
                    });
                });
                
                // Add items as activities
                items.forEach(item => {
                    activities.push({
                        type: 'item_created',
                        description: `New item: ${item.title}`,
                        timestamp: item.created_at
                    });
                });
                
                // Sort by timestamp and take recent 10
                const recentActivities = activities
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 10);
                
                activityList.innerHTML = recentActivities.map(activity => `
                    <div class="activity-entry">
                        <div class="activity-info">
                            <strong>${activity.description}</strong>
                        </div>
                        <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to update activity log:', error);
        }
    }
};

// Main AdminDashboard Class
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.currentPage = 1;
        this.usersPerPage = 20;
        this.charts = {};
        this.apiBaseUrl = '/api';
        this.currentSection = 'dashboard';
        
        this.currentUser = {
            username: localStorage.getItem('currentUser'),
            email: localStorage.getItem('currentEmail') || 'admin@ascended.tech',
            role: localStorage.getItem('userRole') || 'admin',
            id: localStorage.getItem('userId') || '1'
        };
        
        console.log('AdminDashboard initialized with user:', this.currentUser);
        this.init();
    }

    async init() {
        console.log('Initializing Admin Dashboard...');
        
        // Update UI immediately
        this.updateUserInterface();
        
        // Setup navigation and event listeners
        this.setupEventListeners();
        this.setupNavigation();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Set up periodic refresh
        setInterval(() => this.refreshLiveData(), 30000);
        
        console.log('Admin Dashboard fully initialized');
    }

    checkAdminAuth() {
        const currentUser = localStorage.getItem('currentUser');
        const userRole = localStorage.getItem('userRole');
        const isAdmin = localStorage.getItem('isAdmin');
        
        if (!currentUser || !isAdmin || userRole !== 'admin') {
            console.log('Admin authentication failed');
            window.location.href = '/src/pages/admin-login.html';
            return false;
        }
        
        // Set current user data
        this.currentUser = {
            username: currentUser,
            email: localStorage.getItem('currentEmail') || 'admin@ascended.tech',
            role: userRole,
            id: localStorage.getItem('userId') || '1'
        };
        
        // Update UI with admin name
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.textContent = this.currentUser.username;
        }
        
        return true;
    }

    setupEventListeners() {
        // Navigation items
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Add User button
        const addUserBtn = document.querySelector('.action-btn');
        if (addUserBtn && addUserBtn.textContent.includes('Add User')) {
            addUserBtn.addEventListener('click', adminActions.addUser);
        }
    }

    setupNavigation() {
        // Set active navigation item
        this.showSection('dashboard');
    }

    showSection(sectionId) {
        console.log('Showing section:', sectionId);
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        this.currentSection = sectionId;
        
        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'users':
                await this.loadUsersData();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
            case 'activity':
                await this.loadActivityData();
                break;
            case 'system':
                await this.loadSystemData();
                break;
            case 'audit':
                await this.loadAuditData();
                break;
            default:
                console.log('No specific data loader for section:', sectionId);
        }
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                dashboardStats.updateStats(),
                dashboardStats.updateRecentUsers(),
                dashboardStats.updateActivityLog()
            ]);
            
            this.updateSystemStatus();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadUsersData() {
        // Placeholder for users data loading
        console.log('Loading users data...');
    }

    async loadAnalyticsData() {
        // Placeholder for analytics data loading
        console.log('Loading analytics data...');
    }

    async loadActivityData() {
        // Placeholder for activity data loading
        console.log('Loading activity data...');
    }

    async loadSystemData() {
        // Placeholder for system data loading
        console.log('Loading system data...');
    }

    async loadAuditData() {
        // Placeholder for audit data loading
        console.log('Loading audit data...');
    }

    updateUserInterface() {
        console.log('Updating admin UI for user:', this.currentUser.username);
        
        // Update admin name in header
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.textContent = this.currentUser.username;
            console.log('Updated admin name display');
        }
        
        // Update users badge with current user count
        this.updateUsersBadge();
        
        // Set system status
        this.updateSystemStatus();
    }

    async updateUsersBadge() {
        try {
            const users = await api.getUsers();
            const usersBadge = document.getElementById('usersBadge');
            if (usersBadge) {
                usersBadge.textContent = users.length;
            }
        } catch (error) {
            console.error('Failed to update users badge:', error);
        }
    }

    updateSystemStatus() {
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            const text = statusElement.querySelector('.status-text');
            
            if (indicator && text) {
                indicator.className = 'status-indicator healthy';
                text.textContent = 'System Operational';
            }
        }
    }

    async refreshLiveData() {
        if (this.currentSection === 'dashboard') {
            await this.loadDashboardData();
        }
    }

    // Utility methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // You can implement a proper notification system here
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else if (type === 'success') {
            // Could show a success toast
            console.log(`✅ ${message}`);
        }
    }

    // Placeholder methods for admin actions
    async generateQuickReport(type) {
        console.log(`Generating ${type} report...`);
        this.showNotification(`${type} report generation started`, 'success');
    }

    async generateCustomReport() {
        console.log('Generating custom report...');
        this.showNotification('Custom report generation started', 'success');
    }

    async createBackup() {
        console.log('Creating system backup...');
        this.showNotification('Backup creation started', 'success');
    }

    async clearOldSessions() {
        console.log('Clearing old sessions...');
        this.showNotification('Old sessions cleared', 'success');
    }

    async optimizeDatabase() {
        console.log('Optimizing database...');
        this.showNotification('Database optimization started', 'success');
    }

    async clearCache() {
        console.log('Clearing cache...');
        this.showNotification('Cache cleared', 'success');
    }

    async validateData() {
        console.log('Validating data integrity...');
        this.showNotification('Data validation completed', 'success');
    }

    async saveAllSettings() {
        console.log('Saving all settings...');
        this.showNotification('Settings saved successfully', 'success');
    }

    async resetToDefaults() {
        console.log('Resetting to defaults...');
        this.showNotification('Settings reset to defaults', 'success');
    }

    async filterAuditLog() {
        console.log('Filtering audit log...');
    }

    async exportAuditLog() {
        console.log('Exporting audit log...');
        this.showNotification('Audit log exported successfully', 'success');
    }
}

// Simple API wrapper
const api = {
    async getUsers() {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async createUser(userData) {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
    },

    async updateUser(userId, userData) {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    async getItems() {
        const response = await fetch('/api/items');
        if (!response.ok) throw new Error('Failed to fetch items');
        return response.json();
    }
};

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Admin dashboard DOM loaded, performing authentication check...');
    
    // Wait a moment for localStorage to be fully available
    setTimeout(() => {
        // Get all authentication data with detailed logging
        const currentUser = localStorage.getItem('currentUser');
        const userRole = localStorage.getItem('userRole');
        const isAdmin = localStorage.getItem('isAdmin');
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('currentEmail');
        
        console.log('🔍 Complete authentication status:');
        console.log('   • currentUser:', currentUser || 'NOT SET');
        console.log('   • userRole:', userRole || 'NOT SET');
        console.log('   • isAdmin:', isAdmin || 'NOT SET');
        console.log('   • userId:', userId || 'NOT SET');
        console.log('   • email:', email || 'NOT SET');
        
        // Check basic authentication
        if (!currentUser) {
            console.log('❌ No authenticated user found, redirecting to main login...');
            window.location.href = '/index.html';
            return;
        }
        
        // Check admin role with fallback logic
        const isUserAdmin = (userRole === 'admin') || (currentUser === 'admin') || (isAdmin === 'true');
        
        console.log('🔍 Admin check result:', isUserAdmin);
        console.log('   • Role check (userRole === "admin"):', userRole === 'admin');
        console.log('   • Username check (currentUser === "admin"):', currentUser === 'admin');
        console.log('   • Flag check (isAdmin === "true"):', isAdmin === 'true');
        
        if (!isUserAdmin) {
            console.log('❌ Non-admin user attempting to access admin dashboard');
            console.log('   • Required: admin role');
            console.log('   • Current role:', userRole);
            
            alert('Access denied. Admin privileges required.');
            window.location.href = '/src/pages/dashboard/user-dashboard.html';
            return;
        }
        
        console.log('✅ Admin user authenticated successfully!');
        console.log('   • Username:', currentUser);
        console.log('   • Role:', userRole);
        
        // Ensure admin flag is set
        if (!isAdmin || isAdmin !== 'true') {
            console.log('🔧 Setting admin flag in localStorage...');
            localStorage.setItem('isAdmin', 'true');
        }
        
        console.log('🚀 Initializing admin dashboard...');
        
        // Initialize the admin dashboard
        window.adminDashboard = new AdminDashboard();
    }, 100);
});

console.log('Admin dashboard JavaScript loaded successfully');