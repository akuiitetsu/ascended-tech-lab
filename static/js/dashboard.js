/* ============================================
   DASHBOARD FUNCTIONS
   ============================================ */

import auth from './auth.js';

// Import progress tracker if available
let progressTracker = null;
if (window.progressTracker) {
    progressTracker = window.progressTracker;
}

// Room mapping for dashboard display
const ROOM_CONFIG = {
    'flowchart': {
        displayName: 'FLOWBYTE',
        icon: 'bi-diagram-3',
        color: '#005FFB',
        description: 'Flowchart & Logic Design'
    },
    'netxus': {
        displayName: 'NETXUS', 
        icon: 'bi-hdd-network',
        color: '#00A949',
        description: 'Network Systems & Protocols'
    },
    'aitrix': {
        displayName: 'AITRIX',
        icon: 'bi-robot',
        color: '#E08300', 
        description: 'AI & Machine Learning'
    },
    'schemax': {
        displayName: 'SCHEMAX',
        icon: 'bi-database',
        color: '#8B5A3C',
        description: 'Database Design & Management'
    },
    'codevance': {
        displayName: 'CODEVANCE',
        icon: 'bi-code-slash',
        color: '#DC3545',
        description: 'Programming Challenges'
    }
};

// Load and display user progress from database
async function loadUserProgress() {
    try {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('currentUser');
        
        if (!userId || !username) {
            console.warn('No user ID found for progress loading');
            loadLocalProgress(); // Show default state
            return;
        }

        console.log('🔄 Loading progress for user:', username, 'ID:', userId);

        // Show loading state
        const progressText = document.querySelector('#overall-progress-text');
        if (progressText) {
            progressText.textContent = 'Loading...';
        }

        // Fetch user progress from backend
        const response = await fetch(`/api/users/${userId}/progress/summary`);
        
        if (!response.ok) {
            throw new Error(`Failed to load progress: ${response.status} ${response.statusText}`);
        }

        const progressData = await response.json();
        console.log('📊 Progress data loaded:', progressData);

        // Update dashboard with real progress
        updateDashboardProgress(progressData);
        
        // Trigger success event
        const event = new CustomEvent('dashboard-updated', {
            detail: { success: true, data: progressData }
        });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('❌ Error loading user progress:', error);
        
        // Show error state briefly, then fall back to local storage
        const progressText = document.querySelector('#overall-progress-text');
        if (progressText) {
            progressText.textContent = 'Error';
            setTimeout(() => {
                loadLocalProgress();
            }, 1000);
        } else {
            loadLocalProgress();
        }
        
        // Trigger error event
        const event = new CustomEvent('dashboard-error', {
            detail: { error: error.message }
        });
        document.dispatchEvent(event);
    }
}

// Update dashboard elements with progress data
function updateDashboardProgress(progressData) {
    // Convert API room data to frontend format if needed
    const formattedData = formatProgressData(progressData);
    
    // Update overall progress
    updateOverallProgress(formattedData);
    
    // Update room cards
    updateRoomCards(formattedData);
    
    // Update room progress summary
    updateRoomProgressSummary(formattedData);
}

// Convert API progress data format to frontend expected format
function formatProgressData(progressData) {
    // If progressData has room_progress array (from API), convert it
    if (progressData.room_progress && Array.isArray(progressData.room_progress)) {
        const formattedData = {};
        
        // Map API room names to frontend room names
        const roomMapping = {
            'flowchart': 'flowchart',
            'networking': 'netxus',
            'ai-training': 'aitrix', 
            'database': 'schemax',
            'programming': 'codevance'
        };
        
        progressData.room_progress.forEach(roomData => {
            const apiRoomName = roomData.room_name;
            const frontendRoomName = roomMapping[apiRoomName] || apiRoomName;
            
            formattedData[frontendRoomName] = {
                progress_percentage: roomData.progress_percentage || 0,
                score: roomData.score || 0,
                current_level: roomData.current_level || 1,
                time_spent: roomData.time_spent || 0,
                attempts: roomData.attempts || 0,
                completed: roomData.completed || false,
                last_accessed: roomData.last_accessed,
                display_name: roomData.display_name,
                description: roomData.description,
                color: roomData.color,
                icon: roomData.icon
            };
        });
        
        return formattedData;
    }
    
    // If already in correct format, return as-is
    return progressData;
}

