// ============================================
// MOBILE UTILITIES FOR FLOWBYTE LAB
// ============================================

const FlowByteMobileUtils = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
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
    
    enhanceTouchFeedback() {
        // Only apply general touch feedback to UI elements, not flowchart nodes
        const interactiveElements = document.querySelectorAll('.tool-btn, .difficulty-btn, button, .btn');
        
        interactiveElements.forEach(element => {
            // Skip if this is a flowchart node (they have specialized handling)
            if (element.classList.contains('flowchart-node')) return;
            
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
                this.style.filter = 'brightness(1.2)';
                this.style.transition = 'all 0.1s ease';
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.filter = '';
                    this.style.transition = 'all 0.2s ease';
                }, 100);
            });
        });
    },
    
    // Enhanced double-tap detection for flowchart nodes
    setupDoubleTapHandler(element, callback) {
        let touchStartTime = 0;
        let touchCount = 0;
        let touchTimeout = null;
        let lastTouchTime = 0;
        let isProcessingDoubleTap = false;
        
        element.addEventListener('touchstart', (e) => {
            // Prevent other touch handlers from interfering
            if (isProcessingDoubleTap) return;
            
            touchStartTime = Date.now();
            touchCount++;
            
            // Clear existing timeout
            if (touchTimeout) {
                clearTimeout(touchTimeout);
                touchTimeout = null;
            }
            
            // Check for double-tap
            if (touchCount === 2) {
                const timeBetweenTaps = touchStartTime - lastTouchTime;
                if (timeBetweenTaps < 300 && timeBetweenTaps > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    isProcessingDoubleTap = true;
                    
                    // Reset any existing transforms before calling callback
                    element.style.transform = '';
                    element.style.filter = '';
                    element.style.transition = '';
                    
                    callback(e);
                    touchCount = 0;
                    
                    // Reset processing flag after a short delay
                    setTimeout(() => {
                        isProcessingDoubleTap = false;
                    }, 100);
                    return;
                }
            }
            
            lastTouchTime = touchStartTime;
            
            // Reset touch count after 300ms
            touchTimeout = setTimeout(() => {
                touchCount = 0;
                touchTimeout = null;
                isProcessingDoubleTap = false;
            }, 300);
        });
        
        // Override touchend to prevent scaling when double-tap is detected
        element.addEventListener('touchend', (e) => {
            if (isProcessingDoubleTap) {
                e.preventDefault();
                e.stopPropagation();
                // Ensure transform is reset
                element.style.transform = '';
                element.style.filter = '';
                return;
            }
        });
        
        // Prevent context menu on long press
        element.addEventListener('contextmenu', (e) => {
            if (this.isMobile()) {
                e.preventDefault();
            }
        });
    },
    
    // Visual feedback for double-tap (simplified)
    showDoubleTapFeedback(element) {
        // Show only a simple text feedback without affecting element transforms
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.95);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            pointer-events: none;
            z-index: 2000;
            animation: fadeInOut 1s ease-out forwards;
        `;
        feedback.textContent = 'Text Editor Opened';
        
        // Add fade animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        if (!document.querySelector('style[data-feedback-animation]')) {
            style.setAttribute('data-feedback-animation', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    },
    
    init() {
        this.setupMobileViewport();
        this.enhanceTouchFeedback();
        
        if (this.isMobile()) {
            document.body.classList.add('mobile-device');
            console.log('📱 FlowByte mobile enhancements initialized');
        }
    }
};

class FlowByteGame {
    constructor() {
        this.currentDifficulty = null;
        this.currentLevel = null;
        this.currentTool = 'cursor';
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.connectionSource = null;
        this.nodeCounter = 0;
        this.gameContainer = null;
        this.mistakeCount = 0;
        this.container = null;
        this.initialized = false;
        this.challengeStartTime = null;
        this.roomStartTime = null;
        
        // Initialize mobile enhancements
        FlowByteMobileUtils.init();
        this.score = 0;
        this.attempts = 0;
        
        this.difficulties = {
            easy: {
                name: 'Easy',
                description: 'Basic programming flowcharts with fundamental control structures',
                levels: [
                    { 
                        name: 'Sequential Program Flow', 
                        objective: 'Create a basic sequential program flowchart',
                        scenario: "Design a flowchart for a simple 'Hello World' program that: starts execution, declares variables, prints a greeting message, and terminates. Show the linear flow of program execution from start to end."
                    },
                    { 
                        name: 'Conditional Logic', 
                        objective: 'Add if-else decision structures',
                        scenario: "Create a flowchart for an age verification program: read user's age input, check if age >= 18, display 'Adult' message if true or 'Minor' message if false, then end program execution."
                    },
                    { 
                        name: 'Input-Processing-Output', 
                        objective: 'Show data flow through program',
                        scenario: "Design a flowchart for a simple calculator program: get two numbers from user input, perform addition operation, store result in variable, display the calculated sum to user, then exit."
                    },
                    { 
                        name: 'Function Call Chain', 
                        objective: 'Represent function calls and returns',
                        scenario: "Create a flowchart showing a program that calls multiple functions: main() calls getUserInput(), then calls calculateSum(), then calls displayResult(), with each function returning control to the caller."
                    },
                    { 
                        name: 'Complete Program Structure', 
                        objective: 'Design full program with multiple components',
                        scenario: "Design a flowchart for a student grade calculator: initialize variables, input student scores, validate input data, calculate average, determine letter grade using conditions, display results, and terminate program."
                    }
                ]
            },
            hard: {
                name: 'Hard',
                description: 'Advanced programming structures and algorithm flowcharts',
                levels: [
                    { 
                        name: 'Nested Control Structures', 
                        objective: 'Design nested if-else and switch statements',
                        scenario: "Create a flowchart for a multi-level menu system: check user role (admin/user), then check permissions within role, then check specific actions allowed, with nested conditions determining different execution paths."
                    },
                    { 
                        name: 'Loop Algorithms', 
                        objective: 'Implement for/while loop structures',
                        scenario: "Design a flowchart for a factorial calculation algorithm: initialize counter and result variables, use while loop to multiply numbers, check loop condition, increment counter, and return final result."
                    },
                    { 
                        name: 'Exception Handling', 
                        objective: 'Show try-catch-finally blocks',
                        scenario: "Create a flowchart for file processing with error handling: attempt to open file, catch FileNotFoundException, catch IOException, handle each exception type differently, execute finally block for cleanup, then continue or exit."
                    },
                    { 
                        name: 'Recursive Algorithms', 
                        objective: 'Model recursive function calls',
                        scenario: "Design a flowchart for binary search algorithm: check if array is empty, compare target with middle element, recursively call function on left or right half based on comparison, show call stack and return values."
                    },
                    { 
                        name: 'Object-Oriented Flow', 
                        objective: 'Represent class interactions and inheritance',
                        scenario: "Create a flowchart showing polymorphic method calls: instantiate different subclass objects, call same method name on each object, show dynamic method resolution, constructor chaining, and inheritance hierarchy execution flow."
                    }
                ]
            }
        };
        
        this.flowchartSteps = {
            1: 'understand_purpose',
            2: 'choose_template',
            3: 'add_shapes',
            4: 'connect_shapes',
            5: 'add_text',
            6: 'format_refine',
            7: 'test_improve'
        };
        this.currentStep = 1;
        this.hasStartNode = false;
        this.hasEndNode = false;
        this.hasProcessNodes = false;
        this.hasConnections = false;
        this.hasLabels = false;
        this.placementMode = null; // Track what shape is being placed
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    init(container = null) {
        console.log('🎮 FlowByteGame.init() called');
        console.log('Container provided:', container ? 'YES' : 'NO');
        console.log('Container type:', container ? container.constructor.name : 'N/A');
        
        this.container = container || document;
        
        // Ensure we have a valid container
        if (!this.container) {
            console.error('❌ No valid container provided to FlowByteGame.init()');
            return;
        }
        
        console.log('📦 Using container:', this.container === document ? 'document' : 'provided element');
        
        // Check for required elements with better error reporting
        const checkForElements = () => {
            const difficultyScreen = this.container.querySelector('#difficulty-screen');
            const levelScreen = this.container.querySelector('#level-screen');
            const gameScreen = this.container.querySelector('#game-screen');
            
            const elementStatus = {
                difficultyScreen: !!difficultyScreen,
                levelScreen: !!levelScreen,
                gameScreen: !!gameScreen
            };
            
            console.log('🔍 Element check results:', elementStatus);
            
            if (!difficultyScreen) console.log('❌ Missing #difficulty-screen');
            if (!levelScreen) console.log('❌ Missing #level-screen');  
            if (!gameScreen) console.log('❌ Missing #game-screen');
            
            return difficultyScreen && levelScreen && gameScreen;
        };
        
        // Wait for DOM elements with timeout
        const maxRetries = 50; // 5 seconds max wait
        let retries = 0;
        
        const initWhenReady = () => {
            const elementsReady = checkForElements();
            
            if (!elementsReady && retries < maxRetries) {
                retries++;
                console.log(`⏳ Waiting for DOM elements... attempt ${retries}/${maxRetries}`);
                setTimeout(initWhenReady, 100);
                return;
            }
            
            if (!elementsReady) {
                console.error('❌ Failed to find required DOM elements after maximum retries');
                console.log('🔍 Container content preview:', this.container.innerHTML.substring(0, 500) + '...');
                return;
            }
            
            try {
                console.log('✅ All required elements found, setting up event listeners...');
                this.setupEventListeners();
                
                console.log('✅ Event listeners set up, showing difficulty screen...');
                this.showRoomSelection();
                
                this.initialized = true;
                console.log('🎉 FlowByteGame initialized successfully!');
            } catch (error) {
                console.error('❌ Error during FlowByteGame initialization:', error);
            }
        };
        
        // Start the initialization process
        console.log('🚀 Starting initialization process...');
        initWhenReady();
    }

    setupEventListeners() {
        console.log('🎛️ Setting up FlowByte event listeners...');
        const container = this.container;
        
        try {
            // Difficulty selection buttons
            const easyBtn = container.querySelector('#easy-difficulty-btn');
            const hardBtn = container.querySelector('#hard-difficulty-btn');
            
            console.log('🔘 Button check:', {
                easyBtn: !!easyBtn,
                hardBtn: !!hardBtn
            });
            
            if (easyBtn && hardBtn) {
                // Clean setup for difficulty buttons
                const newEasyBtn = easyBtn.cloneNode(true);
                const newHardBtn = hardBtn.cloneNode(true);
                
                easyBtn.parentNode.replaceChild(newEasyBtn, easyBtn);
                hardBtn.parentNode.replaceChild(newHardBtn, hardBtn);
                
                newEasyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🟢 Easy difficulty selected');
                    this.selectDifficulty('easy');
                });
                
                newHardBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🔴 Hard difficulty selected');
                    this.selectDifficulty('hard');
                });
                
                console.log('✅ Difficulty buttons setup complete');
            } else {
                console.warn('⚠️ Difficulty buttons not found:', { easyBtn: !!easyBtn, hardBtn: !!hardBtn });
            }
            
            // Navigation buttons
            const backToDifficultyBtn = container.querySelector('#back-to-difficulty-btn');
            if (backToDifficultyBtn) {
                backToDifficultyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showRoomSelection();
                });
                console.log('✅ Back to difficulty button setup');
            }
            
            const backToLevelsBtn = container.querySelector('#back-to-levels-btn');
            if (backToLevelsBtn) {
                // Create a new button to ensure clean event handling
                const newBackToLevelsBtn = backToLevelsBtn.cloneNode(true);
                backToLevelsBtn.parentNode.replaceChild(newBackToLevelsBtn, backToLevelsBtn);
                
                newBackToLevelsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Navigating back to level selection');
                    this.showLevelSelection();
                });
                console.log('✅ Back to levels button setup');
            }
            
            // Game action buttons
            this.setupGameActionButtons(container);
            this.setupNodeCreationButtons(container);
            this.setupToolButtons(container);
            
            console.log('✅ All FlowByte event listeners setup complete');
            
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    setupGameActionButtons(container) {
        const buttons = [
            { id: '#complete-level-btn', handler: () => this.completeLevel() },
            { id: '#abort-mission-btn', handler: () => this.abortMission() },
            { id: '#get-hint-btn', handler: () => this.getHint() },
            { id: '#reset-canvas-btn', handler: () => this.resetCanvas() }
        ];
        
        buttons.forEach(({ id, handler }) => {
            const btn = container.querySelector(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }

    setupNodeCreationButtons(container) {
        const nodeButtons = [
            { id: '#add-oval-btn', type: 'oval' },
            { id: '#add-rectangle-btn', type: 'rectangle' },
            { id: '#add-diamond-btn', type: 'diamond' },
            { id: '#add-parallelogram-btn', type: 'parallelogram' }
        ];
        
        nodeButtons.forEach(({ id, type }) => {
            const btn = container.querySelector(id);
            if (btn) {
                btn.addEventListener('click', () => this.addNode(type));
            }
        });
    }

    setupToolButtons(container) {
        const toolButtons = [
            { id: '#cursor-tool-btn', tool: 'cursor' },
            { id: '#arrow-tool-btn', tool: 'arrow' },
            { id: '#delete-tool-btn', tool: 'delete' }
        ];
        
        toolButtons.forEach(({ id, tool }) => {
            const btn = container.querySelector(id);
            if (btn) {
                btn.addEventListener('click', () => this.selectTool(tool));
            }
        });
    }

    showScreen(screenId) {
        console.log('📺 FlowByte showScreen:', screenId);
        const container = this.container;
        
        if (!container) {
            console.error('❌ No container available for showScreen');
            return;
        }
        
        // Hide all screens
        const screens = ['difficulty-screen', 'level-screen', 'game-screen'];
        screens.forEach(id => {
            const screen = container.querySelector(`#${id}`);
            if (screen) {
                screen.classList.add('hidden');
                screen.style.display = 'none';
                console.log(`🙈 Hidden screen: ${id}`);
            }
        });
        
        // Show target screen
        const targetScreen = container.querySelector(`#${screenId}`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            const displayType = screenId === 'difficulty-screen' ? 'flex' : 'block';
            targetScreen.style.display = displayType;
            
            // Force visibility for difficulty screen
            if (screenId === 'difficulty-screen') {
                targetScreen.style.position = 'relative';
                targetScreen.style.width = '100%';
                targetScreen.style.height = '100vh';
                targetScreen.style.zIndex = '100';
            }
            
            console.log(`👁️ Showing screen: ${screenId} (display: ${displayType})`);
            console.log('Screen element details:', {
                id: targetScreen.id,
                className: targetScreen.className,
                display: targetScreen.style.display,
                visibility: targetScreen.style.visibility,
                position: targetScreen.style.position,
                zIndex: targetScreen.style.zIndex
            });
            
            // Double-check that the screen is actually visible
            setTimeout(() => {
                const rect = targetScreen.getBoundingClientRect();
                console.log('Screen bounding rect:', {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left
                });
                
                if (rect.width === 0 || rect.height === 0) {
                    console.warn('⚠️ Screen may not be visible - zero dimensions detected');
                }
            }, 50);
            
        } else {
            console.error(`❌ Screen ${screenId} not found in container`);
            console.log('Available screens:', 
                Array.from(container.querySelectorAll('[id*="screen"]')).map(el => el.id)
            );
        }
    }

    showRoomSelection() {
        console.log('🏠 Showing difficulty selection...');
        this.showScreen('difficulty-screen');
    }

    selectDifficulty(difficulty) {
        console.log('Difficulty selected:', difficulty);
        this.currentDifficulty = difficulty;
        this.showLevelSelection();
    }

    showLevelSelection() {
        console.log('Showing level selection for difficulty:', this.currentDifficulty);
        
        if (!this.currentDifficulty) {
            console.error('No difficulty selected');
            return;
        }
        
        const difficultyData = this.difficulties[this.currentDifficulty];
        const container = this.container;
        
        // Update header
        const titleElement = container.querySelector('#difficulty-title');
        const descElement = container.querySelector('#difficulty-description');
        
        if (titleElement) titleElement.textContent = `FLOWBYTE - ${difficultyData.name}`;
        if (descElement) descElement.textContent = difficultyData.description;
        
        // Populate level grid
        const levelGrid = container.querySelector('#level-grid');
        if (levelGrid) {
            levelGrid.innerHTML = difficultyData.levels.map((level, index) => `
                <div class="level-card" data-level="${index + 1}">
                    <div class="level-number">${index + 1}</div>
                    <h3>${level.name}</h3>
                    <p>${level.objective}</p>
                </div>
            `).join('');
            
            // Add click handlers to level cards
            levelGrid.querySelectorAll('.level-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const level = parseInt(card.dataset.level);
                    console.log('Level selected:', level);
                    this.startLevel(level);
                });
            });
        }
        
        this.showScreen('level-screen');
    }

    startLevel(levelNumber) {
        console.log('Starting level:', levelNumber);
        this.currentLevel = levelNumber;
        this.mistakeCount = 0;
        this.attempts = 0;
        
        // Initialize timing
        this.challengeStartTime = Date.now();
        if (!this.roomStartTime) {
            this.roomStartTime = Date.now();
        }
        
        // Reset hints for new level
        this.resetHints();
        
        this.initGame();
    }

    initGame() {
        console.log('Initializing game interface...');
        const difficultyData = this.difficulties[this.currentDifficulty];
        const levelData = difficultyData.levels[this.currentLevel - 1];
        const container = this.container;
        
        // Reset flowchart tracking
        this.currentStep = 1;
        this.hasStartNode = false;
        this.hasEndNode = false;
        this.hasProcessNodes = false;
        this.hasConnections = false;
        this.hasLabels = false;
        
        // Update game interface elements
        const currentLevelDisplay = container.querySelector('#current-level-display');
        const mistakeCount = container.querySelector('#mistake-count');
        const levelObjective = container.querySelector('#level-objective');
        const levelScenario = container.querySelector('#level-scenario');
        
        if (currentLevelDisplay) currentLevelDisplay.textContent = `${this.currentLevel}/5`;
        if (mistakeCount) mistakeCount.textContent = this.mistakeCount;
        if (levelObjective) levelObjective.textContent = levelData.objective;
        if (levelScenario) levelScenario.textContent = levelData.scenario;
        
        // Initialize canvas
        this.gameContainer = container.querySelector('#flowchart-canvas');
        if (this.gameContainer) {
            this.setupCanvasEventListeners();
            // Initialize SVG if not present
            if (!this.gameContainer.querySelector('#connection-svg')) {
                this.gameContainer.innerHTML = '<svg id="connection-svg" class="connection-svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></svg>';
            }
        }
        
        // Initialize cursor tool as active
        this.selectTool('cursor');
        
        // Show tutorial for this level
        this.showLevelTutorial();
        
        this.showScreen('game-screen');
        console.log('Game interface initialized successfully');
    }

    showLevelTutorial() {
        const difficultyData = this.difficulties[this.currentDifficulty];
        const levelData = difficultyData.levels[this.currentLevel - 1];
        
        const tutorials = {
            easy: {
                1: {
                    title: "Welcome to Flowchart Construction!",
                    steps: [
                        "📖 Read the scenario: Sarah needs a simple opening day routine flowchart",
                        "🔵 Start with an OVAL shape labeled 'START'",
                        "📦 Add RECTANGLE shapes for each process step",
                        "🔵 End with an OVAL shape labeled 'END'",
                        "➡️ Connect all shapes with arrows in logical order",
                        "✏️ Double-click any shape to edit its text"
                    ]
                },
                2: {
                    title: "Adding Decision Points",
                    steps: [
                        "💎 Use DIAMOND shapes for decisions (Yes/No questions)",
                        "🔵 Start with 'START' oval",
                        "📦 Add process rectangles",
                        "💎 Add diamond for decisions like 'Inventory OK?'",
                        "➡️ Connect decision diamonds to different paths",
                        "🔵 End with 'END' oval"
                    ]
                },
                3: {
                    title: "Input and Output Operations",
                    steps: [
                        "📄 Use PARALLELOGRAM shapes for input/output",
                        "🔵 Start with 'START' oval",
                        "📄 Add parallelogram for 'Get Customer Order'",
                        "📦 Add process rectangles for actions",
                        "📄 Add parallelogram for 'Print Receipt'",
                        "🔵 End with 'END' oval"
                    ]
                },
                4: {
                    title: "Multi-Step Process Chain",
                    steps: [
                        "🔗 Chain multiple processes together",
                        "🔵 Start with 'START'",
                        "📦 Add multiple process rectangles",
                        "💎 Include decision points where needed",
                        "📄 Add input/output operations",
                        "➡️ Connect everything in logical sequence"
                    ]
                },
                5: {
                    title: "Complete Workflow Design",
                    steps: [
                        "🏆 Combine all flowchart elements",
                        "🔵 Use ovals for start/end points",
                        "📦 Use rectangles for processes",
                        "💎 Use diamonds for decisions",
                        "📄 Use parallelograms for input/output",
                        "🎯 Create a comprehensive coffee shop workflow"
                    ]
                }
            },
            hard: {
                1: {
                    title: "Nested Decision Logic",
                    steps: [
                        "🌳 Create decision trees with multiple branches",
                        "💎 Use multiple diamond shapes for nested decisions",
                        "🔀 Show different paths for customer types",
                        "💳 Include payment method decisions",
                        "🍂 Add seasonal menu logic",
                        "🔄 Ensure all paths eventually connect"
                    ]
                },
                2: {
                    title: "Loop Structures",
                    steps: [
                        "🔄 Create iterative processes with loops",
                        "✅ Use diamonds for loop conditions",
                        "↩️ Draw arrows that loop back to previous steps",
                        "🔍 Add quality control loops",
                        "📊 Include inventory checking cycles",
                        "⏹️ Ensure loops have proper exit conditions"
                    ]
                },
                3: {
                    title: "Error Handling Workflows",
                    steps: [
                        "⚠️ Plan for error scenarios",
                        "❌ Add decision points for error checking",
                        "🔧 Include error handling processes",
                        "💳 Handle payment failures",
                        "📦 Handle out-of-stock situations",
                        "🛠️ Add equipment malfunction paths"
                    ]
                },
                4: {
                    title: "Parallel Processing",
                    steps: [
                        "⚡ Show concurrent operations",
                        "👥 Include multiple staff workflows",
                        "🔀 Show processes running simultaneously",
                        "🎯 Coordinate parallel tasks",
                        "🔗 Show synchronization points",
                        "📋 Manage resource sharing"
                    ]
                },
                5: {
                    title: "System Architecture",
                    steps: [
                        "🏢 Design enterprise-level flowchart",
                        "🌐 Show multi-location operations",
                        "📊 Include data flow between locations",
                        "🔐 Add security and authentication",
                        "📈 Include reporting and analytics",
                        "🎛️ Show system integration points"
                    ]
                }
            }
        };
        
        const tutorial = tutorials[this.currentDifficulty][this.currentLevel];
        this.displayTutorial(tutorial);
    }

    displayTutorial(tutorial) {
        // Create tutorial modal
        const tutorialModal = document.createElement('div');
        tutorialModal.className = 'tutorial-modal';
        tutorialModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        const tutorialContent = document.createElement('div');
        tutorialContent.style.cssText = `
            background: linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%);
            border: 2px solid #4CAF50;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        tutorialContent.innerHTML = `
            <h2 style="color: #4CAF50; margin: 0 0 20px 0; font-size: 1.5rem;">${tutorial.title}</h2>
            <div style="text-align: left; margin: 20px 0;">
                ${tutorial.steps.map(step => `
                    <div style="
                        background: rgba(76, 175, 80, 0.1);
                        border-left: 4px solid #4CAF50;
                        padding: 10px 15px;
                        margin: 10px 0;
                        color: #ffffff;
                        border-radius: 5px;
                        font-size: 0.9rem;
                    ">${step}</div>
                `).join('')}
            </div>
            <button id="start-building" style="
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
            ">START BUILDING FLOWCHART</button>
        `;
        
        tutorialModal.appendChild(tutorialContent);
        document.body.appendChild(tutorialModal);
        
        // Add hover effect to button
        const startButton = tutorialContent.querySelector('#start-building');
        startButton.addEventListener('mouseenter', () => {
            startButton.style.background = 'linear-gradient(135deg, #45a049, #3e8e41)';
            startButton.style.transform = 'translateY(-2px)';
        });
        startButton.addEventListener('mouseleave', () => {
            startButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            startButton.style.transform = 'translateY(0)';
        });
        
        // Handle tutorial completion
        startButton.addEventListener('click', () => {
            document.body.removeChild(tutorialModal);
            this.currentStep = 3; // Allow immediate shape placement
            this.updateStepGuidance();
            this.showFeedback('Great! Now you can start building your flowchart. Click the shape buttons below to add elements!', 'success');
        });
    }

    updateStepGuidance() {
        const hintPanel = this.container.querySelector('.hint-panel p');
        if (!hintPanel) return;
        
        const stepGuidance = {
            1: "Click 'Get Hint' to see the tutorial again, or start adding shapes to build your flowchart.",
            2: "You're ready to build! Use the shape tools below to create your flowchart.",
            3: "Add shapes by clicking the buttons below. Start with an oval for START, add processes, and end with an oval for END.",
            4: "Great progress! Use the arrow tool to connect your shapes in logical order.",
            5: "Double-click any shape to edit its text. Make descriptions clear and concise.",
            6: "Your flowchart is taking shape! Check that it's well-organized and easy to follow.",
            7: "Excellent! Review your complete flowchart to ensure it represents the process accurately."
        };
        
        hintPanel.textContent = stepGuidance[this.currentStep] || "Keep building your flowchart following the tutorial steps.";
    }

    addNode(type) {
        if (!this.gameContainer) {
            this.showFeedback('Canvas not ready. Please wait.', 'error');
            return;
        }
        
        // Allow shape placement immediately after tutorial
        if (this.currentStep < 3) {
            this.currentStep = 3;
        }
        
        // Enter placement mode instead of creating random positioned node
        this.placementMode = type;
        this.gameContainer.style.cursor = 'crosshair';
        this.showFeedback(`Click on the canvas to place your ${this.getShapeTypeName(type)}`, 'info');
        
        // Highlight the selected tool
        this.highlightActiveTool(type);
    }

    highlightActiveTool(type) {
        const container = this.container;
        container.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('placing'));
        
        const toolButton = container.querySelector(`#add-${type}-btn`);
        if (toolButton) {
            toolButton.classList.add('placing');
        }
    }

    setupCanvasEventListeners() {
        if (!this.gameContainer) return;
        
        this.gameContainer.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        // Add mouse event listeners for drag and drop
        this.gameContainer.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });

        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });
    }

    handleCanvasClick(event) {
        const rect = this.gameContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // If in placement mode, place the shape
        if (this.placementMode) {
            this.createNodeAtPosition(this.placementMode, x, y);
            this.exitPlacementMode();
            return;
        }

        // Clear selections if clicking on empty canvas
        if (event.target === this.gameContainer) {
            if (this.selectedNode) {
                const selectedElement = this.container.querySelector(`#${this.selectedNode.id}`);
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                }
                this.selectedNode = null;
            }
            
            if (this.connectionSource) {
                this.clearConnectionSource();
                this.showFeedback('Connection cancelled.');
            }
        }
    }

    handleMouseDown(event) {
        const target = event.target;
        
        // Check if clicking on a flowchart node
        if (target.classList.contains('flowchart-node')) {
            event.preventDefault();
            
            const nodeId = target.id;
            const node = this.nodes.find(n => n.id === nodeId);
            
            if (node) {
                // Handle tool actions first
                this.handleNodeClick(node, event);
                
                // Start drag if using cursor tool (for moving) or arrow tool (default interaction)
                if (this.currentTool === 'cursor' || this.currentTool === 'arrow') {
                    this.startDrag(node, event);
                }
            }
        }
    }

    startDrag(node, event) {
        this.draggedNode = node;
        const nodeElement = document.getElementById(node.id);
        const rect = nodeElement.getBoundingClientRect();
        const canvasRect = this.gameContainer.getBoundingClientRect();
        
        this.dragOffset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        nodeElement.style.zIndex = '1000';
        nodeElement.classList.add('dragging');
        // Use grabbing cursor during drag regardless of current tool
        this.gameContainer.style.cursor = 'grabbing';
        
        // Add extra visual feedback for cursor tool drags
        if (this.currentTool === 'cursor') {
            nodeElement.style.boxShadow = '0 8px 25px rgba(252, 163, 17, 0.6)';
            nodeElement.style.transform += ' scale(1.05)';
        }
    }

    handleMouseMove(event) {
        if (!this.draggedNode) return;
        
        event.preventDefault();
        const canvasRect = this.gameContainer.getBoundingClientRect();
        
        let x = event.clientX - canvasRect.left - this.dragOffset.x;
        let y = event.clientY - canvasRect.top - this.dragOffset.y;
        
        // Constrain to canvas bounds
        const nodeElement = document.getElementById(this.draggedNode.id);
        const nodeRect = nodeElement.getBoundingClientRect();
        
        x = Math.max(0, Math.min(x, canvasRect.width - nodeRect.width));
        y = Math.max(0, Math.min(y, canvasRect.height - nodeRect.height));
        
        // Update node position
        this.draggedNode.x = x;
        this.draggedNode.y = y;
        
        nodeElement.style.left = `${x}px`;
        nodeElement.style.top = `${y}px`;
        
        // Update any connections to this node
        this.updateNodeConnections(this.draggedNode.id);
    }

    handleMouseUp(event) {
        if (!this.draggedNode) return;
        
        const nodeElement = document.getElementById(this.draggedNode.id);
        const nodeType = this.draggedNode.type;
        
        // Reset visual styles
        nodeElement.style.zIndex = '';
        nodeElement.classList.remove('dragging');
        
        // Reset transform and shadow to base state
        const baseTransform = nodeType === 'diamond' ? 'none' : 
                             nodeType === 'parallelogram' ? 'skew(-20deg)' : '';
        nodeElement.style.transform = baseTransform;
        nodeElement.style.boxShadow = '';
        
        // Reset canvas cursor based on current tool
        this.gameContainer.style.cursor = this.currentTool === 'delete' ? 'not-allowed' : 
                                         this.currentTool === 'arrow' ? 'crosshair' : 
                                         this.currentTool === 'cursor' ? 'default' : 'default';
        
        // Show brief success feedback for cursor tool moves
        if (this.currentTool === 'cursor') {
            nodeElement.style.transition = 'all 0.2s ease';
            setTimeout(() => {
                nodeElement.style.transition = '';
            }, 200);
        }
        
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    updateNodeConnections(nodeId) {
        // Find all connections involving this node and redraw them
        const connectionsToUpdate = this.connections.filter(conn => 
            conn.source === nodeId || conn.target === nodeId
        );
        
        connectionsToUpdate.forEach(connection => {
            const sourceNode = this.nodes.find(n => n.id === connection.source);
            const targetNode = this.nodes.find(n => n.id === connection.target);
            
            if (sourceNode && targetNode) {
                // Remove old connection visuals
                this.removeConnectionVisuals(connection.id);
                // Redraw connection
                this.drawConnection(sourceNode, targetNode, connection.id);
            }
        });
    }

    exitPlacementMode() {
        this.placementMode = null;
        this.gameContainer.style.cursor = this.currentTool === 'delete' ? 'not-allowed' : 
                                         this.currentTool === 'arrow' ? 'crosshair' : 
                                         this.currentTool === 'cursor' ? 'default' : 'default';
        
        // Remove placement highlighting
        const container = this.container;
        container.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('placing'));
    }

    createNodeAtPosition(type, x, y, text = null) {
        // Adjust position to center the node at click point
        const adjustedX = Math.max(10, Math.min(x - 40, this.gameContainer.offsetWidth - 90));
        const adjustedY = Math.max(10, Math.min(y - 20, this.gameContainer.offsetHeight - 50));
        
        this.createNode(type, adjustedX, adjustedY, text);
        
        // Update progress tracking
        this.updateFlowchartProgress();
    }

    createNode(type, x, y, text = null) {
        const node = {
            id: `node-${++this.nodeCounter}`,
            type: type,
            x: x,
            y: y,
            text: text || this.getDefaultText(type)
        };

        const nodeElement = document.createElement('div');
        nodeElement.className = `flowchart-node node-${type}`;
        nodeElement.id = node.id;
        nodeElement.style.left = `${x}px`;
        nodeElement.style.top = `${y}px`;
        nodeElement.textContent = node.text;

        // Add visual styles for flowchart nodes
        this.applyNodeStyles(nodeElement, type);

        // Enhanced click/touch handling for both desktop and mobile
        // Desktop double-click handler
        nodeElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.editNodeText(node);
        });

        // Enhanced mobile double-tap handling using mobile utils
        if (FlowByteMobileUtils.isMobile()) {
            FlowByteMobileUtils.setupDoubleTapHandler(nodeElement, (e) => {
                this.editNodeText(node);
            });
            
            // Clean mobile touch feedback that doesn't interfere with double-tap
            nodeElement.addEventListener('touchstart', (e) => {
                // Only apply subtle visual feedback, no scaling
                nodeElement.style.filter = 'brightness(1.1)';
                nodeElement.style.transition = 'filter 0.1s ease';
                
                // Show hint about double-tap on first touch
                if (!nodeElement.hasAttribute('data-hint-shown')) {
                    setTimeout(() => {
                        if (!nodeElement.hasAttribute('data-editing')) {
                            const hint = document.createElement('div');
                            hint.style.cssText = `
                                position: absolute;
                                top: -25px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: rgba(255, 193, 7, 0.9);
                                color: #000;
                                padding: 2px 6px;
                                border-radius: 3px;
                                font-size: 9px;
                                font-weight: bold;
                                pointer-events: none;
                                z-index: 1000;
                                white-space: nowrap;
                            `;
                            hint.textContent = 'Double-tap to edit';
                            nodeElement.style.position = 'relative';
                            nodeElement.appendChild(hint);
                            
                            setTimeout(() => {
                                if (hint.parentNode) {
                                    hint.parentNode.removeChild(hint);
                                }
                            }, 2000);
                        }
                    }, 1000);
                    nodeElement.setAttribute('data-hint-shown', 'true');
                }
            });
            
            nodeElement.addEventListener('touchend', (e) => {
                // Reset only the brightness filter, keep position stable
                setTimeout(() => {
                    nodeElement.style.filter = '';
                    nodeElement.style.transition = 'filter 0.2s ease';
                }, 50);
            });
        }

        // Standard click handler for single clicks
        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Only handle single click if not from touch or if it's the first click
            if (!FlowByteMobileUtils.isMobile() || e.detail === 1) {
                this.handleNodeClick(node, e);
            }
        });

        // Prevent default drag behavior
        nodeElement.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        this.gameContainer.appendChild(nodeElement);
        this.nodes.push(node);
        
        // Track node types for validation
        if (type === 'oval') {
            if (node.text.toUpperCase().includes('START')) {
                this.hasStartNode = true;
            } else if (node.text.toUpperCase().includes('END')) {
                this.hasEndNode = true;
            }
        } else if (type === 'rectangle') {
            this.hasProcessNodes = true;
        }
        
        this.showFeedback(`${this.getShapeTypeName(type)} placed! Double-click to edit text or drag to move.`);
        this.updateFlowchartProgress();
    }

    applyNodeStyles(element, type) {
        element.style.position = 'absolute';
        element.style.padding = '8px 12px';
        element.style.fontSize = '12px';
        element.style.fontWeight = 'bold';
        element.style.textAlign = 'center';
        element.style.cursor = 'grab';
        element.style.userSelect = 'none';
        element.style.border = '2px solid #4CAF50';
        element.style.color = 'white';
        element.style.minWidth = '80px';
        element.style.minHeight = '40px';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        
        switch(type) {
            case 'oval':
                element.style.borderRadius = '50px';
                element.style.backgroundColor = '#52b788';
                break;
            case 'rectangle':
                element.style.borderRadius = '4px';
                element.style.backgroundColor = '#457b9d';
                break;
            case 'diamond':
                element.style.backgroundColor = '#fca311';
                element.style.width = '90px';
                element.style.height = '90px';
                element.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
                element.style.border = 'none'; // Remove border as clip-path can interfere
                element.style.transform = 'none'; // Remove rotation, use clip-path instead
                element.style.fontSize = '11px'; // Slightly smaller font for diamond
                element.style.padding = '0'; // Remove padding for better centering
                break;
            case 'parallelogram':
                element.style.background = 'linear-gradient(to right, transparent 10px, #9d4edd 10px)';
                element.style.transform = 'skew(-20deg)';
                element.style.backgroundColor = '#9d4edd';
                break;
        }

        // Add hover effects with cursor-specific feedback
        element.addEventListener('mouseenter', () => {
            if (!element.classList.contains('dragging')) {
                const baseTransform = type === 'diamond' ? 'none' : 
                                   type === 'parallelogram' ? 'skew(-20deg)' : '';
                element.style.transform = baseTransform + ' scale(1.05)';
                element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                
                // Change cursor based on current tool when hovering over nodes
                if (this.currentTool === 'cursor') {
                    element.style.cursor = 'grab';
                } else if (this.currentTool === 'arrow') {
                    element.style.cursor = 'crosshair';
                } else if (this.currentTool === 'delete') {
                    element.style.cursor = 'not-allowed';
                } else {
                    element.style.cursor = 'pointer';
                }
            }
        });

        element.addEventListener('mouseleave', () => {
            if (!element.classList.contains('dragging')) {
                const baseTransform = type === 'diamond' ? 'none' : 
                                   type === 'parallelogram' ? 'skew(-20deg)' : '';
                element.style.transform = baseTransform;
                element.style.boxShadow = '';
                element.style.cursor = 'inherit';
            }
        });
    }

    selectTool(tool) {
        this.currentTool = tool;
        console.log('Tool selected:', tool);
        
        // Exit placement mode when switching tools
        this.exitPlacementMode();
        
        // Update tool buttons - remove active from all, add to selected
        const container = this.container;
        container.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        
        if (tool === 'cursor') {
            const cursorBtn = container.querySelector('#cursor-tool-btn');
            if (cursorBtn) cursorBtn.classList.add('active');
        } else if (tool === 'arrow') {
            const arrowBtn = container.querySelector('#arrow-tool-btn');
            if (arrowBtn) arrowBtn.classList.add('active');
        } else if (tool === 'delete') {
            const deleteBtn = container.querySelector('#delete-tool-btn');
            if (deleteBtn) deleteBtn.classList.add('active');
        }
        
        if (this.gameContainer) {
            this.gameContainer.style.cursor = tool === 'delete' ? 'not-allowed' : 
                                             tool === 'arrow' ? 'crosshair' : 
                                             tool === 'cursor' ? 'default' : 'default';
        }
        
        // Update cursor style for all existing nodes based on the new tool
        this.updateNodeCursors();
        
        if (tool !== 'arrow') {
            this.clearConnectionSource();
        }
    }

    updateNodeCursors() {
        // Update cursor style for all existing flowchart nodes based on current tool
        const nodeElements = this.gameContainer?.querySelectorAll('.flowchart-node');
        if (!nodeElements) return;

        nodeElements.forEach(nodeElement => {
            if (!nodeElement.classList.contains('dragging')) {
                // Reset to default first
                nodeElement.style.cursor = 'inherit';
                
                // Apply tool-specific cursor (this will be used in hover states via the mouseenter listener)
                // The actual cursor change happens in the mouseenter event listener in applyNodeStyles
                nodeElement.setAttribute('data-tool-cursor', this.currentTool);
            }
        });
    }

    getDefaultText(type) {
        const defaults = {
            oval: 'START',
            rectangle: 'PROCESS',
            diamond: 'DECISION',
            parallelogram: 'INPUT/OUTPUT'
        };
        return defaults[type] || 'NODE';
    }

    getShapeTypeName(type) {
        const names = {
            oval: 'Start/End shape',
            rectangle: 'Process shape',
            diamond: 'Decision shape',
            parallelogram: 'Input/Output shape'
        };
        return names[type] || 'Shape';
    }

    showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${type}`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        switch(type) {
            case 'error':
                feedback.style.backgroundColor = '#e63946';
                break;
            case 'warning':
                feedback.style.backgroundColor = '#fca311';
                break;
            case 'info':
                feedback.style.backgroundColor = '#457b9d';
                break;
            default:
                feedback.style.backgroundColor = '#52b788';
        }
        
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 4000);
    }

    handleNodeClick(node, event) {
        switch(this.currentTool) {
            case 'cursor':
            case 'select':
                this.selectNode(node);
                break;
            case 'arrow':
                this.handleConnectionClick(node);
                break;
            case 'delete':
                this.deleteNode(node);
                break;
        }
    }

    selectNode(node) {
        if (this.selectedNode) {
            document.getElementById(this.selectedNode.id).classList.remove('selected');
        }
        this.selectedNode = node;
        document.getElementById(node.id).classList.add('selected');
        this.showFeedback(`Selected ${node.type} node`);
    }

    handleConnectionClick(node) {
        // Step 4 validation
        if (this.currentStep < 4) {
            this.showFeedback('Add your shapes first, then connect them with arrows.', 'warning');
            return;
        }
        
        if (this.nodes.length < 2) {
            this.showFeedback('Add at least 2 shapes before creating connections.', 'warning');
            return;
        }
        
        if (!this.connectionSource) {
            this.connectionSource = node;
            const nodeElement = document.getElementById(node.id);
            if (nodeElement) {
                nodeElement.classList.add('highlight-source');
            }
            this.showFeedback('Source node selected. Click target node to create connection.');
        } else {
            if (this.connectionSource.id === node.id) {
                this.showFeedback('Cannot connect node to itself!', 'error');
                return;
            }
            
            if (this.connectionExists(this.connectionSource.id, node.id)) {
                this.showFeedback('Connection already exists!', 'error');
                return;
            }
            
            this.createConnection(this.connectionSource, node);
            this.clearConnectionSource();
        }
    }

    createConnection(sourceNode, targetNode) {
        const connection = {
            id: `connection-${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id
        };

        this.connections.push(connection);
        this.drawConnection(sourceNode, targetNode, connection.id);
        this.hasConnections = true;
        this.showFeedback('Connection created! Your flowchart is taking shape.');
        this.updateFlowchartProgress();
    }

    drawConnection(sourceNode, targetNode, connectionId) {
        const svg = document.getElementById('connection-svg');
        if (!svg) return;
        
        // Ensure SVG has proper attributes
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.pointerEvents = 'none';
        
        const sourceElement = document.getElementById(sourceNode.id);
        const targetElement = document.getElementById(targetNode.id);
        
        if (!sourceElement || !targetElement) return;
        
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const canvasRect = this.gameContainer.getBoundingClientRect();

        const sourceX = sourceRect.left - canvasRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top - canvasRect.top + sourceRect.height / 2;
        const targetX = targetRect.left - canvasRect.left + targetRect.width / 2;
        const targetY = targetRect.top - canvasRect.top + targetRect.height / 2;

        // Create arrowhead marker definition if it doesn't exist
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.appendChild(defs);
        }

        // Create arrowhead marker if it doesn't exist
        if (!svg.querySelector('#arrowhead')) {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');
            marker.setAttribute('markerUnits', 'strokeWidth');

            const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrowPath.setAttribute('d', 'M0,0 L0,6 L8,3 z');
            arrowPath.setAttribute('fill', '#4CAF50');
            arrowPath.setAttribute('stroke', '#4CAF50');
            arrowPath.setAttribute('stroke-width', '1');

            marker.appendChild(arrowPath);
            defs.appendChild(marker);
        }

        // Calculate connection points on the edge of shapes with precise edge detection
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        
        // Calculate precise edge intersection points for different shape types
        const sourceEdge = this.calculateShapeEdgePoint(sourceNode, sourceRect, targetX, targetY, false);
        const targetEdge = this.calculateShapeEdgePoint(targetNode, targetRect, sourceX, sourceY, true);
        
        const adjustedSourceX = sourceEdge.x;
        const adjustedSourceY = sourceEdge.y;
        const adjustedTargetX = targetEdge.x;
        const adjustedTargetY = targetEdge.y;

        // Create main connection line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', adjustedSourceX);
        line.setAttribute('y1', adjustedSourceY);
        line.setAttribute('x2', adjustedTargetX);
        line.setAttribute('y2', adjustedTargetY);
        line.setAttribute('stroke', '#4CAF50');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        line.setAttribute('id', `line-${connectionId}`);
        line.style.pointerEvents = 'none';
        
        // Create invisible clickable area for deletion (wider for easier clicking)
        const invisibleLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        invisibleLine.setAttribute('x1', adjustedSourceX);
        invisibleLine.setAttribute('y1', adjustedSourceY);
        invisibleLine.setAttribute('x2', adjustedTargetX);
        invisibleLine.setAttribute('y2', adjustedTargetY);
        invisibleLine.setAttribute('stroke', 'transparent');
        invisibleLine.setAttribute('stroke-width', '12');
        invisibleLine.setAttribute('id', `invisible-${connectionId}`);
        invisibleLine.style.cursor = 'pointer';
        invisibleLine.style.pointerEvents = 'stroke';
        
        invisibleLine.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentTool === 'delete') {
                this.deleteConnection(connectionId);
            }
        });

        svg.appendChild(line);
        svg.appendChild(invisibleLine);
    }

    calculateShapeEdgePoint(node, nodeRect, targetX, targetY, isTarget) {
        const canvasRect = this.gameContainer.getBoundingClientRect();
        const centerX = nodeRect.left - canvasRect.left + nodeRect.width / 2;
        const centerY = nodeRect.top - canvasRect.top + nodeRect.height / 2;
        
        // Calculate angle from center to target point
        const angle = Math.atan2(targetY - centerY, targetX - centerX);
        
        // Get half dimensions
        const halfWidth = nodeRect.width / 2;
        const halfHeight = nodeRect.height / 2;
        
        let edgeX, edgeY;
        
        switch(node.type) {
            case 'oval':
                // For ovals/ellipses, calculate intersection with ellipse boundary
                const radiusX = halfWidth;
                const radiusY = halfHeight;
                const denominator = Math.sqrt(
                    Math.pow(radiusY * Math.cos(angle), 2) + 
                    Math.pow(radiusX * Math.sin(angle), 2)
                );
                edgeX = centerX + (radiusX * radiusY * Math.cos(angle)) / denominator;
                edgeY = centerY + (radiusX * radiusY * Math.sin(angle)) / denominator;
                break;
                
            case 'diamond':
                // For diamonds, calculate intersection with diamond edges
                // Diamond points: top, right, bottom, left
                const absCos = Math.abs(Math.cos(angle));
                const absSin = Math.abs(Math.sin(angle));
                
                if (absCos / halfWidth > absSin / halfHeight) {
                    // Intersect with left or right edge
                    const t = halfWidth / absCos;
                    edgeX = centerX + t * Math.cos(angle);
                    edgeY = centerY + t * Math.sin(angle);
                } else {
                    // Intersect with top or bottom edge
                    const t = halfHeight / absSin;
                    edgeX = centerX + t * Math.cos(angle);
                    edgeY = centerY + t * Math.sin(angle);
                }
                break;
                
            case 'rectangle':
            case 'parallelogram':
            default:
                // For rectangles and parallelograms, calculate intersection with rectangle boundary
                const slope = Math.tan(angle);
                
                // Check which edge the line intersects
                if (Math.abs(slope) <= halfHeight / halfWidth) {
                    // Intersects left or right edge
                    if (Math.cos(angle) > 0) {
                        // Right edge
                        edgeX = centerX + halfWidth;
                        edgeY = centerY + halfWidth * slope;
                    } else {
                        // Left edge
                        edgeX = centerX - halfWidth;
                        edgeY = centerY - halfWidth * slope;
                    }
                } else {
                    // Intersects top or bottom edge
                    if (Math.sin(angle) > 0) {
                        // Bottom edge
                        edgeY = centerY + halfHeight;
                        edgeX = centerX + halfHeight / slope;
                    } else {
                        // Top edge
                        edgeY = centerY - halfHeight;
                        edgeX = centerX - halfHeight / slope;
                    }
                }
                break;
        }
        
        // For target nodes, move the point slightly inward so the arrowhead tip touches the edge
        if (isTarget) {
            const arrowheadLength = 2; // Reduced adjustment for more precise alignment
            const adjustmentAngle = Math.atan2(centerY - edgeY, centerX - edgeX);
            edgeX += Math.cos(adjustmentAngle) * arrowheadLength;
            edgeY += Math.sin(adjustmentAngle) * arrowheadLength;
        }
        
        return { x: edgeX, y: edgeY };
    }

    connectionExists(sourceId, targetId) {
        return this.connections.some(conn => 
            (conn.source === sourceId && conn.target === targetId) ||
            (conn.source === targetId && conn.target === sourceId)
        );
    }

    clearConnectionSource() {
        if (this.connectionSource) {
            const sourceElement = document.getElementById(this.connectionSource.id);
            if (sourceElement) {
                sourceElement.classList.remove('highlight-source');
            }
            this.connectionSource = null;
        }
    }

    deleteNode(node) {
        if (confirm(`Delete ${node.type} node "${node.text}"?`)) {
            this.removeNodeConnections(node.id);
            const nodeElement = document.getElementById(node.id);
            if (nodeElement) {
                nodeElement.remove();
            }
            this.nodes = this.nodes.filter(n => n.id !== node.id);
            
            if (this.selectedNode && this.selectedNode.id === node.id) {
                this.selectedNode = null;
            }
            
            this.showFeedback('Node deleted!');
            this.updateFlowchartProgress();
        }
    }

    removeNodeConnections(nodeId) {
        this.connections = this.connections.filter(connection => {
            if (connection.source === nodeId || connection.target === nodeId) {
                this.removeConnectionVisuals(connection.id);
                return false;
            }
            return true;
        });
    }

    deleteConnection(connectionId) {
        if (confirm('Delete this connection?')) {
            this.connections = this.connections.filter(conn => conn.id !== connectionId);
            this.removeConnectionVisuals(connectionId);
            this.showFeedback('Connection deleted!');
        }
    }

    removeConnectionVisuals(connectionId) {
        const line = document.getElementById(`line-${connectionId}`);
        const invisible = document.getElementById(`invisible-${connectionId}`);
        
        if (line) line.remove();
        if (invisible) invisible.remove();
    }

    resetCanvas() {
        if (confirm('Reset canvas? This will delete all nodes and connections.')) {
            this.nodes = [];
            this.connections = [];
            this.selectedNode = null;
            this.connectionSource = null;
            this.nodeCounter = 0;
            this.currentStep = 1;
            this.hasStartNode = false;
            this.hasEndNode = false;
            this.hasProcessNodes = false;
            this.hasConnections = false;
            this.hasLabels = false;
            
            if (this.gameContainer) {
                this.gameContainer.innerHTML = '<svg id="connection-svg" class="connection-svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></svg>';
            }
            
            this.updateStepGuidance();
            this.showFeedback('Canvas reset!');
        }
    }

    abortMission() {
        if (confirm('Are you sure you want to abort this mission? Your progress will be lost.')) {
            // Reset game state
            this.currentDifficulty = null;
            this.currentLevel = null;
            this.nodes = [];
            this.connections = [];
            this.selectedNode = null;
            this.connectionSource = null;
            this.mistakeCount = 0;
            this.resetCanvas();
            
            // Redirect to difficulty selection screen
            this.showRoomSelection();
        }
    }

    updateMistakeCount() {
        const mistakeElement = this.container.querySelector('#mistake-count');
        if (mistakeElement) {
            mistakeElement.textContent = this.mistakeCount;
        }
    }

    updateFlowchartProgress() {
        // Auto-advance steps based on progress
        if (this.currentStep === 1 && this.nodes.length > 0) {
            this.currentStep = 3; // Skip to step 3 since we're adding shapes
        } else if (this.currentStep === 3 && this.hasConnections) {
            this.currentStep = 4;
        } else if (this.currentStep === 4 && this.hasLabels) {
            this.currentStep = 5;
        } else if (this.currentStep === 5 && this.hasStartNode && this.hasEndNode) {
            this.currentStep = 6;
        }
        
        this.updateStepGuidance();
        this.checkFlowchartCompletion();
    }

    checkFlowchartCompletion() {
        const hasRequiredElements = this.hasStartNode && this.hasEndNode && 
                                  this.hasProcessNodes && this.hasConnections;
        
        if (hasRequiredElements && this.currentStep >= 6) {
            this.currentStep = 7;
            this.updateStepGuidance();
            this.showFeedback('Excellent! Your flowchart has all required elements. Review and test it.', 'success');
        }
    }

    completeLevel() {
        // Enhanced validation based on 7-step process
        const validationResults = this.validateFlowchart();
        
        if (!validationResults.isValid) {
            this.showFeedback(validationResults.message, 'error');
            this.mistakeCount++;
            this.attempts++;
            this.updateMistakeCount();
            return;
        }
        
        // Check if all 7 steps are completed
        if (this.currentStep < 7) {
            this.showFeedback('Complete all flowchart creation steps before finishing the level.', 'warning');
            return;
        }
        
        this.showFeedback('Outstanding! You\'ve created a proper flowchart following professional standards!', 'success');
        
        // Calculate score based on completion and mistakes
        const baseScore = 100;
        const mistakePenalty = Math.min(this.mistakeCount * 10, 50); // Max 50 point penalty
        this.score = Math.max(50, baseScore - mistakePenalty); // Minimum 50 points
        
        // Calculate progress
        const progress = Math.round((this.currentLevel / 5) * 100);
        const progressElement = this.container.querySelector('#learning-progress');
        if (progressElement) {
            progressElement.textContent = `${progress}%`;
        }
        
        // Report progress to tracking systems
        this.reportProgressToCenter();
        
        // Automatically reset canvas for next level
        this.resetCanvasForNextLevel();
        
        if (this.currentLevel < 5) {
            setTimeout(() => {
                this.startLevel(this.currentLevel + 1);
            }, 2000);
        } else {
            // Report room completion
            this.reportRoomCompletion();
            
            setTimeout(() => {
                if (window.commandCenter) {
                    window.commandCenter.showCommandDashboard();
                }
            }, 2000);
        }
    }

    resetCanvasForNextLevel() {
        // Clear all visual elements from canvas
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.connectionSource = null;
        this.nodeCounter = 0;
        
        // Reset progress tracking
        this.currentStep = 1;
        this.hasStartNode = false;
        this.hasEndNode = false;
        this.hasProcessNodes = false;
        this.hasConnections = false;
        this.hasLabels = false;
        
        // Clear placement mode
        this.exitPlacementMode();
        
        // Clear the canvas and reinitialize SVG
        if (this.gameContainer) {
            this.gameContainer.innerHTML = '<svg id="connection-svg" class="connection-svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></svg>';
        }
        
        // Reset tool selection to default
        this.selectTool('arrow');
        
        console.log('Canvas automatically reset for next level');
    }

    validateFlowchart() {
        // Step 1: Purpose understanding (checked by having appropriate scenario)
        if (this.nodes.length === 0) {
            return { isValid: false, message: 'Add at least one shape to represent your process.' };
        }
        
        // Step 2 & 3: Template and shapes
        if (!this.hasStartNode) {
            return { isValid: false, message: 'Every flowchart needs a START node (oval shape).' };
        }
        
        if (!this.hasEndNode) {
            return { isValid: false, message: 'Every flowchart needs an END node (oval shape).' };
        }
        
        if (!this.hasProcessNodes) {
            return { isValid: false, message: 'Add at least one process step (rectangle shape).' };
        }
        
        // Step 4: Connections
        if (!this.hasConnections) {
            return { isValid: false, message: 'Connect your shapes with arrows to show the flow.' };
        }
        
        if (this.connections.length < this.nodes.length - 1) {
            return { isValid: false, message: 'Not all shapes are properly connected.' };
        }
        
        // Step 5: Text labels
        const unlabeledNodes = this.nodes.filter(node => 
            !node.text || node.text === this.getDefaultText(node.type)
        );
        
        if (unlabeledNodes.length > 0) {
            return { isValid: false, message: 'Add descriptive text to all shapes.' };
        }
        
        return { isValid: true, message: 'Perfect flowchart structure!' };
    }

    getHint() {
        // Initialize hint tracking if not exists
        if (!this.hintTracker) {
            this.hintTracker = {
                currentLevel: 0,
                maxLevel: 3,
                hintsUsed: 0
            };
        }

        // Progressive hints based on current level and difficulty
        const progressiveHints = this.getProgressiveHints();
        const currentHint = progressiveHints[this.hintTracker.currentLevel];
        
        if (currentHint) {
            this.showFeedback(`💡 Hint ${this.hintTracker.currentLevel + 1}/${this.hintTracker.maxLevel + 1}: ${currentHint}`, 'info');
            
            // Update hint panel display
            const hintDisplay = document.getElementById('current-hint-display');
            if (hintDisplay) {
                hintDisplay.textContent = currentHint;
            }
            
            // Update hint button text to show progression
            const hintBtn = document.getElementById('get-hint-btn');
            if (hintBtn) {
                this.hintTracker.currentLevel = Math.min(this.hintTracker.currentLevel + 1, this.hintTracker.maxLevel);
                this.hintTracker.hintsUsed++;
                
                if (this.hintTracker.currentLevel >= this.hintTracker.maxLevel) {
                    hintBtn.innerHTML = '💡 All Hints Used';
                    hintBtn.disabled = true;
                    hintBtn.style.opacity = '0.6';
                } else {
                    hintBtn.innerHTML = `💡 Next Hint (${this.hintTracker.currentLevel + 1}/${this.hintTracker.maxLevel + 1})`;
                }
            }
        }
    }

    getProgressiveHints() {
        const easyHints = {
            1: [ // Sequential Program Flow - Level 1
                "Start with a START oval representing program entry point (main function begins).",
                "Add a rectangle for 'Declare variables' - this represents variable initialization in code.",
                "Add another rectangle for 'Print Hello World' - the main program logic.",
                "End with END oval representing program termination (return 0 or exit)."
            ],
            2: [ // Conditional Logic (if-else) - Level 2
                "Begin with START, then add parallelogram for 'Input age' (user input operation).",
                "Add decision diamond 'age >= 18?' - this represents the if condition in code.",
                "Create two paths: 'Yes' leads to 'Display Adult', 'No' leads to 'Display Minor'.",
                "Both condition branches should converge back to END oval."
            ],
            3: [ // Input-Processing-Output Pattern - Level 3
                "START → Input parallelogram 'Get number1' → Input parallelogram 'Get number2'.",
                "Add process rectangle 'sum = number1 + number2' (the calculation logic).",
                "Add output parallelogram 'Display sum' (print/output statement).",
                "Connect all in sequence: Input → Input → Process → Output → END."
            ],
            4: [ // Function Call Chain - Level 4
                "START represents main() function entry point.",
                "Add rectangles for function calls: 'Call getUserInput()', 'Call calculateSum()', 'Call displayResult()'.",
                "Each function call should return control (arrow back to main flow).",
                "Show the sequential function calling pattern ending at END."
            ],
            5: [ // Complete Program with Validation - Level 5
                "Design full program: START → Input grades → Validate input (decision diamond).",
                "If invalid input, loop back to input. If valid, proceed to calculate average.",
                "Add decision diamond for grade classification (A/B/C/D/F based on average).",
                "Multiple branches for different grades, all converging to display result then END."
            ]
        };

        const hardHints = {
            1: [ // Nested Control Structures - Level 1
                "Start with decision diamond 'Check user role' (admin vs user).",
                "Each role branch leads to another decision: 'Check permissions within role'.",
                "Further nest with 'Check specific action allowed' decisions.",
                "Create tree structure: Role → Permissions → Actions → Final processes."
            ],
            2: [ // Loop Algorithms (while/for loops) - Level 2
                "START → Initialize 'counter = 1, result = 1' → Enter while loop decision 'counter <= n?'.",
                "If Yes: 'result = result * counter' → 'counter = counter + 1' → loop back to condition.",
                "If No: exit loop → 'Return result' → END.",
                "Show the loop iteration path clearly with back-arrow to condition check."
            ],
            3: [ // Exception Handling (try-catch-finally) - Level 3
                "START → 'Try: Open file' → Decision diamond 'File exists?'.",
                "If No: 'Catch FileNotFoundException' → 'Handle file error'.",
                "Add another decision for 'IOException occurred?' with separate catch block.",
                "All paths lead to 'Finally: Close resources' before END."
            ],
            4: [ // Recursive Algorithms - Level 4
                "START → Decision 'Array empty or element found?' → If Yes: 'Return result'.",
                "If No: 'Compare with middle element' → Decision 'target < middle?'.",
                "Two recursive paths: 'Search left half' or 'Search right half'.",
                "Show recursive calls with arrows pointing back to function start, stack depth implied."
            ],
            5: [ // Object-Oriented Polymorphism - Level 5
                "START → 'Create Animal objects (Dog, Cat, Bird)'.",
                "Add process 'Call makeSound() on each object'.",
                "Show decision 'Determine actual object type at runtime'.",
                "Multiple branches for polymorphic method resolution → specific implementations → END."
            ]
        };

        const currentLevel = this.currentLevel || 1;
        const isEasy = this.currentDifficulty === 'easy';
        
        return isEasy ? 
            (easyHints[currentLevel] || easyHints[1]) :
            (hardHints[currentLevel] || hardHints[1]);
    }

    resetHints() {
        // Reset hint tracking for new level/challenge
        this.hintTracker = {
            currentLevel: 0,
            maxLevel: 3,
            hintsUsed: 0
        };
        
        // Reset hint button appearance
        const hintBtn = document.getElementById('get-hint-btn');
        if (hintBtn) {
            hintBtn.innerHTML = '💡 Get Hint (1/4)';
            hintBtn.disabled = false;
            hintBtn.style.opacity = '1';
        }
        
        // Reset hint display panel
        const hintDisplay = document.getElementById('current-hint-display');
        if (hintDisplay) {
            hintDisplay.textContent = 'Click "Get Hint" for step-by-step guidance tailored to your current level!';
        }
    }

    editNodeText(node) {
        // Step 5 validation
        if (this.currentStep < 5 && this.nodes.length > 0) {
            this.showFeedback('Great! Now you can add text to make your flowchart clear.', 'success');
            this.currentStep = Math.max(this.currentStep, 5);
        }
        
        // Mark node as being edited for mobile feedback
        const nodeElement = document.getElementById(node.id);
        if (nodeElement) {
            nodeElement.setAttribute('data-editing', 'true');
            
            // Reset any existing transforms to prevent expansion
            nodeElement.style.transform = '';
            nodeElement.style.filter = '';
            nodeElement.style.transition = '';
            
            // Add subtle editing visual feedback
            nodeElement.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.8)';
            nodeElement.style.borderColor = '#4CAF50';
            
            // Show mobile-friendly feedback
            if (FlowByteMobileUtils.isMobile()) {
                this.showFeedback('📝 Text editor opened! Choose appropriate text for your flowchart element.', 'info');
            }
        }
        
        this.showTextSelectionModal(node);
    }

    showTextSelectionModal(node) {
        const difficultyData = this.difficulties[this.currentDifficulty];
        const levelData = difficultyData.levels[this.currentLevel - 1];
        
        // Get appropriate text options based on node type, difficulty, and level
        const textOptions = this.getTextOptions(node.type, this.currentDifficulty, this.currentLevel);
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'text-selection-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%);
            border: 2px solid #4CAF50;
            border-radius: 15px;
            padding: 25px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        modalContent.innerHTML = `
            <h3 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 1.3rem;">
                Choose Text for ${this.getShapeTypeName(node.type)}
            </h3>
            <p style="color: #cccccc; margin: 0 0 20px 0; font-size: 0.9rem;">
                Select the most appropriate text for this ${node.type} shape in the context of: <br/>
                <strong style="color: #4CAF50;">${levelData.name}</strong> - ${levelData.scenario.substring(0, 80)}...
            </p>
            <select id="text-options" style="
                width: 100%;
                padding: 12px;
                font-size: 1rem;
                border: 2px solid #4CAF50;
                border-radius: 8px;
                background: #1e1e2e;
                color: white;
                margin-bottom: 20px;
                outline: none;
            ">
                <option value="">-- Select Text Option --</option>
                ${textOptions.map(option => `
                    <option value="${option.value}" ${option.value === node.text ? 'selected' : ''}>
                        ${option.label}
                    </option>
                `).join('')}
            </select>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="apply-text" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Apply Text</button>
                <button id="cancel-text" style="
                    background: linear-gradient(135deg, #6c757d, #5a6268);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Cancel</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        const selectElement = modalContent.querySelector('#text-options');
        const applyBtn = modalContent.querySelector('#apply-text');
        const cancelBtn = modalContent.querySelector('#cancel-text');
        

        
        applyBtn.addEventListener('click', () => {
            if (selectElement.value) {
                this.updateNodeText(node, selectElement.value);
                document.body.removeChild(modal);
            } else {
                this.showFeedback('Please select a text option first!', 'warning');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    getTextOptions(nodeType, difficulty, level) {
        const programmingOptions = {
            easy: {
                1: { // Sequential Program Flow - Hello World
                    oval: [
                        { value: 'START', label: 'START - Program begins execution' },
                        { value: 'END', label: 'END - Program terminates' },
                        { value: 'MAIN()', label: 'MAIN() - Entry point function' }
                    ],
                    rectangle: [
                        { value: 'DECLARE VARIABLES', label: 'DECLARE VARIABLES - Initialize memory' },
                        { value: 'PRINT "HELLO WORLD"', label: 'PRINT "HELLO WORLD" - Output statement' },
                        { value: 'SET message = "Hello"', label: 'SET message = "Hello" - Variable assignment' },
                        { value: 'RETURN 0', label: 'RETURN 0 - Successful termination' }
                    ],
                    diamond: [
                        { value: 'VARIABLES INITIALIZED?', label: 'VARIABLES INITIALIZED? - Memory check' }
                    ],
                    parallelogram: [
                        { value: 'OUTPUT MESSAGE', label: 'OUTPUT MESSAGE - Console display' },
                        { value: 'SYSTEM INPUT', label: 'SYSTEM INPUT - Runtime parameters' }
                    ]
                },
                2: { // Conditional Logic - Age Verification
                    oval: [
                        { value: 'START', label: 'START - Program execution begins' },
                        { value: 'END', label: 'END - Program terminates' },
                        { value: 'MAIN()', label: 'MAIN() - Entry point function' }
                    ],
                    rectangle: [
                        { value: 'DISPLAY "ADULT"', label: 'DISPLAY "ADULT" - True branch output' },
                        { value: 'DISPLAY "MINOR"', label: 'DISPLAY "MINOR" - False branch output' },
                        { value: 'DECLARE int age', label: 'DECLARE int age - Variable declaration' },
                        { value: 'PROCESS VERIFICATION', label: 'PROCESS VERIFICATION - Age validation logic' }
                    ],
                    diamond: [
                        { value: 'age >= 18?', label: 'age >= 18? - Condition check' },
                        { value: 'INPUT VALID?', label: 'INPUT VALID? - Data validation' },
                        { value: 'age > 0?', label: 'age > 0? - Range validation' }
                    ],
                    parallelogram: [
                        { value: 'INPUT age', label: 'INPUT age - Read user input' },
                        { value: 'OUTPUT result', label: 'OUTPUT result - Display classification' },
                        { value: 'PRINT "Enter age: "', label: 'PRINT "Enter age: " - User prompt' }
                    ]
                },
                3: { // Input-Processing-Output - Simple Calculator
                    oval: [
                        { value: 'START', label: 'START - Calculator program begins' },
                        { value: 'END', label: 'END - Program terminates' }
                    ],
                    rectangle: [
                        { value: 'sum = num1 + num2', label: 'sum = num1 + num2 - Addition operation' },
                        { value: 'DECLARE VARIABLES', label: 'DECLARE VARIABLES - Initialize num1, num2, sum' },
                        { value: 'VALIDATE INPUT', label: 'VALIDATE INPUT - Check numeric data' },
                        { value: 'CALCULATE RESULT', label: 'CALCULATE RESULT - Perform arithmetic' }
                    ],
                    diamond: [
                        { value: 'INPUT VALID?', label: 'INPUT VALID? - Numeric validation' },
                        { value: 'CALCULATION OK?', label: 'CALCULATION OK? - Error check' }
                    ],
                    parallelogram: [
                        { value: 'INPUT num1', label: 'INPUT num1 - Read first number' },
                        { value: 'INPUT num2', label: 'INPUT num2 - Read second number' },
                        { value: 'OUTPUT sum', label: 'OUTPUT sum - Display result' },
                        { value: 'PRINT "Result: "', label: 'PRINT "Result: " - Output label' }
                    ]
                },
                4: { // Function Call Chain - Modular Program
                    oval: [
                        { value: 'START', label: 'START - Main function begins' },
                        { value: 'END', label: 'END - Return to OS' }
                    ],
                    rectangle: [
                        { value: 'CALL getUserInput()', label: 'CALL getUserInput() - Function call' },
                        { value: 'CALL calculateSum()', label: 'CALL calculateSum() - Function call' },
                        { value: 'CALL displayResult()', label: 'CALL displayResult() - Function call' },
                        { value: 'RETURN TO MAIN', label: 'RETURN TO MAIN - Function returns' },
                        { value: 'INITIALIZE PROGRAM', label: 'INITIALIZE PROGRAM - Setup variables' }
                    ],
                    diamond: [
                        { value: 'FUNCTION SUCCESS?', label: 'FUNCTION SUCCESS? - Return value check' },
                        { value: 'DATA READY?', label: 'DATA READY? - Input validation' }
                    ],
                    parallelogram: [
                        { value: 'RETURN value', label: 'RETURN value - Function output' },
                        { value: 'PASS parameters', label: 'PASS parameters - Function arguments' }
                    ]
                },
                5: { // Complete Program - Student Grade Calculator
                    oval: [
                        { value: 'START', label: 'START - Grade calculator begins' },
                        { value: 'END', label: 'END - Program terminates' }
                    ],
                    rectangle: [
                        { value: 'INITIALIZE ARRAYS', label: 'INITIALIZE ARRAYS - Setup score storage' },
                        { value: 'CALCULATE AVERAGE', label: 'CALCULATE AVERAGE - Compute mean score' },
                        { value: 'ASSIGN GRADE A', label: 'ASSIGN GRADE A - Score >= 90' },
                        { value: 'ASSIGN GRADE B', label: 'ASSIGN GRADE B - Score >= 80' },
                        { value: 'ASSIGN GRADE C', label: 'ASSIGN GRADE C - Score >= 70' }
                    ],
                    diamond: [
                        { value: 'SCORE VALID?', label: 'SCORE VALID? - Range 0-100?' },
                        { value: 'average >= 90?', label: 'average >= 90? - A grade check' },
                        { value: 'average >= 80?', label: 'average >= 80? - B grade check' },
                        { value: 'MORE STUDENTS?', label: 'MORE STUDENTS? - Continue input?' }
                    ],
                    parallelogram: [
                        { value: 'INPUT student_scores', label: 'INPUT student_scores - Read test scores' },
                        { value: 'OUTPUT final_grade', label: 'OUTPUT final_grade - Display letter grade' },
                        { value: 'PRINT grade_report', label: 'PRINT grade_report - Student transcript' }
                    ]
                }
            },
            hard: {
                1: { // Nested Control Structures - Multi-level Menu System
                    oval: [
                        { value: 'START', label: 'START - Program initialization' },
                        { value: 'END', label: 'END - Program termination' }
                    ],
                    rectangle: [
                        { value: 'ADMIN FUNCTIONS', label: 'ADMIN FUNCTIONS - Administrative operations' },
                        { value: 'USER FUNCTIONS', label: 'USER FUNCTIONS - Standard user operations' },
                        { value: 'GRANT ACCESS', label: 'GRANT ACCESS - Permission approved' },
                        { value: 'DENY ACCESS', label: 'DENY ACCESS - Permission denied' }
                    ],
                    diamond: [
                        { value: 'user_role == ADMIN?', label: 'user_role == ADMIN? - Role check' },
                        { value: 'user_role == USER?', label: 'user_role == USER? - Role check' },
                        { value: 'has_permission?', label: 'has_permission? - Permission validation' },
                        { value: 'action_allowed?', label: 'action_allowed? - Action authorization' },
                        { value: 'is_authenticated?', label: 'is_authenticated? - Login status' }
                    ],
                    parallelogram: [
                        { value: 'INPUT user_credentials', label: 'INPUT user_credentials - Login data' },
                        { value: 'OUTPUT access_result', label: 'OUTPUT access_result - Permission status' }
                    ]
                },
                2: { // Loop Algorithms - Factorial Calculation
                    oval: [
                        { value: 'START', label: 'START - Factorial algorithm begins' },
                        { value: 'END', label: 'END - Return factorial result' }
                    ],
                    rectangle: [
                        { value: 'counter = 1', label: 'counter = 1 - Initialize loop variable' },
                        { value: 'result = 1', label: 'result = 1 - Initialize accumulator' },
                        { value: 'result *= counter', label: 'result *= counter - Multiply operation' },
                        { value: 'counter++', label: 'counter++ - Increment loop variable' }
                    ],
                    diamond: [
                        { value: 'counter <= n?', label: 'counter <= n? - Loop condition' },
                        { value: 'n >= 0?', label: 'n >= 0? - Input validation' },
                        { value: 'overflow_check?', label: 'overflow_check? - Range validation' }
                    ],
                    parallelogram: [
                        { value: 'INPUT n', label: 'INPUT n - Read factorial number' },
                        { value: 'OUTPUT result', label: 'OUTPUT result - Display factorial' }
                    ]
                },
                3: { // Exception Handling - File Processing with Try-Catch
                    oval: [
                        { value: 'START', label: 'START - File processing begins' },
                        { value: 'END', label: 'END - Processing complete or terminated' }
                    ],
                    rectangle: [
                        { value: 'TRY: OPEN FILE', label: 'TRY: OPEN FILE - Attempt file access' },
                        { value: 'CATCH FileNotFound', label: 'CATCH FileNotFound - Handle missing file' },
                        { value: 'CATCH IOException', label: 'CATCH IOException - Handle I/O errors' },
                        { value: 'FINALLY: CLOSE FILE', label: 'FINALLY: CLOSE FILE - Cleanup resources' }
                    ],
                    diamond: [
                        { value: 'FILE EXISTS?', label: 'FILE EXISTS? - File availability check' },
                        { value: 'IO_ERROR occurred?', label: 'IO_ERROR occurred? - I/O operation failed?' },
                        { value: 'PERMISSIONS OK?', label: 'PERMISSIONS OK? - File access rights?' }
                    ],
                    parallelogram: [
                        { value: 'INPUT filename', label: 'INPUT filename - Get file path' },
                        { value: 'OUTPUT error_message', label: 'OUTPUT error_message - Display exception' }
                    ]
                },
                4: { // Recursive Algorithms - Binary Search
                    oval: [
                        { value: 'START', label: 'START - Binary search function' },
                        { value: 'RETURN result', label: 'RETURN result - Found/Not found' }
                    ],
                    rectangle: [
                        { value: 'CALCULATE mid', label: 'CALCULATE mid - Find middle index' },
                        { value: 'SEARCH LEFT HALF', label: 'SEARCH LEFT HALF - Recursive call' },
                        { value: 'SEARCH RIGHT HALF', label: 'SEARCH RIGHT HALF - Recursive call' },
                        { value: 'RETURN index', label: 'RETURN index - Element found' }
                    ],
                    diamond: [
                        { value: 'ARRAY EMPTY?', label: 'ARRAY EMPTY? - Base case check' },
                        { value: 'target == arr[mid]?', label: 'target == arr[mid]? - Element found?' },
                        { value: 'target < arr[mid]?', label: 'target < arr[mid]? - Search left?' },
                        { value: 'ELEMENT FOUND?', label: 'ELEMENT FOUND? - Recursive result?' }
                    ],
                    parallelogram: [
                        { value: 'INPUT array, target', label: 'INPUT array, target - Search parameters' },
                        { value: 'RETURN -1', label: 'RETURN -1 - Element not found' }
                    ]
                },
                5: { // Object-Oriented Polymorphism - Animal Sound System
                    oval: [
                        { value: 'START', label: 'START - Polymorphism demonstration' },
                        { value: 'END', label: 'END - All objects processed' }
                    ],
                    rectangle: [
                        { value: 'CREATE Dog obj', label: 'CREATE Dog obj - Instantiate Dog class' },
                        { value: 'CREATE Cat obj', label: 'CREATE Cat obj - Instantiate Cat class' },
                        { value: 'CREATE Bird obj', label: 'CREATE Bird obj - Instantiate Bird class' },
                        { value: 'CALL makeSound()', label: 'CALL makeSound() - Polymorphic method call' }
                    ],
                    diamond: [
                        { value: 'obj instanceof Dog?', label: 'obj instanceof Dog? - Runtime type check' },
                        { value: 'obj instanceof Cat?', label: 'obj instanceof Cat? - Runtime type check' },
                        { value: 'obj instanceof Bird?', label: 'obj instanceof Bird? - Runtime type check' },
                        { value: 'MORE OBJECTS?', label: 'MORE OBJECTS? - Continue iteration?' }
                    ],
                    parallelogram: [
                        { value: 'INPUT animal_type', label: 'INPUT animal_type - User selection' },
                        { value: 'OUTPUT sound', label: 'OUTPUT sound - Animal-specific sound' }
                    ]
                }
            }
        };
        
        // Get options for current difficulty and level, fallback to basic options
        const difficultyOptions = programmingOptions[difficulty] || programmingOptions.easy;
        const levelOptions = difficultyOptions[level] || difficultyOptions[1];
        const nodeOptions = levelOptions[nodeType] || [];
        
        // Add some generic options if none exist
        if (nodeOptions.length === 0) {
            return [
                { value: nodeType.toUpperCase(), label: `${nodeType.toUpperCase()} - Default text` },
                { value: 'PROCESS', label: 'PROCESS - Generic process step' }
            ];
        }
        
        return nodeOptions;
    }

    updateNodeText(node, newText) {
        node.text = newText.trim().toUpperCase();
        const nodeElement = document.getElementById(node.id);
        if (nodeElement) {
            nodeElement.textContent = node.text;
            
            // Clear editing state and reset ALL visual effects
            nodeElement.removeAttribute('data-editing');
            nodeElement.style.boxShadow = '';
            nodeElement.style.borderColor = '';
            nodeElement.style.transform = '';
            nodeElement.style.filter = '';
            nodeElement.style.transition = '';
            
            // Add success animation for mobile users (controlled animation)
            if (FlowByteMobileUtils.isMobile()) {
                nodeElement.style.animation = 'nodeUpdateSuccess 0.6s ease-in-out';
                setTimeout(() => {
                    nodeElement.style.animation = '';
                    // Ensure everything is reset after animation
                    nodeElement.style.transform = '';
                    nodeElement.style.filter = '';
                    nodeElement.style.transition = '';
                }, 600);
            }
        }
        
        // Update tracking for start/end nodes
        if (node.type === 'oval') {
            if (node.text.includes('START')) {
                this.hasStartNode = true;
            } else if (node.text.includes('END')) {
                this.hasEndNode = true;
            }
        }
        
        this.hasLabels = true;
        
        // Enhanced feedback for mobile users
        if (FlowByteMobileUtils.isMobile()) {
            this.showFeedback(`✅ "${node.text}" updated! Double-tap other shapes to edit them.`, 'success');
        } else {
            this.showFeedback('Text updated! Your flowchart is becoming more detailed.', 'success');
        }
        
        this.updateFlowchartProgress();
    }

    // Helper method to report progress to command center and database
    async reportProgressToCenter() {
        try {
            if (window.progressTracker) {
                // Use the improved completeChallenge method for proper validation
                await window.progressTracker.completeChallenge('flowchart', {
                    level: this.currentLevel,
                    score: this.score,
                    timeSpent: this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                    attempts: this.attempts,
                    difficulty: this.currentDifficulty,
                    mistakeCount: this.mistakeCount
                });
                
                // Check for level completion badge
                if (window.achievementManager) {
                    await window.achievementManager.checkLevelCompletion(
                        'flowbyte',
                        this.currentLevel,
                        this.score,
                        this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                        { difficulty: this.currentDifficulty, attempts: this.attempts, mistakeCount: this.mistakeCount }
                    );
                }
                
                // Dispatch event to update command center display
                window.dispatchEvent(new CustomEvent('progressUpdated', {
                    detail: {
                        roomName: 'flowchart',
                        progress: this.currentLevel * 20, // Each level = 20%
                        score: this.score,
                        level: this.currentLevel
                    }
                }));
                
                console.log(`📊 Level ${this.currentLevel}/5 progress reported for FlowByte`);
            }
        } catch (error) {
            console.warn('Could not report progress to progress tracker:', error);
        }
    }

    // Helper method to report room completion with detailed stats
    async reportRoomCompletion() {
        try {
            if (window.progressTracker) {
                await window.progressTracker.markRoomComplete('flowchart', this.score);
                
                // Check for room completion badge
                if (window.achievementManager) {
                    const totalTime = Math.floor((Date.now() - this.roomStartTime) / 1000);
                    await window.achievementManager.checkRoomCompletion(
                        'flowbyte',
                        this.score,
                        totalTime,
                        5, // All 5 levels completed
                        { difficulty: this.currentDifficulty, mistakeCount: this.mistakeCount, totalAttempts: this.attempts }
                    );
                    
                    // Check for cross-room achievements
                    await window.achievementManager.checkAllRoomsCompletion();
                }
                
                // Dispatch room completion event
                window.dispatchEvent(new CustomEvent('roomCompleted', {
                    detail: {
                        roomName: 'flowchart',
                        completionStats: {
                            timeSpent: Math.floor((Date.now() - this.roomStartTime) / 1000),
                            totalMistakes: this.mistakeCount,
                            finalScore: this.score,
                            difficulty: this.currentDifficulty,
                            totalLevels: 5
                        }
                    }
                }));
                
                console.log('🏆 FlowByte room completion reported successfully');
            }
        } catch (error) {
            console.warn('Could not report room completion:', error);
        }
    }
}

// Export the class for use by command center
window.FlowByteGame = FlowByteGame;

// Don't auto-initialize when loaded independently
console.log('FlowByteGame class loaded and ready');