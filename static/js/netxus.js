class NetxusLab {
    constructor() {
        this.currentDifficulty = null;
        this.currentLab = null;
        this.container = null;
        this.initialized = false;
        
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
        this.displayLabInstructions();
        this.updateLabInterface();
        this.showScreen('game-screen');
        console.log('Lab interface initialized successfully');
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
        this.showFeedback('Lab completed successfully! 🎉', 'success');
        
        if (this.currentLab < 5) {
            setTimeout(() => {
                this.startLab(this.currentLab + 1);
            }, 2000);
        } else {
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
        if (confirm('Are you sure you want to abort this lab? Your progress will be lost.')) {
            // Check if we're in command center mode
            if (window.commandCenter) {
                window.commandCenter.showCommandDashboard();
            } else {
                // Fallback navigation
                this.showDifficultySelection();
            }
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
                    <li><strong>VLAN 10:</strong> 192.168.10.0/24 (Sales Department)</li>
                    <li><strong>VLAN 20:</strong> 192.168.20.0/24 (Marketing Department)</li>
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
                        );
                        
                        return networks.every(net => net && net === networks[0]);
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

    // Additional hard challenge test implementations
    getAdvancedLabTests(labNumber) {
        const advancedTests = {
            1: [ // Inter-VLAN Routing
                {
                    name: 'Switch with VLANs configured',
                    check: () => {
                        const switches = this.devices.filter(d => d.type === 'switch');
                        return switches.some(sw => 
                            sw.configuration.vlans && sw.configuration.vlans.length > 1
                        );
                    }
                },
                {
                    name: 'Router with subinterfaces',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            Object.keys(router.configuration.interfaces).some(ifaceName => 
                                ifaceName.includes('.')
                            )
                        );
                    }
                },
                {
                    name: 'Trunk connection between switch and router',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        const switches = this.devices.filter(d => d.type === 'switch');
                        
                        return this.cables.some(cable => {
                            const device1 = this.devices.find(d => d.id === cable.source);
                            const device2 = this.devices.find(d => d.id === cable.target);
                            
                            return (device1?.type === 'router' && device2?.type === 'switch') ||
                                   (device1?.type === 'switch' && device2?.type === 'router');
                        });
                    }
                }
            ],
            2: [ // Static Routing
                {
                    name: 'Two routers placed',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 2
                },
                {
                    name: 'WAN connection between routers',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        if (routers.length < 2) return false;
                        
                        return this.cables.some(cable => {
                            const device1 = this.devices.find(d => d.id === cable.source);
                            const device2 = this.devices.find(d => d.id === cable.target);
                            
                            return device1?.type === 'router' && device2?.type === 'router';
                        });
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
                    name: '1 Router, 2 Switches, 4 PCs placed',
                    check: () => this.devices.filter(d => d.type === 'router').length >= 1 &&
                                 this.devices.filter(d => d.type === 'switch').length >= 2 &&
                                 this.devices.filter(d => d.type === 'pc').length >= 4
                },
                {
                    name: 'All devices properly connected',
                    check: () => {
                        // Simplified check - all devices should have at least one connection
                        return this.devices.every(device => 
                            this.cables.some(cable => 
                                cable.source === device.id || cable.target === device.id
                            )
                        );
                    }
                },
                {
                    name: 'DHCP enabled on router',
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
                    name: 'Wireless access point configured',
                    check: () => this.devices.filter(d => d.type === 'wireless').length >= 1
                },
                {
                    name: 'Laptops with wireless connection',
                    check: () => this.devices.filter(d => d.type === 'laptop').length >= 2
                },
                {
                    name: 'WPA2 security configured',
                    check: () => {
                        const wireless = this.devices.filter(d => d.type === 'wireless');
                        return wireless.some(ap => 
                            ap.configuration.security === 'WPA2' && ap.configuration.password
                        );
                    }
                }
            ],
            5: [ // ACL Configuration
                {
                    name: 'Multiple network segments',
                    check: () => {
                        // Check for different IP networks
                        const networks = new Set();
                        this.devices.forEach(device => {
                            if (device.configuration.ipAddress) {
                                const network = this.getNetworkAddress(
                                    device.configuration.ipAddress, 
                                    device.configuration.subnetMask || '255.255.255.0'
                                );
                                networks.add(network);
                            }
                        });
                        return networks.size >= 2;
                    }
                },
                {
                    name: 'ACL configured on router',
                    check: () => {
                        const routers = this.devices.filter(d => d.type === 'router');
                        return routers.some(router => 
                            router.configuration.accessLists && router.configuration.accessLists.length > 0
                        );
                    }
                },
                {
                    name: 'Server device present',
                    check: () => this.devices.filter(d => d.type === 'server').length >= 1
                }
            ]
        };

        return advancedTests[labNumber] || [];
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
                    <li><strong>VLAN 10:</strong> 192.168.10.0/24 (Sales Department)</li>
                    <li><strong>VLAN 20:</strong> 192.168.20.0/24 (Marketing Department)</li>
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
}

// Make NetxusLab globally accessible for configuration callbacks
window.NetxusLab = NetxusLab;
window.netxusLab = null;

console.log('NetxusLab class loaded and ready with complete simulation system');
