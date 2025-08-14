class CommandCenter {
    constructor() {
        this.gameDisplay = document.getElementById('gameDisplay');
        this.currentRoom = null;
        this.roomStates = {}; // Store room states for persistence
        this.roomInstances = {}; // Store active room instances
        this.roomProgress = {
            'flowchart': { completion: 85, status: 'In Progress', lastPlayed: true },
            'networking': { completion: 45, status: 'In Progress', lastPlayed: false },
            'ai-training': { completion: 35, status: 'In Progress', lastPlayed: false },
            'database': { completion: 25, status: 'In Progress', lastPlayed: false },
            'programming': { completion: 15, status: 'In Progress', lastPlayed: false }
        };
        
        this.initializeModuleButtons();
        this.loadUserInfo();
        this.initializeRoomContainers();
        this.showCommandDashboard();
    }

    initializeModuleButtons() {
        const moduleButtons = document.querySelectorAll('.module-nav-btn');
        moduleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const roomType = button.classList[1];
                this.navigateToRoom(roomType);
            });
        });
    }

    initializeRoomContainers() {
        // Create hidden containers for each room to maintain state
        this.roomContainers = {};
        const roomTypes = ['flowchart', 'networking', 'ai-training', 'database', 'programming'];
        
        roomTypes.forEach(roomType => {
            const container = document.createElement('div');
            container.id = `room-${roomType}`;
            container.className = 'room-container hidden';
            container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                background: #1a1a2e;
            `;
            this.gameDisplay.appendChild(container);
            this.roomContainers[roomType] = container;
        });
    }

    async navigateToRoom(roomType) {
        // Update navigation buttons
        this.updateNavigationButtons(roomType);
        
        // Show loading transition
        this.showLoadingTransition(roomType);
        
        // Load room if not already loaded
        if (!this.roomInstances[roomType]) {
            await this.loadRoomInstance(roomType);
        }
        
        // Switch to room with smooth transition
        this.switchToRoom(roomType);
        
        // Update room progress
        this.updateRoomProgress(roomType);
    }

    updateNavigationButtons(activeRoom) {
        document.querySelectorAll('.module-nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.classList.contains(activeRoom)) {
                btn.classList.add('active');
            }
        });
    }

    showLoadingTransition(roomType) {
        const roomNames = {
            'flowchart': 'FLOWBYTE',
            'networking': 'NETXUS', 
            'ai-training': 'AITRIX',
            'database': 'SCHEMAX',
            'programming': 'CODEVANCE'
        };

        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'room-transition-overlay';
        loadingOverlay.innerHTML = `
            <div class="transition-content">
                <div class="transition-spinner"></div>
                <h3>Accessing ${roomNames[roomType]}...</h3>
                <div class="transition-progress">
                    <div class="progress-bar-transition"></div>
                </div>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(26, 26, 46, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            backdrop-filter: blur(10px);
        `;

        document.body.appendChild(loadingOverlay);

        // Remove loading overlay after animation
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
        }, 800);
    }

    async loadRoomInstance(roomType) {
        if (roomType === 'flowchart') {
            await this.loadFlowchartRoom();
        } else {
            this.createPlaceholderRoom(roomType);
        }
    }

    async loadFlowchartRoom() {
        const container = this.roomContainers['flowchart'];
        
        // Load the flowchart game script if not already loaded
        if (!window.FlowByteGame) {
            await this.loadScript('/static/js/flowchart-game.js');
        }

        // Initialize the flowchart game in its container
        container.innerHTML = '';
        
        // Create a wrapper that the flowchart game can use
        const gameWrapper = document.createElement('div');
        gameWrapper.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
        `;
        container.appendChild(gameWrapper);

        // Initialize flowchart game with custom container handling
        if (window.FlowByteGame) {
            this.roomInstances['flowchart'] = new FlowByteGame();
            // Override the body.innerHTML setting to work within our container
            this.setupFlowchartGameInContainer(gameWrapper);
        }
    }

    setupFlowchartGameInContainer(container) {
        const flowByteGame = this.roomInstances['flowchart'];
        
        // Override the showRoomSelection method to work within container
        const originalShowRoomSelection = flowByteGame.showRoomSelection.bind(flowByteGame);
        flowByteGame.showRoomSelection = () => {
            container.innerHTML = `
                <div class="flowbyte-container">
                    <div class="room-header">
                        <button class="back-to-command" onclick="window.commandCenter.showCommandDashboard()">
                            ← Back to Command Center
                        </button>
                        <h1>FLOWBYTE</h1>
                        <p>Flowchart Construction Lab</p>
                    </div>
                    <div class="difficulty-selection">
                        <h2>Select Difficulty Level</h2>
                        <div class="difficulty-cards">
                            <div class="difficulty-card easy" onclick="window.commandCenter.roomInstances.flowchart.selectDifficulty('easy')">
                                <h3>Easy</h3>
                                <p>Basic flowchart construction with guided instructions</p>
                                <div class="level-count">5 Levels</div>
                            </div>
                            <div class="difficulty-card hard" onclick="window.commandCenter.roomInstances.flowchart.selectDifficulty('hard')">
                                <h3>Hard</h3>
                                <p>Advanced flowchart design with complex logic patterns</p>
                                <div class="level-count">5 Levels</div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>
                    .flowbyte-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: white; }
                    .room-header { text-align: center; margin-bottom: 40px; position: relative; }
                    .back-to-command { position: absolute; left: 0; top: 0; background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
                    .back-to-command:hover { background: #5a6268; }
                    .room-header h1 { font-size: 3em; color: #2c5aa0; margin: 0; }
                    .room-header p { font-size: 1.2em; color: #ccc; margin: 10px 0; }
                    .difficulty-selection h2 { text-align: center; margin-bottom: 30px; color: #fff; }
                    .difficulty-cards { display: flex; gap: 30px; justify-content: center; }
                    .difficulty-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; width: 250px; text-align: center; }
                    .difficulty-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
                    .difficulty-card.easy { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
                    .difficulty-card.hard { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
                    .difficulty-card h3 { margin: 0 0 15px 0; font-size: 1.5em; }
                    .difficulty-card p { margin: 0 0 20px 0; opacity: 0.9; }
                    .level-count { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; }
                </style>
            `;
        };

        // Override other methods to work within container
        const originalInitGame = flowByteGame.initGame.bind(flowByteGame);
        flowByteGame.initGame = () => {
            // Call original but modify the container target
            const tempBody = document.body;
            document.body = { innerHTML: '' };
            
            originalInitGame();
            
            // Move the content to our container
            container.innerHTML = document.body.innerHTML;
            document.body = tempBody;
            
            // Re-setup the game container reference
            flowByteGame.gameContainer = container.querySelector('#flowchart-canvas');
            if (flowByteGame.gameContainer) {
                flowByteGame.setupEventListeners();
                flowByteGame.updateStatus();
            }
        };

        // Start the game
        flowByteGame.showRoomSelection();
    }

    createPlaceholderRoom(roomType) {
        const container = this.roomContainers[roomType];
        const roomInfo = {
            'networking': { name: 'NETXUS', description: 'Dive deep into network protocols and infrastructure', icon: 'bi-hdd-network', color: '#00A949' },
            'ai-training': { name: 'AITRIX', description: 'Train AI models and understand machine learning concepts', icon: 'bi-robot', color: '#E08300' },
            'database': { name: 'SCHEMAX', description: 'Design and optimize database systems', icon: 'bi-database', color: '#FF3600' },
            'programming': { name: 'CODEVANCE', description: 'Master programming concepts and algorithms', icon: 'bi-code-slash', color: '#FF006D' }
        };

        const room = roomInfo[roomType];
        
        container.innerHTML = `
            <div class="room-placeholder">
                <button class="back-to-command" onclick="window.commandCenter.showCommandDashboard()">
                    ← Back to Command Center
                </button>
                <div class="room-header" style="border-color: ${room.color};">
                    <i class="bi ${room.icon}" style="color: ${room.color};"></i>
                    <h2>${room.name}</h2>
                </div>
                <div class="room-description">
                    <p>${room.description}</p>
                </div>
                <div class="coming-soon">
                    <i class="bi bi-tools"></i>
                    <h3>Under Development</h3>
                    <p>This room is currently being built. Check back soon for exciting challenges!</p>
                </div>
            </div>
        `;

        this.roomInstances[roomType] = { type: 'placeholder', room: room };
    }

    switchToRoom(roomType) {
        // Hide command dashboard
        const dashboard = this.gameDisplay.querySelector('.command-dashboard');
        if (dashboard) {
            dashboard.style.opacity = '0';
            dashboard.style.visibility = 'hidden';
        }

        // Hide all other rooms
        Object.keys(this.roomContainers).forEach(room => {
            if (room !== roomType) {
                const container = this.roomContainers[room];
                container.style.opacity = '0';
                container.style.visibility = 'hidden';
            }
        });

        // Show target room with animation
        const targetRoom = this.roomContainers[roomType];
        setTimeout(() => {
            targetRoom.style.opacity = '1';
            targetRoom.style.visibility = 'visible';
            this.currentRoom = roomType;
        }, 100);
    }

    showCommandDashboard() {
        // Hide all rooms
        Object.keys(this.roomContainers).forEach(roomType => {
            const container = this.roomContainers[roomType];
            container.style.opacity = '0';
            container.style.visibility = 'hidden';
        });

        // Create or show dashboard
        let dashboard = this.gameDisplay.querySelector('.command-dashboard');
        if (!dashboard) {
            dashboard = this.createCommandDashboard();
            this.gameDisplay.appendChild(dashboard);
        }

        // Show dashboard with animation
        setTimeout(() => {
            dashboard.style.opacity = '1';
            dashboard.style.visibility = 'visible';
            this.currentRoom = null;
        }, 100);

        // Update navigation buttons
        document.querySelectorAll('.module-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    createCommandDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'command-dashboard';
        dashboard.style.cssText = `
            width: 100%;
            height: 100%;
            opacity: 1;
            visibility: visible;
            transition: all 0.3s ease;
            padding: 40px;
            color: white;
            overflow-y: auto;
        `;

        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h2><i class="bi bi-command"></i> Command Center Overview</h2>
                <p>Monitor and access all training modules from this central hub</p>
            </div>
            
            <div class="room-grid">
                ${Object.keys(this.roomProgress).map(roomType => this.createRoomCard(roomType)).join('')}
            </div>
            
            <div class="system-status">
                <div class="status-header">
                    <h3><i class="bi bi-activity"></i> System Status</h3>
                </div>
                <div class="status-grid">
                    <div class="status-item">
                        <i class="bi bi-cpu"></i>
                        <div class="status-info">
                            <span class="status-label">Active Modules</span>
                            <span class="status-value">5/5 Online</span>
                        </div>
                    </div>
                    <div class="status-item">
                        <i class="bi bi-person-check"></i>
                        <div class="status-info">
                            <span class="status-label">User Status</span>
                            <span class="status-value">Active</span>
                        </div>
                    </div>
                    <div class="status-item">
                        <i class="bi bi-shield-check"></i>
                        <div class="status-info">
                            <span class="status-label">Security</span>
                            <span class="status-value">Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add dashboard styles
        this.addDashboardStyles();
        
        return dashboard;
    }

    createRoomCard(roomType) {
        const roomInfo = {
            'flowchart': { name: 'FLOWBYTE', icon: 'bi-diagram-3', color: '#005FFB', description: 'Flowchart Logic' },
            'networking': { name: 'NETXUS', icon: 'bi-hdd-network', color: '#00A949', description: 'Network Engineering' },
            'ai-training': { name: 'AITRIX', icon: 'bi-robot', color: '#E08300', description: 'AI & Machine Learning' },
            'database': { name: 'SCHEMAX', icon: 'bi-database', color: '#FF3600', description: 'Database Management' },
            'programming': { name: 'CODEVANCE', icon: 'bi-code-slash', color: '#FF006D', description: 'Advanced Programming' }
        };

        const room = roomInfo[roomType];
        const progress = this.roomProgress[roomType];
        
        return `
            <div class="room-card ${roomType} ${progress.lastPlayed ? 'last-played' : ''}" 
                 onclick="window.commandCenter.navigateToRoom('${roomType}')"
                 style="border-color: ${room.color};">
                ${progress.lastPlayed ? '<div class="last-played-badge"><i class="bi bi-clock-history"></i> Last Played</div>' : ''}
                <div class="room-icon" style="color: ${room.color};">
                    <i class="bi ${room.icon}"></i>
                </div>
                <div class="room-info">
                    <h3>${room.name}</h3>
                    <p>${room.description}</p>
                    <div class="room-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress.completion}%; background: ${room.color};"></div>
                        </div>
                        <div class="progress-text">
                            <span class="progress-percentage">${progress.completion}%</span>
                            <span class="progress-status">${progress.status}</span>
                        </div>
                    </div>
                </div>
                <div class="room-status available" style="background: ${room.color};">
                    ${roomType === 'flowchart' ? 'Available' : 'Coming Soon'}
                </div>
            </div>
        `;
    }

    addDashboardStyles() {
        if (!document.getElementById('dashboard-styles')) {
            const style = document.createElement('style');
            style.id = 'dashboard-styles';
            style.textContent = `
                .command-dashboard {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }
                
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                
                .dashboard-header h2 {
                    color: #10a1fa;
                    margin-bottom: 10px;
                    font-size: 2.2em;
                }
                
                .dashboard-header p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1.1em;
                }
                
                .room-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 25px;
                    margin-bottom: 40px;
                    max-width: 1400px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .room-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid;
                    border-radius: 15px;
                    padding: 25px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    backdrop-filter: blur(10px);
                }
                
                .room-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
                }
                
                .room-card.last-played::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: 13px;
                    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
                    pointer-events: none;
                }
                
                .last-played-badge {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #ffc107;
                    color: #000;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 0.8em;
                    font-weight: bold;
                }
                
                .room-icon {
                    font-size: 3rem;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                .room-info h3 {
                    margin: 0 0 10px 0;
                    font-size: 1.5rem;
                    text-align: center;
                }
                
                .room-info p {
                    color: rgba(255, 255, 255, 0.7);
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .room-progress {
                    margin-top: 15px;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                
                .progress-text {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9em;
                }
                
                .progress-percentage {
                    font-weight: bold;
                }
                
                .progress-status {
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .room-status {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    color: white;
                }
                
                .system-status {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 30px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                
                .status-header {
                    text-align: center;
                    margin-bottom: 25px;
                }
                
                .status-header h3 {
                    color: #10a1fa;
                    font-size: 1.5em;
                }
                
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }
                
                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                
                .status-item i {
                    font-size: 2rem;
                    color: #28a745;
                }
                
                .status-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .status-label {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9em;
                }
                
                .status-value {
                    color: white;
                    font-weight: bold;
                    font-size: 1.1em;
                }
                
                .back-to-command {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background 0.3s;
                    z-index: 100;
                }
                
                .back-to-command:hover {
                    background: #5a6268;
                }
                
                .room-placeholder {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #ffffff;
                    padding: 40px;
                    position: relative;
                }
                
                .room-placeholder .room-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                    padding: 20px 40px;
                    border: 2px solid;
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .room-placeholder .room-header i {
                    font-size: 3rem;
                }
                
                .room-placeholder .room-header h2 {
                    margin: 0;
                    font-size: 2.5rem;
                }
                
                .room-placeholder .room-description {
                    margin-bottom: 40px;
                    max-width: 600px;
                }
                
                .room-placeholder .room-description p {
                    font-size: 1.2rem;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                }
                
                .coming-soon {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 40px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }
                
                .coming-soon i {
                    font-size: 4rem;
                    color: #ffc107;
                    margin-bottom: 20px;
                }
                
                .coming-soon h3 {
                    color: #ffc107;
                    margin-bottom: 15px;
                }
                
                .transition-content {
                    text-align: center;
                }
                
                .transition-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid #10a1fa;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                .transition-progress {
                    width: 200px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 20px;
                }
                
                .progress-bar-transition {
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #10a1fa, #A069FF);
                    animation: loadingProgress 0.8s ease-in-out;
                }
                
                @keyframes loadingProgress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .module-nav-btn.active {
                    background: linear-gradient(135deg, #10a1fa, #A069FF);
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateRoomProgress(roomType) {
        // Update last played status
        Object.keys(this.roomProgress).forEach(room => {
            this.roomProgress[room].lastPlayed = room === roomType;
        });
        
        // Save state
        this.saveRoomState(roomType);
    }

    saveRoomState(roomType) {
        // Save current room state for persistence
        this.roomStates[roomType] = {
            lastAccessed: Date.now(),
            instance: this.roomInstances[roomType]
        };
        
        // Save to localStorage for persistence across sessions
        localStorage.setItem('commandCenterRoomStates', JSON.stringify(this.roomStates));
        localStorage.setItem('commandCenterRoomProgress', JSON.stringify(this.roomProgress));
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    loadUserInfo() {
        // Load user information from localStorage
        const username = localStorage.getItem('currentUser');
        const email = localStorage.getItem('currentEmail');
        
        if (username) {
            const profileUsername = document.getElementById('profileUsername');
            const profileEmail = document.getElementById('profileEmail');
            
            if (profileUsername) {
                profileUsername.textContent = username; 
            }
            
            if (profileEmail) {
                profileEmail.textContent = email || 'No email provided';
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.commandCenter = new CommandCenter();
});