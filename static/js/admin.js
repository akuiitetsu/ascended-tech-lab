import api from './api.js';

// Admin Authentication Check
function checkAdminAuth() {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
        window.location.href = 'index.html';
    }
}

// Toggle Admin Menu
function toggleAdminMenu() {
    // Implementation for admin menu toggle
}

// Dashboard Data Management
const dashboardStats = {
    async updateStats() {
        try {
            const users = await api.getUsers();
            const items = await api.getItems();
            
            // Update user count
            document.querySelector('.stat-card.users .stat-value').textContent = users.length;
            
            // Calculate active users (users created in last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const activeUsers = users.filter(user => 
                new Date(user.created_at) > weekAgo
            ).length;
            document.querySelector('.stat-card.active .stat-value').textContent = activeUsers;
            
            // Update completion rate (placeholder calculation)
            const completionRate = Math.round((items.length / Math.max(users.length, 1)) * 100);
            document.querySelector('.stat-card.completion .stat-value').textContent = `${completionRate}%`;
            
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    },
    
    async updateRecentUsers() {
        try {
            const users = await api.getUsers();
            const userList = document.querySelector('.user-list');
            
            if (userList) {
                const recentUsers = users.slice(0, 5); // Show last 5 users
                userList.innerHTML = recentUsers.map(user => `
                    <div class="user-entry">
                        <div class="user-info">
                            <strong>${user.name}</strong>
                            <span>${user.email}</span>
                        </div>
                        <div class="user-date">
                            ${new Date(user.created_at).toLocaleDateString()}
                        </div>
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
                // Combine users and items for activity log
                const activities = [
                    ...users.slice(0, 3).map(user => ({
                        type: 'user',
                        action: 'User registered',
                        details: user.name,
                        timestamp: user.created_at
                    })),
                    ...items.slice(0, 3).map(item => ({
                        type: 'item',
                        action: 'Item created',
                        details: item.title,
                        timestamp: item.created_at
                    }))
                ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                activityList.innerHTML = activities.map(activity => `
                    <div class="activity-entry">
                        <div class="activity-info">
                            <strong>${activity.action}</strong>
                            <span>${activity.details}</span>
                        </div>
                        <div class="activity-time">
                            ${new Date(activity.timestamp).toLocaleString()}
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to update activity log:', error);
        }
    }
};

// Admin Actions
const adminActions = {
    async addUser() {
        const name = prompt('Enter user name:');
        const email = prompt('Enter user email:');
        
        if (name && email) {
            try {
                await api.createUser({ name, email });
                alert('User added successfully!');
                dashboardStats.updateStats();
                dashboardStats.updateRecentUsers();
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
        alert(`Generating ${reportType} report...`);
        // Implement report generation logic
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    dashboardStats.updateStats();
    dashboardStats.updateRecentUsers();
    dashboardStats.updateActivityLog();
    
    // Add event listener for Add User button
    const addUserBtn = document.querySelector('.action-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', adminActions.addUser);
    }
    
    // Navigation handling
    document.querySelectorAll('.nav-section li').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-section li').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            // Handle navigation
        });
    });
});

// Refresh data periodically
setInterval(() => {
    dashboardStats.updateStats();
    dashboardStats.updateActivityLog();
}, 30000); // Every 30 seconds
