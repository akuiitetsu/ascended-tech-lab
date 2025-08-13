/* ============================================
   DASHBOARD FUNCTIONS
   ============================================ */

import auth from './auth.js';

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
    alert('Edit Profile functionality would be implemented here');
}

function changePassword() {
    alert('Change Password functionality would be implemented here');
}

function logout() {
    auth.logout();
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
    window.location.href = 'user-dashboard.html';
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
    // Check authentication on load
    const username = localStorage.getItem('currentUser');
    const email = localStorage.getItem('currentEmail');
    
    if (!username) {
        window.location.href = '/index.html';
        return;
    }
    
    // Update profile info
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('profileEmail').textContent = email || `${username}@ascended.lab`;
    
    // Update welcome username if element exists
    const welcomeUsername = document.getElementById('welcomeUsername');
    if (welcomeUsername) {
        welcomeUsername.textContent = username;
    }
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
window.scrollBadges = scrollBadges;
window.toggleBadgeFullscreen = toggleBadgeFullscreen;
window.playCutscene = playCutscene;
window.closeCutscene = closeCutscene;
