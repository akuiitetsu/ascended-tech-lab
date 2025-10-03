// ============================================
// UNIVERSAL MOBILE UTILITIES
// ============================================

const MobileUtils = {
    // Device detection
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isTablet() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    },
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // Viewport management
    setupMobileViewport() {
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 100);
        });
    },
    
    // Enhanced touch feedback for game interfaces
    enhanceGameTouchFeedback(container) {
        const gameElements = container.querySelectorAll('.difficulty-btn, .game-btn, .answer-option, .code-option, .flowchart-node, .network-node');
        
        gameElements.forEach(element => {
            element.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.95)';
                this.style.filter = 'brightness(1.2)';
                this.style.transition = 'all 0.1s ease';
            });
            
            element.addEventListener('touchend', function(e) {
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.filter = '';
                    this.style.transition = 'all 0.2s ease';
                }, 100);
            });
            
            element.addEventListener('touchcancel', function(e) {
                this.style.transform = '';
                this.style.filter = '';
                this.style.transition = 'all 0.2s ease';
            });
        });
    },
    
    // Initialize mobile enhancements for any game room
    initGameRoom() {
        this.setupMobileViewport();
        
        // Add mobile classes
        document.body.classList.add('mobile-ready');
        if (this.isMobile()) document.body.classList.add('mobile-device');
        if (this.isTablet()) document.body.classList.add('tablet-device');
        if (this.isTouchDevice()) document.body.classList.add('touch-device');
        
        // Enhance touch feedback for the entire document
        this.enhanceGameTouchFeedback(document);
        
        // Prevent zoom on inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'file') {
                input.style.fontSize = '16px';
            }
        });
    }
};

// Global swipe handler for game navigation
const SwipeHandler = {
    startX: 0, startY: 0, endX: 0, endY: 0,
    minSwipeDistance: 50,
    
    init(element, callbacks = {}) {
        element.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        });
        
        element.addEventListener('touchend', (e) => {
            this.endX = e.changedTouches[0].clientX;
            this.endY = e.changedTouches[0].clientY;
            this.handleSwipe(callbacks);
        });
    },
    
    handleSwipe(callbacks) {
        const deltaX = this.endX - this.startX;
        const deltaY = this.endY - this.startY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
            if (deltaX > 0 && callbacks.onSwipeRight) callbacks.onSwipeRight();
            else if (deltaX < 0 && callbacks.onSwipeLeft) callbacks.onSwipeLeft();
        } else if (Math.abs(deltaY) > this.minSwipeDistance) {
            if (deltaY > 0 && callbacks.onSwipeDown) callbacks.onSwipeDown();
            else if (deltaY < 0 && callbacks.onSwipeUp) callbacks.onSwipeUp();
        }
    }
};

import auth from './auth.js';

/* ============================================
   MOBILE TOUCH ENHANCEMENTS
   ============================================ */

// Enhanced mobile touch handling
function setupMobileTouchHandlers() {
    // Prevent default touch behaviors that interfere with the app
    document.addEventListener('touchstart', function(e) {
        // Allow scrolling and interaction with input elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || 
            e.target.closest('.scrollable') || e.target.closest('.modal')) {
            return;
        }
        
        // Prevent double-tap zoom on most elements
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Enhanced button touch feedback
    const touchElements = document.querySelectorAll('button, .btn, .clickable, [onclick]');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
}

// Mobile-optimized help panel
function setupMobileHelpPanel() {
    const helpPanel = document.getElementById('helpPanel');
    if (!helpPanel) return;
    
    // Add swipe to close gesture
    let startX = 0;
    let startY = 0;
    
    helpPanel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    helpPanel.addEventListener('touchmove', function(e) {
        if (!helpPanel.classList.contains('active')) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = Math.abs(startY - currentY);
        
        // If swiping right and it's more horizontal than vertical
        if (diffX < -50 && diffY < 100) {
            toggleHelp();
        }
    }, { passive: true });
}

// Mobile-optimized profile panel (disabled - only available in dashboard)
function setupMobileProfilePanel() {
    // Profile panel is only available in the user dashboard
    // No mobile profile panel setup needed on this page
}

// Mobile viewport height adjustment
function handleMobileViewport() {
    // Fix viewport height issues on mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 500);
    });
}

