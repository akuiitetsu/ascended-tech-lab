/**
 * Universal Responsive Game Room Manager
 * Handles responsive design and multi-device optimization for all 5 game rooms
 */

function initializeResponsiveFeatures() {
    console.log('🎮 Initializing Universal Responsive Features');
    
    // Device detection
    const deviceInfo = detectDevice();
    const screenInfo = analyzeScreen();
    
    // Setup all responsive features
    setupViewportHandler();
    applyDeviceClasses(deviceInfo, screenInfo);
    setupTouchEnhancements(deviceInfo);
    setupKeyboardNavigation(deviceInfo);
    setupPerformanceOptimizations(deviceInfo, screenInfo);
    setupAccessibilityFeatures();
    handleSpecialDisplays(deviceInfo, screenInfo);
    
    console.log('✅ Responsive features initialized:', {
        device: deviceInfo,
        screen: screenInfo
    });
}

function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
        isMobile: /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
        isTablet: /ipad|android(?!.*mobile)/i.test(userAgent),
        isIOS: /ipad|iphone|ipod/.test(userAgent),
        isAndroid: /android/i.test(userAgent),
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isTV: width >= 1920 && height >= 1080 && window.devicePixelRatio <= 1.5,
        isFridge: width >= 600 && width <= 1200 && height >= 400 && height <= 800,
        isDesktop: !('ontouchstart' in window) && !/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
        hasKeyboard: !('ontouchstart' in window),
        supportsHover: window.matchMedia('(hover: hover)').matches,
        pixelRatio: window.devicePixelRatio || 1
    };
}

function analyzeScreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    return {
        width: width,
        height: height,
        aspectRatio: aspectRatio,
        orientation: width > height ? 'landscape' : 'portrait',
        size: categorizeScreenSize(width),
        isUltraWide: aspectRatio > 2.1,
        isSquare: Math.abs(aspectRatio - 1) < 0.2,
        isUltraTall: aspectRatio < 0.6,
        is4K: width >= 3840 || height >= 2160,
        isRetina: window.devicePixelRatio >= 2
    };
}

function categorizeScreenSize(width) {
    if (width < 480) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1200) return 'lg';
    if (width < 1920) return 'xl';
    if (width < 2560) return 'xxl';
    return 'ultra';
}

function setupViewportHandler() {
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
        
        const vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vw', vw + 'px');
    }
    
    setViewportHeight();
    
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            setViewportHeight();
            const newScreenInfo = analyzeScreen();
            const newDeviceInfo = detectDevice();
            applyDeviceClasses(newDeviceInfo, newScreenInfo);
        }, 100);
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            setViewportHeight();
            const newScreenInfo = analyzeScreen();
            const newDeviceInfo = detectDevice();
            applyDeviceClasses(newDeviceInfo, newScreenInfo);
        }, 300);
    });
}

function applyDeviceClasses(deviceInfo, screenInfo) {
    const body = document.body;
    
    // Clear existing responsive classes
    const classesToRemove = Array.from(body.classList).filter(function(className) {
        return className.includes('-device') || className.includes('aspect-') || 
               className.includes('size-') || className.includes('orientation-');
    });
    
    classesToRemove.forEach(function(className) {
        body.classList.remove(className);
    });
    
    // Add device type classes
    if (deviceInfo.isMobile) body.classList.add('mobile-device');
    if (deviceInfo.isTablet) body.classList.add('tablet-device');
    if (deviceInfo.isDesktop) body.classList.add('desktop-device');
    if (deviceInfo.isTV) body.classList.add('tv-device');
    if (deviceInfo.isFridge) body.classList.add('fridge-device');
    if (deviceInfo.isIOS) body.classList.add('ios-device');
    if (deviceInfo.isAndroid) body.classList.add('android-device');
    
    // Add interaction classes
    if (deviceInfo.isTouchDevice) body.classList.add('touch-device');
    else body.classList.add('no-touch-device');
    
    if (deviceInfo.supportsHover) body.classList.add('hover-device');
    else body.classList.add('no-hover-device');
    
    // Add screen classes
    body.classList.add('size-' + screenInfo.size + '-device');
    body.classList.add(screenInfo.orientation + '-device');
    
    if (screenInfo.isUltraWide) body.classList.add('ultra-wide-device');
    if (screenInfo.isSquare) body.classList.add('square-device');
    if (screenInfo.isUltraTall) body.classList.add('ultra-tall-device');
    if (screenInfo.isRetina) body.classList.add('retina-device');
    if (screenInfo.is4K) body.classList.add('4k-device');
    
    // Add aspect ratio classes
    const ratio = screenInfo.aspectRatio;
    if (Math.abs(ratio - 4/3) < 0.1) body.classList.add('aspect-4-3');
    else if (Math.abs(ratio - 16/9) < 0.1) body.classList.add('aspect-16-9');
    else if (Math.abs(ratio - 21/9) < 0.1) body.classList.add('aspect-21-9');
}

