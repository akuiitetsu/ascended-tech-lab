class CommandCenter {
    constructor() {
        // Core properties
        this.gameDisplay = document.getElementById('gameDisplay');
        console.log('🎮 GameDisplay element found:', !!this.gameDisplay);
        
        if (!this.gameDisplay) {
            console.error('❌ GameDisplay element not found! Command Center cannot initialize properly.');
        }
        
        this.currentRoom = null;
        this.roomStates = {};
        this.roomInstances = {};
        this.roomContainers = {};
        this.progressTracker = null;
        
        // Room progress data - will be populated from server
        this.roomProgress = {};
        
        // Room configuration
        this.roomConfig = {
            names: {
                'flowchart': 'FLOWBYTE',
                'netxus': 'NETXUS', 
                'aitrix': 'AITRIX',
                'schemax': 'SCHEMAX',
                'codevance': 'CODEVANCE',
                // Legacy support
                'networking': 'NETXUS', 
                'ai-training': 'AITRIX',
                'database': 'SCHEMAX',
                'programming': 'CODEVANCE'
            },
            info: {
                'flowchart': { name: 'FLOWBYTE', icon: 'bi-diagram-3', color: '#005FFB', description: 'Flowchart Logic' },
                'netxus': { name: 'NETXUS', icon: 'bi-hdd-network', color: '#00A949', description: 'Network Engineering' },
                'aitrix': { name: 'AITRIX', icon: 'bi-robot', color: '#E08300', description: 'AI & Machine Learning' },
                'schemax': { name: 'SCHEMAX', icon: 'bi-database', color: '#8B5A3C', description: 'Database Management' },
                'codevance': { name: 'CODEVANCE', icon: 'bi-code-slash', color: '#DC3545', description: 'Programming Challenges' },
                // Legacy support
                'networking': { name: 'NETXUS', icon: 'bi-hdd-network', color: '#00A949', description: 'Network Engineering' },
                'ai-training': { name: 'AITRIX', icon: 'bi-robot', color: '#E08300', description: 'AI & Machine Learning' },
                'database': { name: 'SCHEMAX', icon: 'bi-database', color: '#8B5A3C', description: 'Database Management' },
                'programming': { name: 'CODEVANCE', icon: 'bi-code-slash', color: '#DC3545', description: 'Programming Challenges' }
            }
        };
        
        this.initialize();
    }

    // =============================================
    // INITIALIZATION METHODS
    // =============================================

    async initialize() {
        console.log('🚀 Initializing Command Center...');
        
        // Wait for progress tracker to be available
        await this.waitForProgressTracker();
        console.log('✅ Progress tracker loaded');
        
        this.initializeModuleButtons();
        console.log('✅ Module buttons initialized');
        
        this.loadUserInfo();
        console.log('✅ User info loaded');
        
        await this.loadUserProgress();
        console.log('✅ User progress loaded');
        
        this.initializeRoomContainers();
        console.log('✅ Room containers initialized');
        
        this.setupProgressEventListeners();
        console.log('✅ Progress event listeners setup');
        
        this.showCommandDashboard();
        console.log('✅ Command dashboard shown');
        
        console.log('🎉 Command Center initialization complete!');
    }

    async waitForProgressTracker() {
        // Wait for progress tracker to be loaded
        while (!window.progressTracker) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.progressTracker = window.progressTracker;
        console.log('✅ Progress tracker connected to Command Center');
    }

    async loadUserProgress() {
        console.log('📊 Loading user progress...');
        try {
            if (this.progressTracker) {
                // Load progress data from tracker
                const progressData = this.progressTracker.getAllProgress();
                console.log('Progress data from tracker:', progressData);
                
                // Initialize room progress with default values
                const defaultRooms = ['flowchart', 'netxus', 'aitrix', 'schemax', 'codevance'];
                console.log('Initializing rooms:', defaultRooms);
                
                defaultRooms.forEach(roomType => {
                    // Check for progress data with both new and legacy room names
                    const roomProgress = progressData.find(p => 
                        p.room_name === roomType || 
                        (roomType === 'netxus' && p.room_name === 'networking') ||
                        (roomType === 'aitrix' && p.room_name === 'ai-training') ||
                        (roomType === 'schemax' && p.room_name === 'database') ||
                        (roomType === 'codevance' && p.room_name === 'programming')
                    );
                    
                    this.roomProgress[roomType] = {
                        completion: roomProgress ? roomProgress.progress_percentage : 0,
                        status: roomProgress?.completed ? 'Completed' : 'In Progress',
                        lastPlayed: false,
                        score: roomProgress ? roomProgress.score : 0,
                        level: roomProgress ? roomProgress.current_level : 1,
                        timeSpent: roomProgress ? roomProgress.time_spent : 0
                    };
                });
                
                // Mark most recently accessed room as last played
                if (progressData.length > 0) {
                    const mostRecent = progressData.reduce((latest, current) => {
                        const currentTime = new Date(current.last_accessed || 0).getTime();
                        const latestTime = new Date(latest.last_accessed || 0).getTime();
                        return currentTime > latestTime ? current : latest;
                    });
                    
                    // Map legacy room name to new room name
                    const mapLegacyRoomName = (legacyName) => {
                        const mapping = {
                            'networking': 'netxus',
                            'ai-training': 'aitrix',
                            'database': 'schemax',
                            'programming': 'codevance'
                        };
                        return mapping[legacyName] || legacyName;
                    };
                    
                    const mappedRoomName = mapLegacyRoomName(mostRecent.room_name);
                    if (this.roomProgress[mappedRoomName]) {
                        this.roomProgress[mappedRoomName].lastPlayed = true;
                    }
                }
                
                console.log('📊 User progress loaded in Command Center:', this.roomProgress);
            }
        } catch (error) {
            console.error('❌ Error loading user progress:', error);
            // Initialize with default values
            this.initializeDefaultProgress();
        }
    }

    initializeDefaultProgress() {
        const defaultRooms = ['flowchart', 'netxus', 'aitrix', 'schemax', 'codevance'];
        
        defaultRooms.forEach(roomType => {
            this.roomProgress[roomType] = {
                completion: 0,
                status: 'Not Started',
                lastPlayed: false,
                score: 0,
                level: 1,
                timeSpent: 0
            };
        });
        
        // Set first room as last played
        this.roomProgress['flowchart'].lastPlayed = true;
    }

    setupProgressEventListeners() {
        // Listen for progress updates from the progress tracker
        document.addEventListener('progress-updated', (event) => {
            const { roomName, progress } = event.detail;
            this.handleProgressUpdate(roomName, progress);
        });
        
        document.addEventListener('progress-loaded', (event) => {
            const { progress } = event.detail;
            this.handleProgressLoaded(progress);
        });
    }

    handleProgressUpdate(roomName, progress) {
        // Update local room progress cache
        if (this.roomProgress[roomName]) {
            this.roomProgress[roomName] = {
                completion: progress.progress_percentage || 0,
                status: progress.completed ? 'Completed' : 'In Progress',
                lastPlayed: this.roomProgress[roomName].lastPlayed,
                score: progress.score || 0,
                level: progress.current_level || 1,
                timeSpent: progress.time_spent || 0
            };
            
            // Update UI if we're on the dashboard
            if (this.gameDisplay && this.gameDisplay.innerHTML.includes('command-dashboard')) {
                this.refreshDashboardDisplay();
            }
            
            console.log(`📈 Progress updated in Command Center for ${roomName}:`, this.roomProgress[roomName]);
        }
    }

    handleProgressLoaded(progressData) {
        console.log('📋 Progress data loaded in Command Center:', progressData);
        // Refresh the dashboard if it's currently displayed
        if (this.gameDisplay && this.gameDisplay.innerHTML.includes('command-dashboard')) {
            this.refreshDashboardDisplay();
        }
    }

    refreshDashboardDisplay() {
        // Refresh the dashboard to show updated progress
        setTimeout(() => {
            this.showCommandDashboard();
        }, 100);
    }

    initializeModuleButtons() {
        const moduleButtons = document.querySelectorAll('.module-nav-btn');
        moduleButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Get room type from the button classes
                const roomType = button.classList[1]; // Second class is the room type
                console.log('🎯 Button clicked for room:', roomType);
                
                // Map the room type if needed for consistency
                const mappedRoomType = this.mapRoomType(roomType);
                console.log('🗺️ Mapped room type:', mappedRoomType);
                
                this.navigateToRoom(mappedRoomType);
            });
        });
    }

    // Map room types for consistency between dashboard and command center
    mapRoomType(roomType) {
        const roomMapping = {
            'flowchart': 'flowchart',
            'networking': 'netxus',
            'ai-training': 'aitrix', 
            'database': 'schemax',
            'programming': 'codevance'
        };
        
        return roomMapping[roomType] || roomType;
    }

    initializeRoomContainers() {
        console.log('🏗️ Initializing room containers...');
        const roomTypes = ['flowchart', 'netxus', 'aitrix', 'schemax', 'codevance'];
        
        roomTypes.forEach(roomType => {
            console.log(`Creating container for: ${roomType}`);
            const container = this.createRoomContainer(roomType);
            this.gameDisplay.appendChild(container);
            this.roomContainers[roomType] = container;
            console.log(`✅ Container created and added for: ${roomType}`);
        });
        
        // Also create legacy containers for backward compatibility
        const legacyRoomTypes = ['networking', 'ai-training', 'database', 'programming'];
        legacyRoomTypes.forEach((legacyType, index) => {
            const newType = ['netxus', 'aitrix', 'schemax', 'codevance'][index];
            this.roomContainers[legacyType] = this.roomContainers[newType];
            console.log(`🔗 Legacy mapping: ${legacyType} -> ${newType}`);
        });
        
        console.log('🏁 All room containers initialized:', Object.keys(this.roomContainers));
    }

    createRoomContainer(roomType) {
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
            z-index: 1;
            overflow: auto;
        `;
        console.log(`📦 Created room container for: ${roomType}`);
        return container;
    }

    // =============================================
    // NAVIGATION METHODS
    // =============================================

    async navigateToRoom(roomType) {
        console.log(`🔄 Navigating to room: ${roomType}`);
        console.log('Available room containers:', Object.keys(this.roomContainers));
        console.log('Available room progress:', Object.keys(this.roomProgress));
        console.log('Room container exists:', !!this.roomContainers[roomType]);
        
        // Check if this is a legacy room type that needs mapping
        const mappedRoomType = this.mapRoomType(roomType);
        console.log(`Mapped room type: ${roomType} -> ${mappedRoomType}`);
        
        this.updateNavigationButtons(roomType);
        this.showLoadingTransition(roomType);
        
        if (!this.roomInstances[mappedRoomType]) {
            console.log(`📥 Loading room instance for: ${mappedRoomType}`);
            await this.loadRoomInstance(mappedRoomType);
        } else {
            console.log(`✅ Room instance already exists for: ${mappedRoomType}`);
        }
        
        console.log(`🎯 Switching to room: ${mappedRoomType}`);
        this.switchToRoom(mappedRoomType);
        this.updateRoomProgress(mappedRoomType);
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
        const roomName = this.roomConfig.names[roomType] || 'Room';
        const loadingOverlay = this.createLoadingOverlay(roomName);
        
        document.body.appendChild(loadingOverlay);
        
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
        }, 800);
    }

    createLoadingOverlay(roomName) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'room-transition-overlay';
        loadingOverlay.innerHTML = `
            <div class="transition-content">
                <div class="transition-spinner"></div>
                <h3>Accessing ${roomName}...</h3>
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
        return loadingOverlay;
    }

    switchToRoom(roomType) {
        this.hideDashboard();
        this.hideAllRooms();
        this.showTargetRoom(roomType);
    }

    hideDashboard() {
        const dashboard = this.gameDisplay.querySelector('.command-dashboard');
        if (dashboard) {
            dashboard.style.opacity = '0';
            dashboard.style.visibility = 'hidden';
        }
    }

    hideAllRooms() {
        Object.keys(this.roomContainers).forEach(room => {
            const container = this.roomContainers[room];
            container.style.opacity = '0';
            container.style.visibility = 'hidden';
        });
    }

    showTargetRoom(roomType) {
        const targetRoom = this.roomContainers[roomType];
        console.log(`🎯 Showing target room: ${roomType}`);
        console.log('Room container exists:', !!targetRoom);
        console.log('All available room containers:', Object.keys(this.roomContainers));
        
        if (targetRoom) {
            console.log('✅ Target room container found, showing it...');
            
            // Add simple test content to verify the room is working
            if (!targetRoom.innerHTML.trim()) {
                targetRoom.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        flex-direction: column;
                        color: white;
                        font-size: 24px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    ">
                        <h1>${roomType.toUpperCase()} ROOM</h1>
                        <p>Room successfully loaded and displayed!</p>
                        <button onclick="window.commandCenter.showCommandDashboard()" 
                                style="margin-top: 20px; padding: 10px 20px; font-size: 16px; background: #fff; color: #333; border: none; border-radius: 5px; cursor: pointer;">
                            ← Back to Command Center
                        </button>
                    </div>
                `;
            }
            
            // Force display properties
            targetRoom.classList.remove('hidden');
            targetRoom.style.display = 'block';
            
            setTimeout(() => {
                targetRoom.style.opacity = '1';
                targetRoom.style.visibility = 'visible';
                targetRoom.style.zIndex = '10';
                console.log('🎯 Room should now be visible');
                
                this.currentRoom = roomType;
                console.log(`✅ Room ${roomType} is now the active room`);
                console.log('Room container styles:', {
                    opacity: targetRoom.style.opacity,
                    visibility: targetRoom.style.visibility,
                    display: targetRoom.style.display,
                    zIndex: targetRoom.style.zIndex
                });
            }, 100);
        } else {
            console.error(`❌ Room container not found for: ${roomType}`);
            console.error('Available containers:', Object.keys(this.roomContainers));
        }
    }

    showCommandDashboard() {
        this.hideAllRooms();
        
        let dashboard = this.gameDisplay.querySelector('.command-dashboard');
        if (!dashboard) {
            dashboard = this.createCommandDashboard();
            this.gameDisplay.appendChild(dashboard);
        }
        
        setTimeout(() => {
            dashboard.style.opacity = '1';
            dashboard.style.visibility = 'visible';
            this.currentRoom = null;
        }, 100);

        this.updateNavigationButtons('');
    }

    // =============================================
    // ROOM LOADING METHODS
    // =============================================

    async loadRoomInstance(roomType) {
        console.log(`Loading room instance: ${roomType}`);
        
        switch(roomType) {
            case 'flowchart':
                await this.loadFlowchartRoom();
                break;
            case 'netxus':
                await this.loadNetxusRoom();
                break;
            case 'aitrix':
                await this.loadAitrixRoom();
                break;
            case 'schemax':
                await this.loadSchemaxRoom();
                break;
            case 'codevance':
                await this.loadCodevanceRoom();
                break;
            // Legacy room type support
            case 'networking':
                await this.loadNetxusRoom();
                break;
            case 'ai-training':
                await this.loadAitrixRoom();
                break;
            case 'database':
                await this.loadSchemaxRoom();
                break;
            case 'programming':
                await this.loadCodevanceRoom();
                break;
            default:
                console.error(`Unknown room type: ${roomType}`);
                await this.loadPlaceholderRoom(roomType);
        }
    }

    // =============================================
    // FLOWBYTE ROOM METHODS
    // =============================================

    async loadFlowchartRoom() {
        const container = this.roomContainers['flowchart'];
        
        console.log('Loading FlowByte room...');
        
        // Load the game script first with correct path resolution
        if (!window.FlowByteGame) {
            console.log('Loading FlowByte game script...');
            try {
                // Determine the correct script path based on current location
                const currentPath = window.location.pathname;
                let scriptPath;
                
                // For file:// URLs, use simple relative paths
                if (window.location.protocol === 'file:') {
                    scriptPath = '../../static/js/flowchart-game.js';
                } else if (currentPath.includes('/src/pages/')) {
                    // We're in a subfolder like /src/pages/command-center.html
                    scriptPath = '../../static/js/flowchart-game.js';
                } else if (currentPath === '/' || currentPath.includes('index.html')) {
                    // We're at the root
                    scriptPath = './static/js/flowchart-game.js';
                } else {
                    // Default fallback
                    scriptPath = '/static/js/flowchart-game.js';
                }
                
                console.log('Current path:', currentPath);
                console.log('Protocol:', window.location.protocol);
                console.log('Attempting to load script from:', scriptPath);
                await this.loadScript(scriptPath);
                console.log('FlowByte game script loaded successfully');
            } catch (error) {
                console.error('Failed to load FlowByte game script:', error);
                // Try alternative paths if the first one fails
                console.log('Trying alternative script paths...');
                const alternativePaths = [
                    '/static/js/flowchart-game.js',
                    '../static/js/flowchart-game.js',
                    '../../static/js/flowchart-game.js',
                    './static/js/flowchart-game.js'
                ];
                
                let scriptLoaded = false;
                for (const altPath of alternativePaths) {
                    try {
                        console.log(`Trying script path: ${altPath}`);
                        await this.loadScript(altPath);
                        console.log(`✓ Script loaded successfully from: ${altPath}`);
                        scriptLoaded = true;
                        break;
                    } catch (altError) {
                        console.log(`✗ Failed to load from: ${altPath}`);
                    }
                }
                
                if (!scriptLoaded) {
                    console.error('All script loading attempts failed');
                    this.createFlowchartFallback(container);
                    return;
                }
            }
        }

        try {
            // Get the current page's base path for HTML loading
            const currentPath = window.location.pathname;
            let basePath;
            
            if (currentPath.includes('/src/pages/')) {
                basePath = '../../';
            } else if (currentPath === '/' || currentPath.includes('index.html')) {
                basePath = './';
            } else {
                basePath = '/';
            }
            
            // Try multiple possible paths for the HTML file
            const possiblePaths = [
                `${basePath}src/rooms/flowchart-room.html`,
                './src/rooms/flowchart-room.html',
                '../src/rooms/flowchart-room.html',
                '/src/rooms/flowchart-room.html',
                '../../src/rooms/flowchart-room.html'
            ];
            
            console.log('Current path:', currentPath);
            console.log('Base path:', basePath);
            console.log('Trying HTML paths:', possiblePaths);
            
            let htmlContent = null;
            let loadedPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Attempting to fetch HTML from: ${path}`);
                    const response = await fetch(path);
                    console.log(`Response status for ${path}:`, response.status);
                    
                    if (response.ok) {
                        htmlContent = await response.text();
                        loadedPath = path;
                        console.log(`✓ Successfully loaded HTML from: ${path}`);
                        console.log('HTML content length:', htmlContent.length);
                        break;
                    } else {
                        console.log(`✗ Failed to load from ${path}: HTTP ${response.status}`);
                    }
                } catch (e) {
                    console.log(`✗ Network error loading from ${path}:`, e.message);
                }
            }
            
            if (!htmlContent) {
                throw new Error('Could not load flowchart room HTML from any path. All attempts failed.');
            }
            
            // Parse the HTML and extract content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const gameContainer = doc.getElementById('game-container');
            
            if (!gameContainer) {
                console.error('HTML content does not contain #game-container');
                console.log('Available elements:', Array.from(doc.querySelectorAll('[id]')).map(el => el.id));
                throw new Error('Game container not found in HTML');
            }
            
            console.log('✓ Found game container with content length:', gameContainer.innerHTML.length);
            
            // Extract and add styles
            const styles = doc.querySelectorAll('style');
            console.log(`Found ${styles.length} style elements`);
            
            styles.forEach((style, index) => {
                const styleId = `flowchart-styles-${index}`;
                if (!document.getElementById(styleId)) {
                    const newStyle = document.createElement('style');
                    newStyle.id = styleId;
                    newStyle.setAttribute('data-room', 'flowchart');
                    newStyle.textContent = style.textContent;
                    document.head.appendChild(newStyle);
                    console.log(`✓ Added style block ${index + 1}`);
                } else {
                    console.log(`Style block ${index + 1} already exists`);
                }
            });
            
            // Set the container content
            container.innerHTML = gameContainer.innerHTML;
            console.log('✓ Container content set, length:', container.innerHTML.length);
            
            // Verify the required elements are present
            const difficultyScreen = container.querySelector('#difficulty-screen');
            const levelScreen = container.querySelector('#level-screen');
            const gameScreen = container.querySelector('#game-screen');
            
            console.log('Element verification:', {
                difficultyScreen: !!difficultyScreen,
                levelScreen: !!levelScreen,
                gameScreen: !!gameScreen
            });
            
            if (!difficultyScreen || !levelScreen || !gameScreen) {
                throw new Error('Required game screens not found in loaded HTML');
            }
            
            // Initialize the game
            if (window.FlowByteGame) {
                console.log('✓ FlowByteGame class available, initializing...');
                this.roomInstances['flowchart'] = new FlowByteGame();
                
                // Setup integration after a short delay
                setTimeout(() => {
                    this.setupFlowchartGameIntegration();
                }, 300);
            } else {
                throw new Error('FlowByteGame class not available after script load');
            }
            
        } catch (error) {
            console.error('✗ Error loading flowchart room:', error);
            this.createFlowchartFallback(container);
        }
    }

    setupFlowchartGameIntegration() {
        const flowByteGame = this.roomInstances['flowchart'];
        const container = this.roomContainers['flowchart'];
        
        if (!flowByteGame || !container) {
            console.error('✗ FlowByte game or container not available for integration');
            return;
        }
        
        console.log('Setting up FlowByte integration...');
        console.log('Container innerHTML length:', container.innerHTML.length);
        
        try {
            // Initialize the game with the container
            flowByteGame.init(container);
            
            // Setup command center navigation
            this.setupCommandCenterNavigation(container);
            
            console.log('✓ FlowByte integration completed successfully');
            
            // Ensure the difficulty screen is visible after initialization
            setTimeout(() => {
                const difficultyScreen = container.querySelector('#difficulty-screen');
                if (difficultyScreen) {
                    console.log('🔧 Ensuring difficulty screen visibility...');
                    difficultyScreen.style.display = 'flex';
                    difficultyScreen.classList.remove('hidden');
                    console.log('Difficulty screen display:', difficultyScreen.style.display);
                    console.log('Difficulty screen classes:', difficultyScreen.className);
                }
            }, 100);
            
        } catch (error) {
            console.error('✗ Error setting up FlowByte integration:', error);
            this.createFlowchartFallback(container);
        }
    }

    setupCommandCenterNavigation(container) {
        // Wait a bit for the game to fully initialize
        setTimeout(() => {
            const backToCommandBtn = container.querySelector('#back-to-command-btn');
            if (backToCommandBtn) {
                // Create a new button to ensure clean event handling
                const newBackBtn = backToCommandBtn.cloneNode(true);
                backToCommandBtn.parentNode.replaceChild(newBackBtn, backToCommandBtn);
                
                // Add command center navigation
                newBackBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Navigating back to command center dashboard');
                    this.showCommandDashboard();
                });
                
                console.log('Command center navigation setup complete');
            } else {
                console.warn('Back to command button not found');
            }
        }, 300);
    }

    // =============================================
    // NETXUS ROOM METHODS
    // =============================================

    async loadNetxusRoom() {
        const container = this.roomContainers['netxus'] || this.roomContainers['networking'];
        
        console.log('Loading NETXUS room...');
        
        // Load the game script first with correct path resolution
        if (!window.NetxusLab) {
            console.log('Loading NETXUS lab script...');
            try {
                // Determine the correct script path based on current location
                const currentPath = window.location.pathname;
                let scriptPath;
                
                if (currentPath.includes('/src/pages/')) {
                    // We're in a subfolder like /src/pages/command-center.html
                    scriptPath = '../../static/js/netxus.js';
                } else if (currentPath === '/' || currentPath.includes('index.html')) {
                    // We're at the root
                    scriptPath = './static/js/netxus.js';
                } else {
                    // Default fallback
                    scriptPath = '/static/js/netxus.js';
                }
                
                console.log('Attempting to load script from:', scriptPath);
                await this.loadScript(scriptPath);
                console.log('NETXUS lab script loaded successfully');
            } catch (error) {
                console.error('Failed to load NETXUS lab script:', error);
                // Try alternative paths if the first one fails
                console.log('Trying alternative script paths...');
                const alternativePaths = [
                    '/static/js/netxus.js',
                    '../static/js/netxus.js',
                    '../../static/js/netxus.js',
                    './static/js/netxus.js'
                ];
                
                let scriptLoaded = false;
                for (const altPath of alternativePaths) {
                    try {
                        console.log(`Trying script path: ${altPath}`);
                        await this.loadScript(altPath);
                        console.log(`✓ Script loaded successfully from: ${altPath}`);
                        scriptLoaded = true;
                        break;
                    } catch (altError) {
                        console.log(`✗ Failed to load from: ${altPath}`);
                    }
                }
                
                if (!scriptLoaded) {
                    console.error('All script loading attempts failed');
                    this.createNetxusFallback(container);
                    return;
                }
            }
        }

        try {
            // Get the current page's base path for HTML loading
            const currentPath = window.location.pathname;
            let basePath;
            
            if (currentPath.includes('/src/pages/')) {
                basePath = '../../';
            } else if (currentPath === '/' || currentPath.includes('index.html')) {
                basePath = './';
            } else {
                basePath = '/';
            }
            
            // Try multiple possible paths for the HTML file
            const possiblePaths = [
                `${basePath}src/rooms/netxus-room.html`,
                './src/rooms/netxus-room.html',
                '../src/rooms/netxus-room.html',
                '/src/rooms/netxus-room.html',
                '../../src/rooms/netxus-room.html'
            ];
            
            console.log('Current path:', currentPath);
            console.log('Base path:', basePath);
            console.log('Trying HTML paths:', possiblePaths);
            
            let htmlContent = null;
            let loadedPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Attempting to fetch HTML from: ${path}`);
                    const response = await fetch(path);
                    console.log(`Response status for ${path}:`, response.status);
                    
                    if (response.ok) {
                        htmlContent = await response.text();
                        loadedPath = path;
                        console.log(`✓ Successfully loaded HTML from: ${path}`);
                        console.log('HTML content length:', htmlContent.length);
                        break;
                    } else {
                        console.log(`✗ Failed to load from ${path}: HTTP ${response.status}`);
                    }
                } catch (e) {
                    console.log(`✗ Network error loading from ${path}:`, e.message);
                }
            }
            
            if (!htmlContent) {
                throw new Error('Could not load NETXUS room HTML from any path. All attempts failed.');
            }
            
            // Parse the HTML and extract content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const gameContainer = doc.getElementById('game-container');
            
            if (!gameContainer) {
                console.error('HTML content does not contain #game-container');
                console.log('Available elements:', Array.from(doc.querySelectorAll('[id]')).map(el => el.id));
                throw new Error('Game container not found in HTML');
            }
            
            console.log('✓ Found game container with content length:', gameContainer.innerHTML.length);
            
            // Extract and add styles
            const styles = doc.querySelectorAll('style');
            console.log(`Found ${styles.length} style elements`);
            
            styles.forEach((style, index) => {
                const styleId = `netxus-styles-${index}`;
                if (!document.getElementById(styleId)) {
                    const newStyle = document.createElement('style');
                    newStyle.id = styleId;
                    newStyle.setAttribute('data-room', 'netxus');
                    newStyle.textContent = style.textContent;
                    document.head.appendChild(newStyle);
                    console.log(`✓ Added style block ${index + 1}`);
                } else {
                    console.log(`Style block ${index + 1} already exists`);
                }
            });
            
            // Set the container content
            container.innerHTML = gameContainer.innerHTML;
            console.log('✓ Container content set, length:', container.innerHTML.length);
            
            // Verify the required elements are present
            const difficultyScreen = container.querySelector('#difficulty-screen');
            const levelScreen = container.querySelector('#level-screen');
            const gameScreen = container.querySelector('#game-screen');
            
            console.log('Element verification:', {
                difficultyScreen: !!difficultyScreen,
                levelScreen: !!levelScreen,
                gameScreen: !!gameScreen
            });
            
            if (!difficultyScreen || !levelScreen || !gameScreen) {
                throw new Error('Required game screens not found in loaded HTML');
            }
            
            // Initialize the lab
            if (window.NetxusLab) {
                console.log('✓ NetxusLab class available, initializing...');
                this.roomInstances['netxus'] = new NetxusLab();
                
                // Setup integration after a short delay
                setTimeout(() => {
                    this.setupNetxusLabIntegration();
                }, 300);
            } else {
                throw new Error('NetxusLab class not available after script load');
            }
            
        } catch (error) {
            console.error('✗ Error loading NETXUS room:', error);
            this.createNetxusFallback(container);
        }
    }

    setupNetxusLabIntegration() {
        const netxusLab = this.roomInstances['netxus'];
        const container = this.roomContainers['netxus'];
        
        if (!netxusLab || !container) {
            console.error('✗ NETXUS lab or container not available for integration');
            return;
        }
        
        console.log('Setting up NETXUS integration...');
        console.log('Container innerHTML length:', container.innerHTML.length);
        
        try {
            // Initialize the lab with the container
            netxusLab.init(container);
            
            // Setup command center navigation
            this.setupCommandCenterNavigation(container, 'netxus');
            
            console.log('✓ NETXUS integration completed successfully');
            
            // Ensure the difficulty screen is visible after initialization
            setTimeout(() => {
                const difficultyScreen = container.querySelector('#difficulty-screen');
                if (difficultyScreen) {
                    console.log('🔧 Ensuring difficulty screen visibility...');
                    difficultyScreen.style.display = 'flex';
                    difficultyScreen.classList.remove('hidden');
                    console.log('Difficulty screen display:', difficultyScreen.style.display);
                    console.log('Difficulty screen classes:', difficultyScreen.className);
                }
            }, 100);
            
        } catch (error) {
            console.error('✗ Error setting up NETXUS integration:', error);
            this.createNetxusFallback(container);
        }
    }

    // =============================================
    // AITRIX ROOM METHODS
    // =============================================

    async loadAitrixRoom() {
        const container = this.roomContainers['aitrix'] || this.roomContainers['ai-training'];
        
        console.log('Loading AITRIX room...');
        
        // Load the game script first with correct path resolution
        if (!window.AitrixLab) {
            console.log('Loading AITRIX lab script...');
            try {
                // Determine the correct script path based on current location
                const currentPath = window.location.pathname;
                let scriptPath;
                
                console.log('Current path for AITRIX script loading:', currentPath);
                
                if (currentPath.includes('/src/pages/')) {
                    // We're in a subfolder like /src/pages/command-center.html
                    scriptPath = '../../static/js/aitrix-game.js';
                } else if (currentPath === '/' || currentPath.includes('index.html')) {
                    // We're at the root
                    scriptPath = './static/js/aitrix-game.js';
                } else {
                    // Default fallback
                    scriptPath = '/static/js/aitrix-game.js';
                }
                
                console.log('Attempting to load AITRIX script from:', scriptPath);
                await this.loadScript(scriptPath);
                console.log('AITRIX lab script loaded successfully');
            } catch (error) {
                console.error('Failed to load AITRIX lab script:', error);
                // Try alternative paths if the first one fails
                console.log('Trying alternative AITRIX script paths...');
                const alternativePaths = [
                    './static/js/aitrix-game.js',
                    '../static/js/aitrix-game.js', 
                    '../../static/js/aitrix-game.js',
                    '/static/js/aitrix-game.js',
                    'static/js/aitrix-game.js',
                    './js/aitrix-game.js',
                    '../js/aitrix-game.js'
                ];
                
                let scriptLoaded = false;
                for (const altPath of alternativePaths) {
                    try {
                        console.log(`Trying AITRIX script path: ${altPath}`);
                        await this.loadScript(altPath);
                        console.log(`✓ AITRIX script loaded successfully from: ${altPath}`);
                        scriptLoaded = true;
                        break;
                    } catch (altError) {
                        console.log(`✗ Failed to load AITRIX from: ${altPath}`, altError.message);
                    }
                }
                
                if (!scriptLoaded) {
                    console.error('All AITRIX script loading attempts failed');
                    
                    // Try to check if the file exists at expected locations
                    console.log('Checking file existence at common locations...');
                    const testPaths = [
                        './static/js/aitrix-game.js',
                        '/static/js/aitrix-game.js',
                        '../static/js/aitrix-game.js'
                    ];
                    
                    for (const testPath of testPaths) {
                        try {
                            const response = await fetch(testPath, { method: 'HEAD' });
                            console.log(`File check for ${testPath}: ${response.status}`);
                            if (response.ok) {
                                console.log(`✓ File exists at: ${testPath}, trying to load again...`);
                                await this.loadScript(testPath);
                                scriptLoaded = true;
                                break;
                            }
                        } catch (e) {
                            console.log(`File check failed for ${testPath}`);
                        }
                    }
                    
                    if (!scriptLoaded) {
                        this.createAitrixFallback(container);
                        return;
                    }
                }
            }
        }

        try {
            // Get the current page's base path for HTML loading
            const currentPath = window.location.pathname;
            let basePath;
            
            if (currentPath.includes('/src/pages/')) {
                basePath = '../../';
            } else if (currentPath === '/' || currentPath.includes('index.html')) {
                basePath = './';
            } else {
                basePath = '/';
            }
            
            // Try multiple possible paths for the HTML file
            const possiblePaths = [
                `${basePath}src/rooms/aitrix-room.html`,
                './src/rooms/aitrix-room.html',
                '../src/rooms/aitrix-room.html',
                '/src/rooms/aitrix-room.html',
                '../../src/rooms/aitrix-room.html',
                'src/rooms/aitrix-room.html'
            ];
            
            console.log('Current path:', currentPath);
            console.log('Base path:', basePath);
            console.log('Trying AITRIX HTML paths:', possiblePaths);
            
            let htmlContent = null;
            let loadedPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Attempting to fetch AITRIX HTML from: ${path}`);
                    const response = await fetch(path);
                    console.log(`Response status for ${path}:`, response.status);
                    
                    if (response.ok) {
                        htmlContent = await response.text();
                        loadedPath = path;
                        console.log(`✓ Successfully loaded AITRIX HTML from: ${path}`);
                        console.log('HTML content length:', htmlContent.length);
                        break;
                    } else {
                        console.log(`✗ Failed to load from ${path}: HTTP ${response.status}`);
                    }
                } catch (e) {
                    console.log(`✗ Network error loading from ${path}:`, e.message);
                }
            }
            
            if (!htmlContent) {
                throw new Error('Could not load AITRIX room HTML from any path. All attempts failed.');
            }
            
            // Parse the HTML and extract content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const gameContainer = doc.getElementById('game-container');
            
            if (!gameContainer) {
                console.error('HTML content does not contain #game-container');
                console.log('Available elements:', Array.from(doc.querySelectorAll('[id]')).map(el => el.id));
                throw new Error('Game container not found in HTML');
            }
            
            console.log('✓ Found game container with content length:', gameContainer.innerHTML.length);
            
            // Extract and add styles
            const styles = doc.querySelectorAll('style');
            console.log(`Found ${styles.length} style elements`);
            
            styles.forEach((style, index) => {
                const styleId = `aitrix-styles-${index}`;
                if (!document.getElementById(styleId)) {
                    const newStyle = document.createElement('style');
                    newStyle.id = styleId;
                    newStyle.setAttribute('data-room', 'aitrix');
                    newStyle.textContent = style.textContent;
                    document.head.appendChild(newStyle);
                    console.log(`✓ Added style block ${index + 1}`);
                } else {
                    console.log(`Style block ${index + 1} already exists`);
                }
            });
            
            // Set the container content
            container.innerHTML = gameContainer.innerHTML;
            console.log('✓ Container content set, length:', container.innerHTML.length);
            
            // Verify the required elements are present
            const difficultyScreen = container.querySelector('#difficulty-screen');
            const levelScreen = container.querySelector('#level-screen');
            const gameScreen = container.querySelector('#game-screen');
            
            console.log('Element verification:', {
                difficultyScreen: !!difficultyScreen,
                levelScreen: !!levelScreen,
                gameScreen: !!gameScreen
            });
            
            if (!difficultyScreen || !levelScreen || !gameScreen) {
                throw new Error('Required game screens not found in loaded HTML');
            }
            
            // Initialize the lab
            if (window.AitrixLab) {
                console.log('✓ AitrixLab class available, initializing...');
                this.roomInstances['aitrix'] = new AitrixLab();
                
                // Setup integration after a short delay
                setTimeout(() => {
                    this.setupAitrixLabIntegration();
                }, 300);
            } else {
                throw new Error('AitrixLab class not available after script load');
            }
            
        } catch (error) {
            console.error('✗ Error loading AITRIX room:', error);
            this.createAitrixFallback(container);
        }
    }

    setupAitrixLabIntegration() {
        const aitrixLab = this.roomInstances['aitrix'];
        const container = this.roomContainers['aitrix'];
        
        if (!aitrixLab || !container) {
            console.error('✗ AITRIX lab or container not available for integration');
            return;
        }
        
        console.log('Setting up AITRIX integration...');
        console.log('Container innerHTML length:', container.innerHTML.length);
        
        try {
            // Initialize the lab with the container
            aitrixLab.init(container);
            
            // Setup command center navigation
            this.setupCommandCenterNavigation(container, 'aitrix');
            
            console.log('✓ AITRIX integration completed successfully');
            
            // Ensure the difficulty screen is visible after initialization
            setTimeout(() => {
                const difficultyScreen = container.querySelector('#difficulty-screen');
                if (difficultyScreen) {
                    console.log('🔧 Ensuring AITRIX difficulty screen visibility...');
                    difficultyScreen.style.display = 'flex';
                    difficultyScreen.classList.remove('hidden');
                    console.log('Difficulty screen display:', difficultyScreen.style.display);
                    console.log('Difficulty screen classes:', difficultyScreen.className);
                }
            }, 100);
            
        } catch (error) {
            console.error('✗ Error setting up AITRIX integration:', error);
            this.createAitrixFallback(container);
        }
    }

    // =============================================
    // SCHEMAX ROOM METHODS
    // =============================================

    async loadSchemaxRoom() {
        const container = this.roomContainers['schemax'] || this.roomContainers['database'];
        
        console.log('Loading SCHEMAX room...');
        
        // Load the game script first with correct path resolution
        if (!window.SchemaxLab) {
            console.log('Loading SCHEMAX lab script...');
            try {
                // Determine the correct script path based on current location
                const currentPath = window.location.pathname;
                let scriptPath;
                
                console.log('Current path for SCHEMAX script loading:', currentPath);
                
                if (currentPath.includes('/src/pages/')) {
                    // We're in a subfolder like /src/pages/command-center.html
                    scriptPath = '../../static/js/schemax-game.js';
                } else if (currentPath === '/' || currentPath.includes('index.html')) {
                    // We're at the root
                    scriptPath = './static/js/schemax-game.js';
                } else {
                    // Default fallback
                    scriptPath = '/static/js/schemax-game.js';
                }
                
                console.log('Attempting to load SCHEMAX script from:', scriptPath);
                await this.loadScript(scriptPath);
                console.log('SCHEMAX lab script loaded successfully');
            } catch (error) {
                console.error('Failed to load SCHEMAX lab script:', error);
                // Try alternative paths if the first one fails
                console.log('Trying alternative SCHEMAX script paths...');
                const alternativePaths = [
                    './static/js/schemax-game.js',
                    '../static/js/schemax-game.js', 
                    '../../static/js/schemax-game.js',
                    '/static/js/schemax-game.js',
                    'static/js/schemax-game.js',
                    './js/schemax-game.js',
                    '../js/schemax-game.js'
                ];
                
                let scriptLoaded = false;
                for (const altPath of alternativePaths) {
                    try {
                        console.log(`Trying SCHEMAX script path: ${altPath}`);
                        await this.loadScript(altPath);
                        console.log(`✓ SCHEMAX script loaded successfully from: ${altPath}`);
                        scriptLoaded = true;
                        break;
                    } catch (altError) {
                        console.log(`✗ Failed to load SCHEMAX from: ${altPath}`, altError.message);
                    }
                }
                
                if (!scriptLoaded) {
                    console.error('All SCHEMAX script loading attempts failed');
                    this.createSchemaxFallback(container);
                    return;
                }
            }
        }

        try {
            // Get the current page's base path for HTML loading
            const currentPath = window.location.pathname;
            let basePath;
            
            if (currentPath.includes('/src/pages/')) {
                basePath = '../../';
            } else if (currentPath === '/' || currentPath.includes('index.html')) {
                basePath = './';
            } else {
                basePath = '/';
            }
            
            // Try multiple possible paths for the HTML file
            const possiblePaths = [
                `${basePath}src/rooms/schemax-room.html`,
                './src/rooms/schemax-room.html',
                '../src/rooms/schemax-room.html',
                '/src/rooms/schemax-room.html',
                '../../src/rooms/schemax-room.html',
                'src/rooms/schemax-room.html'
            ];
            
            console.log('Current path:', currentPath);
            console.log('Base path:', basePath);
            console.log('Trying SCHEMAX HTML paths:', possiblePaths);
            
            let htmlContent = null;
            let loadedPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Attempting to fetch SCHEMAX HTML from: ${path}`);
                    const response = await fetch(path);
                    console.log(`Response status for ${path}:`, response.status);
                    
                    if (response.ok) {
                        htmlContent = await response.text();
                        loadedPath = path;
                        console.log(`✓ Successfully loaded SCHEMAX HTML from: ${path}`);
                        console.log('HTML content length:', htmlContent.length);
                        break;
                    } else {
                        console.log(`✗ Failed to load from ${path}: HTTP ${response.status}`);
                    }
                } catch (e) {
                    console.log(`✗ Network error loading from ${path}:`, e.message);
                }
            }
            
            if (!htmlContent) {
                throw new Error('Could not load SCHEMAX room HTML from any path. All attempts failed.');
            }
            
            // Parse the HTML and extract content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const gameContainer = doc.getElementById('game-container');
            
            if (!gameContainer) {
                console.error('HTML content does not contain #game-container');
                console.log('Available elements:', Array.from(doc.querySelectorAll('[id]')).map(el => el.id));
                throw new Error('Game container not found in HTML');
            }
            
            console.log('✓ Found game container with content length:', gameContainer.innerHTML.length);
            
            // Extract and add styles
            const styles = doc.querySelectorAll('style');
            console.log(`Found ${styles.length} style elements`);
            
            styles.forEach((style, index) => {
                const styleId = `schemax-styles-${index}`;
                if (!document.getElementById(styleId)) {
                    const newStyle = document.createElement('style');
                    newStyle.id = styleId;
                    newStyle.setAttribute('data-room', 'schemax');
                    newStyle.textContent = style.textContent;
                    document.head.appendChild(newStyle);
                    console.log(`✓ Added style block ${index + 1}`);
                } else {
                    console.log(`Style block ${index + 1} already exists`);
                }
            });
            
            // Set the container content
            container.innerHTML = gameContainer.innerHTML;
            console.log('✓ Container content set, length:', container.innerHTML.length);
            
            // Verify the required elements are present
            const difficultyScreen = container.querySelector('#difficulty-screen');
            const levelScreen = container.querySelector('#level-screen');
            const gameScreen = container.querySelector('#game-screen');
            
            console.log('Element verification:', {
                difficultyScreen: !!difficultyScreen,
                levelScreen: !!levelScreen,
                gameScreen: !!gameScreen
            });
            
            if (!difficultyScreen || !levelScreen || !gameScreen) {
                throw new Error('Required game screens not found in loaded HTML');
            }
            
            // Initialize the lab
            if (window.SchemaxLab) {
                console.log('✓ SchemaxLab class available, initializing...');
                this.roomInstances['schemax'] = new SchemaxLab();
                
                // Setup integration after a short delay
                setTimeout(() => {
                    this.setupSchemaxLabIntegration();
                }, 300);
            } else {
                throw new Error('SchemaxLab class not available after script load');
            }
            
        } catch (error) {
            console.error('✗ Error loading SCHEMAX room:', error);
            this.createSchemaxFallback(container);
        }
    }

    setupSchemaxLabIntegration() {
        const schemaxLab = this.roomInstances['schemax'];
        const container = this.roomContainers['schemax'];
        
        if (!schemaxLab || !container) {
            console.error('✗ SCHEMAX lab or container not available for integration');
            return;
        }
        
        console.log('Setting up SCHEMAX integration...');
        console.log('Container innerHTML length:', container.innerHTML.length);
        
        try {
            // Initialize the lab with the container
            schemaxLab.init(container);
            
            // Setup command center navigation
            this.setupCommandCenterNavigation(container, 'schemax');
            
            console.log('✓ SCHEMAX integration completed successfully');
            
            // Ensure the difficulty screen is visible after initialization
            setTimeout(() => {
                const difficultyScreen = container.querySelector('#difficulty-screen');
                if (difficultyScreen) {
                    console.log('🔧 Ensuring SCHEMAX difficulty screen visibility...');
                    difficultyScreen.style.display = 'flex';
                    difficultyScreen.classList.remove('hidden');
                    console.log('Difficulty screen display:', difficultyScreen.style.display);
                    console.log('Difficulty screen classes:', difficultyScreen.className);
                }
            }, 100);
            
        } catch (error) {
            console.error('✗ Error setting up SCHEMAX integration:', error);
            this.createSchemaxFallback(container);
        }
    }

    // =============================================
    // CODEVANCE ROOM METHODS
    // =============================================

    async loadCodevanceRoom() {
        const container = this.roomContainers['codevance'];
        
        console.log('Loading CODEVANCE room...');
        
        // Load the game script first with correct path resolution
        if (!window.CodevanceLab) {
            console.log('Loading CODEVANCE lab script...');
            try {
                // Determine the correct script path based on current location
                const currentPath = window.location.pathname;
                let scriptPath;
                
                console.log('Current path for CODEVANCE script loading:', currentPath);
                
                if (currentPath.includes('/src/pages/')) {
                    // We're in a subfolder like /src/pages/command-center.html
                    scriptPath = '../../static/js/codevance-game.js';
                } else if (currentPath === '/' || currentPath.includes('index.html')) {
                    // We're at the root
                    scriptPath = './static/js/codevance-game.js';
                } else {
                    // Default fallback
                    scriptPath = '/static/js/codevance-game.js';
                }
                
                console.log('Attempting to load CODEVANCE script from:', scriptPath);
                await this.loadScript(scriptPath);
                console.log('CODEVANCE lab script loaded successfully');
            } catch (error) {
                console.error('Failed to load CODEVANCE lab script:', error);
                // Try alternative paths if the first one fails
                console.log('Trying alternative CODEVANCE script paths...');
                const alternativePaths = [
                    './static/js/codevance-game.js',
                    '../static/js/codevance-game.js', 
                    '../../static/js/codevance-game.js',
                    '/static/js/codevance-game.js',
                    'static/js/codevance-game.js',
                    './js/codevance-game.js',
                    '../js/codevance-game.js'
                ];
                
                let scriptLoaded = false;
                for (const altPath of alternativePaths) {
                    try {
                        console.log(`Trying CODEVANCE script path: ${altPath}`);
                        await this.loadScript(altPath);
                        console.log(`✓ CODEVANCE script loaded successfully from: ${altPath}`);
                        scriptLoaded = true;
                        break;
                    } catch (altError) {
                        console.log(`✗ Failed to load CODEVANCE from: ${altPath}`, altError.message);
                    }
                }
                
                if (!scriptLoaded) {
                    console.error('All CODEVANCE script loading attempts failed');
                    this.createCodevanceFallback(container);
                    return;
                }
            }
        }

        try {
            // Get the current page's base path for HTML loading
            const currentPath = window.location.pathname;
            let basePath;
            
            if (currentPath.includes('/src/pages/')) {
                basePath = '../../';
            } else if (currentPath === '/' || currentPath.includes('index.html')) {
                basePath = './';
            } else {
                basePath = '/';
            }
            
            // Try multiple possible paths for the HTML file
            const possiblePaths = [
                `${basePath}src/rooms/codevance-room.html`,
                './src/rooms/codevance-room.html',
                '../src/rooms/codevance-room.html',
                '/src/rooms/codevance-room.html',
                '../../src/rooms/codevance-room.html',
                'src/rooms/codevance-room.html'
            ];
            
            console.log('Current path:', currentPath);
            console.log('Base path:', basePath);
            console.log('Trying CODEVANCE HTML paths:', possiblePaths);
            
            let htmlContent = null;
            let loadedPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Attempting to fetch CODEVANCE HTML from: ${path}`);
                    const response = await fetch(path);
                    console.log(`Response status for ${path}:`, response.status);
                    
                    if (response.ok) {
                        htmlContent = await response.text();
                        loadedPath = path;
                        console.log(`✓ Successfully loaded CODEVANCE HTML from: ${path}`);
                        console.log('HTML content length:', htmlContent.length);
                        break;
                    } else {
                        console.log(`✗ Failed to load from ${path}: HTTP ${response.status}`);
                    }
                } catch (e) {
                    console.log(`✗ Network error loading from ${path}:`, e.message);
                }
            }
            
            if (!htmlContent) {
                throw new Error('Could not load CODEVANCE room HTML from any path. All attempts failed.');
            }
            
            // Parse the HTML and extract content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const gameContainer = doc.getElementById('game-container');
            
            if (!gameContainer) {
                console.error('HTML content does not contain #game-container');
                console.log('Available elements:', Array.from(doc.querySelectorAll('[id]')).map(el => el.id));
                throw new Error('Game container not found in HTML');
            }
            
            console.log('✓ Found game container with content length:', gameContainer.innerHTML.length);
            
            // Extract and add styles
            const styles = doc.querySelectorAll('style');
            console.log(`Found ${styles.length} style elements`);
            
            styles.forEach((style, index) => {
                const styleId = `codevance-styles-${index}`;
                if (!document.getElementById(styleId)) {
                    const newStyle = document.createElement('style');
                    newStyle.id = styleId;
                    newStyle.setAttribute('data-room', 'codevance');
                    newStyle.textContent = style.textContent;
                    document.head.appendChild(newStyle);
                    console.log(`✓ Added style block ${index + 1}`);
                } else {
                    console.log(`Style block ${index + 1} already exists`);
                }
            });
            
            // Set the container content
            container.innerHTML = gameContainer.innerHTML;
            console.log('✓ Container content set, length:', container.innerHTML.length);
            
            // Verify the required elements are present
            const difficultyScreen = container.querySelector('#difficulty-screen');
            const levelScreen = container.querySelector('#level-screen');
            const gameScreen = container.querySelector('#game-screen');
            
            console.log('Element verification:', {
                difficultyScreen: !!difficultyScreen,
                levelScreen: !!levelScreen,
                gameScreen: !!gameScreen
            });
            
            if (!difficultyScreen || !levelScreen || !gameScreen) {
                throw new Error('Required game screens not found in loaded HTML');
            }
            
            // Initialize the lab
            if (window.CodevanceLab) {
                console.log('✓ CodevanceLab class available, initializing...');
                this.roomInstances['codevance'] = new CodevanceLab();
                
                // Setup integration after a short delay
                setTimeout(() => {
                    this.setupCodevanceLabIntegration();
                }, 300);
            } else {
                throw new Error('CodevanceLab class not available after script load');
            }
            
        } catch (error) {
            console.error('✗ Error loading CODEVANCE room:', error);
            this.createCodevanceFallback(container);
        }
    }

    setupCodevanceLabIntegration() {
        const codevanceLab = this.roomInstances['codevance'];
        const container = this.roomContainers['codevance'];
        
        if (!codevanceLab || !container) {
            console.error('✗ CODEVANCE lab or container not available for integration');
            return;
        }
        
        console.log('Setting up CODEVANCE integration...');
        console.log('Container innerHTML length:', container.innerHTML.length);
        
        try {
            // Initialize the lab with the container
            codevanceLab.init(container);
            
            // Setup command center navigation
            this.setupCommandCenterNavigation(container, 'codevance');
            
            console.log('✓ CODEVANCE integration completed successfully');
            
            // Ensure the difficulty screen is visible after initialization
            setTimeout(() => {
                const difficultyScreen = container.querySelector('#difficulty-screen');
                if (difficultyScreen) {
                    console.log('🔧 Ensuring CODEVANCE difficulty screen visibility...');
                    difficultyScreen.style.display = 'flex';
                    difficultyScreen.classList.remove('hidden');
                    console.log('Difficulty screen display:', difficultyScreen.style.display);
                    console.log('Difficulty screen classes:', difficultyScreen.className);
                }
            }, 100);
            
        } catch (error) {
            console.error('✗ Error setting up CODEVANCE integration:', error);
            this.createCodevanceFallback(container);
        }
    }

    createFlowchartFallback(container) {
        console.log('Creating FlowByte fallback interface');
        container.innerHTML = `
            <div class="room-placeholder">
                <button class="back-to-command" onclick="window.commandCenter.showCommandDashboard()">
                    ← Back to Command Center
                </button>
                <div class="room-header" style="border-color: #005FFB;">
                    <i class="bi bi-diagram-3" style="color: #005FFB;"></i>
                    <h2>FLOWBYTE</h2>
                </div>
                <div class="room-description">
                    <p>Flowchart Logic Training Room</p>
                </div>
                <div class="coming-soon">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Loading Error</h3>
                    <p>Unable to load the FLOWBYTE room content. Please refresh the page and try again.</p>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
        this.roomInstances['flowchart'] = { type: 'fallback' };
    }

    createNetxusFallback(container) {
        console.log('Creating NETXUS fallback interface');
        container.innerHTML = `
            <div class="room-placeholder">
                <button class="back-to-command" onclick="window.commandCenter.showCommandDashboard()">
                    ← Back to Command Center
                </button>
                <div class="room-header" style="border-color: #00A949;">
                    <i class="bi bi-hdd-network" style="color: #00A949;"></i>
                    <h2>NETXUS</h2>
                </div>
                <div class="room-description">
                    <p>Network Engineering Training Room</p>
                </div>
                <div class="coming-soon">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Loading Error</h3>
                    <p>Unable to load the NETXUS room content. Please refresh the page and try again.</p>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
        this.roomInstances['netxus'] = { type: 'fallback' };
    }

    createAitrixFallback(container) {
        console.log('Creating AITRIX fallback interface');
        container.innerHTML = `
            <div class="room-placeholder">
                <button class="back-to-command" onclick="window.commandCenter.showCommandDashboard()">
                    ← Back to Command Center
                </button>
                <div class="room-header" style="border-color: #E08300;">
                    <i class="bi bi-robot" style="color: #E08300;"></i>
                    <h2>AITRIX</h2>
                </div>
                <div class="room-description">
                    <p>AI & Machine Learning Training Room</p>
                </div>
                <div class="coming-soon">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Loading Error</h3>
                    <p>Unable to load the AITRIX room content. Please refresh the page and try again.</p>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
        this.roomInstances['aitrix'] = { type: 'fallback' };
    }

    // =============================================
    // FALLBACK METHODS
    // =============================================

    createSchemaxFallback(container) {
        console.log('Creating SCHEMAX fallback interface');
        container.innerHTML = `
            <div class="room-placeholder">
                <button class="back-to-command" onclick="window.commandCenter.showCommandDashboard()">
                    ← Back to Command Center
                </button>
                <div class="room-header" style="border-color: #FF3600;">
                    <i class="bi bi-database" style="color: #FF3600;"></i>
                    <h2>SCHEMAX</h2>
                </div>
                <div class="room-description">
                    <p>Database Schema Design Training Room</p>
                </div>
                <div class="coming-soon">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Script Loading Error</h3>
                    <p>Unable to load the SCHEMAX game script. This might be due to:</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>Missing schemax-game.js file</li>
                        <li>Incorrect file path configuration</li>
                        <li>Network connectivity issues</li>
                    </ul>
                    <p><strong>Expected file location:</strong> /static/js/schemax-game.js</p>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #FF3600; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                    <button onclick="window.commandCenter.loadSchemaxRoom()" style="margin-top: 5px; margin-left: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Retry Load
                    </button>
                </div>
            </div>
        `;
        this.roomInstances['schemax'] = { type: 'fallback' };
    }

    createCodevanceFallback(container) {
        console.log('Creating CODEVANCE fallback interface');
        container.innerHTML = `
            <div class="room-placeholder">
                <button class="back-to-command" onclick="window.commandCenter.showCommandDashboard()">
                    ← Back to Command Center
                </button>
                <div class="room-header" style="border-color: #DC3545;">
                    <i class="bi bi-code-slash" style="color: #DC3545;"></i>
                    <h2>CODEVANCE</h2>
                </div>
                <div class="room-description">
                    <p>Programming Challenges Training Room</p>
                </div>
                <div class="coming-soon">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Script Loading Error</h3>
                    <p>Unable to load the CODEVANCE game script. This might be due to:</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>Missing codevance-game.js file</li>
                        <li>Incorrect file path configuration</li>
                        <li>Network connectivity issues</li>
                    </ul>
                    <p><strong>Expected file location:</strong> /static/js/codevance-game.js</p>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #DC3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                    <button onclick="window.commandCenter.loadCodevanceRoom()" style="margin-top: 5px; margin-left: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Retry Load
                    </button>
                </div>
            </div>
        `;
        this.roomInstances['codevance'] = { type: 'fallback' };
    }

    // =============================================
    // DASHBOARD METHODS
    // =============================================

    createCommandDashboard() {
        console.log('🎮 Creating command dashboard...');
        console.log('Room progress keys:', Object.keys(this.roomProgress));
        
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

        dashboard.innerHTML = this.generateDashboardHTML();
        this.addDashboardStyles();
        
        return dashboard;
    }

    generateDashboardHTML() {
        const roomKeys = Object.keys(this.roomProgress);
        console.log('🎯 Generating dashboard with room keys:', roomKeys);
        
        const roomCards = roomKeys.map(roomType => {
            console.log(`Creating card for room: ${roomType}`);
            const card = this.createRoomCard(roomType);
            console.log(`Card created for ${roomType}:`, !!card);
            return card;
        }).join('');
        
        console.log('Total room cards HTML length:', roomCards.length);
        
        return `
            <div class="dashboard-header">
                <h2><i class="bi bi-command"></i> Command Center Overview</h2>
                <p>Monitor and access all training modules from this central hub</p>
            </div>
            
            <div class="room-grid">
                ${roomCards}
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
    }

    createRoomCard(roomType) {
        console.log(`🃏 Creating room card for: ${roomType}`);
        const room = this.roomConfig.info[roomType];
        console.log(`Room config found:`, !!room, room);
        
        if (!room) {
            console.error(`❌ No room config found for: ${roomType}`);
            console.error('Available room configs:', Object.keys(this.roomConfig.info));
            return '<div class="error">Room config not found</div>';
        }
        
        const progress = this.roomProgress[roomType] || { completion: 0, status: 'Not Started', lastPlayed: false, score: 0, level: 1, timeSpent: 0 };
        console.log(`Progress for ${roomType}:`, progress);
        
        // Format time spent
        const formatTime = (seconds) => {
            if (seconds < 60) return `${seconds}s`;
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
            return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
        };
        
        // Get completion status with more details
        const getStatusDetails = () => {
            if (progress.completion >= 100) {
                return { text: 'Completed', color: '#4CAF50', icon: 'bi-check-circle-fill' };
            } else if (progress.completion > 0) {
                return { text: `Level ${progress.level}`, color: '#FFA726', icon: 'bi-play-circle-fill' };
            } else {
                return { text: 'Not Started', color: '#757575', icon: 'bi-circle' };
            }
        };
        
        const statusDetails = getStatusDetails();
        
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
                            <div class="progress-fill" style="width: ${progress.completion}%; background: linear-gradient(90deg, ${room.color} 0%, ${room.color}99 100%);"></div>
                        </div>
                        <div class="progress-text">
                            <span class="progress-percentage">${progress.completion}%</span>
                            <span class="progress-status" style="color: ${statusDetails.color};">
                                <i class="bi ${statusDetails.icon}"></i> ${statusDetails.text}
                            </span>
                        </div>
                        <div class="room-stats">
                            <div class="stat-item">
                                <i class="bi bi-trophy"></i>
                                <span>${progress.score || 0} pts</span>
                            </div>
                            ${progress.timeSpent > 0 ? `
                            <div class="stat-item">
                                <i class="bi bi-clock"></i>
                                <span>${formatTime(progress.timeSpent)}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="room-status ${progress.completion >= 100 ? 'completed' : 'available'}" style="background: ${statusDetails.color};">
                    ${progress.completion >= 100 ? 'Completed' : 
                      (roomType === 'flowchart' || roomType === 'netxus' || roomType === 'aitrix' || roomType === 'schemax' || roomType === 'codevance') ? 'Available' : 'Coming Soon'}
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
                    align-items: center;
                    font-size: 0.9em;
                    margin-bottom: 10px;
                }
                
                .progress-percentage {
                    font-weight: bold;
                    color: white;
                }
                
                .progress-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.85em;
                    font-weight: 500;
                }
                
                .room-stats {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.8em;
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .stat-item i {
                    font-size: 0.9em;
                    opacity: 0.7;
                }
                
                .room-status.completed {
                    background: #4CAF50 !important;
                }
                
                .room-status.available {
                    background: #2196F3;
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

    // =============================================
    // UTILITY METHODS
    // =============================================

    async updateRoomProgress(roomType, progressData = {}) {
        // Update last played status locally
        Object.keys(this.roomProgress).forEach(room => {
            this.roomProgress[room].lastPlayed = room === roomType;
        });
        
        // Use progress tracker to update server and cache
        if (this.progressTracker) {
            try {
                const updateData = {
                    progress_percentage: progressData.progress || this.roomProgress[roomType]?.completion || 0,
                    score: progressData.score || 0,
                    current_level: progressData.level || 1,
                    time_spent: progressData.timeSpent || 0,
                    attempts: progressData.attempts || 1,
                    ...progressData
                };
                
                await this.progressTracker.updateProgress(roomType, updateData);
                console.log(`✅ Progress updated for ${roomType}:`, updateData);
            } catch (error) {
                console.error(`❌ Failed to update progress for ${roomType}:`, error);
                // Fall back to local storage
                this.saveRoomStateLocal(roomType);
            }
        } else {
            // Fallback to local storage
            this.saveRoomStateLocal(roomType);
        }
    }

    saveRoomStateLocal(roomType) {
        // Legacy local storage save for backwards compatibility
        this.roomStates[roomType] = {
            lastAccessed: Date.now(),
            instance: this.roomInstances[roomType]
        };
        
        localStorage.setItem('commandCenterRoomStates', JSON.stringify(this.roomStates));
        localStorage.setItem('commandCenterRoomProgress', JSON.stringify(this.roomProgress));
    }

    // Method for games to call when user makes progress
    async reportProgress(roomType, progressData) {
        if (!roomType) {
            console.warn('Room type is required for progress reporting');
            return;
        }
        
        try {
            // Update progress via progress tracker
            await this.updateRoomProgress(roomType, progressData);
            
            // Show progress notification
            this.showProgressNotification(roomType, progressData);
            
            console.log(`📊 Progress reported for ${roomType}:`, progressData);
        } catch (error) {
            console.error(`❌ Error reporting progress for ${roomType}:`, error);
        }
    }

    showProgressNotification(roomType, progressData) {
        const roomDisplayName = this.roomConfig.names[roomType] || roomType;
        let message = '';
        
        if (progressData.completed) {
            message = `🎉 ${roomDisplayName} completed! Score: ${progressData.score || 0}`;
        } else if (progressData.progress) {
            message = `📈 ${roomDisplayName} progress: ${progressData.progress}%`;
        } else if (progressData.score) {
            message = `⭐ ${roomDisplayName} score: +${progressData.score} points`;
        } else {
            message = `✅ Progress saved for ${roomDisplayName}`;
        }
        
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = 'progress-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(16, 161, 250, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`Script ${src} already loaded`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            
            script.onload = () => {
                console.log(`✓ Script loaded: ${src}`);
                
                // Verify the correct class is available based on the script
                let classAvailable = false;
                let className = '';
                
                if (src.includes('flowchart-game')) {
                    classAvailable = !!window.FlowByteGame;
                    className = 'FlowByteGame';
                } else if (src.includes('aitrix-game')) {
                    classAvailable = !!window.AitrixLab;
                    className = 'AitrixLab';
                } else if (src.includes('schemax-game')) {
                    classAvailable = !!window.SchemaxLab;
                    className = 'SchemaxLab';
                } else if (src.includes('netxus')) {
                    classAvailable = !!window.NetxusLab;
                    className = 'NetxusLab';
                } else if (src.includes('codevance-game')) {
                    classAvailable = !!window.CodevanceLab;
                    className = 'CodevanceLab';
                } else {
                    // Generic check - assume success if no specific class needed
                    classAvailable = true;
                }
                
                if (classAvailable) {
                    console.log(`✓ ${className || 'Script'} class available after load`);
                    resolve();
                } else {
                    const error = new Error(`${className} class not found after script load`);
                    console.error(`✗ ${className} class not available after script load`);
                    reject(error);
                }
            };
            
            script.onerror = () => {
                const error = new Error(`Failed to load script: ${src}`);
                console.error(`✗ Failed to load script: ${src}`);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }

    loadUserInfo() {
        const username = localStorage.getItem('currentUser');
        const email = localStorage.getItem('currentEmail');
        
        if (username) {
            const profileUsername = document.getElementById('profileUsername');
            const profileEmail = document.getElementById('profileEmail');
            
            if (profileUsername) profileUsername.textContent = username; 
            if (profileEmail) profileEmail.textContent = email || 'No email provided';
        }
    }
}

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, creating Command Center...');
    window.commandCenter = new CommandCenter();
});