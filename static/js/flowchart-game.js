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
                this.gameContainer.innerHTML = '<svg id="connection-svg" class="connection-svg"></svg>';
            }
        }
        
        this.showScreen('game-screen');
        console.log('Game interface initialized successfully');
    }

    setupCanvasEventListeners() {
        if (!this.gameContainer) return;
        
        this.gameContainer.addEventListener('click', (e) => {
            if (e.target === this.gameContainer) {
                this.handleCanvasClick(e);
            }
        });
    }

    selectTool(tool) {
        this.currentTool = tool;
        console.log('Tool selected:', tool);
        
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

    addNode(type) {
        if (!this.gameContainer) {
            this.showFeedback('Canvas not ready. Please wait.', 'error');
            return;
        }
        
        const canvas = this.gameContainer;
        const rect = canvas.getBoundingClientRect();
        const x = Math.random() * (rect.width - 120) + 60;
        const y = Math.random() * (rect.height - 60) + 30;
        
        this.createNode(type, x, y);
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

        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleNodeClick(node, e);
        });

        nodeElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.editNodeText(node);
        });

        this.gameContainer.appendChild(nodeElement);
        this.nodes.push(node);
        this.showFeedback('Node added successfully!');
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
        if (!this.connectionSource) {
            this.connectionSource = node;
            document.getElementById(node.id).classList.add('highlight-source');
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
        this.showFeedback('Connection created!');
    }

    drawConnection(sourceNode, targetNode, connectionId) {
        const svg = document.getElementById('connection-svg');
        const sourceRect = document.getElementById(sourceNode.id).getBoundingClientRect();
        const targetRect = document.getElementById(targetNode.id).getBoundingClientRect();
        const canvasRect = this.gameContainer.getBoundingClientRect();

        const sourceX = sourceRect.left - canvasRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top - canvasRect.top + sourceRect.height / 2;
        const targetX = targetRect.left - canvasRect.left + targetRect.width / 2;
        const targetY = targetRect.top - canvasRect.top + targetRect.height / 2;

        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceX);
        line.setAttribute('y1', sourceY);
        line.setAttribute('x2', targetX);
        line.setAttribute('y2', targetY);
        line.setAttribute('class', 'connection-line');
        line.setAttribute('id', `line-${connectionId}`);
        
        // Create invisible clickable area
        const invisibleLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        invisibleLine.setAttribute('x1', sourceX);
        invisibleLine.setAttribute('y1', sourceY);
        invisibleLine.setAttribute('x2', targetX);
        invisibleLine.setAttribute('y2', targetY);
        invisibleLine.setAttribute('class', 'connection-invisible');
        invisibleLine.setAttribute('id', `invisible-${connectionId}`);
        
        invisibleLine.addEventListener('click', () => {
            if (this.currentTool === 'delete') {
                this.deleteConnection(connectionId);
            }
        });

        // Create arrowhead
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        const arrowX1 = targetX - arrowLength * Math.cos(angle - arrowAngle);
        const arrowY1 = targetY - arrowLength * Math.sin(angle - arrowAngle);
        const arrowX2 = targetX - arrowLength * Math.cos(angle + arrowAngle);
        const arrowY2 = targetY - arrowLength * Math.sin(angle + arrowAngle);
        
        const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrowhead.setAttribute('points', `${targetX},${targetY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`);
        arrowhead.setAttribute('fill', '#4CAF50');
        arrowhead.setAttribute('id', `arrow-${connectionId}`);

        svg.appendChild(line);
        svg.appendChild(invisibleLine);
        svg.appendChild(arrowhead);
    }

    connectionExists(sourceId, targetId) {
        return this.connections.some(conn => 
            (conn.source === sourceId && conn.target === targetId) ||
            (conn.source === targetId && conn.target === sourceId)
        );
    }

    clearConnectionSource() {
        if (this.connectionSource) {
            document.getElementById(this.connectionSource.id).classList.remove('highlight-source');
            this.connectionSource = null;
        }
    }

    deleteNode(node) {
        if (confirm(`Delete ${node.type} node "${node.text}"?`)) {
            this.removeNodeConnections(node.id);
            document.getElementById(node.id).remove();
            this.nodes = this.nodes.filter(n => n.id !== node.id);
            
            if (this.selectedNode && this.selectedNode.id === node.id) {
                this.selectedNode = null;
            }
            
            this.showFeedback('Node deleted!');
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
        const arrow = document.getElementById(`arrow-${connectionId}`);
        
        if (line) line.remove();
        if (invisible) invisible.remove();
        if (arrow) arrow.remove();
    }

    editNodeText(node) {
        const newText = prompt('Enter new text for node:', node.text);
        if (newText !== null && newText.trim() !== '') {
            node.text = newText.toUpperCase();
            document.getElementById(node.id).textContent = node.text;
            this.showFeedback('Node text updated!');
        }
    }

    resetCanvas() {
        if (confirm('Reset canvas? This will delete all nodes and connections.')) {
            this.nodes = [];
            this.connections = [];
            this.selectedNode = null;
            this.connectionSource = null;
            this.nodeCounter = 0;
            
            this.gameContainer.innerHTML = '<svg id="connection-svg" class="connection-svg"></svg>';
            this.showFeedback('Canvas reset!');
        }
    }

    completeLevel() {
        if (this.nodes.length < 2) {
            this.showFeedback('Add at least 2 nodes to complete the level!', 'error');
            this.mistakeCount++;
            this.updateMistakeCount();
            return;
        }
        
        this.showFeedback('Level completed successfully!');
        
        // Calculate progress
        const progress = Math.round((this.currentLevel / 5) * 100);
        const progressElement = this.container.querySelector('#learning-progress');
        if (progressElement) {
            progressElement.textContent = `${progress}%`;
        }
        
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

    abortMission() {
        if (confirm('Are you sure you want to abort this mission? Your progress will be lost.')) {
            // Check if we're in command center mode
            if (window.commandCenter) {
                window.commandCenter.showCommandDashboard();
            } else {
                // Fallback navigation
                this.showRoomSelection();
            }
        }
    }

    getHint() {
        const hints = [
            "Start with a START node (oval shape) and end with an END node.",
            "Connect nodes using the arrow tool - click source, then target.",
            "Use process nodes (rectangles) for actions and operations.",
            "Decision nodes (diamonds) should have two or more paths leading out.",
            "Input/Output nodes (parallelograms) represent data flow."
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        this.showFeedback(`Hint: ${randomHint}`);
    }

    updateMistakeCount() {
        const mistakeElement = this.container.querySelector('#mistake-count');
        if (mistakeElement) {
            mistakeElement.textContent = this.mistakeCount;
        }
    }

    showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${type === 'error' ? 'error' : ''}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }

    handleCanvasClick(event) {
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

// Export the class for use by command center
window.FlowByteGame = FlowByteGame;

// Don't auto-initialize when loaded independently
console.log('FlowByteGame class loaded and ready');
