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
        
        this.difficulties = {
            easy: {
                name: 'Easy',
                description: 'Basic flowchart construction with guided instructions',
                levels: [
                    { 
                        name: 'Simple Start-End Flow', 
                        objective: 'Create a basic start-to-end flowchart',
                        scenario: "Sarah is opening her first coffee shop and needs a simple process flowchart for her opening day routine. Help her create a basic flow that shows how she starts and ends her day."
                    },
                    { 
                        name: 'Decision Making', 
                        objective: 'Add decision nodes to your flowchart',
                        scenario: "Sarah needs to add decision points to her coffee shop process. Help her create a flowchart that includes decisions like checking inventory and customer preferences."
                    },
                    { 
                        name: 'Input-Output Flow', 
                        objective: 'Create flowchart with input/output operations',
                        scenario: "Sarah wants to track customer orders and receipts. Create a flowchart that shows input/output operations for her coffee shop system."
                    },
                    { 
                        name: 'Process Chain', 
                        objective: 'Build a multi-step process flowchart',
                        scenario: "Sarah's coffee shop now has multiple processes running together. Help her create a comprehensive workflow that connects all operations."
                    },
                    { 
                        name: 'Complete Workflow', 
                        objective: 'Combine all elements into complex flowchart',
                        scenario: "Sarah wants a master flowchart that includes all aspects of her coffee shop operations. Create a complete workflow that demonstrates advanced flowchart design."
                    }
                ]
            },
            hard: {
                name: 'Hard',
                description: 'Advanced flowchart design with complex logic patterns',
                levels: [
                    { 
                        name: 'Nested Decisions', 
                        objective: 'Create flowchart with multiple decision branches',
                        scenario: "Sarah's coffee shop now has complex decision trees for different customer types, payment methods, and seasonal menus. Design a flowchart with nested decision logic."
                    },
                    { 
                        name: 'Loop Structures', 
                        objective: 'Design flowcharts with iterative processes',
                        scenario: "Sarah needs to implement quality control loops and inventory checking cycles. Create a flowchart that demonstrates iterative processes and loop structures."
                    },
                    { 
                        name: 'Error Handling', 
                        objective: 'Build flowcharts with exception handling',
                        scenario: "Sarah wants to handle various error scenarios like payment failures, out-of-stock items, and equipment malfunctions. Design a robust flowchart with error handling."
                    },
                    { 
                        name: 'Parallel Processing', 
                        objective: 'Design concurrent workflow patterns',
                        scenario: "Sarah's coffee shop now has multiple staff members working simultaneously on different tasks. Create a flowchart that shows parallel processing workflows."
                    },
                    { 
                        name: 'System Architecture', 
                        objective: 'Create comprehensive system flowchart',
                        scenario: "Sarah is expanding to multiple locations and needs a master system architecture flowchart that governs all operations across her coffee shop chain."
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
            marker.setAttribute('markerWidth', '12');
            marker.setAttribute('markerHeight', '12');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '4');
            marker.setAttribute('orient', 'auto');
            marker.setAttribute('markerUnits', 'strokeWidth');

            const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrowPath.setAttribute('d', 'M0,0 L0,8 L10,4 z');
            arrowPath.setAttribute('fill', '#4CAF50');
            arrowPath.setAttribute('stroke', '#4CAF50');
            arrowPath.setAttribute('stroke-width', '1');

            marker.appendChild(arrowPath);
            defs.appendChild(marker);
        }

        // Calculate connection points on the edge of shapes with better offset
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        
        // Calculate shape radii with padding
        const sourceRadius = Math.min(sourceRect.width, sourceRect.height) / 2;
        const targetRadius = Math.min(targetRect.width, targetRect.height) / 2;
        
        // Increase offset to ensure arrowhead is clearly visible outside the shape
        const arrowheadOffset = 15; // Increased offset for better visibility
        const sourceOffset = sourceRadius + 2; // Small offset from source edge
        
        const adjustedSourceX = sourceX + Math.cos(angle) * sourceOffset;
        const adjustedSourceY = sourceY + Math.sin(angle) * sourceOffset;
        const adjustedTargetX = targetX - Math.cos(angle) * (targetRadius + arrowheadOffset);
        const adjustedTargetY = targetY - Math.sin(angle) * (targetRadius + arrowheadOffset);

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
            this.updateMistakeCount();
            return;
        }
        
        // Check if all 7 steps are completed
        if (this.currentStep < 7) {
            this.showFeedback('Complete all flowchart creation steps before finishing the level.', 'warning');
            return;
        }
        
        this.showFeedback('Outstanding! You\'ve created a proper flowchart following professional standards!', 'success');
        
        // Calculate progress
        const progress = Math.round((this.currentLevel / 5) * 100);
        const progressElement = this.container.querySelector('#learning-progress');
        if (progressElement) {
            progressElement.textContent = `${progress}%`;
        }
        
        // Automatically reset canvas for next level
        this.resetCanvasForNextLevel();
        
        if (this.currentLevel < 5) {
            setTimeout(() => {
                this.startLevel(this.currentLevel + 1);
            }, 2000);
        } else {
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
                Select the most appropriate text for this ${node.type} shape in the context of the scenario.
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
        const coffeeShopOptions = {
            easy: {
                1: { // Simple Start-End Flow
                    oval: [
                        { value: 'START', label: 'START - Begin the process' },
                        { value: 'END', label: 'END - Finish the process' },
                        { value: 'OPEN SHOP', label: 'OPEN SHOP - Start of day' },
                        { value: 'CLOSE SHOP', label: 'CLOSE SHOP - End of day' }
                    ],
                    rectangle: [
                        { value: 'UNLOCK DOOR', label: 'UNLOCK DOOR - Open the shop' },
                        { value: 'TURN ON LIGHTS', label: 'TURN ON LIGHTS - Illuminate space' },
                        { value: 'START COFFEE MACHINE', label: 'START COFFEE MACHINE - Prepare equipment' },
                        { value: 'CLEAN COUNTER', label: 'CLEAN COUNTER - Prepare workspace' },
                        { value: 'COUNT REGISTER', label: 'COUNT REGISTER - Check cash' }
                    ],
                    diamond: [
                        { value: 'READY TO OPEN?', label: 'READY TO OPEN? - Check if prepared' },
                        { value: 'ALL CLEAN?', label: 'ALL CLEAN? - Verify cleanliness' }
                    ],
                    parallelogram: [
                        { value: 'CHECK SCHEDULE', label: 'CHECK SCHEDULE - Review daily tasks' },
                        { value: 'RECORD OPENING TIME', label: 'RECORD OPENING TIME - Log start time' }
                    ]
                },
                2: { // Decision Making
                    oval: [
                        { value: 'START', label: 'START - Begin the process' },
                        { value: 'END', label: 'END - Finish the process' },
                        { value: 'SERVE CUSTOMER', label: 'SERVE CUSTOMER - Begin service' }
                    ],
                    rectangle: [
                        { value: 'GREET CUSTOMER', label: 'GREET CUSTOMER - Welcome them' },
                        { value: 'TAKE ORDER', label: 'TAKE ORDER - Record request' },
                        { value: 'PREPARE COFFEE', label: 'PREPARE COFFEE - Make beverage' },
                        { value: 'CHECK INVENTORY', label: 'CHECK INVENTORY - Verify stock' },
                        { value: 'RESTOCK ITEMS', label: 'RESTOCK ITEMS - Replenish supplies' }
                    ],
                    diamond: [
                        { value: 'INVENTORY LOW?', label: 'INVENTORY LOW? - Check stock levels' },
                        { value: 'CUSTOMER SATISFIED?', label: 'CUSTOMER SATISFIED? - Verify happiness' },
                        { value: 'SPECIAL REQUEST?', label: 'SPECIAL REQUEST? - Custom order?' },
                        { value: 'PAYMENT READY?', label: 'PAYMENT READY? - Ready to pay?' }
                    ],
                    parallelogram: [
                        { value: 'GET CUSTOMER PREFERENCE', label: 'GET CUSTOMER PREFERENCE - Ask for details' },
                        { value: 'DISPLAY MENU', label: 'DISPLAY MENU - Show options' }
                    ]
                },
                3: { // Input-Output Flow
                    oval: [
                        { value: 'START ORDER', label: 'START ORDER - Begin order process' },
                        { value: 'COMPLETE ORDER', label: 'COMPLETE ORDER - Finish transaction' }
                    ],
                    rectangle: [
                        { value: 'PROCESS PAYMENT', label: 'PROCESS PAYMENT - Handle transaction' },
                        { value: 'PREPARE BEVERAGE', label: 'PREPARE BEVERAGE - Make drink' },
                        { value: 'PACKAGE ORDER', label: 'PACKAGE ORDER - Prepare for pickup' }
                    ],
                    diamond: [
                        { value: 'PAYMENT VALID?', label: 'PAYMENT VALID? - Check payment' },
                        { value: 'ORDER CORRECT?', label: 'ORDER CORRECT? - Verify accuracy' }
                    ],
                    parallelogram: [
                        { value: 'GET CUSTOMER ORDER', label: 'GET CUSTOMER ORDER - Input: Customer request' },
                        { value: 'PRINT RECEIPT', label: 'PRINT RECEIPT - Output: Transaction proof' },
                        { value: 'DISPLAY TOTAL', label: 'DISPLAY TOTAL - Output: Amount due' },
                        { value: 'SCAN LOYALTY CARD', label: 'SCAN LOYALTY CARD - Input: Customer data' }
                    ]
                },
                4: { // Process Chain
                    oval: [
                        { value: 'START', label: 'START - Begin the process' },
                        { value: 'END', label: 'END - Finish the process' }
                    ],
                    rectangle: [
                        { value: 'SETUP STATION', label: 'SETUP STATION - Prepare work area' },
                        { value: 'TAKE ORDER', label: 'TAKE ORDER - Record request' },
                        { value: 'PREPARE DRINK', label: 'PREPARE DRINK - Make beverage' },
                        { value: 'SERVE CUSTOMER', label: 'SERVE CUSTOMER - Deliver order' },
                        { value: 'CLEAN STATION', label: 'CLEAN STATION - Tidy workspace' }
                    ],
                    diamond: [
                        { value: 'ORDER READY?', label: 'ORDER READY? - Check completion' },
                        { value: 'CUSTOMER WAITING?', label: 'CUSTOMER WAITING? - Check queue' }
                    ],
                    parallelogram: [
                        { value: 'READ ORDER TICKET', label: 'READ ORDER TICKET - Input: Order details' },
                        { value: 'CALL ORDER NUMBER', label: 'CALL ORDER NUMBER - Output: Customer notification' }
                    ]
                },
                5: { // Complete Workflow
                    oval: [
                        { value: 'START', label: 'START - Begin the process' },
                        { value: 'END', label: 'END - Finish the process' }
                    ],
                    rectangle: [
                        { value: 'OPEN SHOP', label: 'OPEN SHOP - Start business day' },
                        { value: 'SERVE CUSTOMERS', label: 'SERVE CUSTOMERS - Handle orders' },
                        { value: 'MANAGE INVENTORY', label: 'MANAGE INVENTORY - Track supplies' },
                        { value: 'PROCESS PAYMENTS', label: 'PROCESS PAYMENTS - Handle transactions' },
                        { value: 'CLOSE SHOP', label: 'CLOSE SHOP - End business day' }
                    ],
                    diamond: [
                        { value: 'CUSTOMERS WAITING?', label: 'CUSTOMERS WAITING? - Check queue' },
                        { value: 'INVENTORY LOW?', label: 'INVENTORY LOW? - Check stock' },
                        { value: 'PAYMENT VALID?', label: 'PAYMENT VALID? - Verify transaction' }
                    ],
                    parallelogram: [
                        { value: 'GET ORDER', label: 'GET ORDER - Input: Customer request' },
                        { value: 'PRINT RECEIPT', label: 'PRINT RECEIPT - Output: Transaction record' },
                        { value: 'UPDATE INVENTORY', label: 'UPDATE INVENTORY - Output: Stock levels' }
                    ]
                }
            },
            hard: {
                1: { // Nested Decisions
                    oval: [
                        { value: 'START SERVICE', label: 'START SERVICE - Begin customer service' },
                        { value: 'END SERVICE', label: 'END SERVICE - Complete interaction' }
                    ],
                    rectangle: [
                        { value: 'IDENTIFY CUSTOMER TYPE', label: 'IDENTIFY CUSTOMER TYPE - Categorize visitor' },
                        { value: 'APPLY DISCOUNT', label: 'APPLY DISCOUNT - Reduce price' },
                        { value: 'PROCESS PAYMENT', label: 'PROCESS PAYMENT - Handle transaction' },
                        { value: 'UPDATE SEASONAL MENU', label: 'UPDATE SEASONAL MENU - Change offerings' }
                    ],
                    diamond: [
                        { value: 'REGULAR CUSTOMER?', label: 'REGULAR CUSTOMER? - Known visitor?' },
                        { value: 'LOYALTY MEMBER?', label: 'LOYALTY MEMBER? - Has membership?' },
                        { value: 'CASH OR CARD?', label: 'CASH OR CARD? - Payment method?' },
                        { value: 'SEASONAL ITEM?', label: 'SEASONAL ITEM? - Special menu item?' },
                        { value: 'STUDENT DISCOUNT?', label: 'STUDENT DISCOUNT? - Eligible for reduction?' }
                    ],
                    parallelogram: [
                        { value: 'CHECK CUSTOMER DATABASE', label: 'CHECK CUSTOMER DATABASE - Lookup info' },
                        { value: 'DISPLAY PAYMENT OPTIONS', label: 'DISPLAY PAYMENT OPTIONS - Show methods' }
                    ]
                },
                2: { // Loop Structures
                    oval: [
                        { value: 'START QUALITY CHECK', label: 'START QUALITY CHECK - Begin inspection' },
                        { value: 'END QUALITY CHECK', label: 'END QUALITY CHECK - Complete inspection' }
                    ],
                    rectangle: [
                        { value: 'INSPECT PRODUCT', label: 'INSPECT PRODUCT - Check quality' },
                        { value: 'RECORD RESULTS', label: 'RECORD RESULTS - Log findings' },
                        { value: 'FIX ISSUES', label: 'FIX ISSUES - Correct problems' },
                        { value: 'RESTOCK INVENTORY', label: 'RESTOCK INVENTORY - Replenish supplies' }
                    ],
                    diamond: [
                        { value: 'QUALITY OK?', label: 'QUALITY OK? - Meets standards?' },
                        { value: 'MORE ITEMS?', label: 'MORE ITEMS? - Continue checking?' },
                        { value: 'INVENTORY LOW?', label: 'INVENTORY LOW? - Need restocking?' }
                    ],
                    parallelogram: [
                        { value: 'GET NEXT ITEM', label: 'GET NEXT ITEM - Input: Next product' },
                        { value: 'UPDATE INVENTORY LOG', label: 'UPDATE INVENTORY LOG - Output: Stock record' }
                    ]
                }
            }
        };
        
        // Get options for current difficulty and level, fallback to basic options
        const difficultyOptions = coffeeShopOptions[difficulty] || coffeeShopOptions.easy;
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
}

// Export the class for use by command center
window.FlowByteGame = FlowByteGame;

// Don't auto-initialize when loaded independently
console.log('FlowByteGame class loaded and ready');