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
    
    // Enhanced password security validation
    const passwordValidation = auth.validatePasswordSecurity(password);
    if (!passwordValidation.isValid) {
        const errorMessage = 'Password security requirements not met:\n\n• ' + 
            passwordValidation.errors.join('\n• ') + 
            '\n\nPassword Requirements:\n• 12+ characters minimum\n• At least one uppercase letter (A-Z)\n• At least one lowercase letter (a-z)\n• At least one number (0-9)\n• At least one special character (!@#$%^&*)\n• No common weak patterns or sequential characters';
        alert(errorMessage);
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Additional field validation
    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
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
        
        alert('Registration successful! Your account has been created with enhanced security. Please login with your new account.');
        
        // Clear form fields
        document.getElementById('regUsername').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirmPassword').value = '';
        
        // Reset password indicators
        resetPasswordIndicators();
        
        toggleAuthMode(); // Switch back to login form
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
    }
}

// Email validation helper function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength indicator functions
function setupPasswordStrengthIndicator() {
    const passwordField = document.getElementById('regPassword');
    const confirmPasswordField = document.getElementById('regConfirmPassword');
    
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
        
        passwordField.addEventListener('focus', function() {
            const container = document.getElementById('passwordStrengthContainer');
            container.style.display = 'block';
            // Scroll to keep the form visible
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });
    }
    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            updatePasswordMatch();
        });
        
        confirmPasswordField.addEventListener('focus', function() {
            const indicator = document.getElementById('passwordMatchIndicator');
            indicator.style.display = 'block';
            // Scroll to keep the form visible
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });
        
        passwordField.addEventListener('input', function() {
            if (confirmPasswordField.value) {
                updatePasswordMatch();
            }
        });
    }
}

function updatePasswordStrength(password) {
    const strengthContainer = document.getElementById('passwordStrengthContainer');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'strength-bar';
        strengthText.textContent = 'Password strength: None';
        updateRequirements(password);
        return;
    }
    
    const validation = auth.validatePasswordSecurity(password);
    const strength = validation.strength;
    
    // Update strength bar
    strengthBar.style.width = strength + '%';
    strengthBar.className = 'strength-bar';
    
    let strengthLabel = '';
    if (strength < 30) {
        strengthLabel = 'Weak';
        strengthBar.classList.add('weak');
    } else if (strength < 60) {
        strengthLabel = 'Fair';
        strengthBar.classList.add('fair');
    } else if (strength < 80) {
        strengthLabel = 'Good';
        strengthBar.classList.add('good');
    } else {
        strengthLabel = 'Strong';
        strengthBar.classList.add('strong');
    }
    
    strengthText.textContent = `Password strength: ${strengthLabel} (${strength}%)`;
    
    updateRequirements(password);
}

function updateRequirements(password) {
    const requirements = [
        { id: 'reqLength', test: password.length >= 12 },
        { id: 'reqUppercase', test: /[A-Z]/.test(password) },
        { id: 'reqLowercase', test: /[a-z]/.test(password) },
        { id: 'reqNumber', test: /[0-9]/.test(password) },
        { id: 'reqSpecial', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) },
        { id: 'reqPatterns', test: !hasWeakPatterns(password) }
    ];
    
    requirements.forEach(req => {
        const element = document.getElementById(req.id);
        if (element) {
            if (req.test) {
                element.className = 'requirement met';
                element.innerHTML = element.innerHTML.replace('✗', '✓');
            } else {
                element.className = 'requirement unmet';
                element.innerHTML = element.innerHTML.replace('✓', '✗');
            }
        }
    });
}

function hasWeakPatterns(password) {
    const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /admin/i,
        /letmein/i,
        /welcome/i,
        /^(.)\1{2,}/, // Repeated characters
        /(.{2,})\1{2,}/ // Repeated sequences
    ];
    
    for (let pattern of commonPatterns) {
        if (pattern.test(password)) {
            return true;
        }
    }
    
    // Check for sequential characters
    for (let i = 0; i < password.length - 2; i++) {
        const char1 = password.charCodeAt(i);
        const char2 = password.charCodeAt(i + 1);
        const char3 = password.charCodeAt(i + 2);
        
        if ((char2 === char1 + 1 && char3 === char2 + 1) || 
            (char2 === char1 - 1 && char3 === char2 - 1)) {
            return true;
        }
    }
    
    return false;
}

function updatePasswordMatch() {
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const matchIndicator = document.getElementById('passwordMatchIndicator');
    
    if (!confirmPassword) {
        matchIndicator.textContent = '';
        matchIndicator.className = 'password-match-indicator';
        return;
    }
    
    if (password === confirmPassword) {
        matchIndicator.textContent = '✓ Passwords match';
        matchIndicator.className = 'password-match-indicator match';
    } else {
        matchIndicator.textContent = '✗ Passwords do not match';
        matchIndicator.className = 'password-match-indicator no-match';
    }
}

function resetPasswordIndicators() {
    const strengthContainer = document.getElementById('passwordStrengthContainer');
    const matchIndicator = document.getElementById('passwordMatchIndicator');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    strengthContainer.style.display = 'none';
    matchIndicator.style.display = 'none';
    strengthBar.style.width = '0%';
    strengthBar.className = 'strength-bar';
    strengthText.textContent = 'Password strength: None';
    matchIndicator.textContent = '';
    matchIndicator.className = 'password-match-indicator';
    
    // Reset all requirements
    updateRequirements('');
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
    
    // Set up password strength indicator for registration
    setupPasswordStrengthIndicator();
});