function setupTouchEnhancements(deviceInfo) {
    if (!deviceInfo.isTouchDevice) return;
    
    const selectors = [
        '.difficulty-btn', '.challenge-btn', '.level-card', '.btn', '.interactive-btn',
        '.matching-item', '.scenario-card', '.os-card', '.flowchart-node',
        '.network-device', '.table-card', '.action-btn'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    elements.forEach(function(element) {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.filter = 'brightness(1.1)';
            this.style.transition = 'all 0.1s ease';
            this.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            var self = this;
            setTimeout(function() {
                self.style.transform = '';
                self.style.filter = '';
                self.style.transition = 'all 0.2s ease';
                self.classList.remove('touch-active');
            }, 100);
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = '';
            this.style.filter = '';
            this.style.transition = 'all 0.2s ease';
            this.classList.remove('touch-active');
        }, { passive: true });
    });
    
    // Prevent iOS zoom on inputs
    if (deviceInfo.isIOS) {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            if (input.type !== 'file') {
                input.style.fontSize = '16px';
            }
        });
    }
}

function setupKeyboardNavigation(deviceInfo) {
    if (!deviceInfo.isTV && !deviceInfo.hasKeyboard) return;
    
    let currentIndex = 0;
    let focusableElements = [];
    
    function updateFocusableElements() {
        const selectors = [
            '.difficulty-btn:not([disabled])', 
            '.challenge-btn:not([disabled])', 
            '.level-card:not([disabled])', 
            '.btn:not([disabled])',
            '.interactive-btn:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])'
        ];
        
        focusableElements = Array.from(document.querySelectorAll(selectors.join(', ')))
            .filter(function(el) { return el.offsetParent !== null; });
    }
    
    function focusElement(index) {
        if (focusableElements[index]) {
            focusableElements[index].focus();
            focusableElements[index].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    document.addEventListener('keydown', function(e) {
        updateFocusableElements();
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
                focusElement(currentIndex);
                break;
                
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                focusElement(currentIndex);
                break;
                
            case 'Enter':
            case ' ':
                if (focusableElements[currentIndex]) {
                    e.preventDefault();
                    focusableElements[currentIndex].click();
                }
                break;
                
            case 'Escape':
                var backBtn = document.querySelector('.back-btn, .back-to-levels, .back-to-difficulty-btn');
                if (backBtn) {
                    backBtn.click();
                }
                break;
        }
    });
    
    setTimeout(function() {
        updateFocusableElements();
        if (focusableElements.length > 0) {
            focusElement(0);
        }
    }, 100);
}

function setupPerformanceOptimizations(deviceInfo, screenInfo) {
    // Reduce animations on lower-end devices
    if (deviceInfo.pixelRatio < 2 && screenInfo.width < 1920) {
        const style = document.createElement('style');
        style.textContent = 
            '* { will-change: auto !important; } ' +
            '.difficulty-btn, .level-card, .btn { transition-duration: 0.15s !important; }';
        document.head.appendChild(style);
    }
    
    // Optimize for very large displays
    if (screenInfo.width > 2560) {
        const style = document.createElement('style');
        style.textContent = 
            '.difficulty-btn, .level-card, .btn { will-change: transform; } ' +
            '.lab-container, .game-layout { contain: layout style paint; }';
        document.head.appendChild(style);
    }
}

function setupAccessibilityFeatures() {
    // Reduced motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        const style = document.createElement('style');
        style.textContent = 
            '*, *::before, *::after { ' +
            'animation-duration: 0.01ms !important; ' +
            'animation-iteration-count: 1 !important; ' +
            'transition-duration: 0.01ms !important; ' +
            'scroll-behavior: auto !important; }';
        document.head.appendChild(style);
    }
    
    // High contrast support
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
    
    // Enhanced focus indicators
    const style = document.createElement('style');
    style.textContent = 
        '*:focus-visible { ' +
        'outline: 3px solid rgba(255, 255, 255, 0.8) !important; ' +
        'outline-offset: 2px !important; }';
    document.head.appendChild(style);
}

function handleSpecialDisplays(deviceInfo, screenInfo) {
    // Refrigerator display optimizations
    if (deviceInfo.isFridge) {
        document.documentElement.style.setProperty('--fridge-scale', '0.8');
        const style = document.createElement('style');
        style.textContent = 
            '.difficulty-modal, .room-modal { transform: scale(0.9); max-height: 85vh; overflow-y: auto; } ' +
            '.level-grid, .challenge-grid { grid-template-columns: repeat(2, 1fr) !important; } ' +
            '.lab-container, .game-layout { padding: 8px !important; gap: 8px !important; } ' +
            '.lab-sidebar, .game-sidebar { width: 220px !important; min-width: 220px !important; }';
        document.head.appendChild(style);
    }
    
    // TV display optimizations
    if (deviceInfo.isTV) {
        const style = document.createElement('style');
        style.textContent = 
            '.difficulty-btn:focus, .level-card:focus, .btn:focus { ' +
            'outline: 4px solid currentColor !important; outline-offset: 4px !important; ' +
            'transform: scale(1.05) !important; z-index: 10 !important; } ' +
            '.level-grid, .challenge-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important; gap: 30px !important; }';
        document.head.appendChild(style);
    }
    
    // Ultra-wide display optimizations
    if (screenInfo.isUltraWide) {
        const style = document.createElement('style');
        style.textContent = 
            '.lab-container, .game-layout { max-width: 85% !important; margin: 0 auto !important; } ' +
            '.level-grid, .challenge-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important; max-width: 1800px !important; }';
        document.head.appendChild(style);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeResponsiveFeatures);

// Also initialize immediately if DOM is already ready
if (document.readyState !== 'loading') {
    initializeResponsiveFeatures();
}