// Update overall progress section
function updateOverallProgress(progressData) {
    // Handle both API format and local format
    let overallProgress;
    let overallStats;
    
    if (progressData.overall_stats) {
        // API format with overall_stats
        overallProgress = Math.round(progressData.overall_stats.total_progress || 0);
        overallStats = progressData.overall_stats;
    } else {
        // Local format - calculate from room data
        overallProgress = calculateOverallProgress(progressData);
        overallStats = {
            total_score: calculateTotalScore(progressData),
            completed_rooms: calculateCompletedRooms(progressData),
            total_rooms: Object.keys(ROOM_CONFIG).length
        };
    }
    
    // Update main progress bar
    const progressBar = document.querySelector('.progress-section .progress-fill');
    const progressText = document.querySelector('#overall-progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${overallProgress}%`;
        progressBar.setAttribute('data-progress', `${overallProgress}%`);
    }
    
    if (progressText) {
        progressText.textContent = `${overallProgress}%`;
    }
    
    // Update statistics with real data
    updateProgressStats(progressData, overallStats);
}

// Update individual room cards
function updateRoomCards(progressData) {
    const roomsGrid = document.querySelector('.rooms-grid');
    if (!roomsGrid) return;

    // Update existing room cards instead of recreating them
    const roomCards = roomsGrid.querySelectorAll('.room-card');
    
    roomCards.forEach((card, index) => {
        const roomNames = Object.keys(ROOM_CONFIG);
        const roomName = roomNames[index];
        
        if (!roomName || !ROOM_CONFIG[roomName]) return;
        
        const roomConfig = ROOM_CONFIG[roomName];
        const roomProgress = progressData[roomName] || { 
            progress_percentage: 0, 
            score: 0, 
            current_level: 1,
            time_spent: 0,
            completed: false,
            attempts: 0
        };
        
        console.log(`Updating room card for ${roomName}:`, roomProgress);
        updateRoomCard(card, roomName, roomConfig, roomProgress);
    });
}

