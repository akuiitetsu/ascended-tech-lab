class FlowByteGame {
    constructor() {
        this.currentDifficulty = null;
        this.currentLevel = null;
        this.currentTool = 'arrow';
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
        this.score = 0;
        this.attempts = 0;
        
        this.difficulties = {
            easy: {
                name: 'Easy',
                description: 'Basic flowchart construction with guided instructions',
                levels: [
                    { 
                        name: 'Simple Start-End Flow', 
                        objective: 'Create a basic start-to-end flowchart',
                        scenario: "You're designing a software deployment pipeline for TechCorp. Create a flowchart that outlines the basic steps from code commit to production deployment, showing a clear start and end to the process."
                    },
                    { 
                        name: 'Decision Making', 
                        objective: 'Add decision nodes to your flowchart',
                        scenario: "The IT security team needs a flowchart for incident response procedures. Design a decision-based flowchart that shows how to classify security threats and determine appropriate response actions based on severity levels."
                    },
                    { 
                        name: 'Input-Output Flow', 
                        objective: 'Create flowchart with input/output operations',
                        scenario: "Design a database backup and recovery workflow for the data center. Create a flowchart showing input validation, backup processes, and recovery procedures with proper data handling operations."
                    },
                    { 
                        name: 'Process Chain', 
                        objective: 'Build a multi-step process flowchart',
                        scenario: "The DevOps team needs a comprehensive CI/CD pipeline flowchart. Design a multi-step process that connects development, testing, staging, and production deployment with automated quality checks."
                    },
                    { 
                        name: 'Complete Workflow', 
                        objective: 'Combine all elements into complex flowchart',
                        scenario: "Create a complete IT asset management workflow that includes device procurement, deployment, monitoring, maintenance, and decommissioning processes for enterprise infrastructure."
                    }
                ]
            },
            hard: {
                name: 'Hard',
                description: 'Advanced flowchart design with complex IT architecture patterns',
                levels: [
                    { 
                        name: 'Nested Decisions', 
                        objective: 'Create flowchart with multiple decision branches',
                        scenario: "Design a complex network troubleshooting flowchart with nested decision trees for different protocol issues, hardware failures, and security incidents requiring multi-level diagnostic procedures."
                    },
                    { 
                        name: 'Loop Structures', 
                        objective: 'Design flowcharts with iterative processes',
                        scenario: "Create a system monitoring flowchart that implements continuous health checks, automated scaling decisions, and performance optimization loops for cloud infrastructure management."
                    },
                    { 
                        name: 'Error Handling', 
                        objective: 'Build flowcharts with exception handling',
                        scenario: "Design a comprehensive disaster recovery flowchart for data center operations that handles various failure scenarios including power outages, hardware failures, network disruptions, and security breaches with proper fallback procedures."
                    },
                    { 
                        name: 'Parallel Processing', 
                        objective: 'Design concurrent workflow patterns',
                        scenario: "Create a microservices architecture flowchart showing parallel processing workflows for a distributed system with multiple services running simultaneously, including load balancing and inter-service communication."
                    },
                    { 
                        name: 'System Architecture', 
                        objective: 'Create comprehensive system flowchart',
                        scenario: "Design a complete enterprise IT architecture flowchart that governs data flow, security protocols, user access management, and system integrations across multiple business units and geographic locations."
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
                
                // Only start drag if using arrow tool (default interaction)
                if (this.currentTool === 'arrow') {
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
        this.gameContainer.style.cursor = 'grabbing';
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
        nodeElement.style.zIndex = '';
        nodeElement.classList.remove('dragging');
        this.gameContainer.style.cursor = this.currentTool === 'delete' ? 'not-allowed' : 
                                         this.currentTool === 'arrow' ? 'crosshair' : 'default';
        
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
                                         this.currentTool === 'arrow' ? 'crosshair' : 'default';
        
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

        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleNodeClick(node, e);
        });

        nodeElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.editNodeText(node);
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
                element.style.transform = 'rotate(45deg)';
                element.style.backgroundColor = '#fca311';
                element.style.width = '60px';
                element.style.height = '60px';
                break;
            case 'parallelogram':
                element.style.background = 'linear-gradient(to right, transparent 10px, #9d4edd 10px)';
                element.style.transform = 'skew(-20deg)';
                element.style.backgroundColor = '#9d4edd';
                break;
        }

        // Add hover effects
        element.addEventListener('mouseenter', () => {
            if (!element.classList.contains('dragging')) {
                element.style.transform += ' scale(1.05)';
                element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }
        });

        element.addEventListener('mouseleave', () => {
            if (!element.classList.contains('dragging')) {
                const baseTransform = type === 'diamond' ? 'rotate(45deg)' : 
                                   type === 'parallelogram' ? 'skew(-20deg)' : '';
                element.style.transform = baseTransform;
                element.style.boxShadow = '';
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
        
        if (tool === 'arrow') {
            const arrowBtn = container.querySelector('#arrow-tool-btn');
            if (arrowBtn) arrowBtn.classList.add('active');
        } else if (tool === 'delete') {
            const deleteBtn = container.querySelector('#delete-tool-btn');
            if (deleteBtn) deleteBtn.classList.add('active');
        }
        
        if (this.gameContainer) {
            this.gameContainer.style.cursor = tool === 'delete' ? 'not-allowed' : 
                                             tool === 'arrow' ? 'crosshair' : 'default';
        }
        
        if (tool !== 'arrow') {
            this.clearConnectionSource();
        }
    }

    getDefaultText(type) {
        const defaults = {
            oval: 'START',
            rectangle: 'PROCESS',
            diamond: 'DECISION?',
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
        // Show tutorial again when hint is requested
        if (this.currentStep <= 3) {
            this.showLevelTutorial();
            return;
        }
        
        const stepHints = {
            4: "Use the arrow tool (bottom right) to connect your shapes. Click on a source shape, then click on the target shape.",
            5: "Double-click on any shape to edit its text. Use clear, action-oriented descriptions like 'Open Shop', 'Check Inventory'.",
            6: "Make sure your flowchart flows logically from START to END. All shapes should be connected in the right order.",
            7: "Review checklist: ✓ START oval ✓ Process rectangles ✓ Decisions (if needed) ✓ END oval ✓ All connected with arrows"
        };
        
        const hint = stepHints[this.currentStep] || "Your flowchart looks good! Make sure it follows the tutorial steps and represents the complete process.";
        this.showFeedback(`💡 Hint: ${hint}`, 'info');
    }

    editNodeText(node) {
        // Step 5 validation
        if (this.currentStep < 5 && this.nodes.length > 0) {
            this.showFeedback('Great! Now you can add text to make your flowchart clear.', 'success');
            this.currentStep = Math.max(this.currentStep, 5);
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
                <option value="custom">✏️ Custom Text (Type your own)</option>
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
        
        // Handle custom text option
        selectElement.addEventListener('change', () => {
            if (selectElement.value === 'custom') {
                const customText = prompt('Enter custom text for this shape:', node.text);
                if (customText && customText.trim()) {
                    selectElement.innerHTML += `<option value="${customText.trim()}" selected>Custom: ${customText.trim()}</option>`;
                    selectElement.value = customText.trim();
                } else {
                    selectElement.value = '';
                }
            }
        });
        
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
        const itIndustryOptions = {
            easy: {
                1: { // Software Deployment Pipeline - Simple Start-End Flow
                    oval: [
                        { value: 'START', label: 'START - Begin deployment process' },
                        { value: 'END', label: 'END - Deployment complete' },
                        { value: 'CODE COMMIT', label: 'CODE COMMIT - Developer submits code' },
                        { value: 'PRODUCTION READY', label: 'PRODUCTION READY - System deployed' }
                    ],
                    rectangle: [
                        { value: 'CODE REVIEW', label: 'CODE REVIEW - Examine submitted code' },
                        { value: 'BUILD APPLICATION', label: 'BUILD APPLICATION - Compile source code' },
                        { value: 'RUN TESTS', label: 'RUN TESTS - Execute test suite' },
                        { value: 'DEPLOY TO STAGING', label: 'DEPLOY TO STAGING - Test environment' },
                        { value: 'DEPLOY TO PRODUCTION', label: 'DEPLOY TO PRODUCTION - Live environment' }
                    ],
                    diamond: [
                        { value: 'TESTS PASSED?', label: 'TESTS PASSED? - Verify code quality' },
                        { value: 'BUILD SUCCESSFUL?', label: 'BUILD SUCCESSFUL? - Check compilation' }
                    ],
                    parallelogram: [
                        { value: 'GET CODE CHANGES', label: 'GET CODE CHANGES - Input: Developer commits' },
                        { value: 'LOG DEPLOYMENT', label: 'LOG DEPLOYMENT - Output: Deployment record' }
                    ]
                },
                2: { // IT Security Incident Response - Decision Making
                    oval: [
                        { value: 'START', label: 'START - Begin incident response' },
                        { value: 'END', label: 'END - Incident resolved' },
                        { value: 'INCIDENT DETECTED', label: 'INCIDENT DETECTED - Security alert triggered' }
                    ],
                    rectangle: [
                        { value: 'ANALYZE THREAT', label: 'ANALYZE THREAT - Examine security event' },
                        { value: 'CLASSIFY SEVERITY', label: 'CLASSIFY SEVERITY - Determine threat level' },
                        { value: 'ISOLATE SYSTEMS', label: 'ISOLATE SYSTEMS - Contain threat' },
                        { value: 'NOTIFY STAKEHOLDERS', label: 'NOTIFY STAKEHOLDERS - Alert management' },
                        { value: 'APPLY PATCHES', label: 'APPLY PATCHES - Fix vulnerabilities' }
                    ],
                    diamond: [
                        { value: 'CRITICAL THREAT?', label: 'CRITICAL THREAT? - High severity incident?' },
                        { value: 'SYSTEMS COMPROMISED?', label: 'SYSTEMS COMPROMISED? - Data breach detected?' },
                        { value: 'EXTERNAL THREAT?', label: 'EXTERNAL THREAT? - Outside attacker?' },
                        { value: 'IMMEDIATE ACTION REQUIRED?', label: 'IMMEDIATE ACTION REQUIRED? - Emergency response?' }
                    ],
                    parallelogram: [
                        { value: 'GET THREAT DETAILS', label: 'GET THREAT DETAILS - Input: Security alert data' },
                        { value: 'GENERATE INCIDENT REPORT', label: 'GENERATE INCIDENT REPORT - Output: Documentation' }
                    ]
                },
                3: { // Database Backup and Recovery - Input-Output Flow
                    oval: [
                        { value: 'START BACKUP', label: 'START BACKUP - Begin backup process' },
                        { value: 'BACKUP COMPLETE', label: 'BACKUP COMPLETE - Process finished' }
                    ],
                    rectangle: [
                        { value: 'VALIDATE DATA', label: 'VALIDATE DATA - Check data integrity' },
                        { value: 'CREATE BACKUP', label: 'CREATE BACKUP - Generate backup file' },
                        { value: 'COMPRESS DATA', label: 'COMPRESS DATA - Reduce file size' },
                        { value: 'TRANSFER TO STORAGE', label: 'TRANSFER TO STORAGE - Move to backup location' }
                    ],
                    diamond: [
                        { value: 'DATA VALID?', label: 'DATA VALID? - Check data integrity' },
                        { value: 'BACKUP SUCCESSFUL?', label: 'BACKUP SUCCESSFUL? - Verify completion' }
                    ],
                    parallelogram: [
                        { value: 'READ DATABASE', label: 'READ DATABASE - Input: Source data' },
                        { value: 'WRITE BACKUP FILE', label: 'WRITE BACKUP FILE - Output: Backup archive' },
                        { value: 'LOG BACKUP STATUS', label: 'LOG BACKUP STATUS - Output: Process log' },
                        { value: 'GET BACKUP SCHEDULE', label: 'GET BACKUP SCHEDULE - Input: Timing parameters' }
                    ]
                },
                4: { // DevOps CI/CD Pipeline - Process Chain
                    oval: [
                        { value: 'START', label: 'START - Begin CI/CD pipeline' },
                        { value: 'END', label: 'END - Pipeline complete' }
                    ],
                    rectangle: [
                        { value: 'SOURCE CONTROL', label: 'SOURCE CONTROL - Retrieve code' },
                        { value: 'BUILD STAGE', label: 'BUILD STAGE - Compile application' },
                        { value: 'TEST STAGE', label: 'TEST STAGE - Run automated tests' },
                        { value: 'STAGING DEPLOYMENT', label: 'STAGING DEPLOYMENT - Deploy to test environment' },
                        { value: 'PRODUCTION DEPLOYMENT', label: 'PRODUCTION DEPLOYMENT - Deploy to live environment' }
                    ],
                    diamond: [
                        { value: 'BUILD PASSED?', label: 'BUILD PASSED? - Compilation successful?' },
                        { value: 'TESTS PASSED?', label: 'TESTS PASSED? - All tests green?' }
                    ],
                    parallelogram: [
                        { value: 'GET BUILD ARTIFACTS', label: 'GET BUILD ARTIFACTS - Input: Compiled code' },
                        { value: 'SEND NOTIFICATIONS', label: 'SEND NOTIFICATIONS - Output: Status updates' }
                    ]
                },
                5: { // IT Asset Management - Complete Workflow
                    oval: [
                        { value: 'START', label: 'START - Begin asset lifecycle' },
                        { value: 'END', label: 'END - Asset decommissioned' }
                    ],
                    rectangle: [
                        { value: 'PROCURE DEVICE', label: 'PROCURE DEVICE - Purchase equipment' },
                        { value: 'DEPLOY DEVICE', label: 'DEPLOY DEVICE - Install and configure' },
                        { value: 'MONITOR PERFORMANCE', label: 'MONITOR PERFORMANCE - Track device health' },
                        { value: 'PERFORM MAINTENANCE', label: 'PERFORM MAINTENANCE - Update and repair' },
                        { value: 'DECOMMISSION DEVICE', label: 'DECOMMISSION DEVICE - Retire equipment' }
                    ],
                    diamond: [
                        { value: 'DEVICE AVAILABLE?', label: 'DEVICE AVAILABLE? - Ready for deployment?' },
                        { value: 'MAINTENANCE NEEDED?', label: 'MAINTENANCE NEEDED? - Requires servicing?' },
                        { value: 'END OF LIFE?', label: 'END OF LIFE? - Time to replace?' }
                    ],
                    parallelogram: [
                        { value: 'GET ASSET REQUEST', label: 'GET ASSET REQUEST - Input: Equipment request' },
                        { value: 'UPDATE ASSET DATABASE', label: 'UPDATE ASSET DATABASE - Output: Inventory record' },
                        { value: 'GENERATE REPORTS', label: 'GENERATE REPORTS - Output: Asset status' }
                    ]
                }
            },
            hard: {
                1: { // Network Troubleshooting - Nested Decisions
                    oval: [
                        { value: 'START DIAGNOSIS', label: 'START DIAGNOSIS - Begin network troubleshooting' },
                        { value: 'ISSUE RESOLVED', label: 'ISSUE RESOLVED - Network restored' }
                    ],
                    rectangle: [
                        { value: 'CHECK PHYSICAL LAYER', label: 'CHECK PHYSICAL LAYER - Inspect cables/hardware' },
                        { value: 'ANALYZE PROTOCOLS', label: 'ANALYZE PROTOCOLS - Examine network traffic' },
                        { value: 'RESET EQUIPMENT', label: 'RESET EQUIPMENT - Restart network devices' },
                        { value: 'UPDATE FIRMWARE', label: 'UPDATE FIRMWARE - Patch network devices' }
                    ],
                    diamond: [
                        { value: 'HARDWARE FAILURE?', label: 'HARDWARE FAILURE? - Physical component issue?' },
                        { value: 'PROTOCOL ERROR?', label: 'PROTOCOL ERROR? - Network protocol problem?' },
                        { value: 'SECURITY INCIDENT?', label: 'SECURITY INCIDENT? - Malicious activity?' },
                        { value: 'CONFIGURATION ISSUE?', label: 'CONFIGURATION ISSUE? - Settings problem?' },
                        { value: 'PERFORMANCE DEGRADED?', label: 'PERFORMANCE DEGRADED? - Slow network?' }
                    ],
                    parallelogram: [
                        { value: 'GET NETWORK LOGS', label: 'GET NETWORK LOGS - Input: System logs' },
                        { value: 'DISPLAY DIAGNOSTIC RESULTS', label: 'DISPLAY DIAGNOSTIC RESULTS - Output: Test results' }
                    ]
                },
                2: { // System Monitoring - Loop Structures
                    oval: [
                        { value: 'START MONITORING', label: 'START MONITORING - Begin system health check' },
                        { value: 'MONITORING COMPLETE', label: 'MONITORING COMPLETE - Health check finished' }
                    ],
                    rectangle: [
                        { value: 'CHECK CPU USAGE', label: 'CHECK CPU USAGE - Monitor processor load' },
                        { value: 'CHECK MEMORY', label: 'CHECK MEMORY - Monitor RAM usage' },
                        { value: 'SCALE RESOURCES', label: 'SCALE RESOURCES - Adjust capacity' },
                        { value: 'OPTIMIZE PERFORMANCE', label: 'OPTIMIZE PERFORMANCE - Tune system' }
                    ],
                    diamond: [
                        { value: 'RESOURCES AVAILABLE?', label: 'RESOURCES AVAILABLE? - Sufficient capacity?' },
                        { value: 'PERFORMANCE OK?', label: 'PERFORMANCE OK? - System running well?' },
                        { value: 'SCALING NEEDED?', label: 'SCALING NEEDED? - Require more resources?' }
                    ],
                    parallelogram: [
                        { value: 'READ SYSTEM METRICS', label: 'READ SYSTEM METRICS - Input: Performance data' },
                        { value: 'SEND ALERTS', label: 'SEND ALERTS - Output: Notifications' }
                    ]
                },
                3: { // Disaster Recovery - Error Handling
                    oval: [
                        { value: 'DISASTER DETECTED', label: 'DISASTER DETECTED - Critical failure identified' },
                        { value: 'RECOVERY COMPLETE', label: 'RECOVERY COMPLETE - Systems restored' }
                    ],
                    rectangle: [
                        { value: 'ASSESS DAMAGE', label: 'ASSESS DAMAGE - Evaluate system status' },
                        { value: 'ACTIVATE BACKUP SITE', label: 'ACTIVATE BACKUP SITE - Switch to DR location' },
                        { value: 'RESTORE FROM BACKUP', label: 'RESTORE FROM BACKUP - Recover data' },
                        { value: 'FAILOVER SYSTEMS', label: 'FAILOVER SYSTEMS - Switch to backup systems' }
                    ],
                    diamond: [
                        { value: 'POWER FAILURE?', label: 'POWER FAILURE? - Electrical outage?' },
                        { value: 'HARDWARE FAILURE?', label: 'HARDWARE FAILURE? - Equipment broken?' },
                        { value: 'NETWORK DISRUPTION?', label: 'NETWORK DISRUPTION? - Connectivity lost?' },
                        { value: 'SECURITY BREACH?', label: 'SECURITY BREACH? - Cyber attack?' }
                    ],
                    parallelogram: [
                        { value: 'GET FAILURE REPORTS', label: 'GET FAILURE REPORTS - Input: Error notifications' },
                        { value: 'LOG RECOVERY ACTIONS', label: 'LOG RECOVERY ACTIONS - Output: Recovery log' }
                    ]
                },
                4: { // Microservices Architecture - Parallel Processing
                    oval: [
                        { value: 'START SERVICES', label: 'START SERVICES - Begin microservices' },
                        { value: 'ALL SERVICES READY', label: 'ALL SERVICES READY - System operational' }
                    ],
                    rectangle: [
                        { value: 'DEPLOY SERVICE A', label: 'DEPLOY SERVICE A - Launch user service' },
                        { value: 'DEPLOY SERVICE B', label: 'DEPLOY SERVICE B - Launch data service' },
                        { value: 'CONFIGURE LOAD BALANCER', label: 'CONFIGURE LOAD BALANCER - Distribute traffic' },
                        { value: 'SYNC SERVICES', label: 'SYNC SERVICES - Coordinate communication' }
                    ],
                    diamond: [
                        { value: 'SERVICE A READY?', label: 'SERVICE A READY? - User service online?' },
                        { value: 'SERVICE B READY?', label: 'SERVICE B READY? - Data service online?' },
                        { value: 'LOAD BALANCED?', label: 'LOAD BALANCED? - Traffic distributed?' },
                        { value: 'SERVICES SYNCED?', label: 'SERVICES SYNCED? - Communication established?' }
                    ],
                    parallelogram: [
                        { value: 'GET SERVICE CONFIG', label: 'GET SERVICE CONFIG - Input: Service parameters' },
                        { value: 'SEND STATUS UPDATES', label: 'SEND STATUS UPDATES - Output: Service health' }
                    ]
                },
                5: { // Enterprise IT Architecture - System Architecture
                    oval: [
                        { value: 'START SYSTEM', label: 'START SYSTEM - Initialize enterprise architecture' },
                        { value: 'SYSTEM OPERATIONAL', label: 'SYSTEM OPERATIONAL - Full enterprise ready' }
                    ],
                    rectangle: [
                        { value: 'CONFIGURE SECURITY', label: 'CONFIGURE SECURITY - Set up access controls' },
                        { value: 'SETUP DATA FLOW', label: 'SETUP DATA FLOW - Configure data pipelines' },
                        { value: 'INTEGRATE SYSTEMS', label: 'INTEGRATE SYSTEMS - Connect business units' },
                        { value: 'DEPLOY GLOBALLY', label: 'DEPLOY GLOBALLY - Distribute across locations' }
                    ],
                    diamond: [
                        { value: 'SECURITY CONFIGURED?', label: 'SECURITY CONFIGURED? - Access controls ready?' },
                        { value: 'DATA FLOWING?', label: 'DATA FLOWING? - Information moving correctly?' },
                        { value: 'SYSTEMS INTEGRATED?', label: 'SYSTEMS INTEGRATED? - All units connected?' },
                        { value: 'GLOBAL DEPLOYMENT OK?', label: 'GLOBAL DEPLOYMENT OK? - All locations ready?' }
                    ],
                    parallelogram: [
                        { value: 'GET BUSINESS REQUIREMENTS', label: 'GET BUSINESS REQUIREMENTS - Input: Business needs' },
                        { value: 'GENERATE ARCHITECTURE REPORTS', label: 'GENERATE ARCHITECTURE REPORTS - Output: System status' },
                        { value: 'UPDATE COMPLIANCE LOGS', label: 'UPDATE COMPLIANCE LOGS - Output: Audit trail' }
                    ]
                }
            }
        };
        
        // Get options for current difficulty and level, fallback to basic options
        const difficultyOptions = itIndustryOptions[difficulty] || itIndustryOptions.easy;
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
        this.showFeedback('Text updated! Your flowchart is becoming more detailed.', 'success');
        this.updateFlowchartProgress();
    }

    // Helper method to report progress to command center and database
    async reportProgressToCenter() {
        try {
            if (window.progressTracker) {
                const levelProgress = Math.round((this.currentLevel / 5) * 100);
                
                await window.progressTracker.updateProgress('flowchart', levelProgress, {
                    currentLevel: this.currentLevel,
                    score: this.score,
                    attempts: this.attempts,
                    timeSpent: this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                    difficulty: this.currentDifficulty,
                    mistakeCount: this.mistakeCount
                });
                
                // Dispatch event to update command center display
                window.dispatchEvent(new CustomEvent('progressUpdated', {
                    detail: {
                        roomName: 'flowchart',
                        progress: levelProgress,
                        score: this.score,
                        level: this.currentLevel
                    }
                }));
            }
        } catch (error) {
            console.warn('Could not report progress to progress tracker:', error);
        }
    }

    // Helper method to report room completion with detailed stats
    async reportRoomCompletion() {
        try {
            if (window.progressTracker) {
                await window.progressTracker.reportRoomCompletion('flowchart', {
                    timeSpent: Math.floor((Date.now() - this.roomStartTime) / 1000),
                    totalMistakes: this.mistakeCount,
                    totalLevels: 5,
                    finalScore: this.score,
                    difficulty: this.currentDifficulty
                });
                
                // Dispatch room completion event
                window.dispatchEvent(new CustomEvent('roomCompleted', {
                    detail: {
                        roomName: 'flowchart',
                        completionStats: {
                            timeSpent: Math.floor((Date.now() - this.roomStartTime) / 1000),
                            totalMistakes: this.mistakeCount,
                            finalScore: this.score
                        }
                    }
                }));
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