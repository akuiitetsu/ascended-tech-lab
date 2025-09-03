import auth from './auth.js';

/* ============================================
   WELCOME SCREEN FUNCTIONS
   ============================================ */
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

/* ============================================
   LOG IN FUNCTIONS
   ============================================ */
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username) {
        alert('Please enter your username');
        return;
    }
    
    if (!password) {
        alert('Please enter your password');
        return;
    }
    
    try {
        console.log(`Trying to login user: ${username} with password provided`);
        
        // Login with proper credentials
        const user = await auth.login(username, password);
        updateProfileInfo(user.username, user.email);
        
        // Clear the form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        showWelcomeScreen();
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}

/* ============================================
   REGISTER FUNCTIONS
   ============================================ */
function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        // Direct registration without email verification
        const userData = {
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };
        
        const result = await auth.register(userData);
        
        alert('Registration successful! Please login with your new account.');
        
        // Clear form fields
        document.getElementById('regUsername').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirmPassword').value = '';
        
        toggleAuthMode(); // Switch back to login form
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
    }
}

function showWelcomeScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'flex';
}

/* ============================================
   PROFILE FUNCTIONS
   ============================================ */
function toggleProfile() {
    const profilePanel = document.getElementById('profilePanel');
    profilePanel.classList.toggle('active');
}

function editProfile() {
    alert('Edit Profile functionality would be implemented here');
}

function changePassword() {
    alert('Change Password functionality would be implemented here');
}

function logout() {
    auth.logout();
    window.location.href = 'index.html';
}

// Update profile info when user logs in
function updateProfileInfo(username, email = 'user@example.com') {
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('profileEmail').textContent = email;
}

/* ============================================
   CUTSCENE FUNCTIONS
   ============================================ */
function startGame(event) {
    event.preventDefault();
    
    // Hide welcome screen
    document.getElementById('welcomeScreen').style.display = 'none';
    
    // Show cutscene screen
    document.getElementById('cutsceneScreen').style.display = 'flex';
    
    // Start playing the cutscene
    playCutscene();
}

function playCutscene() {
    const video = document.getElementById('introCutscene');
    const overlay = document.getElementById('cutsceneOverlay');
    const progressBar = document.getElementById('progressBar');
    
    // Show loading overlay initially
    overlay.style.display = 'flex';
    
    // Set up video event listeners
    video.addEventListener('loadeddata', function() {
        // Hide loading overlay when video is ready
        overlay.style.display = 'none';
        
        // Start playing
        video.play().catch(function(error) {
            console.log('Video autoplay failed:', error);
            // Show a play button if autoplay fails
            showPlayButton();
        });
    });
    
    video.addEventListener('timeupdate', function() {
        // Update progress bar
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = progress + '%';
    });
    
    video.addEventListener('ended', function() {
        // Cutscene finished, proceed to game
        endCutscene();
    });
    
    video.addEventListener('error', function() {
        console.log('Video failed to load');
        // Skip to game if video fails
        endCutscene();
    });
    
    // Load the video
    video.load();
}

function skipCutscene() {
    const video = document.getElementById('introCutscene');
    video.pause();
    endCutscene();
}

function endCutscene() {
    // Hide cutscene screen
    document.getElementById('cutsceneScreen').style.display = 'none';
    
    // Redirect to user dashboard
    window.location.href = 'src/pages/dashboard/user-dashboard.html';
    
    // Reset video for next time
    const video = document.getElementById('introCutscene');
    video.currentTime = 0;
    document.getElementById('progressBar').style.width = '0%';
}

function showPlayButton() {
    const overlay = document.getElementById('cutsceneOverlay');
    overlay.innerHTML = `
        <div class="manual-play">
            <button onclick="manualPlay()" class="manual-play-btn">
                <i class="bi bi-play-circle"></i>
                <p>Click to Play Intro</p>
            </button>
        </div>
    `;
    overlay.style.display = 'flex';
}

function manualPlay() {
    const video = document.getElementById('introCutscene');
    const overlay = document.getElementById('cutsceneOverlay');
    
    video.play();
    overlay.style.display = 'none';
}

// Add space key skip functionality
document.addEventListener('keydown', function(event) {
    const cutsceneScreen = document.getElementById('cutsceneScreen');
    if (event.code === 'Space' && cutsceneScreen.style.display !== 'none') {
        skipCutscene();
    }
});

/* ============================================
   RESPONSIVE UTILITIES
   ============================================ */
   
// Handle orientation change
window.addEventListener('orientationchange', function() {
    // Small delay to allow for orientation change to complete
    setTimeout(function() {
        // Recalculate any responsive elements if needed
        const helpPanel = document.getElementById('helpPanel');
        if (helpPanel && helpPanel.classList.contains('active')) {
            // Ensure help panel is properly positioned after orientation change
            helpPanel.style.right = '0';
        }
    }, 100);
});

// Handle resize for responsive adjustments
window.addEventListener('resize', function() {
    // Ensure responsive behavior on window resize
    const helpPanel = document.getElementById('helpPanel');
    if (helpPanel && helpPanel.classList.contains('active')) {
        // Adjust help panel width based on new viewport size
        if (window.innerWidth <= 480) {
            helpPanel.style.width = '95vw';
        } else if (window.innerWidth <= 768) {
            helpPanel.style.width = '85vw';
        } else {
            helpPanel.style.width = '400px';
        }
    }
});

// Make functions globally accessible
window.toggleHelp = toggleHelp;
window.handleLogin = handleLogin;
window.toggleAuthMode = toggleAuthMode;
window.handleRegister = handleRegister;
window.toggleProfile = toggleProfile;
window.editProfile = editProfile;
window.changePassword = changePassword;
window.logout = logout;
window.startGame = startGame;
window.skipCutscene = skipCutscene;
window.manualPlay = manualPlay;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (auth.isAuthenticated()) {
        const user = auth.getCurrentUser();
        if (user) {
            updateProfileInfo(user.username, user.email);
            showWelcomeScreen();
        }
    }
});