// Update individual room card with progress data
function updateRoomCard(card, roomName, config, progress) {
    const progressPercentage = Math.round(progress.progress_percentage || 0);
    const isCompleted = progressPercentage >= 100;
    const isNotStarted = progressPercentage === 0;
    
    // Update progress bar
    const progressFill = card.querySelector('.progress-fill');
    const progressText = card.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
        progressFill.style.background = config.color;
    }
    
    if (progressText) {
        progressText.textContent = `${progressPercentage}%`;
    }
    
    // Update status icon and text
    const statusIcon = card.querySelector('.progress-status i');
    const statusText = card.querySelector('.progress-status span');
    
    if (statusIcon && statusText) {
        if (isCompleted) {
            statusIcon.className = 'bi bi-check-circle-fill';
            statusText.textContent = 'Completed';
            card.classList.add('completed');
            card.classList.remove('not-started');
        } else if (isNotStarted) {
            statusIcon.className = 'bi bi-lock';
            statusText.textContent = 'Not Started';
            card.classList.add('not-started');
            card.classList.remove('completed');
        } else {
            statusIcon.className = 'bi bi-play-circle-fill';
            statusText.textContent = 'In Progress';
            card.classList.remove('completed', 'not-started');
        }
    }
    
    // Update progress details
    const scoreElement = card.querySelector('.progress-score');
    const levelElement = card.querySelector('.progress-level');
    
    if (scoreElement) {
        scoreElement.textContent = `Score: ${progress.score || 0}`;
    }
    
    if (levelElement) {
        levelElement.textContent = `Level: ${progress.current_level || 1}`;
    }
    
    // Add time spent if available
    if (progress.time_spent && progress.time_spent > 0) {
        let timeElement = card.querySelector('.progress-time');
        if (!timeElement) {
            timeElement = document.createElement('span');
            timeElement.className = 'progress-time';
            card.querySelector('.progress-details').appendChild(timeElement);
        }
        timeElement.textContent = formatTime(progress.time_spent);
    }
    
    // Check for last played room
    const lastPlayed = getLastPlayedRoom();
    if (lastPlayed === roomName) {
        if (!card.querySelector('.last-played-badge')) {
            const badge = document.createElement('div');
            badge.className = 'last-played-badge';
            badge.innerHTML = `
                <i class="bi bi-clock-history"></i>
                Last Played
            `;
            card.insertBefore(badge, card.firstChild);
        }
    } else {
        const existingBadge = card.querySelector('.last-played-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }
}

// Create individual room card element
function createRoomCard(roomName, config, progress) {
    const card = document.createElement('div');
    card.className = 'room-card active';
    card.onclick = () => navigateToRoom(roomName);
    
    const progressPercentage = Math.round(progress.progress_percentage || 0);
    const isCompleted = progressPercentage >= 100;
    const isNotStarted = progressPercentage === 0;
    
    // Add status classes
    if (isCompleted) {
        card.classList.add('completed');
    } else if (isNotStarted) {
        card.classList.add('not-started');
    }
    
    // Get last played status
    const lastPlayed = getLastPlayedRoom();
    const isLastPlayed = lastPlayed === roomName;
    
    card.innerHTML = `
        ${isLastPlayed ? `
            <div class="last-played-badge">
                <i class="bi bi-clock-history"></i>
                Last Played
            </div>
        ` : ''}
        <h3>${config.displayName}</h3>
        <div class="room-description">
            <small>${config.description}</small>
        </div>
        <div class="room-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%; background: ${config.color};">
                    <span class="progress-text">${progressPercentage}%</span>
                </div>
            </div>
            <div class="progress-info">
                <div class="progress-status">
                    <i class="bi ${isCompleted ? 'bi-check-circle-fill' : isNotStarted ? 'bi-lock' : 'bi-play-circle-fill'}"></i>
                    <span>${isCompleted ? 'Completed' : isNotStarted ? 'Not Started' : 'In Progress'}</span>
                </div>
                <div class="progress-details">
                    <span class="progress-score">Score: ${progress.score || 0}</span>
                    <span class="progress-level">Level: ${progress.current_level || 1}</span>
                    ${progress.time_spent ? `<span class="progress-time">${formatTime(progress.time_spent)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Update room progress summary in overview section
function updateRoomProgressSummary(progressData) {
    const summaryContainer = document.querySelector('.room-progress-summary');
    if (!summaryContainer) return;

    // Clear existing summary
    summaryContainer.innerHTML = '';

    // Create summary items for top 3 rooms
    const topRooms = Object.keys(ROOM_CONFIG).slice(0, 3);
    
    topRooms.forEach(roomName => {
        const roomConfig = ROOM_CONFIG[roomName];
        const roomProgress = progressData[roomName] || { progress_percentage: 0 };
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'room-progress-item';
        
        summaryItem.innerHTML = `
            <i class="bi ${roomConfig.icon}" style="color: ${roomConfig.color};"></i>
            <span>${roomConfig.displayName}</span>
            <div class="mini-progress">
                <div class="mini-fill" style="width: ${roomProgress.progress_percentage || 0}%; background: ${roomConfig.color};"></div>
            </div>
        `;
        
        summaryContainer.appendChild(summaryItem);
    });
}

// Calculate overall progress across all rooms
function calculateOverallProgress(progressData) {
    const roomNames = Object.keys(ROOM_CONFIG);
    const totalProgress = roomNames.reduce((sum, roomName) => {
        const progress = progressData[roomName]?.progress_percentage || 0;
        return sum + progress;
    }, 0);
    
    return Math.round(totalProgress / roomNames.length);
}

// Load progress from local storage as fallback
function loadLocalProgress() {
    console.log('📦 Loading fallback progress from local storage');
    
    // Try to get existing progress from localStorage
    const existingProgress = localStorage.getItem('userProgress');
    let defaultProgress;
    
    if (existingProgress) {
        try {
            defaultProgress = JSON.parse(existingProgress);
        } catch (e) {
            console.warn('Failed to parse stored progress, using defaults');
        }
    }
    
    // Default progress for new users or fallback
    if (!defaultProgress) {
        defaultProgress = {
            'flowchart': { progress_percentage: 0, score: 0, current_level: 1, time_spent: 0 },
            'netxus': { progress_percentage: 0, score: 0, current_level: 1, time_spent: 0 },
            'aitrix': { progress_percentage: 0, score: 0, current_level: 1, time_spent: 0 },
            'schemax': { progress_percentage: 0, score: 0, current_level: 1, time_spent: 0 },
            'codevance': { progress_percentage: 0, score: 0, current_level: 1, time_spent: 0 }
        };
    }
    
    updateDashboardProgress(defaultProgress);
}

// Listen for progress updates
function setupProgressListeners() {
    // Listen for progress updates from games
    document.addEventListener('progress-updated', (event) => {
        console.log('🔄 Progress update received:', event.detail);
        // Refresh dashboard data
        setTimeout(() => loadUserProgress(), 500);
    });
    
    // Listen for progress loaded events
    document.addEventListener('progress-loaded', (event) => {
        console.log('📊 Progress loaded:', event.detail);
        if (event.detail.progress) {
            updateDashboardProgress(event.detail.progress);
        }
    });
    
    // Listen for room completions
    document.addEventListener('roomCompleted', (event) => {
        console.log('🎉 Room completion received:', event.detail);
        // Refresh dashboard data
        setTimeout(() => loadUserProgress(), 500);
    });
    
    // Listen for level completions
    document.addEventListener('levelCompleted', (event) => {
        console.log('⭐ Level completion received:', event.detail);
        // Refresh dashboard data 
        setTimeout(() => loadUserProgress(), 300);
    });
}

// Update progress statistics
function updateProgressStats(progressData, overallStats = null) {
    let totalScore, totalTime, completedRooms;
    
    if (overallStats) {
        // Use provided overall stats (from API)
        totalScore = overallStats.total_score || 0;
        completedRooms = overallStats.completed_rooms || 0;
        totalTime = calculateTotalTime(progressData); // Still need to calculate time
    } else {
        // Calculate from room data
        totalScore = calculateTotalScore(progressData);
        totalTime = calculateTotalTime(progressData);
        completedRooms = calculateCompletedRooms(progressData);
    }
    
    // Update DOM elements
    const totalScoreElement = document.querySelector('#total-score');
    const totalTimeElement = document.querySelector('#total-time');
    const completedRoomsElement = document.querySelector('#completed-rooms');
    
    if (totalScoreElement) {
        totalScoreElement.textContent = totalScore.toLocaleString();
    }
    
    if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(totalTime);
    }
    
    if (completedRoomsElement) {
        const totalRooms = Object.keys(ROOM_CONFIG).length;
        completedRoomsElement.textContent = `${completedRooms}/${totalRooms}`;
    }
}

// Calculate total score across all rooms
function calculateTotalScore(progressData) {
    let total = 0;
    
    // Handle both API format and local format
    if (progressData.room_progress && Array.isArray(progressData.room_progress)) {
        total = progressData.room_progress.reduce((sum, room) => {
            return sum + (room.score || 0);
        }, 0);
    } else {
        total = Object.values(progressData).reduce((sum, room) => {
            return sum + (room.score || 0);
        }, 0);
    }
    
    return total;
}

// Calculate total time spent
function calculateTotalTime(progressData) {
    let total = 0;
    
    // Handle both API format and local format
    if (progressData.room_progress && Array.isArray(progressData.room_progress)) {
        total = progressData.room_progress.reduce((sum, room) => {
            return sum + (room.time_spent || 0);
        }, 0);
    } else {
        total = Object.values(progressData).reduce((sum, room) => {
            return sum + (room.time_spent || 0);
        }, 0);
    }
    
    return total;
}

// Calculate completed rooms
function calculateCompletedRooms(progressData) {
    let completed = 0;
    
    // Handle both API format and local format
    if (progressData.room_progress && Array.isArray(progressData.room_progress)) {
        completed = progressData.room_progress.filter(room => {
            return room.completed || (room.progress_percentage || 0) >= 100;
        }).length;
    } else {
        completed = Object.values(progressData).filter(room => {
            return room.completed || (room.progress_percentage || 0) >= 100;
        }).length;
    }
    
    return completed;
}

// Format time in seconds to readable format
function formatTime(seconds) {
    if (!seconds || seconds < 60) {
        return '< 1m';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Get last played room from local storage
function getLastPlayedRoom() {
    return localStorage.getItem('lastPlayedRoom') || null;
}

// Set last played room
function setLastPlayedRoom(roomName) {
    localStorage.setItem('lastPlayedRoom', roomName);
}

// Enhanced room navigation with tracking
function navigateToRoom(roomType) {
    // Update last played room
    setLastPlayedRoom(roomType);
    
    // Navigate to command center and then to specific room
    sessionStorage.setItem('targetRoom', roomType);
    window.location.href = '/src/pages/command-center.html';
}

function toggleHelp() {
    const helpPanel = document.getElementById('helpPanel');
    helpPanel.classList.toggle('active');
    
    // Prevent body scroll when help panel is open on mobile
    if (helpPanel.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function toggleProfile() {
    const profilePanel = document.getElementById('profilePanel');
    profilePanel.classList.toggle('active');

    // Prevent body scroll when profile panel is open on mobile
    if (profilePanel.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function editProfile() {
    openEditProfileModal();
}

function changePassword() {
    openChangePasswordModal();
}

function logout() {
    console.log('User logging out...');
    
    // Clear all user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('totalScore');
    localStorage.removeItem('currentStreak');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
    
    // Redirect to main page
    window.location.href = '/index.html';
}

function updateUserDisplay(username) {
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('welcomeUsername').textContent = username;
}

function startGame() {
    window.location.href = '/src/pages/command-center.html';
}

function goToDashboard() {
    window.location.href = '/src/pages/dashboard/user-dashboard.html';
}

// Add new function for room navigation from dashboard
function originalNavigateToRoom(roomType) {
    // Navigate to command center and then to specific room
    sessionStorage.setItem('targetRoom', roomType);
    window.location.href = '/src/pages/command-center.html';
}

function scrollBadges(direction) {
    const container = document.querySelector('.badges-grid');
    const scrollAmount = 200;
    if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

function toggleBadgeFullscreen() {
    const modal = document.getElementById('badgeModal');
    const badges = document.querySelector('.badges-grid');
    
    if (!modal.classList.contains('active')) {
        const unlockedGrid = modal.querySelector('.unlocked-badges');
        const lockedGrid = modal.querySelector('.locked-badges');
        
        // Clear existing badges
        unlockedGrid.innerHTML = '';
        lockedGrid.innerHTML = '';
        
        // Clone and sort badges
        badges.querySelectorAll('.badge-item').forEach(badge => {
            const clone = badge.cloneNode(true);
            clone.classList.remove('hidden-badge');
            
            if (badge.classList.contains('locked')) {
                lockedGrid.appendChild(clone);
            } else {
                unlockedGrid.appendChild(clone);
            }
        });
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('badgeModal');
        if (modal.classList.contains('active')) {
            toggleBadgeFullscreen();
        }
    }
});

function playCutscene() {
    // Show cutscene overlay/modal
    const cutsceneOverlay = document.createElement('div');
    cutsceneOverlay.id = 'cutsceneOverlay';
    cutsceneOverlay.className = 'cutscene-overlay';
    cutsceneOverlay.innerHTML = `
        <div class="cutscene-container">
            <video id="cutsceneVideo" class="cutscene-video" controls autoplay>
                <source src="/static/video/intro-cutscene.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <button class="close-cutscene" onclick="closeCutscene()">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(cutsceneOverlay);
    document.body.style.overflow = 'hidden';
    
    // Add styles for cutscene overlay
    const style = document.createElement('style');
    style.textContent = `
        .cutscene-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .cutscene-container {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
        }
        
        .cutscene-video {
            width: 100%;
            height: 100%;
            max-width: 800px;
            max-height: 600px;
        }
        
        .close-cutscene {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid #A069FF;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            color: #A069FF;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        
        .close-cutscene:hover {
            background: rgba(160, 105, 255, 0.2);
            transform: scale(1.1);
        }
    `;
    
    if (!document.getElementById('cutscene-styles')) {
        style.id = 'cutscene-styles';
        document.head.appendChild(style);
    }
}

function closeCutscene() {
    const overlay = document.getElementById('cutsceneOverlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = 'auto';
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Dashboard.js loading - checking authentication...');
    
    // Get authentication data
    const username = localStorage.getItem('currentUser');
    const email = localStorage.getItem('currentEmail');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Authentication data:', { username, email, userRole });
    
    if (!username) {
        console.log('❌ No authenticated user found, redirecting to login...');
        window.location.href = '/index.html';
        return;
    }
    
    // CRITICAL FIX: Check for admin role IMMEDIATELY and redirect
    if (userRole === 'admin' || username === 'admin') {
        console.log('🔐 ADMIN USER DETECTED!');
        console.log('   • Username:', username);
        console.log('   • Role:', userRole);
        console.log('   • Forcing admin flag...');
        
        // Force set admin flag
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userRole', 'admin');
        
        console.log('🚀 Redirecting to admin dashboard...');
        
        // Immediate redirect with no delay
        window.location.replace('/src/pages/dashboard/admin-dashboard.html');
        return; // STOP ALL EXECUTION
    }
    
    console.log('👤 Regular user confirmed, proceeding with user dashboard...');
    
    // Update profile info for regular users
    const profileUsernameElement = document.getElementById('profileUsername');
    const profileEmailElement = document.getElementById('profileEmail');
    const welcomeUsernameElement = document.getElementById('welcomeUsername');
    
    if (profileUsernameElement) {
        profileUsernameElement.textContent = username;
    }
    
    if (profileEmailElement) {
        profileEmailElement.textContent = email || `${username}@ascended.lab`;
    }
    
    if (welcomeUsernameElement) {
        welcomeUsernameElement.textContent = username;
    }
    
    // Initialize progress tracking and load user progress
    setupProgressListeners();
    
    // Load initial progress
    loadUserProgress();
    
    // Set up periodic refresh every 30 seconds to catch any missed updates
    setInterval(() => {
        console.log('🔄 Periodic dashboard refresh...');
        loadUserProgress();
    }, 30000);
    
    console.log('User dashboard initialized successfully for:', username);
});

// Close panels when clicking outside
document.addEventListener('click', function(event) {
    const helpPanel = document.getElementById('helpPanel');
    const profilePanel = document.getElementById('profilePanel');
    const helpBtn = document.querySelector('.help-btn');
    const profileBtn = document.querySelector('.profile-btn');
    
    // Close help panel if clicking outside
    if (helpPanel.classList.contains('active') && 
        !helpPanel.contains(event.target) && 
        !helpBtn.contains(event.target)) {
        helpPanel.classList.remove('active');
    }
    
    // Close profile panel if clicking outside
    if (profilePanel.classList.contains('active') && 
        !profilePanel.contains(event.target) && 
        !profileBtn.contains(event.target)) {
        profilePanel.classList.remove('active');
    }
});

// Make functions globally accessible
window.toggleHelp = toggleHelp;
window.toggleProfile = toggleProfile;
window.editProfile = editProfile;
window.changePassword = changePassword;
window.logout = logout;
window.startGame = startGame;
window.goToDashboard = goToDashboard;
window.navigateToRoom = navigateToRoom;
window.scrollBadges = scrollBadges;
window.toggleBadgeFullscreen = toggleBadgeFullscreen;
window.playCutscene = playCutscene;
window.closeCutscene = closeCutscene;
window.loadUserProgress = loadUserProgress;

// Profile Management Functions
function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const currentUser = localStorage.getItem('currentUser');
    const currentEmail = localStorage.getItem('currentEmail');
    
    // Pre-fill current values
    document.getElementById('editUsername').value = currentUser || '';
    document.getElementById('editEmail').value = currentEmail || '';
    
    // Clear any previous errors
    clearModalErrors();
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    clearModalErrors();
}

function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    
    // Clear form
    document.getElementById('changePasswordForm').reset();
    clearModalErrors();
    updatePasswordRequirements('');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    clearModalErrors();
}

function clearModalErrors() {
    const errorElements = document.querySelectorAll('.error-message, .success-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

async function saveProfile(event) {
    event.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const saveBtn = document.getElementById('saveProfileBtn');
    
    // Validate inputs
    if (!username || username.length < 2) {
        showError('usernameError', 'Username must be at least 2 characters long');
        return;
    }
    
    if (!email || !email.includes('@')) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    // Clear previous errors
    clearModalErrors();
    
    // Disable button and show loading
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="bi bi-spinner spin"></i> Saving...';
    
    try {
        const response = await fetch(`/api/users/${userId}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: username,
                email: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update localStorage with new values
            localStorage.setItem('currentUser', data.user.name);
            localStorage.setItem('currentEmail', data.user.email);
            
            // Update UI displays
            updateUserDisplay(data.user.name);
            document.getElementById('profileEmail').textContent = data.user.email;
            
            // Show success and close modal
            showSuccess('usernameError', 'Profile updated successfully!');
            setTimeout(() => {
                closeEditProfileModal();
            }, 1500);
            
        } else {
            showError('usernameError', data.error || 'Failed to update profile');
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        showError('usernameError', 'Network error. Please try again.');
    } finally {
        // Re-enable button
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-check-circle"></i> Save Changes';
    }
}

async function changeUserPassword(event) {
    event.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const changeBtn = document.getElementById('changePasswordBtn');
    
    // Validate inputs
    if (!currentPassword) {
        showError('currentPasswordError', 'Current password is required');
        return;
    }
    
    if (!newPassword) {
        showError('newPasswordError', 'New password is required');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        return;
    }
    
    // Validate password strength
    const validationErrors = validatePasswordStrength(newPassword);
    if (validationErrors.length > 0) {
        showError('newPasswordError', validationErrors[0]);
        return;
    }
    
    // Clear previous errors
    clearModalErrors();
    
    // Disable button and show loading
    changeBtn.disabled = true;
    changeBtn.innerHTML = '<i class="bi bi-spinner spin"></i> Changing...';
    
    try {
        const response = await fetch(`/api/users/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success and close modal
            showSuccess('currentPasswordError', 'Password changed successfully!');
            setTimeout(() => {
                closeChangePasswordModal();
            }, 1500);
            
        } else {
            showError('currentPasswordError', data.error || 'Failed to change password');
        }
        
    } catch (error) {
        console.error('Password change error:', error);
        showError('currentPasswordError', 'Network error. Please try again.');
    } finally {
        // Re-enable button
        changeBtn.disabled = false;
        changeBtn.innerHTML = '<i class="bi bi-check-circle"></i> Change Password';
    }
}

function validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return errors;
}

function updatePasswordRequirements(password) {
    const requirements = [
        { id: 'req-length', test: password.length >= 12 },
        { id: 'req-uppercase', test: /[A-Z]/.test(password) },
        { id: 'req-lowercase', test: /[a-z]/.test(password) },
        { id: 'req-number', test: /[0-9]/.test(password) },
        { id: 'req-special', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) }
    ];
    
    requirements.forEach(req => {
        const element = document.getElementById(req.id);
        if (element) {
            element.className = req.test ? 'requirement-met' : 'requirement-unmet';
        }
    });
}

// Event listeners for forms and password validation
document.addEventListener('DOMContentLoaded', function() {
    // Edit Profile Form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', saveProfile);
    }
    
    // Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', changeUserPassword);
    }
    
    // Password strength validation
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordRequirements(this.value);
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const editModal = document.getElementById('editProfileModal');
        const passwordModal = document.getElementById('changePasswordModal');
        
        if (event.target === editModal) {
            closeEditProfileModal();
        }
        
        if (event.target === passwordModal) {
            closeChangePasswordModal();
        }
    });
});

// Make modal functions globally accessible
window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.updateDashboardProgress = updateDashboardProgress;
window.formatTime = formatTime;