// Enhanced mobile form handling
function setupMobileFormEnhancements() {
    // Prevent zoom on input focus for iOS
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Ensure font-size is 16px or larger to prevent zoom
        const computedStyle = window.getComputedStyle(input);
        if (parseFloat(computedStyle.fontSize) < 16) {
            input.style.fontSize = '16px';
        }
        
        // Add mobile-friendly touch handling
        input.addEventListener('focus', function() {
            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}

// Device detection and mobile-specific features
function detectMobileFeatures() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768;
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        
        // Add mobile-specific styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device * {
                -webkit-tap-highlight-color: rgba(160, 105, 255, 0.3);
            }
            
            .mobile-device button:active,
            .mobile-device .btn:active {
                background-color: rgba(160, 105, 255, 0.2) !important;
            }
            
            .mobile-device input:focus,
            .mobile-device textarea:focus {
                outline: 2px solid #A069FF;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    if (isTablet) {
        document.body.classList.add('tablet-device');
    }
    
    return { isMobile, isTablet };
}

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
    const dataConsent = document.getElementById('dataConsentCheckbox').checked;
    
    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!dataConsent) {
        alert('Please agree to the educational use of your data to proceed with registration.');
        return;
    }
    
    // Enhanced password security validation
    const passwordValidation = auth.validatePasswordSecurity(password);
    if (!passwordValidation.isValid) {
        const errorMessage = 'Password security requirements not met:\n\n• ' + 
            passwordValidation.errors.join('\n• ') + 
            '\n\nPassword Requirements:\n• 12+ characters minimum\n• At least one uppercase letter (A-Z)\n• At least one lowercase letter (a-z)\n• At least one number (0-9)\n• At least one special character (!@#$%^&*)\n• No common sequences (e.g., "123456", "abc")\n• No common words (e.g., "password", "admin")\n• No repeated patterns (e.g., "abcabc", "111")';
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
    // Check for common number sequences
    if (/123456|234567|345678|456789|567890|678901|789012|890123|901234|012345/.test(password)) {
        return true;
    }
    
    // Check for common words and patterns
    if (/password|qwerty|admin|letmein|welcome/i.test(password)) {
        return true;
    }
    
    // Check for repeated characters (e.g., aaa, 111)
    if (/^(.)\1{2,}/.test(password)) {
        return true;
    }
    
    // Check for repeated sequences (e.g., abcabc, 123123)
    if (/(.{2,})\1{2,}/.test(password)) {
        return true;
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
    // Profile panel is only available in the user dashboard
    showNotification('User profile is only available in the dashboard', 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #51cf66, #40c057)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #ff6b6b, #fa5252)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(45deg, #ffd43b, #fab005)';
            break;
        default: // info
            notification.style.background = 'linear-gradient(45deg, #10a1fa, #339af0)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

function editProfile() {
    // Profile editing is only available in the user dashboard
    showNotification('Profile editing is only available in the user dashboard', 'info');
}

function changePassword() {
    // Password changing is only available in the user dashboard
    showNotification('Password changing is only available in the user dashboard', 'info');
}

function logout() {
    auth.logout();
    window.location.href = 'index.html';
}

// Update profile info when user logs in (only if elements exist)
function updateProfileInfo(username, email = 'user@example.com') {
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    
    // Only update elements if they exist (they won't exist on main page/command center)
    if (profileUsername) {
        profileUsername.textContent = username;
    }
    if (profileEmail) {
        profileEmail.textContent = email;
    }
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

// No profile management functions needed here - they're handled in dashboard.js

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

// No modal setup needed - profile functionality is in dashboard.js

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile enhancements setup
    const deviceInfo = detectMobileFeatures();
    handleMobileViewport();
    setupMobileTouchHandlers();
    setupMobileHelpPanel();
    setupMobileProfilePanel();
    setupMobileFormEnhancements();
    
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
    
    // Log device information for debugging
    console.log('Device Info:', deviceInfo);
    console.log('Screen dimensions:', window.innerWidth + 'x' + window.innerHeight);
    console.log('Pixel ratio:', window.devicePixelRatio);
});

// Load Achievement Manager
function loadAchievementManager() {
    const script = document.createElement('script');
    script.src = 'static/js/achievement-manager.js';
    script.onload = function() {
        console.log('🏆 Achievement Manager loaded successfully');
    };
    script.onerror = function() {
        console.warn('⚠️ Failed to load Achievement Manager');
    };
    document.head.appendChild(script);
}

// Load Progress Tracker if not already loaded
function loadProgressTracker() {
    if (!window.progressTracker) {
        const script = document.createElement('script');
        script.src = 'static/js/progress-tracker.js';
        script.onload = function() {
            console.log('📊 Progress Tracker loaded successfully');
            // Load Achievement Manager after Progress Tracker
            loadAchievementManager();
        };
        script.onerror = function() {
            console.warn('⚠️ Failed to load Progress Tracker');
        };
        document.head.appendChild(script);
    } else {
        // Progress Tracker already loaded, just load Achievement Manager
        loadAchievementManager();
    }
}

// Load essential scripts on window load
window.addEventListener('load', function() {
    loadProgressTracker();
});

/* ============================================
   PASSWORD VISIBILITY TOGGLE
   ============================================ */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
            icon.setAttribute('title', 'Hide password');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
            icon.setAttribute('title', 'Show password');
        }
    }
}

// Make toggle function globally accessible
window.togglePasswordVisibility = togglePasswordVisibility;