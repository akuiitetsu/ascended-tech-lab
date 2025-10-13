/* ============================================
   COMMAND CENTER FUNCTIONS
   ============================================ */
function toggleHelp() {
    const helpPanel = document.getElementById('helpPanel');
    helpPanel.classList.toggle('active');
    
    if (helpPanel.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function toggleProfile() {
    const profilePanel = document.getElementById('profilePanel');
    profilePanel.classList.toggle('active');
    
    if (profilePanel.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Initialize command center when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get username from localStorage or use default
    const username = localStorage.getItem('currentUser') || 'Tech Master';
    const email = localStorage.getItem('currentEmail') || 'user@ascended.lab';
    
    // Update profile info
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('profileEmail').textContent = email;
});

// Handle panel clicks
document.addEventListener('click', function(event) {
    const helpPanel = document.getElementById('helpPanel');
    const profilePanel = document.getElementById('profilePanel');
    const helpBtn = document.querySelector('.help-btn');
    const profileBtn = document.querySelector('.profile-btn');
    
    if (helpPanel.classList.contains('active') && 
        !helpPanel.contains(event.target) && 
        !helpBtn.contains(event.target)) {
        helpPanel.classList.remove('active');
    }
    
    if (profilePanel.classList.contains('active') && 
        !profilePanel.contains(event.target) && 
        !profileBtn.contains(event.target)) {
        profilePanel.classList.remove('active');
    }
});
