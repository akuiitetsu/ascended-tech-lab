// ============================================
// MOBILE UTILITIES FOR NETXUS LAB
// ============================================

const NetxusMobileUtils = {
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
        const interactiveElements = document.querySelectorAll('.device, .tool-btn, .difficulty-btn, button, .btn, .network-node');
        
        interactiveElements.forEach(element => {
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
    
    init() {
        this.setupMobileViewport();
        this.enhanceTouchFeedback();
        
        if (this.isMobile()) {
            document.body.classList.add('mobile-device');
        }
    }
};

class NetxusLab {
    constructor() {
        this.currentDifficulty = null;
        this.currentLab = null;
        this.container = null;
        this.initialized = false;
        this.challengeStartTime = null;
        this.roomStartTime = null;
        this.score = 0;
        this.attempts = 0;
        
        // Initialize mobile enhancements
        NetxusMobileUtils.init();
        
        // Simulation state
        this.devices = [];
        this.cables = [];
        this.selectedDevice = null;
        this.connectionMode = false;
        this.connectionSource = null;
        this.deviceCounter = 0;
        this.canvas = null;
        this.draggedDevice = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Current tool/mode
        this.currentTool = 'select';
        
        this.labCategories = {
            easy: {
                name: 'Easy Labs',
                description: 'Basic networking fundamentals with step-by-step guidance',
                labs: [
                    {
                        name: 'Basic Device Connectivity',
                        objective: 'Connect 2 PCs to a switch and test connectivity',
                        difficulty: 'Beginner',
                        estimatedTime: '15 minutes'
                    },
                    {
                        name: 'Router-to-PC Connectivity',
                        objective: 'Connect PC to router interface and test connectivity',
                        difficulty: 'Beginner',
                        estimatedTime: '20 minutes'
                    },
                    {
                        name: 'Adding a Second Network',
                        objective: 'Multiple PCs in same LAN using a switch',
                        difficulty: 'Beginner',
                        estimatedTime: '25 minutes'
                    },
                    {
                        name: 'Default Gateway Setup',
                        objective: '2 PCs in different networks using a router',
                        difficulty: 'Beginner',
                        estimatedTime: '30 minutes'
                    },
                    {
                        name: 'Basic DHCP Configuration',
                        objective: 'Router as DHCP server with automatic IP assignment',
                        difficulty: 'Beginner',
                        estimatedTime: '35 minutes'
                    }
                ]
            },
            hard: {
                name: 'Advanced Labs',
                description: 'Complex networking scenarios with advanced configurations',
                labs: [
                    {
                        name: 'Inter-VLAN Routing',
                        objective: 'VLAN 10 and VLAN 20 with router-on-a-stick',
                        difficulty: 'Advanced',
                        estimatedTime: '45 minutes'
                    },
                    {
                        name: 'Static Routing Between Routers',
                        objective: 'Enable communication between two different LANs',
                        difficulty: 'Advanced',
                        estimatedTime: '50 minutes'
                    },
                    {
                        name: 'Small Office LAN',
                        objective: '1 Router, 2 Switches, 4 PCs with DHCP',
                        difficulty: 'Advanced',
                        estimatedTime: '60 minutes'
                    },
                    {
                        name: 'Configuring Wireless LAN',
                        objective: 'Wireless router with SSID and WPA2 security',
                        difficulty: 'Advanced',
                        estimatedTime: '40 minutes'
                    },
                    {
                        name: 'Access Control List (ACL)',
                        objective: 'Restrict access between network segments',
                        difficulty: 'Expert',
                        estimatedTime: '55 minutes'
                    }
                ]
            }
        };

        this.labInstructions = {
            easy: {
                1: this.generateBasicConnectivityLab(),
                2: this.generateRouterConnectivityLab(),
                3: this.generateSecondNetworkLab(),
                4: this.generateDefaultGatewayLab(),
                5: this.generateBasicDHCPLab()
            },
            hard: {
                1: this.generateInterVLANLab(),
                2: this.generateStaticRoutingLab(),
                3: this.generateSmallOfficeLab(),
                4: this.generateWirelessLab(),
                5: this.generateACLLab()
            }
        };
    }

    init(container = null) {
        console.log('🌐 NetxusLab.init() called');
        console.log('Container provided:', container ? 'YES' : 'NO');
        console.log('Container type:', container ? container.constructor.name : 'N/A');
        
        this.container = container || document;
        
        if (!this.container) {
            console.error('❌ No valid container provided to NetxusLab.init()');
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
                this.showDifficultySelection();
                
                this.initialized = true;
                console.log('🎉 NetxusLab initialized successfully!');
            } catch (error) {
                console.error('❌ Error during NetxusLab initialization:', error);
            }
        };
        
        // Start the initialization process
        console.log('🚀 Starting initialization process...');
        initWhenReady();
    }

    setupEventListeners() {
        console.log('🎛️ Setting up NETXUS event listeners...');
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
                    console.log('🟢 Easy labs selected');
                    this.selectDifficulty('easy');
                });
                
                newHardBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🔴 Advanced labs selected');
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
                    this.showDifficultySelection();
                });
                console.log('✅ Back to difficulty button setup');
            }

            const backToLabsBtn = container.querySelector('#back-to-levels-btn');
            if (backToLabsBtn) {
                // Create a new button to ensure clean event handling
                const newBackToLabsBtn = backToLabsBtn.cloneNode(true);
                backToLabsBtn.parentNode.replaceChild(newBackToLabsBtn, backToLabsBtn);
                
                newBackToLabsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Navigating back to lab selection');
                    this.showLabSelection();
                });
                console.log('✅ Back to labs button setup');
            }

            // Lab control buttons
            this.setupLabControlButtons(container);
            
            console.log('✅ All NETXUS event listeners setup complete');
            
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    setupLabControlButtons(container) {
        const buttons = [
            { id: '#complete-lab-btn', handler: () => this.completeLab() },
            { id: '#abort-mission-btn', handler: () => this.abortMission() },
            { id: '#get-hint-btn', handler: () => this.showHint() },
            { id: '#reset-lab-btn', handler: () => this.resetLab() }
        ];
        
        buttons.forEach(({ id, handler }) => {
            const btn = container.querySelector(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }

    showScreen(screenId) {
        console.log('📺 NETXUS showScreen:', screenId);
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
        } else {
            console.error(`❌ Screen ${screenId} not found in container`);
        }
    }

    showDifficultySelection() {
        console.log('🌐 Showing difficulty selection...');
        this.showScreen('difficulty-screen');
    }

    selectDifficulty(difficulty) {
        console.log('Difficulty selected:', difficulty);
        this.currentDifficulty = difficulty;
        this.showLabSelection();
    }

    showLabSelection() {
        console.log('Showing lab selection for difficulty:', this.currentDifficulty);
        
        if (!this.currentDifficulty) {
            console.error('No difficulty selected');
            return;
        }
        
        const categoryData = this.labCategories[this.currentDifficulty];
        const container = this.container;
        
        // Update header
        const titleElement = container.querySelector('#difficulty-title');
        const descElement = container.querySelector('#difficulty-description');
        
        if (titleElement) titleElement.textContent = `NETXUS - ${categoryData.name}`;
        if (descElement) descElement.textContent = categoryData.description;
        
        // Populate level grid
        const labGrid = container.querySelector('#level-grid');
        if (labGrid) {
            labGrid.innerHTML = categoryData.labs.map((lab, index) => `
                <div class="level-card" data-lab="${index + 1}">
                    <div class="level-number">${index + 1}</div>
                    <h3>${lab.name}</h3>
                    <p><strong>Objective:</strong> ${lab.objective}</p>
                    <p><strong>Time:</strong> ${lab.estimatedTime}</p>
                    <p><strong>Difficulty:</strong> ${lab.difficulty}</p>
                </div>
            `).join('');
            
            // Add click handlers to level cards
            labGrid.querySelectorAll('.level-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lab = parseInt(card.dataset.lab);
                    console.log('Lab selected:', lab);
                    this.startLab(lab);
                });
            });
        }
        
        this.showScreen('level-screen');
    }

    startLab(labNumber) {
        console.log('Starting lab:', labNumber);
        this.currentLab = labNumber;
        this.attempts = 0;
        
        // Initialize timing
        this.challengeStartTime = Date.now();
        if (!this.roomStartTime) {
            this.roomStartTime = Date.now();
        }
        
        this.initializeSimulation();
        this.displayLabInstructions();
        this.updateLabInterface();
        this.showScreen('game-screen');
        console.log('Lab interface initialized successfully');
    }

    initializeSimulation() {
        // Reset simulation state
        this.devices = [];
        this.cables = [];
        this.selectedDevice = null;
        this.connectionMode = false;
        this.connectionSource = null;
        this.deviceCounter = 0;
        
        // Get canvas element
        this.canvas = this.container.querySelector('#network-canvas');
        if (this.canvas) {
            this.setupSimulationEventListeners();
            this.setupDeviceToolbar();
            this.clearCanvas();
        }
        
        // Set global reference for device configuration callbacks
        window.netxusLab = this;
    }

    setupSimulationEventListeners() {
        // Canvas click events
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        // Device drag events
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });

        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });

        // Simulation controls
        const clearBtn = this.container.querySelector('#clear-workspace-btn');
        const testBtn = this.container.querySelector('#test-configuration-btn');
        const connectionBtn = this.container.querySelector('#connection-mode-btn');

        if (clearBtn) clearBtn.addEventListener('click', () => this.clearCanvas());
        if (testBtn) testBtn.addEventListener('click', () => this.testConfiguration());
        if (connectionBtn) connectionBtn.addEventListener('click', () => this.toggleConnectionMode());
    }

    setupDeviceToolbar() {
        const toolbar = this.container.querySelector('.device-toolbar');
        if (!toolbar) return;

        // Add click handlers to existing device buttons
        toolbar.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceType = btn.dataset.device;
                this.selectDeviceTool(deviceType);
            });
        });
    }

    selectDeviceTool(deviceType) {
        this.currentTool = deviceType;
        this.connectionMode = false;
        
        // Update toolbar visual state
        this.container.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = this.container.querySelector(`[data-device="${deviceType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.canvas.style.cursor = 'crosshair';
        this.showFeedback(`Click on the workspace to place a ${deviceType}`, 'info');
    }

    toggleConnectionMode() {
        this.connectionMode = !this.connectionMode;
        this.currentTool = this.connectionMode ? 'connect' : 'select';
        
        const btn = this.container.querySelector('#connection-mode-btn');
        if (btn) {
            btn.classList.toggle('active', this.connectionMode);
            btn.textContent = this.connectionMode ? 'Exit Connect' : 'Connect Devices';
        }
        
        this.canvas.classList.toggle('connection-mode', this.connectionMode);
        
        if (this.connectionMode) {
            this.showFeedback('Click on two devices to connect them', 'info');
        } else {
            this.connectionSource = null;
            this.showFeedback('Connection mode disabled', 'info');
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a device
        const clickedDevice = this.getDeviceAtPosition(x, y);

        if (clickedDevice) {
            if (this.connectionMode) {
                this.handleDeviceConnection(clickedDevice);
            } else {
                this.selectDevice(clickedDevice);
            }
            return;
        }

        // Place device if tool selected
        if (this.currentTool && this.currentTool !== 'select' && this.currentTool !== 'connect') {
            this.placeDevice(this.currentTool, x, y);
        } else {
            // Deselect current selection
            this.selectedDevice = null;
            this.updateDeviceSelection();
        }
    }

    getDeviceAtPosition(x, y) {
        return this.devices.find(device => {
            return x >= device.x && x <= device.x + device.width &&
                   y >= device.y && y <= device.y + device.height;
        });
    }

    placeDevice(deviceType, x, y) {
        const device = {
            id: `${deviceType}-${++this.deviceCounter}`,
            type: deviceType,
            name: `${deviceType.toUpperCase()}${this.deviceCounter}`,
            x: x - 30, // Center the device
            y: y - 30,
            width: 60,
            height: 60,
            interfaces: this.getDefaultInterfaces(deviceType),
            configuration: this.getDefaultConfiguration(deviceType)
        };

        this.devices.push(device);
        this.renderDevice(device);
        this.showFeedback(`${device.name} placed successfully`, 'success');
        
        // Reset tool selection
        this.currentTool = 'select';
        this.canvas.style.cursor = 'default';
        this.container.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    getDefaultInterfaces(deviceType) {
        const interfaces = {
            pc: [{ name: 'FastEthernet0', type: 'ethernet', connected: false }],
            laptop: [{ name: 'Wireless0', type: 'wireless', connected: false }],
            router: [
                { name: 'GigabitEthernet0/0', type: 'ethernet', connected: false },
                { name: 'GigabitEthernet0/1', type: 'ethernet', connected: false },
                { name: 'Serial0/0/0', type: 'serial', connected: false }
            ],
            switch: Array.from({ length: 24 }, (_, i) => ({
                name: `FastEthernet0/${i + 1}`,
                type: 'ethernet',
                connected: false
            })),
            server: [{ name: 'FastEthernet0', type: 'ethernet', connected: false }],
            wireless: [
                { name: 'FastEthernet0', type: 'ethernet', connected: false },
                { name: 'Wireless0', type: 'wireless', connected: false }
            ]
        };
        
        return interfaces[deviceType] || [];
    }

    getDefaultConfiguration(deviceType) {
        const configs = {
            pc: {
                ipAddress: '',
                subnetMask: '255.255.255.0',
                defaultGateway: '',
                dnsServer: '8.8.8.8',
                dhcp: false
            },
            laptop: {
                ipAddress: '',
                subnetMask: '255.255.255.0',
                defaultGateway: '',
                dnsServer: '8.8.8.8',
                dhcp: false,
                ssid: '',
                wifiPassword: ''
            },
            router: {
                hostname: `Router${this.deviceCounter}`,
                interfaces: {},
                dhcpPools: [],
                routes: [],
                accessLists: [],
                enablePassword: 'cisco',
                running: true
            },
            switch: {
                hostname: `Switch${this.deviceCounter}`,
                vlans: [{ id: 1, name: 'default' }],
                interfaces: {}
            },
            server: {
                ipAddress: '',
                subnetMask: '255.255.255.0',
                defaultGateway: '',
                services: ['HTTP', 'FTP', 'DNS']
            },
            wireless: {
                ssid: 'TechLab',
                security: 'WPA2',
                password: '12345',
                ipAddress: '192.168.1.1',
                subnetMask: '255.255.255.0',
                dhcpEnabled: true
            }
        };
        
        return configs[deviceType] || {};
    }

    renderDevice(device) {
        const deviceElement = document.createElement('div');
        deviceElement.className = `network-device device-${device.type}`;
        deviceElement.id = device.id;
        deviceElement.style.cssText = `
            position: absolute;
            left: ${device.x}px;
            top: ${device.y}px;
            width: ${device.width}px;
            height: ${device.height}px;
            background: var(--bg-panel, #2d3748);
            border: 2px solid var(--color-cyan, #00b8d8);
            border-radius: 8px;
            padding: 8px;
            cursor: move;
            user-select: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.3s ease;
            z-index: 10;
            box-sizing: border-box;
        `;
        
        deviceElement.innerHTML = `
            <div class="device-icon" style="font-size: 1.5rem; color: var(--color-cyan, #00b8d8); margin-bottom: 4px;">
                <i class="bi ${this.getDeviceIcon(device.type)}"></i>
            </div>
            <div class="device-name" style="font-size: 0.7rem; color: white; text-align: center; line-height: 1.1;">
                ${device.name}
            </div>
        `;

        // Add double-click for configuration
        deviceElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.openDeviceConfiguration(device);
        });

        // Add hover effects
        deviceElement.addEventListener('mouseenter', () => {
            deviceElement.style.borderColor = 'var(--color-green, #38a169)';
            deviceElement.style.boxShadow = '0 4px 12px rgba(0, 184, 216, 0.3)';
        });

        deviceElement.addEventListener('mouseleave', () => {
            if (!deviceElement.classList.contains('selected')) {
                deviceElement.style.borderColor = 'var(--color-cyan, #00b8d8)';
                deviceElement.style.boxShadow = 'none';
            }
        });

        this.canvas.appendChild(deviceElement);
    }

    getDeviceIcon(deviceType) {
        const icons = {
            pc: 'bi-pc-display',
            laptop: 'bi-laptop',
            router: 'bi-router',
            switch: 'bi-hdd-network',
            server: 'bi-server',
            wireless: 'bi-wifi'
        };
        
        return icons[deviceType] || 'bi-question-circle';
    }

    handleMouseDown(e) {
        const target = e.target.closest('.network-device');
        if (!target) return;
        
        const deviceId = target.id;
        const device = this.devices.find(d => d.id === deviceId);
        
        if (device) {
            this.startDrag(device, e);
        }
    }

    startDrag(device, e) {
        this.draggedDevice = device;
        const deviceElement = document.getElementById(device.id);
        const rect = deviceElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        deviceElement.style.zIndex = '1000';
        deviceElement.classList.add('dragging');
        this.canvas.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (!this.draggedDevice) return;
        
        e.preventDefault();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        let x = e.clientX - canvasRect.left - this.dragOffset.x;
        let y = e.clientY - canvasRect.top - this.dragOffset.y;
        
        // Constrain to canvas bounds
        x = Math.max(0, Math.min(x, canvasRect.width - this.draggedDevice.width));
        y = Math.max(0, Math.min(y, canvasRect.height - this.draggedDevice.height));
        
        // Update device position
        this.draggedDevice.x = x;
        this.draggedDevice.y = y;
        
        const deviceElement = document.getElementById(this.draggedDevice.id);
        deviceElement.style.left = `${x}px`;
        deviceElement.style.top = `${y}px`;
        
        // Update any connections to this device
        this.updateDeviceConnections(this.draggedDevice.id);
    }

    handleMouseUp(e) {
        if (!this.draggedDevice) return;
        
        const deviceElement = document.getElementById(this.draggedDevice.id);
        deviceElement.style.zIndex = '';
        deviceElement.classList.remove('dragging');
        this.canvas.style.cursor = 'default';
        
        this.draggedDevice = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    handleDeviceConnection(device) {
        if (!this.connectionSource) {
            this.connectionSource = device;
            this.selectDevice(device);
            this.showFeedback(`Selected ${device.name} as source. Click another device to connect.`, 'info');
        } else if (this.connectionSource.id !== device.id) {
            this.createConnection(this.connectionSource, device);
            this.connectionSource = null;
            this.selectedDevice = null;
            this.updateDeviceSelection();
        }
    }

    createConnection(sourceDevice, targetDevice) {
        // Check if connection already exists
        const existingConnection = this.cables.find(cable => 
            (cable.source === sourceDevice.id && cable.target === targetDevice.id) ||
            (cable.source === targetDevice.id && cable.target === sourceDevice.id)
        );

        if (existingConnection) {
            this.showFeedback('Devices are already connected!', 'warning');
            return;
        }

        // Determine cable type
        const cableType = this.determineCableType(sourceDevice, targetDevice);
        
        const cable = {
            id: `cable-${sourceDevice.id}-${targetDevice.id}`,
            source: sourceDevice.id,
            target: targetDevice.id,
            type: cableType,
            connected: true
        };

        this.cables.push(cable);
        this.renderCable(cable);
        
        // Update device interfaces
        this.updateDeviceInterfaces(sourceDevice, targetDevice, cable);
        
        this.showFeedback(`Connected ${sourceDevice.name} to ${targetDevice.name} with ${cableType} cable`, 'success');
    }

    determineCableType(device1, device2) {
        // Simplified cable type determination
        const sameType = device1.type === device2.type;
        
        if (sameType && (device1.type === 'pc' || device1.type === 'router')) {
            return 'crossover';
        } else if (device1.type === 'router' && device2.type === 'router') {
            return 'serial';
        } else {
            return 'straight';
        }
    }

    updateDeviceInterfaces(sourceDevice, targetDevice, cable) {
        // Find available interfaces and mark as connected
        const sourceInterface = sourceDevice.interfaces.find(iface => !iface.connected);
        const targetInterface = targetDevice.interfaces.find(iface => !iface.connected);
        
        if (sourceInterface) sourceInterface.connected = true;
        if (targetInterface) targetInterface.connected = true;
    }

    renderCable(cable) {
        const sourceDevice = this.devices.find(d => d.id === cable.source);
        const targetDevice = this.devices.find(d => d.id === cable.target);
        
        if (!sourceDevice || !targetDevice) return;

        const svg = this.canvas.querySelector('#network-cables');
        if (!svg) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('id', cable.id);
        line.setAttribute('class', `network-cable cable-${cable.type}`);
        line.setAttribute('x1', sourceDevice.x + 30);
        line.setAttribute('y1', sourceDevice.y + 30);
        line.setAttribute('x2', targetDevice.x + 30);
        line.setAttribute('y2', targetDevice.y + 30);
        line.setAttribute('stroke', this.getCableColor(cable.type));
        line.setAttribute('stroke-width', '3');

        svg.appendChild(line);
    }

    getCableColor(cableType) {
        const colors = {
            straight: 'var(--color-green, #38a169)',
            crossover: 'var(--color-orange, #dd6b20)',
            serial: 'var(--color-red, #e53e3e)'
        };
        return colors[cableType] || 'var(--color-green, #38a169)';
    }

    updateDeviceConnections(deviceId) {
        // Find all connections involving this device and redraw them
        const connectionsToUpdate = this.cables.filter(conn => 
            conn.source === deviceId || conn.target === deviceId
        );
        
        connectionsToUpdate.forEach(connection => {
            const sourceDevice = this.devices.find(n => n.id === connection.source);
            const targetDevice = this.devices.find(n => n.id === connection.target);
            
            if (sourceDevice && targetDevice) {
                // Update connection visual
                const line = document.getElementById(connection.id);
                if (line) {
                    line.setAttribute('x1', sourceDevice.x + 30);
                    line.setAttribute('y1', sourceDevice.y + 30);
                    line.setAttribute('x2', targetDevice.x + 30);
                    line.setAttribute('y2', targetDevice.y + 30);
                }
            }
        });
    }

    selectDevice(device) {
        // Clear previous selection
        if (this.selectedDevice) {
            const prevElement = document.getElementById(this.selectedDevice.id);
            if (prevElement) {
                prevElement.classList.remove('selected');
                prevElement.style.borderColor = 'var(--color-cyan, #00b8d8)';
                prevElement.style.boxShadow = 'none';
            }
        }
        
        this.selectedDevice = device;
        const deviceElement = document.getElementById(device.id);
        if (deviceElement) {
            deviceElement.classList.add('selected');
            deviceElement.style.borderColor = 'var(--color-orange, #dd6b20)';
            deviceElement.style.boxShadow = '0 4px 12px rgba(221, 107, 32, 0.5)';
        }
    }

    updateDeviceSelection() {
        this.container.querySelectorAll('.network-device').forEach(element => {
            element.classList.remove('selected');
            element.style.borderColor = 'var(--color-cyan, #00b8d8)';
            element.style.boxShadow = 'none';
        });
    }

    openDeviceConfiguration(device) {
        const modal = document.createElement('div');
        modal.className = 'device-config-modal';
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
            z-index: 1000;
        `;
        modal.innerHTML = this.generateConfigurationUI(device);

        document.body.appendChild(modal);

        // Setup modal event listeners
        this.setupConfigurationModal(modal, device);
    }

    generateConfigurationUI(device) {
        const deviceName = device.name;
        const deviceType = device.type;

        let configContent = '';

        switch (deviceType) {
            case 'pc':
            case 'laptop':
                configContent = this.generatePCConfiguration(device);
                break;
            case 'router':
                configContent = this.generateRouterConfiguration(device);
                break;
            case 'switch':
                configContent = this.generateSwitchConfiguration(device);
                break;
            default:
                configContent = '<div class="config-section">Configuration panel for this device coming soon...</div>';
        }

        return `
            <div class="config-panel" style="
                background: var(--bg-panel, #2d3748);
                border: 2px solid var(--color-cyan, #00b8d8);
                border-radius: 12px;
                padding: 20px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="config-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--color-cyan, #00b8d8);
                ">
                    <h3 style="margin: 0; color: var(--color-cyan, #00b8d8);">Configure ${deviceName}</h3>
                    <button class="config-close" style="
                        background: var(--color-red, #e53e3e);
                        border: none;
                        border-radius: 4px;
                        color: white;
                        padding: 4px 8px;
                        cursor: pointer;
                    ">&times;</button>
                </div>
                
                <div class="config-content" style="color: white;">
                    ${configContent}
                </div>
            </div>
        `;
    }

    generatePCConfiguration(device) {
        const config = device.configuration;
        
        return `
            <div class="config-section" style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: var(--color-green, #38a169); font-size: 1rem;">IP Configuration</h4>
                <div class="config-form" style="display: grid; gap: 10px;">
                    <div class="form-group" style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: center;">
                        <label style="font-size: 0.9rem; color: #ccc;">Configuration:</label>
                        <select id="ip-mode" style="padding: 6px 10px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.9rem;">
                            <option value="static" ${!config.dhcp ? 'selected' : ''}>Static</option>
                            <option value="dhcp" ${config.dhcp ? 'selected' : ''}>DHCP</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="static-config" style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: center; ${config.dhcp ? 'opacity: 0.5;' : ''}">
                        <label style="font-size: 0.9rem; color: #ccc;">IP Address:</label>
                        <input type="text" id="ip-address" value="${config.ipAddress || ''}" placeholder="192.168.1.10" style="padding: 6px 10px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.9rem;" ${config.dhcp ? 'disabled' : ''}>
                    </div>
                    
                    <div class="form-group" id="subnet-config" style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: center; ${config.dhcp ? 'opacity: 0.5;' : ''}">
                        <label style="font-size: 0.9rem; color: #ccc;">Subnet Mask:</label>
                        <input type="text" id="subnet-mask" value="${config.subnetMask || '255.255.255.0'}" placeholder="255.255.255.0" style="padding: 6px 10px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.9rem;" ${config.dhcp ? 'disabled' : ''}>
                    </div>
                    
                    <div class="form-group" id="gateway-config" style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: center; ${config.dhcp ? 'opacity: 0.5;' : ''}">
                        <label style="font-size: 0.9rem; color: #ccc;">Default Gateway:</label>
                        <input type="text" id="default-gateway" value="${config.defaultGateway || ''}" placeholder="192.168.1.1" style="padding: 6px 10px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.9rem;" ${config.dhcp ? 'disabled' : ''}>
                    </div>
                    
                    <div class="form-group" style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: center;">
                        <label style="font-size: 0.9rem; color: #ccc;">DNS Server:</label>
                        <input type="text" id="dns-server" value="${config.dnsServer || '8.8.8.8'}" placeholder="8.8.8.8" style="padding: 6px 10px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.9rem;">
                    </div>
                </div>
                
                <button class="sim-btn" onclick="window.netxusLab.applyPCConfiguration('${device.id}')" style="
                    margin-top: 15px;
                    padding: 10px 20px;
                    background: var(--color-green, #38a169);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">
                    Apply Configuration
                </button>
            </div>

            <div class="config-section" style="
                background: rgba(0, 184, 216, 0.1);
                border: 1px solid var(--color-cyan, #00b8d8);
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
            ">
                <h4 style="margin: 0 0 10px 0; color: var(--color-cyan, #00b8d8);">Connectivity Test</h4>
                <input type="text" id="ping-target" placeholder="IP Address to ping" style="
                    width: 100%;
                    margin-bottom: 10px;
                    padding: 6px 10px;
                    background: var(--bg-main, #1a202c);
                    border: 1px solid #3d3d3d;
                    border-radius: 4px;
                    color: white;
                ">
                <button class="sim-btn" onclick="window.netxusLab.performPingTest('${device.id}')" style="
                    padding: 8px 16px;
                    background: var(--color-blue, #3182ce);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 10px;
                ">
                    Ping Test
                </button>
                <div id="ping-results" style="margin-top: 10px; font-family: monospace; font-size: 0.8rem;"></div>
            </div>
        `;
    }

    generateRouterConfiguration(device) {
        return `
            <div class="config-section" style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: var(--color-green, #38a169);">Interface Configuration</h4>
                <div id="router-interfaces">
                    ${device.interfaces.map(iface => `
                        <div class="interface-config" style="margin-bottom: 15px; padding: 10px; border: 1px solid #3d3d3d; border-radius: 4px;">
                            <h5 style="margin: 0 0 10px 0; color: var(--color-orange, #dd6b20);">${iface.name}</h5>
                            <div style="display: grid; gap: 8px;">
                                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; align-items: center;">
                                    <label style="font-size: 0.8rem;">IP Address:</label>
                                    <input type="text" id="${iface.name}-ip" placeholder="192.168.1.1" style="padding: 4px 8px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.8rem;">
                                </div>
                                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; align-items: center;">
                                    <label style="font-size: 0.8rem;">Subnet Mask:</label>
                                    <input type="text" id="${iface.name}-mask" placeholder="255.255.255.0" style="padding: 4px 8px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.8rem;">
                                </div>
                                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; align-items: center;">
                                    <label style="font-size: 0.8rem;">Status:</label>
                                    <select id="${iface.name}-status" style="padding: 4px 8px; background: var(--bg-main, #1a202c); border: 1px solid #3d3d3d; border-radius: 4px; color: white; font-size: 0.8rem;">
                                        <option value="up">No Shutdown (Up)</option>
                                        <option value="down" selected>Shutdown (Down)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button class="sim-btn" onclick="window.netxusLab.applyRouterConfiguration('${device.id}')" style="
                    padding: 10px 20px;
                    background: var(--color-green, #38a169);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">
                    Apply Interface Configuration
                </button>
            </div>

            <div class="config-section" style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: var(--color-green, #38a169);">CLI Terminal</h4>
                <div class="cli-terminal" id="router-cli" style="
                    background: #000;
                    border: 1px solid var(--color-cyan, #00b8d8);
                    border-radius: 4px;
                    padding: 10px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.8rem;
                    color: #00ff00;
                    height: 150px;
                    overflow-y: auto;
                    margin: 10px 0;
                ">
                    <div>Router&gt; </div>
                </div>
                
                <div style="display: flex; margin-top: 5px;">
                    <span style="color: #00ff00; margin-right: 5px; font-family: 'Courier New', monospace;">Router&gt;</span>
                    <input type="text" id="cli-input-${device.id}" placeholder="Enter command..." 
                           onkeypress="if(event.key==='Enter') window.netxusLab.executeCommand('${device.id}', this.value)"
                           style="flex: 1; background: #000; border: none; color: #00ff00; font-family: 'Courier New', monospace; font-size: 0.8rem; outline: none;">
                </div>
            </div>
        `;
    }

    generateSwitchConfiguration(device) {
        return `
            <div class="config-section">
                <h4 style="color: var(--color-green, #38a169);">Switch Configuration</h4>
                <p>Switch configuration interface coming soon...</p>
                <p>Available features:</p>
                <ul>
                    <li>VLAN Configuration</li>
                    <li>Port Management</li>
                    <li>Trunk Configuration</li>
                </ul>
            </div>
        `;
    }

    setupConfigurationModal(modal, device) {
        const closeBtn = modal.querySelector('.config-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Setup DHCP toggle for PC/Laptop
        if (device.type === 'pc' || device.type === 'laptop') {
            const ipModeSelect = modal.querySelector('#ip-mode');
            if (ipModeSelect) {
                ipModeSelect.addEventListener('change', (e) => {
                    const isDHCP = e.target.value === 'dhcp';
                    const staticFields = modal.querySelectorAll('#static-config, #subnet-config, #gateway-config');
                    
                    staticFields.forEach(field => {
                        field.style.opacity = isDHCP ? '0.5' : '1';
                        const inputs = field.querySelectorAll('input');
                        inputs.forEach(input => {
                            input.disabled = isDHCP;
                        });
                    });
                });
            }
        }
    }

    // Device configuration methods
    applyPCConfiguration(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;

        const dhcpMode = document.getElementById('ip-mode').value === 'dhcp';
        
        device.configuration.dhcp = dhcpMode;
        
        if (!dhcpMode) {
            device.configuration.ipAddress = document.getElementById('ip-address').value;
            device.configuration.subnetMask = document.getElementById('subnet-mask').value;
            device.configuration.defaultGateway = document.getElementById('default-gateway').value;
        } else {
            // Simulate DHCP assignment
            device.configuration.ipAddress = this.assignDHCPAddress(device);
            device.configuration.subnetMask = '255.255.255.0';
            device.configuration.defaultGateway = this.findDHCPGateway();
        }
        
        device.configuration.dnsServer = document.getElementById('dns-server').value;

        this.showFeedback(`${device.name} configuration applied successfully`, 'success');
        
        // Close modal
        const modal = document.querySelector('.device-config-modal');
        if (modal) modal.remove();
    }

    applyRouterConfiguration(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;

        device.interfaces.forEach(iface => {
            const ipInput = document.getElementById(`${iface.name}-ip`);
            const maskInput = document.getElementById(`${iface.name}-mask`);
            const statusSelect = document.getElementById(`${iface.name}-status`);

            if (ipInput && maskInput && statusSelect) {
                device.configuration.interfaces[iface.name] = {
                    ipAddress: ipInput.value,
                    subnetMask: maskInput.value,
                    status: statusSelect.value
                };
            }
        });

        this.showFeedback(`${device.name} interfaces configured successfully`, 'success');
        
        // Close modal
        const modal = document.querySelector('.device-config-modal');
        if (modal) modal.remove();
    }

    executeCommand(deviceId, command) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;

        const cli = document.getElementById('router-cli');
        const input = document.getElementById(`cli-input-${deviceId}`);
        
        if (!cli || !input) return;

        // Add command to CLI history
        const commandDiv = document.createElement('div');
        commandDiv.textContent = `Router> ${command}`;
        cli.appendChild(commandDiv);

        // Process command
        const response = this.processRouterCommand(device, command);
        
        if (response) {
            const responseDiv = document.createElement('div');
            responseDiv.innerHTML = response.replace(/\n/g, '<br>');
            cli.appendChild(responseDiv);
        }

        // Clear input
        input.value = '';
        
        // Scroll to bottom
        cli.scrollTop = cli.scrollHeight;
    }

    processRouterCommand(device, command) {
        const cmd = command.trim().toLowerCase();
        
        if (cmd === 'enable') {
            return '';
        } else if (cmd === 'configure terminal' || cmd === 'conf t') {
            return '';
        } else if (cmd.startsWith('interface') || cmd.startsWith('int')) {
            return '';
        } else if (cmd.startsWith('ip address')) {
            return '';
        } else if (cmd === 'no shutdown') {
            return '%LINK-5-CHANGED: Interface up, line protocol is up';
        } else if (cmd === 'shutdown') {
            return '%LINK-5-CHANGED: Interface down, line protocol is down';
        } else if (cmd === 'show ip interface brief' || cmd === 'sh ip int br') {
            return this.generateInterfaceStatus(device);
        } else if (cmd === 'show running-config' || cmd === 'sh run') {
            return this.generateRunningConfig(device);
        } else if (cmd.startsWith('ping')) {
            const target = cmd.split(' ')[1];
            return this.simulateRouterPing(device, target);
        } else if (cmd === 'exit') {
            return '';
        } else {
            return `% Invalid input detected at '^' marker.`;
        }
    }

    generateInterfaceStatus(device) {
        let status = 'Interface                  IP-Address      OK? Method Status                Protocol\n';
        
        Object.entries(device.configuration.interfaces).forEach(([ifaceName, config]) => {
            const ip = config.ipAddress || 'unassigned';
            const statusText = config.status === 'up' ? 'up' : 'administratively down';
            const protocol = config.status === 'up' ? 'up' : 'down';
            
            status += `${ifaceName.padEnd(25)} ${ip.padEnd(15)} YES manual ${statusText.padEnd(20)} ${protocol}\n`;
        });
        
        return status;
    }

    generateRunningConfig(device) {
        let config = 'Building configuration...\n\nCurrent configuration:\n!\nversion 15.1\n!\nhostname ' + device.configuration.hostname + '\n!\n';
        
        Object.entries(device.configuration.interfaces).forEach(([ifaceName, ifaceConfig]) => {
            if (ifaceConfig.ipAddress) {
                config += `interface ${ifaceName}\n`;
                config += ` ip address ${ifaceConfig.ipAddress} ${ifaceConfig.subnetMask}\n`;
                config += ifaceConfig.status === 'up' ? ' no shutdown\n' : ' shutdown\n';
                config += '!\n';
            }
        });
        
        return config;
    }

    simulateRouterPing(device, target) {
        if (!target) {
            return '% Bad IP address or hostname';
        }

        // Simulate ping response
        if (this.isReachableFromRouter(device, target)) {
            return `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/4 ms`;
        } else {
            return `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)`;
        }
    }

    assignDHCPAddress(device) {
        // Find DHCP servers (routers with DHCP enabled)
        const dhcpServers = this.devices.filter(d => 
            d.type === 'router' && d.configuration.dhcpPools && d.configuration.dhcpPools.length > 0
        );

        if (dhcpServers.length > 0) {
            // Return an IP from the first available DHCP pool
            return '192.168.1.100'; // Simplified
        }

        return '169.254.1.1'; // APIPA address
    }

    findDHCPGateway() {
        // Find the default gateway from DHCP configuration
        return '192.168.1.1'; // Simplified
    }

    performPingTest(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        const target = document.getElementById('ping-target').value;
        const resultsDiv = document.getElementById('ping-results');

        if (!target) {
            resultsDiv.innerHTML = '<div style="color: red;">Please enter a target IP address</div>';
            return;
        }

        // Simulate ping test
        const success = this.simulatePing(device, target);
        
        if (success) {
            resultsDiv.innerHTML = `
                <div style="color: #52b788; margin-top: 10px;">
                    <div>Pinging ${target}:</div>
                    <div>Reply from ${target}: bytes=32 time<1ms TTL=128</div>
                    <div>Reply from ${target}: bytes=32 time<1ms TTL=128</div>
                    <div>Reply from ${target}: bytes=32 time<1ms TTL=128</div>
                    <div>Reply from ${target}: bytes=32 time<1ms TTL=128</div>
                    <div style="margin-top: 5px;">Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)</div>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div style="color: #e63946; margin-top: 10px;">
                    <div>Pinging ${target}:</div>
                    <div>Request timed out.</div>
                    <div>Request timed out.</div>
                    <div>Request timed out.</div>
                    <div>Request timed out.</div>
                    <div style="margin-top: 5px;">Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)</div>
                </div>
            `;
        }
    }

    simulatePing(sourceDevice, targetIp) {
        // Find target device with matching IP
        const targetDevice = this.devices.find(d => 
            d.configuration.ipAddress === targetIp
        );

        if (!targetDevice) return false;

        // Check if devices are on same network or have routing
        return this.isReachable(sourceDevice, targetDevice);
    }

    isReachable(source, target) {
        // Simplified reachability check
        if (!source.configuration.ipAddress || !target.configuration.ipAddress) {
            return false;
        }

        // Check if on same subnet
        const sourceNetwork = this.getNetworkAddress(source.configuration.ipAddress, source.configuration.subnetMask);
        const targetNetwork = this.getNetworkAddress(target.configuration.ipAddress, target.configuration.subnetMask);

        if (sourceNetwork === targetNetwork) {
            // Check if connected through switch or directly
            return this.areConnectedThroughSwitch(source, target) || this.areDirectlyConnected(source, target);
        }

        // Check if routing exists (simplified)
        return this.hasRoutingPath(source, target);
    }

    isReachableFromRouter(device, targetIp) {
        // Check if router can reach target IP
        const targetDevice = this.devices.find(d => d.configuration.ipAddress === targetIp);
        
        if (!targetDevice) return false;
        
        // Check if target is on any of the router's directly connected networks
        return Object.values(device.configuration.interfaces).some(iface => {
            if (!iface.ipAddress) return false;
            
            const routerNetwork = this.getNetworkAddress(iface.ipAddress, iface.subnetMask);
            const targetNetwork = this.getNetworkAddress(targetIp, targetDevice.configuration.subnetMask);
            
            return routerNetwork === targetNetwork;
        });
    }

    getNetworkAddress(ip, mask) {
        // Simplified network address calculation
        const ipParts = ip.split('.').map(Number);
        const maskParts = mask.split('.').map(Number);
        
        return ipParts.map((part, i) => part & maskParts[i]).join('.');
    }

    areConnectedThroughSwitch(device1, device2) {
        // Check if both devices are connected to the same switch
        const switches = this.devices.filter(d => d.type === 'switch');
        
        return switches.some(switchDevice => {
            const device1Connected = this.cables.some(cable => 
                (cable.source === device1.id && cable.target === switchDevice.id) ||
                (cable.target === device1.id && cable.source === switchDevice.id)
            );
            
            const device2Connected = this.cables.some(cable => 
                (cable.source === device2.id && cable.target === switchDevice.id) ||
                (cable.target === device2.id && cable.source === switchDevice.id)
            );
            
            return device1Connected && device2Connected;
        });
    }

    areDirectlyConnected(device1, device2) {
        return this.cables.some(cable => 
            (cable.source === device1.id && cable.target === device2.id) ||
            (cable.target === device1.id && cable.source === device2.id)
        );
    }

    hasRoutingPath(source, target) {
        // Simplified routing path check
        // In a real implementation, this would check routing tables
        return false;
    }

    testConfiguration() {
        const tests = this.currentDifficulty === 'hard' ? 
            this.getAdvancedLabTests(this.currentLab) : 
            this.getLabTests(this.currentLab);
        const results = [];

        tests.forEach(test => {
            const result = this.runTest(test);
            results.push({
                name: test.name,
                status: result.passed ? 'pass' : 'fail',
                message: result.message
            });
        });

        this.displayTestResults(results);
    }

    // Lab instruction generators
    generateBasicConnectivityLab() {
        return `
            <h2>Lab 1: Basic Device Connectivity</h2>
            
            <h3>🎯 Objective</h3>
            <p>Connect 2 PCs to a switch and establish basic network communication using static IP addresses.</p>
            
            <div class="topology-info">
                <h4>📊 Network Topology</h4>
                <p><strong>Devices:</strong></p>
                <ul>
                    <li>2 PCs (PC0, PC1)</li>
                    <li>1 Switch (Switch0)</li>
                    <li>2 Straight-through Ethernet cables</li>
                </ul>
                <p><strong>Connections:</strong></p>
                <ul>
                    <li>PC0 FastEthernet0/0 → Switch0 FastEthernet0/1</li>
                    <li>PC1 FastEthernet0/0 → Switch0 FastEthernet0/2</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Connections</h4>
            <ol>
                <li>Drag 2 PCs and 1 Switch to the workspace</li>
                <li>Use straight-through cables to connect:
                    <ul>
                        <li>PC0 to Switch0 port FastEthernet0/1</li>
                        <li>PC1 to Switch0 port FastEthernet0/2</li>
                    </ul>
                </li>
            </ol>

            <h4>Step 2: Configure PC0</h4>
            <ol>
                <li>Click on PC0 → Desktop → IP Configuration</li>
                <li>Select "Static" IP configuration</li>
                <li>Enter the following:
                    <div class="command-block">
IP Address: 192.168.1.10
Subnet Mask: 255.255.255.0
Default Gateway: (leave blank)
                    </div>
                </li>
                <li>Click "Apply" or press Enter</li>
            </ol>

            <h4>Step 3: Configure PC1</h4>
            <ol>
                <li>Click on PC1 → Desktop → IP Configuration</li>
                <li>Select "Static" IP configuration</li>
                <li>Enter the following:
                    <div class="command-block">
IP Address: 192.168.1.20
Subnet Mask: 255.255.255.0
Default Gateway: (leave blank)
                    </div>
                </li>
                <li>Click "Apply" or press Enter</li>
            </ol>

            <h4>Step 4: Test Connectivity</h4>
            <ol>
                <li>Click on PC0 → Desktop → Command Prompt</li>
                <li>Type the ping command:
                    <div class="command-block">
ping 192.168.1.20
                    </div>
                </li>
                <li>Press Enter and observe the results</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Output</h4>
                <p>You should see successful ping replies:</p>
                <div class="command-block">
Reply from 192.168.1.20: bytes=32 time<1ms TTL=128
Reply from 192.168.1.20: bytes=32 time<1ms TTL=128
Reply from 192.168.1.20: bytes=32 time<1ms TTL=128
Reply from 192.168.1.20: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.1.20:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
                </div>
                <p><strong>What this means:</strong> Both PCs can communicate successfully on the same network segment.</p>
            </div>

            <h3>🔍 Troubleshooting Tips</h3>
            <ul>
                <li><strong>No connectivity:</strong> Check cable connections and IP configurations</li>
                <li><strong>Wrong cable type:</strong> Use straight-through cables for PC-to-switch connections</li>
                <li><strong>IP conflict:</strong> Ensure both PCs have different IP addresses in the same subnet</li>
                <li><strong>Subnet mismatch:</strong> Verify both PCs use the same subnet mask (255.255.255.0)</li>
            </ul>
        `;
    }

    generateRouterConnectivityLab() {
        return `
            <h2>Lab 2: Router-to-PC Connectivity</h2>
            
            <h3>🎯 Objective</h3>
            <p>Connect a PC directly to a router interface and establish communication using static IP addressing.</p>
            
            <div class="topology-info">
                <h4>📊 Network Topology</h4>
                <p><strong>Devices:</strong></p>
                <ul>
                    <li>1 PC (PC0)</li>
                    <li>1 Router (Router0 - 2811 model recommended)</li>
                    <li>1 Straight-through Ethernet cable</li>
                </ul>
                <p><strong>Connections:</strong></p>
                <ul>
                    <li>PC0 FastEthernet0/0 → Router0 FastEthernet0/0</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Connections</h4>
            <ol>
                <li>Drag 1 PC and 1 Router to the workspace</li>
                <li>Use a straight-through cable to connect PC0 to Router0's FastEthernet0/0 port</li>
                <li>Wait for the connection lights to show (they may be red initially)</li>
            </ol>

            <h4>Step 2: Configure Router Interface</h4>
            <ol>
                <li>Click on Router0 → CLI tab</li>
                <li>Press Enter to start, then type the following commands:
                    <div class="command-block">
Router> enable
Router# configure terminal
Router(config)# interface fastEthernet0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown
Router(config-if)# exit
Router(config)# exit
Router# copy running-config startup-config
                    </div>
                </li>
                <li>Press Enter after each command</li>
            </ol>

            <h4>Step 3: Configure PC0</h4>
            <ol>
                <li>Click on PC0 → Desktop → IP Configuration</li>
                <li>Select "Static" IP configuration</li>
                <li>Enter the following:
                    <div class="command-block">
IP Address: 192.168.1.10
Subnet Mask: 255.255.255.0
Default Gateway: 192.168.1.1
                    </div>
                </li>
                <li>Click "Apply"</li>
            </ol>

            <h4>Step 4: Verify Router Configuration</h4>
            <ol>
                <li>On Router0 CLI, type:
                    <div class="command-block">
Router# show ip interface brief
                    </div>
                </li>
                <li>Verify FastEthernet0/0 shows "up/up" status</li>
            </ol>

            <h4>Step 5: Test Connectivity</h4>
            <ol>
                <li>From PC0 → Desktop → Command Prompt</li>
                <li>Test connectivity to the router:
                    <div class="command-block">
ping 192.168.1.1
                    </div>
                </li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Output</h4>
                <p><strong>Router interface status:</strong></p>
                <div class="command-block">
Interface         IP-Address      OK? Method Status                Protocol
FastEthernet0/0   192.168.1.1     YES manual up                    up
FastEthernet0/1   unassigned      YES unset  administratively down down
                </div>
                <p><strong>Ping results:</strong></p>
                <div class="command-block">
Reply from 192.168.1.1: bytes=32 time=1ms TTL=255
Reply from 192.168.1.1: bytes=32 time=1ms TTL=255
Reply from 192.168.1.1: bytes=32 time=1ms TTL=255
Reply from 192.168.1.1: bytes=32 time=1ms TTL=255
                </div>
            </div>

            <h3>🔍 Key Concepts Learned</h3>
            <ul>
                <li><strong>Router Interfaces:</strong> Must be manually configured and enabled</li>
                <li><strong>No Shutdown:</strong> Router interfaces are administratively down by default</li>
                <li><strong>Default Gateway:</strong> PCs need to know the router's IP for external communication</li>
                <li><strong>Interface Status:</strong> Both physical and protocol status must be "up"</li>
            </ul>
        `;
    }

    generateSecondNetworkLab() {
        return `
            <h2>Lab 3: Adding a Second Network</h2>
            
            <h3>🎯 Objective</h3>
            <p>Create a larger LAN with multiple PCs connected through a switch, demonstrating network scalability.</p>
            
            <div class="topology-info">
                <h4>📊 Network Topology</h4>
                <p><strong>Devices:</strong></p>
                <ul>
                    <li>4 PCs (PC0, PC1, PC2, PC3)</li>
                    <li>1 Switch (Switch0 - 2960 model)</li>
                    <li>4 Straight-through Ethernet cables</li>
                </ul>
                <p><strong>Network:</strong> 192.168.10.0/24</p>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Build the Physical Topology</h4>
            <ol>
                <li>Drag 4 PCs and 1 Switch to workspace</li>
                <li>Connect all PCs to the switch using straight-through cables</li>
            </ol>

            <h4>Step 2-5: Configure All PCs</h4>
            <p>Configure each PC with these IP addresses:</p>
            <div class="command-block">
PC0: 192.168.10.11/24
PC1: 192.168.10.12/24
PC2: 192.168.10.13/24
PC3: 192.168.10.14/24
            </div>

            <h4>Step 6: Test Full Connectivity</h4>
            <ol>
                <li>From PC0, ping all other PCs</li>
                <li>Repeat from each PC to verify full mesh connectivity</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>All ping tests should succeed, demonstrating that the switch creates one large collision domain where all devices can communicate.</p>
            </div>
        `;
    }

    generateDefaultGatewayLab() {
        return `
            <h2>Lab 4: Default Gateway Setup</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure two different networks connected through a router, demonstrating inter-network communication.</p>
            
            <div class="topology-info">
                <h4>📊 Network Topology</h4>
                <p><strong>Networks:</strong></p>
                <ul>
                    <li>Network A: 192.168.1.0/24</li>
                    <li>Network B: 192.168.2.0/24</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Configure Router Interfaces</h4>
            <div class="command-block">
Router(config)# interface fastEthernet0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown

Router(config)# interface fastEthernet0/1
Router(config-if)# ip address 192.168.2.1 255.255.255.0
Router(config-if)# no shutdown
            </div>

            <h4>Step 2: Configure PCs</h4>
            <div class="command-block">
PC0 (Network A): 192.168.1.10/24, Gateway: 192.168.1.1
PC1 (Network B): 192.168.2.10/24, Gateway: 192.168.2.1
            </div>

            <h4>Step 3: Test Inter-Network Communication</h4>
            <p>From PC0, ping PC1 to test routing between networks.</p>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>Successful ping between networks demonstrates routing functionality.</p>
            </div>
        `;
    }

    generateBasicDHCPLab() {
        return `
            <h2>Lab 5: Basic DHCP Configuration</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure a router as a DHCP server to automatically assign IP addresses to client PCs.</p>
            
            <div class="topology-info">
                <h4>📊 Network Setup</h4>
                <p><strong>Network:</strong> 192.168.100.0/24</p>
                <p><strong>DHCP Pool:</strong> 192.168.100.10 - 192.168.100.50</p>
            </div>

            <h3>🔧 DHCP Configuration Commands</h3>
            
            <div class="command-block">
Router(config)# ip dhcp pool LAN-POOL
Router(dhcp-config)# network 192.168.100.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.100.1
Router(dhcp-config)# dns-server 8.8.8.8
Router(dhcp-config)# lease 0 12 0

Router(config)# ip dhcp excluded-address 192.168.100.1 192.168.100.9
            </div>

            <h3>🔍 Verification Commands</h3>
            <div class="command-block">
Router# show ip dhcp binding
Router# show ip dhcp pool
Router# show ip dhcp conflict
            </div>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>PCs should automatically receive IP addresses from the DHCP pool when set to DHCP mode.</p>
            </div>
        `;
    }

    // Advanced lab instruction generators for hard challenges
    generateInterVLANLab() {
        return `
            <h2>Lab 1: Inter-VLAN Routing (Router-on-a-Stick)</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure VLANs on a switch and enable communication between them using router subinterfaces.</p>
            
            <div class="topology-info">
                <h4>📊 VLAN Configuration</h4>
                <ul>
                    <li><strong>VLAN 10:</strong> 192.168.10.0/24 (Development Team)</li>
                    <li><strong>VLAN 20:</strong> 192.168.20.0/24 (Security Operations)</li>
                    <li><strong>Trunk Link:</strong> Between switch and router</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Topology</h4>
            <ol>
                <li>Place 1 Router, 1 Switch, and 2 PCs</li>
                <li>Connect PC1 to Switch port Fa0/1</li>
                <li>Connect PC2 to Switch port Fa0/2</li>
                <li>Connect Switch port Fa0/24 to Router Gi0/0 (trunk link)</li>
            </ol>

            <h4>Step 2: Switch VLAN Configuration</h4>
            <p>Configure the switch with VLANs and assign ports:</p>
            <div class="command-block">
Switch(config)# vlan 10
Switch(config-vlan)# name SALES
Switch(config-vlan)# exit

Switch(config)# vlan 20  
Switch(config-vlan)# name MARKETING
Switch(config-vlan)# exit

Switch(config)# interface fa0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10

Switch(config)# interface fa0/2
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 20

Switch(config)# interface fa0/24
Switch(config-if)# switchport mode trunk
            </div>

            <h4>Step 3: Router Subinterface Configuration</h4>
            <p>Configure router subinterfaces for each VLAN:</p>
            <div class="command-block">
Router(config)# interface gi0/0
Router(config-if)# no shutdown

Router(config)# interface gi0/0.10
Router(config-subif)# encapsulation dot1Q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0

Router(config)# interface gi0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0
            </div>

            <h4>Step 4: PC Configuration</h4>
            <div class="command-block">
PC1 (VLAN 10): 
- IP Address: 192.168.10.10
- Subnet Mask: 255.255.255.0
- Default Gateway: 192.168.10.1

PC2 (VLAN 20):
- IP Address: 192.168.20.10  
- Subnet Mask: 255.255.255.0
- Default Gateway: 192.168.20.1
            </div>

            <h4>Step 5: Testing</h4>
            <ol>
                <li>Ping from PC1 to PC2 (should succeed via router)</li>
                <li>Verify with: <code>show vlan brief</code> on switch</li>
                <li>Verify with: <code>show ip interface brief</code> on router</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>Devices in different VLANs should communicate through the router subinterfaces.</p>
            </div>
        `;
    }

    generateStaticRoutingLab() {
        return `
            <h2>Lab 2: Static Routing Between Two Routers</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure static routes between two routers to enable communication between different LANs.</p>
            
            <div class="topology-info">
                <h4>📊 Network Design</h4>
                <ul>
                    <li><strong>Router1 LAN:</strong> 192.168.1.0/24</li>
                    <li><strong>Router2 LAN:</strong> 192.168.2.0/24</li>
                    <li><strong>WAN Link:</strong> 10.0.0.0/30</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Topology</h4>
            <ol>
                <li>Place 2 Routers and 2 PCs</li>
                <li>Connect PC1 to Router1 Gi0/0</li>
                <li>Connect PC2 to Router2 Gi0/0</li>
                <li>Connect Router1 Gi0/1 to Router2 Gi0/1 (WAN link)</li>
            </ol>

            <h4>Step 2: Router1 Configuration</h4>
            <div class="command-block">
Router1(config)# interface gi0/0
Router1(config-if)# ip address 192.168.1.1 255.255.255.0
Router1(config-if)# no shutdown

Router1(config)# interface gi0/1
Router1(config-if)# ip address 10.0.0.1 255.255.255.252
Router1(config-if)# no shutdown

Router1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
            </div>

            <h4>Step 3: Router2 Configuration</h4>
            <div class="command-block">
Router2(config)# interface gi0/0
Router2(config-if)# ip address 192.168.2.1 255.255.255.0
Router2(config-if)# no shutdown

Router2(config)# interface gi0/1
Router2(config-if)# ip address 10.0.0.2 255.255.255.252
Router2(config-if)# no shutdown

Router2(config)# ip route 192.168.1.0 255.255.255.0 10.0.0.1
            </div>

            <h4>Step 4: PC Configuration</h4>
            <div class="command-block">
PC1: IP 192.168.1.10/24, Gateway 192.168.1.1
PC2: IP 192.168.2.10/24, Gateway 192.168.2.1
            </div>

            <h4>Step 5: Verification</h4>
            <ol>
                <li>Check routing tables: <code>show ip route</code></li>
                <li>Ping between PCs across routers</li>
                <li>Verify WAN connectivity: ping router interfaces</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>PCs on different LANs should communicate through static routing.</p>
            </div>
        `;
    }

    generateSmallOfficeLab() {
        return `
            <h2>Lab 3: Small Office LAN Design</h2>
            
            <h3>🎯 Objective</h3>
            <p>Build a comprehensive small office network with redundancy and DHCP services.</p>
            
            <div class="topology-info">
                <h4>📊 Network Components</h4>
                <ul>
                    <li><strong>1 Router:</strong> Gateway with DHCP server</li>
                    <li><strong>2 Switches:</strong> Distribution layer redundancy</li>
                    <li><strong>4 PCs:</strong> End user devices</li>
                    <li><strong>Network Range:</strong> 192.168.50.0/24</li>
                    <li><strong>DHCP Pool:</strong> 192.168.50.100-192.168.50.200</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Layout</h4>
            <ol>
                <li>Place 1 Router at the center</li>
                <li>Place 2 Switches below the router</li>
                <li>Place 2 PCs connected to each switch</li>
                <li>Connect Router Gi0/0 to Switch1 Fa0/24</li>
                <li>Connect Router Gi0/1 to Switch2 Fa0/24</li>
                <li>Connect switches together for redundancy</li>
            </ol>

            <h4>Step 2: Router Interface Configuration</h4>
            <div class="command-block">
Router(config)# interface gi0/0
Router(config-if)# ip address 192.168.50.1 255.255.255.0
Router(config-if)# no shutdown

Router(config)# interface gi0/1
Router(config-if)# ip address 192.168.50.2 255.255.255.0
Router(config-if)# no shutdown
            </div>

            <h4>Step 3: DHCP Configuration</h4>
            <div class="command-block">
Router(config)# ip dhcp pool OFFICE-LAN
Router(dhcp-config)# network 192.168.50.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.50.1
Router(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
Router(dhcp-config)# lease 0 8 0

Router(config)# ip dhcp excluded-address 192.168.50.1 192.168.50.99
            </div>

            <h4>Step 4: PC Configuration</h4>
            <p>Set all PCs to obtain IP addresses automatically via DHCP.</p>

            <h4>Step 5: Testing</h4>
            <ol>
                <li>Verify DHCP assignments: <code>ipconfig</code> on PCs</li>
                <li>Test inter-PC connectivity</li>
                <li>Check DHCP bindings: <code>show ip dhcp binding</code></li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>All PCs receive automatic IP addresses and have full connectivity.</p>
            </div>
        `;
    }

    generateWirelessLab() {
        return `
            <h2>Lab 4: Wireless LAN Configuration</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure a wireless network with proper security and connectivity.</p>
            
            <div class="topology-info">
                <h4>📊 Wireless Setup</h4>
                <ul>
                    <li><strong>SSID:</strong> TechLab</li>
                    <li><strong>Security:</strong> WPA2-PSK</li>
                    <li><strong>Password:</strong> 12345</li>
                    <li><strong>Network:</strong> 192.168.1.0/24</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Setup</h4>
            <ol>
                <li>Place 1 Wireless Router/Access Point</li>
                <li>Place 2 Laptops with wireless adapters</li>
            </ol>

            <h4>Step 2: Wireless Router Configuration</h4>
            <p>Access the wireless router's web interface and configure:</p>
            <div class="command-block">
Wireless Settings:
- SSID: TechLab
- Security Mode: WPA2-PSK
- Passphrase: 12345
- Channel: Auto
- DHCP: Enabled
- IP Range: 192.168.1.100-192.168.1.199
            </div>

            <h4>Step 3: Laptop Wireless Configuration</h4>
            <ol>
                <li>Open wireless network settings on each laptop</li>
                <li>Scan for available networks</li>
                <li>Connect to "TechLab" network</li>
                <li>Enter password: 12345</li>
                <li>Set to obtain IP automatically</li>
            </ol>

            <h4>Step 4: Security Verification</h4>
            <ol>
                <li>Verify WPA2 encryption is active</li>
                <li>Check connected devices list</li>
                <li>Test network isolation if configured</li>
            </ol>

            <h4>Step 5: Connectivity Testing</h4>
            <ol>
                <li>Ping between laptops</li>
                <li>Test internet connectivity (if available)</li>
                <li>Verify IP address assignments</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>Wireless devices connect securely and can communicate with each other.</p>
            </div>
        `;
    }

    generateACLLab() {
        return `
            <h2>Lab 5: Access Control List (ACL) Configuration</h2>
            
            <h3>🎯 Objective</h3>
            <p>Implement access control policies to restrict network traffic between departments.</p>
            
            <div class="topology-info">
                <h4>📊 Security Policy</h4>
                <ul>
                    <li><strong>HR Network:</strong> 192.168.10.0/24</li>
                    <li><strong>IT Network:</strong> 192.168.20.0/24</li>
                    <li><strong>Server Network:</strong> 192.168.30.0/24</li>
                    <li><strong>Policy:</strong> HR cannot access IT servers</li>
                    <li><strong>Policy:</strong> IT can access all networks</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Network Topology</h4>
            <ol>
                <li>Place 1 Router with 3 interfaces</li>
                <li>Place 1 Switch per network segment</li>
                <li>Connect HR PC to HR network</li>
                <li>Connect IT PC to IT network</li>
                <li>Connect Server to server network</li>
            </ol>

            <h4>Step 2: Basic IP Configuration</h4>
            <div class="command-block">
Router Interface Configuration:
- Gi0/0: 192.168.10.1/24 (HR Network)
- Gi0/1: 192.168.20.1/24 (IT Network)  
- Gi0/2: 192.168.30.1/24 (Server Network)

Device IP Assignments:
- HR PC: 192.168.10.10/24, Gateway: 192.168.10.1
- IT PC: 192.168.20.10/24, Gateway: 192.168.20.1
- Server: 192.168.30.10/24, Gateway: 192.168.30.1
            </div>

            <h4>Step 3: Access Control List Configuration</h4>
            <div class="command-block">
Router(config)# access-list 100 deny ip 192.168.10.0 0.0.0.255 192.168.30.0 0.0.0.255
Router(config)# access-list 100 permit ip any any

Router(config)# interface gi0/0
Router(config-if)# ip access-group 100 out
            </div>

            <h4>Step 4: Testing ACL Rules</h4>
            <ol>
                <li>Test HR PC → Server (should fail)</li>
                <li>Test HR PC → IT PC (should succeed)</li>
                <li>Test IT PC → Server (should succeed)</li>
                <li>Test IT PC → HR PC (should succeed)</li>
            </ol>

            <h4>Step 5: Verification Commands</h4>
            <div class="command-block">
Router# show access-lists
Router# show ip interface gi0/0
Router# show access-lists 100
            </div>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>HR devices blocked from server access while maintaining other connectivity.</p>
            </div>
        `;
    }

    getLabTests(labNumber) {
        const labTests = {
            1: [ // Basic Device Connectivity
                {
                    name: 'Two PCs placed',
                    check: () => this.devices.filter(d => d.type === 'pc').length >= 2
                },
                {
                    name: 'Switch placed',
                    check: () => this.devices.filter(d => d.type === 'switch').length >= 1
                },
                {
                    name: 'PCs connected to switch',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        const switches = this.devices.filter(d => d.type === 'switch');
                        if (pcs.length < 2 || switches.length < 1) return false;
                        
                        return pcs.every(pc => 
                            this.cables.some(cable => 
                                (cable.source === pc.id || cable.target === pc.id) &&
                                switches.some(sw => cable.source === sw.id || cable.target === sw.id)
                            )
                        );
                    }
                },
                {
                    name: 'IP addresses configured',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        return pcs.length >= 2 && 
                               pcs.every(pc => pc.configuration.ipAddress && pc.configuration.subnetMask);
                    }
                },
                {
                    name: 'Same subnet configuration',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        if (pcs.length < 2) return false;
                        
                        const networks = pcs.map(pc => 
                            this.getNetworkAddress(pc.configuration.ipAddress, pc.configuration.subnetMask)
                        );
                        
                        return networks.every(net => net === networks[0]);
                    }
                }
            ],
            2: [ // Router-to-PC Connectivity
                {
                    name: 'Router and PC placed',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 1 &&
                                 this.devices.filter(d => d.type === 'pc').length >= 1
                },
                {
                    name: 'Router-PC connection exists',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        
                        return routers.some(router => 
                            pcs.some(pc => this.areDirectlyConnected(router, pc))
                        );
                    }
                },
                {
                    name: 'Router interface configured',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            Object.values(router.configuration.interfaces).some(iface => 
                                iface.ipAddress && iface.status === 'up'
                            )
                        );
                    }
                },
                {
                    name: 'PC IP configuration matches router subnet',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        
                        if (routers.length === 0 || pcs.length === 0) return false;
                        
                        return pcs.some(pc => {
                            if (!pc.configuration.ipAddress) return false;
                            
                            return routers.some(router => 
                                Object.values(router.configuration.interfaces).some(iface => {
                                    if (!iface.ipAddress) return false;
                                    
                                    const pcNetwork = this.getNetworkAddress(pc.configuration.ipAddress, pc.configuration.subnetMask);
                                    const routerNetwork = this.getNetworkAddress(iface.ipAddress, iface.subnetMask);
                                    
                                    return pcNetwork === routerNetwork;
                                })
                            );
                        });
                    }
                }
            ],
            3: [ // Adding a Second Network
                {
                    name: '3-4 PCs placed',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        return pcs.length >= 3 && pcs.length <= 4;
                    }
                },
                {
                    name: 'All PCs connected to switch',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        const switches = this.devices.filter(d => d.type === 'switch');
                        if (pcs.length < 3 || switches.length < 1) return false;
                        
                        return pcs.every(pc => 
                            switches.some(sw => this.areDirectlyConnected(pc, sw))
                        );
                    }
                },
                {
                    name: 'All PCs have same subnet IPs',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        if (pcs.length < 3) return false;
                        
                        const networks = pcs.map(pc => 
                            pc.configuration.ipAddress ? 
                            this.getNetworkAddress(pc.configuration.ipAddress, pc.configuration.subnetMask) : null
                        ).filter(net => net);
                        
                        return networks.length >= 2 && networks[0] !== networks[1];
                    }
                }
            ],
            4: [ // Default Gateway Setup
                {
                    name: '2 PCs and 1 Router placed',
                    check: () => this.devices.filter(d => d.type === 'pc').length >= 2 &&
                                 this.devices.filter(d => d.type === 'router').length >= 1
                },
                {
                    name: 'Router has 2 configured interfaces',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => {
                            const configuredInterfaces = Object.values(router.configuration.interfaces)
                                .filter(iface => iface.ipAddress && iface.status === 'up');
                            return configuredInterfaces.length >= 2;
                        });
                    }
                },
                {
                    name: 'PCs in different subnets',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        if (pcs.length < 2) return false;
                        
                        const networks = pcs.map(pc => 
                            pc.configuration.ipAddress ? 
                            this.getNetworkAddress(pc.configuration.ipAddress, pc.configuration.subnetMask) : null
                        ).filter(net => net);
                        
                        return networks.length >= 2 && networks[0] !== networks[1];
                    }
                },
                {
                    name: 'PCs have correct gateway configuration',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        return pcs.every(pc => pc.configuration.defaultGateway);
                    }
                }
            ],
            5: [ // Basic DHCP Configuration
                {
                    name: 'Router, Switch, and 2 PCs placed',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 1 &&
                                 this.devices.filter(d => d.type === 'switch').length >= 1 &&
                                 this.devices.filter(d => d.type === 'pc').length >= 2
                },
                {
                    name: 'PCs connected through switch to router',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        const switches = this.devices.filter(d => d.type === 'switch');
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        
                        if (routers.length === 0 || switches.length === 0 || pcs.length < 2) return false;
                        
                        // Check router-switch connection
                        const routerSwitchConnected = routers.some(router => 
                            switches.some(sw => this.areDirectlyConnected(router, sw))
                        );
                        
                        // Check PC-switch connections
                        const pcsSwitchConnected = pcs.every(pc => 
                            switches.some(sw => this.areDirectlyConnected(pc, sw))
                        );
                        
                        return routerSwitchConnected && pcsSwitchConnected;
                    }
                },
                {
                    name: 'Router interface configured',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            Object.values(router.configuration.interfaces).some(iface => 
                                iface.ipAddress && iface.status === 'up'
                            )
                        );
                    }
                },
                {
                    name: 'PCs set to DHCP mode',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        return pcs.length >= 2 && pcs.every(pc => pc.configuration.dhcp === true);
                    }
                }
            ]
        };

        return labTests[labNumber] || [];
    }

    getAdvancedLabTests(labNumber) {
        // Advanced lab tests for hard difficulty
        const advancedLabTests = {
            1: [ // Inter-VLAN Routing
                {
                    name: 'Router and switch placed',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 1 &&
                                 this.devices.filter(d => d.type === 'switch').length >= 1
                },
                {
                    name: 'Multiple PCs placed for different VLANs',
                    check: () => this.devices.filter(d => d.type === 'pc').length >= 2
                },
                {
                    name: 'Router-switch trunk connection exists',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        const switches = this.devices.filter(d => d.type === 'switch');
                        return routers.some(router => 
                            switches.some(sw => this.areDirectlyConnected(router, sw))
                        );
                    }
                },
                {
                    name: 'Router subinterfaces configured',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            Object.keys(router.configuration.interfaces).length >= 2
                        );
                    }
                }
            ],
            2: [ // Static Routing
                {
                    name: 'Multiple routers placed',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 2
                },
                {
                    name: 'PCs in different networks',
                    check: () => this.devices.filter(d => d.type === 'pc').length >= 2
                },
                {
                    name: 'Router-to-router connections',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.length >= 2 && this.cables.some(cable => 
                            routers.some(r1 => r1.id === cable.source || r1.id === cable.target) &&
                            routers.some(r2 => (r2.id === cable.source || r2.id === cable.target) && r2.id !== r1.id)
                        );
                    }
                },
                {
                    name: 'Static routes configured',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            router.configuration.routes && router.configuration.routes.length > 0
                        );
                    }
                }
            ],
            3: [ // Small Office LAN
                {
                    name: 'Complete topology placed',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 1 &&
                                 this.devices.filter(d => d.type === 'switch').length >= 2 &&
                                 this.devices.filter(d => d.type === 'pc').length >= 4
                },
                {
                    name: 'All devices connected',
                    check: () => {
                        const totalDevices = this.devices.length;
                        const expectedConnections = totalDevices - 1; // Minimum for connected topology
                        return this.cables.length >= expectedConnections;
                    }
                },
                {
                    name: 'DHCP configured on router',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            router.configuration.dhcpPools && router.configuration.dhcpPools.length > 0
                        );
                    }
                }
            ],
            4: [ // Wireless LAN
                {
                    name: 'Wireless access point placed',
                    check: () => this.devices.filter(d => d.type === 'wireless').length >= 1
                },
                {
                    name: 'Wireless and wired devices present',
                    check: () => this.devices.filter(d => d.type === 'laptop').length >= 1 &&
                                 this.devices.filter(d => d.type === 'pc').length >= 1
                },
                {
                    name: 'Access point configured',
                    check: () => {
                        const aps = this.devices.filter(d => d.type === 'wireless');
                        return aps.some(ap => 
                            ap.configuration.ssid && ap.configuration.security
                        );
                    }
                }
            ],
            5: [ // Access Control List
                {
                    name: 'Network topology complete',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 1 &&
                                 this.devices.filter(d => d.type === 'pc').length >= 2
                },
                {
                    name: 'Multiple network segments',
                    check: () => {
                        const pcs = this.devices.filter(d => d.type === 'pc');
                        if (pcs.length < 2) return false;
                        const networks = pcs.map(pc => 
                            this.getNetworkAddress(pc.configuration.ipAddress, pc.configuration.subnetMask)
                        ).filter(net => net);
                        return new Set(networks).size >= 2;
                    }
                },
                {
                    name: 'Access control configured',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            router.configuration.accessLists && router.configuration.accessLists.length > 0
                        );
                    }
                }
            ]
        };

        return advancedLabTests[labNumber] || [];
    }

    runTest(test) {
        try {
            const passed = test.check();
            return {
                passed,
                message: passed ? 'Passed' : 'Failed - check configuration'
            };
        } catch (error) {
            return {
                passed: false,
                message: 'Error during test: ' + error.message
            };
        }
    }

    displayTestResults(results) {
        const resultsContainer = this.container.querySelector('#test-output');
        if (!resultsContainer) return;

        const resultsHTML = `
            ${results.map(result => `
                <div class="test-item" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <span style="font-size: 0.9rem; color: white;">${result.name}</span>
                    <span class="test-status" style="
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 0.8rem;
                        font-weight: bold;
                        ${result.status === 'pass' ? 
                          'background: var(--color-green); color: white;' : 
                          'background: var(--color-red); color: white;'}
                    ">${result.status.toUpperCase()}</span>
                </div>
            `).join('')}
        `;

        resultsContainer.innerHTML = resultsHTML;

        // Show completion if all tests pass
        const allPassed = results.every(r => r.status === 'pass');
        if (allPassed) {
            this.showFeedback('All tests passed! Lab completed successfully! 🎉', 'success');
            
            // Auto-advance progress
            const progressElement = this.container.querySelector('#lab-progress');
            if (progressElement) {
                const progress = Math.round((this.currentLab / 5) * 100);
                progressElement.textContent = `${progress}% Complete`;
            }
        } else {
            const failedTests = results.filter(r => r.status === 'fail');
            this.showFeedback(`${failedTests.length} test(s) failed. Check the requirements and try again.`, 'warning');
        }
    }

    clearCanvas() {
        if (confirm('Clear all devices and connections? This cannot be undone.')) {
            this.devices = [];
            this.cables = [];
            this.selectedDevice = null;
            this.connectionSource = null;
            
            // Clear canvas
            this.canvas.innerHTML = '<svg class="network-cables" id="network-cables" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;"></svg>';
            
            // Reset test results
            const testOutput = this.container.querySelector('#test-output');
            if (testOutput) {
                testOutput.innerHTML = 'Click "Test Network" to validate your configuration';
            }
            
            this.showFeedback('Workspace cleared', 'info');
        }
    }

    // Make NetxusLab globally accessible for configuration callbacks
    generateInterVLANLab() {
        return `
            <h2>Lab 1: Inter-VLAN Routing (Router-on-a-Stick)</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure VLANs on a switch and enable communication between them using router subinterfaces.</p>
            
            <div class="topology-info">
                <h4>📊 VLAN Configuration</h4>
                <ul>
                    <li><strong>VLAN 10:</strong> 192.168.10.0/24 (Development Team)</li>
                    <li><strong>VLAN 20:</strong> 192.168.20.0/24 (Security Operations)</li>
                    <li><strong>Trunk Link:</strong> Between switch and router</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Topology</h4>
            <ol>
                <li>Place 1 Router, 1 Switch, and 2 PCs</li>
                <li>Connect PC1 to Switch port Fa0/1</li>
                <li>Connect PC2 to Switch port Fa0/2</li>
                <li>Connect Switch port Fa0/24 to Router Gi0/0 (trunk link)</li>
            </ol>

            <h4>Step 2: Switch VLAN Configuration</h4>
            <p>Configure the switch with VLANs and assign ports:</p>
            <div class="command-block">
Switch(config)# vlan 10
Switch(config-vlan)# name SALES
Switch(config-vlan)# exit

Switch(config)# vlan 20  
Switch(config-vlan)# name MARKETING
Switch(config-vlan)# exit

Switch(config)# interface fa0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10

Switch(config)# interface fa0/2
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 20

Switch(config)# interface fa0/24
Switch(config-if)# switchport mode trunk
            </div>

            <h4>Step 3: Router Subinterface Configuration</h4>
            <p>Configure router subinterfaces for each VLAN:</p>
            <div class="command-block">
Router(config)# interface gi0/0
Router(config-if)# no shutdown

Router(config)# interface gi0/0.10
Router(config-subif)# encapsulation dot1Q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0

Router(config)# interface gi0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0
            </div>

            <h4>Step 4: PC Configuration</h4>
            <div class="command-block">
PC1 (VLAN 10): 
- IP Address: 192.168.10.10
- Subnet Mask: 255.255.255.0
- Default Gateway: 192.168.10.1

PC2 (VLAN 20):
- IP Address: 192.168.20.10  
- Subnet Mask: 255.255.255.0
- Default Gateway: 192.168.20.1
            </div>

            <h4>Step 5: Testing</h4>
            <ol>
                <li>Ping from PC1 to PC2 (should succeed via router)</li>
                <li>Verify with: <code>show vlan brief</code> on switch</li>
                <li>Verify with: <code>show ip interface brief</code> on router</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>Devices in different VLANs should communicate through the router subinterfaces.</p>
            </div>
        `;
    }

    generateStaticRoutingLab() {
        return `
            <h2>Lab 2: Static Routing Between Two Routers</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure static routes between two routers to enable communication between different LANs.</p>
            
            <div class="topology-info">
                <h4>📊 Network Design</h4>
                <ul>
                    <li><strong>Router1 LAN:</strong> 192.168.1.0/24</li>
                    <li><strong>Router2 LAN:</strong> 192.168.2.0/24</li>
                    <li><strong>WAN Link:</strong> 10.0.0.0/30</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Topology</h4>
            <ol>
                <li>Place 2 Routers and 2 PCs</li>
                <li>Connect PC1 to Router1 Gi0/0</li>
                <li>Connect PC2 to Router2 Gi0/0</li>
                <li>Connect Router1 Gi0/1 to Router2 Gi0/1 (WAN link)</li>
            </ol>

            <h4>Step 2: Router1 Configuration</h4>
            <div class="command-block">
Router1(config)# interface gi0/0
Router1(config-if)# ip address 192.168.1.1 255.255.255.0
Router1(config-if)# no shutdown

Router1(config)# interface gi0/1
Router1(config-if)# ip address 10.0.0.1 255.255.255.252
Router1(config-if)# no shutdown

Router1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
            </div>

            <h4>Step 3: Router2 Configuration</h4>
            <div class="command-block">
Router2(config)# interface gi0/0
Router2(config-if)# ip address 192.168.2.1 255.255.255.0
Router2(config-if)# no shutdown

Router2(config)# interface gi0/1
Router2(config-if)# ip address 10.0.0.2 255.255.255.252
Router2(config-if)# no shutdown

Router2(config)# ip route 192.168.1.0 255.255.255.0 10.0.0.1
            </div>

            <h4>Step 4: PC Configuration</h4>
            <div class="command-block">
PC1: IP 192.168.1.10/24, Gateway 192.168.1.1
PC2: IP 192.168.2.10/24, Gateway 192.168.2.1
            </div>

            <h4>Step 5: Verification</h4>
            <ol>
                <li>Check routing tables: <code>show ip route</code></li>
                <li>Ping between PCs across routers</li>
                <li>Verify WAN connectivity: ping router interfaces</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>PCs on different LANs should communicate through static routing.</p>
            </div>
        `;
    }

    generateSmallOfficeLab() {
        return `
            <h2>Lab 3: Small Office LAN Design</h2>
            
            <h3>🎯 Objective</h3>
            <p>Build a comprehensive small office network with redundancy and DHCP services.</p>
            
            <div class="topology-info">
                <h4>📊 Network Components</h4>
                <ul>
                    <li><strong>1 Router:</strong> Gateway with DHCP server</li>
                    <li><strong>2 Switches:</strong> Distribution layer redundancy</li>
                    <li><strong>4 PCs:</strong> End user devices</li>
                    <li><strong>Network Range:</strong> 192.168.50.0/24</li>
                    <li><strong>DHCP Pool:</strong> 192.168.50.100-192.168.50.200</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Layout</h4>
            <ol>
                <li>Place 1 Router at the center</li>
                <li>Place 2 Switches below the router</li>
                <li>Place 2 PCs connected to each switch</li>
                <li>Connect Router Gi0/0 to Switch1 Fa0/24</li>
                <li>Connect Router Gi0/1 to Switch2 Fa0/24</li>
                <li>Connect switches together for redundancy</li>
            </ol>

            <h4>Step 2: Router Interface Configuration</h4>
            <div class="command-block">
Router(config)# interface gi0/0
Router(config-if)# ip address 192.168.50.1 255.255.255.0
Router(config-if)# no shutdown

Router(config)# interface gi0/1
Router(config-if)# ip address 192.168.50.2 255.255.255.0
Router(config-if)# no shutdown
            </div>

            <h4>Step 3: DHCP Configuration</h4>
            <div class="command-block">
Router(config)# ip dhcp pool OFFICE-LAN
Router(dhcp-config)# network 192.168.50.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.50.1
Router(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
Router(dhcp-config)# lease 0 8 0

Router(config)# ip dhcp excluded-address 192.168.50.1 192.168.50.99
            </div>

            <h4>Step 4: PC Configuration</h4>
            <p>Set all PCs to obtain IP addresses automatically via DHCP.</p>

            <h4>Step 5: Testing</h4>
            <ol>
                <li>Verify DHCP assignments: <code>ipconfig</code> on PCs</li>
                <li>Test inter-PC connectivity</li>
                <li>Check DHCP bindings: <code>show ip dhcp binding</code></li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>All PCs receive automatic IP addresses and have full connectivity.</p>
            </div>
        `;
    }

    generateWirelessLab() {
        return `
            <h2>Lab 4: Wireless LAN Configuration</h2>
            
            <h3>🎯 Objective</h3>
            <p>Configure a wireless network with proper security and connectivity.</p>
            
            <div class="topology-info">
                <h4>📊 Wireless Setup</h4>
                <ul>
                    <li><strong>SSID:</strong> TechLab</li>
                    <li><strong>Security:</strong> WPA2-PSK</li>
                    <li><strong>Password:</strong> 12345</li>
                    <li><strong>Network:</strong> 192.168.1.0/24</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Physical Setup</h4>
            <ol>
                <li>Place 1 Wireless Router/Access Point</li>
                <li>Place 2 Laptops with wireless adapters</li>
            </ol>

            <h4>Step 2: Wireless Router Configuration</h4>
            <p>Access the wireless router's web interface and configure:</p>
            <div class="command-block">
Wireless Settings:
- SSID: TechLab
- Security Mode: WPA2-PSK
- Passphrase: 12345
- Channel: Auto
- DHCP: Enabled
- IP Range: 192.168.1.100-192.168.1.199
            </div>

            <h4>Step 3: Laptop Wireless Configuration</h4>
            <ol>
                <li>Open wireless network settings on each laptop</li>
                <li>Scan for available networks</li>
                <li>Connect to "TechLab" network</li>
                <li>Enter password: 12345</li>
                <li>Set to obtain IP automatically</li>
            </ol>

            <h4>Step 4: Security Verification</h4>
            <ol>
                <li>Verify WPA2 encryption is active</li>
                <li>Check connected devices list</li>
                <li>Test network isolation if configured</li>
            </ol>

            <h4>Step 5: Connectivity Testing</h4>
            <ol>
                <li>Ping between laptops</li>
                <li>Test internet connectivity (if available)</li>
                <li>Verify IP address assignments</li>
            </ol>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>Wireless devices connect securely and can communicate with each other.</p>
            </div>
        `;
    }

    generateACLLab() {
        return `
            <h2>Lab 5: Access Control List (ACL) Configuration</h2>
            
            <h3>🎯 Objective</h3>
            <p>Implement access control policies to restrict network traffic between departments.</p>
            
            <div class="topology-info">
                <h4>📊 Security Policy</h4>
                <ul>
                    <li><strong>HR Network:</strong> 192.168.10.0/24</li>
                    <li><strong>IT Network:</strong> 192.168.20.0/24</li>
                    <li><strong>Server Network:</strong> 192.168.30.0/24</li>
                    <li><strong>Policy:</strong> HR cannot access IT servers</li>
                    <li><strong>Policy:</strong> IT can access all networks</li>
                </ul>
            </div>

            <h3>🔧 Step-by-Step Configuration</h3>
            
            <h4>Step 1: Network Topology</h4>
            <ol>
                <li>Place 1 Router with 3 interfaces</li>
                <li>Place 1 Switch per network segment</li>
                <li>Connect HR PC to HR network</li>
                <li>Connect IT PC to IT network</li>
                <li>Connect Server to server network</li>
            </ol>

            <h4>Step 2: Basic IP Configuration</h4>
            <div class="command-block">
Router Interface Configuration:
- Gi0/0: 192.168.10.1/24 (HR Network)
- Gi0/1: 192.168.20.1/24 (IT Network)  
- Gi0/2: 192.168.30.1/24 (Server Network)

Device IP Assignments:
- HR PC: 192.168.10.10/24, Gateway: 192.168.10.1
- IT PC: 192.168.20.10/24, Gateway: 192.168.20.1
- Server: 192.168.30.10/24, Gateway: 192.168.30.1
            </div>

            <h4>Step 3: Access Control List Configuration</h4>
            <div class="command-block">
Router(config)# access-list 100 deny ip 192.168.10.0 0.0.0.255 192.168.30.0 0.0.0.255
Router(config)# access-list 100 permit ip any any

Router(config)# interface gi0/0
Router(config-if)# ip access-group 100 out
            </div>

            <h4>Step 4: Testing ACL Rules</h4>
            <ol>
                <li>Test HR PC → Server (should fail)</li>
                <li>Test HR PC → IT PC (should succeed)</li>
                <li>Test IT PC → Server (should succeed)</li>
                <li>Test IT PC → HR PC (should succeed)</li>
            </ol>

            <h4>Step 5: Verification Commands</h4>
            <div class="command-block">
Router# show access-lists
Router# show ip interface gi0/0
Router# show access-lists 100
            </div>

            <div class="expected-output">
                <h4>✅ Expected Results</h4>
                <p>HR devices blocked from server access while maintaining other connectivity.</p>
            </div>
        `;
    }

    showScreen(screenId) {
        console.log('📺 NETXUS showScreen:', screenId);
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
        } else {
            console.error(`❌ Screen ${screenId} not found in container`);
        }
    }

    showDifficultySelection() {
        console.log('🌐 Showing difficulty selection...');
        this.showScreen('difficulty-screen');
    }

    selectDifficulty(difficulty) {
        console.log('Difficulty selected:', difficulty);
        this.currentDifficulty = difficulty;
        this.showLabSelection();
    }

    showLabSelection() {
        console.log('Showing lab selection for difficulty:', this.currentDifficulty);
        
        if (!this.currentDifficulty) {
            console.error('No difficulty selected');
            return;
        }
        
        const categoryData = this.labCategories[this.currentDifficulty];
        const container = this.container;
        
        // Update header
        const titleElement = container.querySelector('#difficulty-title');
        const descElement = container.querySelector('#difficulty-description');
        
        if (titleElement) titleElement.textContent = `NETXUS - ${categoryData.name}`;
        if (descElement) descElement.textContent = categoryData.description;
        
        // Populate level grid
        const labGrid = container.querySelector('#level-grid');
        if (labGrid) {
            labGrid.innerHTML = categoryData.labs.map((lab, index) => `
                <div class="level-card" data-lab="${index + 1}">
                    <div class="level-number">${index + 1}</div>
                    <h3>${lab.name}</h3>
                    <p><strong>Objective:</strong> ${lab.objective}</p>
                    <p><strong>Time:</strong> ${lab.estimatedTime}</p>
                    <p><strong>Difficulty:</strong> ${lab.difficulty}</p>
                </div>
            `).join('');
            
            // Add click handlers to level cards
            labGrid.querySelectorAll('.level-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lab = parseInt(card.dataset.lab);
                    console.log('Lab selected:', lab);
                    this.startLab(lab);
                });
            });
        }
        
        this.showScreen('level-screen');
    }

    updateLabInterface() {
        const container = this.container;
        const currentLabDisplay = container.querySelector('#current-lab-display');
        const progressDisplay = container.querySelector('#lab-progress');
        
        if (currentLabDisplay) {
            currentLabDisplay.textContent = `${this.currentLab}/5`;
        }
        
        if (progressDisplay) {
            const progress = Math.round((this.currentLab / 5) * 100);
            progressDisplay.textContent = `${progress}%`;
        }
    }

    displayLabInstructions() {
        const instructionsContainer = this.container.querySelector('#lab-instructions');
        if (!instructionsContainer) return;
        
        const instructions = this.labInstructions[this.currentDifficulty][this.currentLab];
        instructionsContainer.innerHTML = instructions;
    }

    completeLab() {
        console.log('Attempting to complete lab:', this.currentLab);
        
        // First, validate that all lab objectives are met
        const tests = this.currentDifficulty === 'hard' ? 
            this.getAdvancedLabTests(this.currentLab) : 
            this.getLabTests(this.currentLab);
        const results = [];

        tests.forEach(test => {
            const result = this.runTest(test);
            results.push({
                name: test.name,
                status: result.passed ? 'pass' : 'fail',
                message: result.message
            });
        });

        // Check if all tests pass
        const allPassed = results.every(r => r.status === 'pass');
        
        if (!allPassed) {
            // Show which tests failed
            const failedTests = results.filter(r => r.status === 'fail');
            const failedTestNames = failedTests.map(t => t.name).join(', ');
            this.showFeedback(`⚠️ Cannot complete lab! The following objectives are not met: ${failedTestNames}. Please complete all requirements before advancing.`, 'error');
            
            // Display detailed test results to help player understand what's missing
            this.displayTestResults(results);
            return; // Don't allow completion
        }

        // All tests passed, proceed with completion
        console.log('All lab objectives completed successfully!');
        this.attempts++;

        // Calculate score based on attempts and completion time
        const baseScore = 100;
        const attemptPenalty = Math.min(this.attempts * 5, 30); // Max 30 point penalty
        this.score = Math.max(70, baseScore - attemptPenalty); // Minimum 70 points
        
        this.showFeedback('Lab completed successfully! All objectives met! 🎉', 'success');
        
        // Report progress to tracking systems
        this.reportProgressToCenter();
        
        if (this.currentLab < 5) {
            setTimeout(() => {
                this.startLab(this.currentLab + 1);
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

    showHint() {
        const hints = {
            1: "💡 Remember to use straight-through cables between PC and switch. Check your IP configurations!",
            2: "💡 Router interfaces are shut down by default. Don't forget to use 'no shutdown' command!",
            3: "💡 Make sure all devices are on the same subnet for communication within the LAN.",
            4: "💡 Each network needs its own subnet. Set the router as the default gateway for both networks.",
            5: "💡 Configure the DHCP pool with network address, default gateway, and DNS server settings."
        };
        
        const hint = hints[this.currentLab] || "💡 Follow the step-by-step instructions carefully and verify each configuration.";
        this.showFeedback(hint, 'info');
    }

    resetLab() {
        if (confirm('Are you sure you want to reset this lab? All progress will be lost.')) {
            this.showFeedback('Lab reset! Start from the beginning.', 'warning');
            this.displayLabInstructions();
        }
    }

    abortMission() {
        if (confirm('Are you sure you want to abort this mission? Your progress will be lost.')) {
            // Reset lab state
            this.currentDifficulty = null;
            this.currentLab = null;
            this.devices = [];
            this.cables = [];
            this.selectedDevice = null;
            this.connectionMode = false;
            this.connectionSource = null;
            this.deviceCounter = 0;
            this.clearCanvas();
            
            // Redirect to difficulty selection screen
            this.showDifficultySelection();
        }
    }

    showFeedback(message, type = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${type}`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 2000;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
        `;
        
        switch(type) {
            case 'success':
                feedback.style.backgroundColor = '#38a169';
                break;
            case 'warning':
                feedback.style.backgroundColor = '#dd6b20';
                break;
            case 'error':
                feedback.style.backgroundColor = '#e53e3e';
                break;
            default:
                feedback.style.backgroundColor = '#3182ce';
        }
        
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 4000);
    }

    // Helper method to report progress to command center and database
    async reportProgressToCenter() {
        try {
            if (window.progressTracker) {
                // Use the improved completeChallenge method for proper validation
                await window.progressTracker.completeChallenge('netxus', {
                    level: this.currentLab,
                    score: this.score,
                    timeSpent: this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                    attempts: this.attempts,
                    difficulty: this.currentDifficulty
                });
                
                // Award level completion badge
                if (window.achievementManager) {
                    await window.achievementManager.checkNetXusLevelCompletion(
                        this.currentLab,
                        this.currentDifficulty,
                        this.score,
                        this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0
                    );
                }
                
                // Dispatch event to update command center display
                window.dispatchEvent(new CustomEvent('progressUpdated', {
                    detail: {
                        roomName: 'netxus',
                        progress: this.currentLab * 20, // Each lab = 20%
                        score: this.score,
                        level: this.currentLab
                    }
                }));
                
                console.log(`📊 Lab ${this.currentLab}/5 progress reported for NetXus`);
            }
        } catch (error) {
            console.warn('Could not report progress to progress tracker:', error);
        }
    }

    // Helper method to report room completion with detailed stats
    async reportRoomCompletion() {
        try {
            if (window.progressTracker) {
                await window.progressTracker.markRoomComplete('netxus', this.score);
                
                // Check for difficulty completion badge
                if (window.achievementManager) {
                    await window.achievementManager.checkNetXusDifficultyCompletion(
                        this.currentDifficulty,
                        5 // All 5 levels completed
                    );
                    
                    // Check for room completion badge (if both difficulties completed)
                    // This is a simplified check - in a full implementation, you'd track user progress across sessions
                    const totalTime = this.roomStartTime ? Math.floor((Date.now() - this.roomStartTime) / 1000) : 0;
                    await window.achievementManager.checkNetXusRoomCompletion(
                        this.score,
                        totalTime,
                        true // Assume room completion for now
                    );
                }
                
                // Dispatch room completion event
                window.dispatchEvent(new CustomEvent('roomCompleted', {
                    detail: {
                        roomName: 'netxus',
                        completionStats: {
                            timeSpent: Math.floor((Date.now() - this.roomStartTime) / 1000),
                            totalAttempts: this.attempts,
                            finalScore: this.score,
                            difficulty: this.currentDifficulty,
                            totalLabs: 5
                        }
                    }
                }));
                
                console.log('🏆 NetXus room completion reported successfully');
            }
        } catch (error) {
            console.warn('Could not report room completion:', error);
        }
    }
}

// Make NetxusLab globally accessible for configuration callbacks
window.NetxusLab = NetxusLab;
window.netxusLab = null;

console.log('NetxusLab class loaded and ready with complete simulation system');
