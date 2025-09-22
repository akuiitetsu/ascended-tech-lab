// Mobile responsiveness utilities for AITRIX Lab
class MobileUtils {
    static setupMobileViewport() {
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
    
    static setupTouchEnhancements() {
        // Add touch feedback for all interactive elements
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.matching-item, .difficulty-card, .level-card, .btn, button');
            if (target) {
                target.style.transform = 'scale(0.95)';
                target.style.transition = 'transform 0.1s ease';
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('.matching-item, .difficulty-card, .level-card, .btn, button');
            if (target) {
                setTimeout(() => {
                    target.style.transform = 'scale(1)';
                }, 100);
            }
        }, { passive: true });
        
        document.addEventListener('touchcancel', (e) => {
            const target = e.target.closest('.matching-item, .difficulty-card, .level-card, .btn, button');
            if (target) {
                target.style.transform = 'scale(1)';
            }
        }, { passive: true });
    }
    
    static isMobileDevice() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    }
    
    static setupMobileScrolling() {
        // Improve scrolling on mobile for containers
        const scrollContainers = document.querySelectorAll('.matching-container, .level-grid');
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
        });
    }
    
    static optimizeForMobile() {
        if (this.isMobileDevice()) {
            document.body.classList.add('mobile-device');
            
            // Add mobile-specific optimizations
            const style = document.createElement('style');
            style.textContent = `
                .mobile-device .matching-item {
                    min-height: 60px !important;
                    font-size: 0.9rem !important;
                    padding: 15px !important;
                }
                
                .mobile-device .btn {
                    min-height: 44px !important;
                    padding: 12px 15px !important;
                    font-size: 0.9rem !important;
                }
                
                .mobile-device .difficulty-card,
                .mobile-device .level-card {
                    min-height: 120px !important;
                    touch-action: manipulation;
                }
                
                .mobile-device * {
                    -webkit-tap-highlight-color: rgba(224, 131, 0, 0.3);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

class AitrixLab {
    constructor() {
        this.currentDifficulty = null;
        this.currentChallenge = null;
        this.container = null;
        this.initialized = false;
        this.score = 0;
        this.attempts = 0;
        this.currentStep = 0;
        this.challengeData = null;
        this.aiPersona = 'tutor'; // 'tutor' or 'mentor'
        this.conversationHistory = [];
        this.challengeStartTime = null;
        this.roomStartTime = null;
        
        this.challengeCategories = {
            easy: {
                name: 'Fundamentals',
                description: 'Beginner-friendly IT concepts with AI Tutor guidance',
                persona: 'AI Tutor',
                challenges: [
                    {
                        name: 'IP Address Detective',
                        objective: 'Assign correct IP addresses for device communication',
                        description: 'Fix network connectivity issues by correcting IP configurations',
                        type: 'network_config',
                        concepts: ['IP addressing', 'subnet basics']
                    },
                    {
                        name: 'Secure Your Passwords',
                        objective: 'Identify weak passwords and create strong alternatives',
                        description: 'Learn cybersecurity basics through password analysis',
                        type: 'security_quiz',
                        concepts: ['Cybersecurity basics', 'authentication']
                    },
                    {
                        name: 'OS Matchmaker',
                        objective: 'Match operating systems to appropriate use cases',
                        description: 'Choose the best OS for different scenarios',
                        type: 'matching',
                        concepts: ['Windows', 'Linux', 'macOS', 'OS roles']
                    },
                    {
                        name: 'Build a Simple Network',
                        objective: 'Connect PCs through a switch and test connectivity',
                        description: 'Create your first network topology with AI guidance',
                        type: 'network_builder',
                        concepts: ['Local networking', 'basic connectivity']
                    },
                    {
                        name: 'Cyber Hygiene Quiz',
                        objective: 'Make safe decisions in IT security scenarios',
                        description: 'Practice digital citizenship and security awareness',
                        type: 'scenario_quiz',
                        concepts: ['Phishing awareness', 'digital citizenship']
                    }
                ]
            },
            hard: {
                name: 'Advanced Application',
                description: 'College-level IT challenges with AI Mentor support',
                persona: 'AI Mentor',
                challenges: [
                    {
                        name: 'Network Segmentation',
                        objective: 'Secure office networks using subnetting and VLANs',
                        description: 'Design secure network architecture for business environments',
                        type: 'network_design',
                        concepts: ['Subnetting', 'VLANs', 'network security']
                    },
                    {
                        name: 'Ethical Hacker Simulation',
                        objective: 'Perform controlled penetration testing',
                        description: 'Find vulnerabilities and recommend security fixes',
                        type: 'pentest',
                        concepts: ['Cybersecurity', 'ethical hacking basics']
                    },
                    {
                        name: 'Database Doctor',
                        objective: 'Normalize a broken database schema',
                        description: 'Fix database design from 1NF to 3NF normalization',
                        type: 'database_design',
                        concepts: ['Database design', 'normalization']
                    },
                    {
                        name: 'OS Command Duel',
                        objective: 'Solve system tasks using Linux CLI commands',
                        description: 'Master command-line system administration',
                        type: 'cli_challenges',
                        concepts: ['Operating systems', 'shell scripting']
                    },
                    {
                        name: 'Cloud Architect Challenge',
                        objective: 'Design scalable cloud infrastructure',
                        description: 'Create AWS-based solutions for startup needs',
                        type: 'cloud_design',
                        concepts: ['Cloud computing', 'deployment', 'scalability']
                    }
                ]
            }
        };
    }

    init(container = null) {
        console.log('🤖 AitrixLab.init() called');
        this.container = container || document;
        
        if (!this.container) {
            console.error('❌ No valid container provided to AitrixLab.init()');
            return;
        }
        
        // Setup mobile enhancements
        MobileUtils.setupMobileViewport();
        MobileUtils.optimizeForMobile();
        
        const initWhenReady = () => {
            const difficultyScreen = this.container.querySelector('#difficulty-screen');
            const levelScreen = this.container.querySelector('#level-screen');
            const gameScreen = this.container.querySelector('#game-screen');
            
            if (difficultyScreen && levelScreen && gameScreen) {
                // Setup mobile touch enhancements after elements are ready
                MobileUtils.setupTouchEnhancements();
                MobileUtils.setupMobileScrolling();
                
                this.setupEventListeners();
                this.showDifficultySelection();
                this.initialized = true;
                console.log('🎉 AitrixLab initialized successfully!');
                console.log('📱 Mobile device detected:', MobileUtils.isMobileDevice());
            } else {
                setTimeout(initWhenReady, 100);
            }
        };
        
        initWhenReady();
    }

    setupEventListeners() {
        const container = this.container;
        
        // Difficulty buttons
        const easyBtn = container.querySelector('#easy-difficulty-btn');
        const hardBtn = container.querySelector('#hard-difficulty-btn');
        
        if (easyBtn && hardBtn) {
            const newEasyBtn = easyBtn.cloneNode(true);
            const newHardBtn = hardBtn.cloneNode(true);
            
            easyBtn.parentNode.replaceChild(newEasyBtn, easyBtn);
            hardBtn.parentNode.replaceChild(newHardBtn, hardBtn);
            
            newEasyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectDifficulty('easy');
            });
            
            newHardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectDifficulty('hard');
            });
        }

        // Navigation buttons
        const backToDifficultyBtn = container.querySelector('#back-to-difficulty-btn');
        if (backToDifficultyBtn) {
            backToDifficultyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDifficultySelection();
            });
        }

        const backToLevelsBtn = container.querySelector('#back-to-levels-btn');
        if (backToLevelsBtn) {
            const newBackBtn = backToLevelsBtn.cloneNode(true);
            backToLevelsBtn.parentNode.replaceChild(newBackBtn, backToLevelsBtn);
            
            newBackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showChallengeSelection();
            });
        }

        // Challenge control buttons
        this.setupChallengeButtons(container);
    }

    setupChallengeButtons(container) {
        const buttons = [
            { id: '#complete-challenge-btn', handler: () => this.completeChallenge() },
            { id: '#abort-mission-btn', handler: () => this.abortMission() },
            { id: '#get-hint-btn', handler: () => this.getHint() },
            { id: '#reset-challenge-btn', handler: () => this.resetChallenge() }
        ];
        
        buttons.forEach(({ id, handler }) => {
            const btn = container.querySelector(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }

    showScreen(screenId) {
        const container = this.container;
        const screens = ['difficulty-screen', 'level-screen', 'game-screen'];
        
        screens.forEach(id => {
            const screen = container.querySelector(`#${id}`);
            if (screen) {
                screen.classList.add('hidden');
                screen.style.display = 'none';
            }
        });
        
        const targetScreen = container.querySelector(`#${screenId}`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.style.display = screenId === 'difficulty-screen' ? 'flex' : 'block';
        }
    }

    showDifficultySelection() {
        this.showScreen('difficulty-screen');
        this.updateAIMessage("Welcome! I'm your AI assistant. Choose your learning path to begin mastering IT concepts with personalized guidance.");
    }

    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.aiPersona = difficulty === 'easy' ? 'tutor' : 'mentor';
        this.showChallengeSelection();
    }

    showChallengeSelection() {
        if (!this.currentDifficulty) return;
        
        const categoryData = this.challengeCategories[this.currentDifficulty];
        const container = this.container;
        
        const titleElement = container.querySelector('#difficulty-title');
        const descElement = container.querySelector('#difficulty-description');
        
        if (titleElement) titleElement.textContent = `AITRIX - ${categoryData.name}`;
        if (descElement) descElement.textContent = categoryData.description;
        
        const challengeGrid = container.querySelector('#level-grid');
        if (challengeGrid) {
            challengeGrid.innerHTML = categoryData.challenges.map((challenge, index) => `
                <div class="level-card" data-challenge="${index + 1}">
                    <div class="level-number">${index + 1}</div>
                    <h3>${challenge.name}</h3>
                    <p><strong>Goal:</strong> ${challenge.objective}</p>
                    <p>${challenge.description}</p>
                    <div class="concepts-list">
                        <strong>Concepts:</strong> ${challenge.concepts.join(', ')}
                    </div>
                </div>
            `).join('');
            
            challengeGrid.querySelectorAll('.level-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const challenge = parseInt(card.dataset.challenge);
                    this.startChallenge(challenge);
                });
            });
        }
        
        this.showScreen('level-screen');
    }

    startChallenge(challengeNumber) {
        this.currentChallenge = challengeNumber;
        this.score = 0;
        this.attempts = 0;
        this.currentStep = 0;
        
        // Initialize timing
        this.challengeStartTime = Date.now();
        if (!this.roomStartTime) {
            this.roomStartTime = Date.now();
        }
        
        const categoryData = this.challengeCategories[this.currentDifficulty];
        this.challengeData = categoryData.challenges[challengeNumber - 1];
        
        this.initChallengeInterface();
        this.showScreen('game-screen');
    }

    initChallengeInterface() {
        const container = this.container;
        
        // Update UI elements
        const currentDisplay = container.querySelector('#current-challenge-display');
        if (currentDisplay) currentDisplay.textContent = `${this.currentChallenge}/5`;
        
        // Load challenge-specific interface
        this.loadChallengeInterface();
        
        // Initialize AI conversation for this challenge
        this.startAIConversation();
    }

    startAIConversation() {
        const persona = this.aiPersona === 'tutor' ? 'AI Tutor' : 'AI Mentor';
        const introduction = this.getChallengeIntroduction();
        
        this.conversationHistory = [];
        this.updateAIMessage(introduction);
        
        // Update challenge progress
        const progressElement = this.container.querySelector('#mentor-progress');
        if (progressElement) {
            progressElement.style.width = '0%';
        }
    }

    getChallengeIntroduction() {
        const persona = this.aiPersona === 'tutor' ? 'AI Tutor' : 'AI Mentor';
        const introductions = {
            'IP Address Detective': `Hello! I'm your ${persona}. I've discovered some devices that can't communicate properly. Let's investigate their IP configurations together and fix the connectivity issues!`,
            'Secure Your Passwords': `Greetings! As your ${persona}, I'll help you understand password security. I've collected some passwords from a recent audit - let's analyze which ones are secure and which need improvement.`,
            'OS Matchmaker': `Welcome! I'm your ${persona}. Today we'll explore different operating systems and learn when to use each one. I have some scenarios that need the perfect OS match!`,
            'Build a Simple Network': `Hi there! Your ${persona} here. Let's build your first network step by step. I'll guide you through connecting devices and making them communicate!`,
            'Cyber Hygiene Quiz': `Hello! As your ${persona}, I'll present you with real-world IT security scenarios. Your job is to make the safest choices to protect digital assets.`,
            'Network Segmentation': `Welcome, advanced student! I'm your ${persona}. Today we'll tackle network security by segmenting a company's infrastructure. This is complex but crucial for enterprise security.`,
            'Ethical Hacker Simulation': `Greetings! As your ${persona}, I'll guide you through controlled penetration testing. Remember, we're the good guys - we find vulnerabilities to fix them!`,
            'Database Doctor': `Hello! Your ${persona} speaking. I have a broken database that needs your expertise. We'll work together to normalize it step by step.`,
            'OS Command Duel': `Welcome, command warrior! I'm your ${persona}. Prepare to master the Linux terminal with hands-on challenges that simulate real system administration tasks.`,
            'Cloud Architect Challenge': `Greetings, future architect! As your ${persona}, I'll help you design scalable cloud solutions for a startup. Let's build something amazing in the cloud!`
        };
        
        return introductions[this.challengeData.name] || `Hello! I'm your ${persona}. Let's start learning together!`;
    }

    loadChallengeInterface() {
        const workspace = this.container.querySelector('#challenge-workspace');
        if (!workspace) return;
        
        const challengeType = this.challengeData.type;
        const interfaceHTML = this.generateChallengeInterface(challengeType);
        
        workspace.innerHTML = interfaceHTML;
        this.setupChallengeInteractions();
    }

    generateChallengeInterface(type) {
        switch (type) {
            case 'network_config':
                return this.generateNetworkConfigInterface();
            case 'security_quiz':
                return this.generateSecurityQuizInterface();
            case 'matching':
                return this.generateMatchingInterface();
            case 'network_builder':
                return this.generateNetworkBuilderInterface();
            case 'scenario_quiz':
                return this.generateScenarioQuizInterface();
            case 'network_design':
                return this.generateNetworkDesignInterface();
            case 'pentest':
                return this.generatePentestInterface();
            case 'database_design':
                return this.generateDatabaseInterface();
            case 'cli_challenges':
                return this.generateCLIInterface();
            case 'cloud_design':
                return this.generateCloudInterface();
            default:
                return '<div class="challenge-interface active"><p>Challenge interface loading...</p></div>';
        }
    }

    generateNetworkConfigInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>🔍 AI Network Detective</h3>
                    <p>I've found devices that can't talk to each other! Let's fix their IP configurations and restore communication.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Configure IP addresses so these devices can communicate properly on the same network.</p>
                </div>
                
                <div class="interaction-panel">
                    <h4>Device Configuration</h4>
                    <div class="device-config">
                        <h5>🖥️ Computer A</h5>
                        <input type="text" id="device-a-ip" placeholder="IP Address" class="config-input">
                        <input type="text" id="device-a-subnet" placeholder="Subnet Mask" class="config-input" value="255.255.255.0">
                    </div>
                    
                    <div class="device-config">
                        <h5>🖥️ Computer B</h5>
                        <input type="text" id="device-b-ip" placeholder="IP Address" class="config-input">
                        <input type="text" id="device-b-subnet" placeholder="Subnet Mask" class="config-input" value="255.255.255.0">
                    </div>
                    
                    <button class="action-btn" onclick="window.aitrixLab.testNetworkConfiguration()">
                        🧪 Test Network Connection
                    </button>
                    <div id="network-test-result" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generateSecurityQuizInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>🔐 AI Security Auditor</h3>
                    <p>I've been analyzing password security in various systems. Help me identify which passwords meet security standards and which need improvement.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Review each password and determine if it's WEAK or STRONG based on cybersecurity best practices.</p>
                </div>
                
                <div class="interaction-panel">
                    <h4>Password Security Assessment</h4>
                    ${this.generatePasswordQuestions()}
                </div>
            </div>
        `;
    }

    generatePasswordQuestions() {
        const passwords = [
            { text: 'password123', answer: 'weak' },
            { text: 'MyS3cur3P@ssw0rd!', answer: 'strong' },
            { text: '12345678', answer: 'weak' },
            { text: 'Tr0ub4dor&3', answer: 'strong' },
            { text: 'admin', answer: 'weak' }
        ];

        return passwords.map((pwd, index) => `
            <div class="password-item" id="password-${index}">
                <span class="password-text">${pwd.text}</span>
                <div class="password-actions">
                    <button class="strength-btn weak-btn" onclick="window.aitrixLab.classifyPassword(${index}, 'weak')">WEAK</button>
                    <button class="strength-btn strong-btn" onclick="window.aitrixLab.classifyPassword(${index}, 'strong')">STRONG</button>
                </div>
            </div>
        `).join('');
    }

    generateMatchingInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>💻 AI System Advisor</h3>
                    <p>Different scenarios require different operating systems. I'll present you with various use cases, and you need to recommend the best OS for each situation.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Match each scenario with the most appropriate operating system based on the requirements.</p>
                </div>
                
                <div class="interaction-panel">
                    <div class="instructions" style="background: rgba(224, 131, 0, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4>📋 Instructions</h4>
                        <p>1. Click on a scenario card to select it</p>
                        <p>2. Click on an operating system card to choose the best match</p>
                        <p>3. Click "Validate Matches" to check your answer</p>
                    </div>
                    
                    <div class="matching-container">
                        <div class="scenarios-column">
                            <h4>📋 Scenarios</h4>
                            ${this.generateScenarioCards()}
                        </div>
                        
                        <div class="os-column">
                            <h4>🖥️ Operating Systems</h4>
                            ${this.generateOSCards()}
                        </div>
                    </div>
                    
                    <button class="action-btn" onclick="window.aitrixLab.validateMatching()">
                        ✅ Validate Matches
                    </button>
                    <div id="matching-result" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generateScenarioCards() {
        const scenarios = [
            { id: 'gaming', text: 'Gaming PC with latest games', answer: 'windows' },
            { id: 'server', text: 'Web server hosting', answer: 'linux' },
            { id: 'creative', text: 'Video editing workstation', answer: 'macos' }
        ];

        return scenarios.map(scenario => `
            <div class="scenario-card clickable-card" id="scenario-${scenario.id}" data-answer="${scenario.answer}" style="cursor: pointer; border: 2px solid #444; padding: 15px; margin: 10px 0; border-radius: 8px; transition: all 0.3s ease;">
                <h5>${scenario.text}</h5>
                <p style="color: #888; font-size: 0.9em;">Click to select, then choose OS →</p>
            </div>
        `).join('');
    }

    generateOSCards() {
        const systems = [
            { id: 'windows', name: 'Windows 11', desc: 'Gaming & Office' },
            { id: 'linux', name: 'Ubuntu Linux', desc: 'Servers & Development' },
            { id: 'macos', name: 'macOS', desc: 'Creative & Professional' }
        ];

        return systems.map(os => `
            <div class="os-card clickable-card" id="os-${os.id}" data-os="${os.id}" style="cursor: pointer; border: 2px solid #444; padding: 15px; margin: 10px 0; border-radius: 8px; transition: all 0.3s ease;">
                <h5>${os.name}</h5>
                <p style="color: #888; font-size: 0.9em;">${os.desc}</p>
            </div>
        `).join('');
    }

    generateNetworkBuilderInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>🌐 AI Network Guide</h3>
                    <p>Let's build a simple network together! I'll guide you through connecting devices and configuring them for communication.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Follow my guidance to create a working network with proper IP addressing and connectivity testing.</p>
                </div>
                
                <div class="interaction-panel">
                    <h4>Network Building Steps</h4>
                    <div class="network-steps">
                        <div class="step-item">
                            <h5>Step 1: Physical Connections</h5>
                            <p>Connect two PCs to a switch using ethernet cables.</p>
                            <button class="action-btn" onclick="window.aitrixLab.completeNetworkStep(1)">✓ Connections Complete</button>
                        </div>
                        <div class="step-item">
                            <h5>Step 2: IP Configuration</h5>
                            <p>Assign IP addresses: PC1 (192.168.1.10) and PC2 (192.168.1.20)</p>
                            <button class="action-btn" onclick="window.aitrixLab.completeNetworkStep(2)">✓ IPs Configured</button>
                        </div>
                        <div class="step-item">
                            <h5>Step 3: Test Connectivity</h5>
                            <p>Ping from PC1 to PC2 to verify communication.</p>
                            <button class="action-btn" onclick="window.aitrixLab.completeNetworkStep(3)">✓ Test Successful</button>
                        </div>
                    </div>
                    <div id="network-builder-feedback" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generateScenarioQuizInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>🛡️ AI Security Advisor</h3>
                    <p>I'll present you with common IT security situations. Your cybersecurity knowledge will help you make the safest decisions!</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Choose the most secure and appropriate response to each scenario.</p>
                </div>
                
                <div class="interaction-panel">
                    <div class="quiz-container">
                        <div class="question-card" id="current-question">
                            <h4>Scenario 1 of 3</h4>
                            <p class="question-text">You receive an email claiming to be from your bank, asking you to click a link and verify your account details due to "suspicious activity." What should you do?</p>
                            
                            <div class="answer-options">
                                <button class="option-btn" onclick="window.aitrixLab.answerSecurityQuestion('A')">
                                    A) Click the link immediately to secure my account
                                </button>
                                <button class="option-btn" onclick="window.aitrixLab.answerSecurityQuestion('B')">
                                    B) Delete the email and contact the bank directly using official channels
                                </button>
                                <button class="option-btn" onclick="window.aitrixLab.answerSecurityQuestion('C')">
                                    C) Forward the email to friends to warn them
                                </button>
                                <button class="option-btn" onclick="window.aitrixLab.answerSecurityQuestion('D')">
                                    D) Reply to ask for more information
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="quiz-feedback" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generateNetworkDesignInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>🏢 AI Network Analysis</h3>
                    <p>I've analyzed a small office network where HR, IT, and Guest devices are all on one LAN. This creates security risks! Let's design proper network segmentation.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Design secure network segments using subnetting and VLANs to isolate different departments.</p>
                </div>
                
                <div class="interaction-panel">
                    <h4>Network Segmentation Design</h4>
                    <div class="network-design-form">
                        <div class="subnet-group">
                            <h5>🏢 HR Department (High Security)</h5>
                            <div class="form-row">
                                <label>Network Range:</label>
                                <input type="text" id="hr-subnet" placeholder="192.168.10.0/24" class="config-input">
                            </div>
                            <div class="form-row">
                                <label>VLAN ID:</label>
                                <input type="number" id="hr-vlan" placeholder="10" min="1" max="4094" class="config-input">
                            </div>
                        </div>
                        
                        <div class="subnet-group">
                            <h5>💻 IT Department (Administrative)</h5>
                            <div class="form-row">
                                <label>Network Range:</label>
                                <input type="text" id="it-subnet" placeholder="192.168.20.0/24" class="config-input">
                            </div>
                            <div class="form-row">
                                <label>VLAN ID:</label>
                                <input type="number" id="it-vlan" placeholder="20" min="1" max="4094" class="config-input">
                            </div>
                        </div>
                        
                        <div class="subnet-group">
                            <h5>🌐 Guest Network (Restricted)</h5>
                            <div class="form-row">
                                <label>Network Range:</label>
                                <input type="text" id="guest-subnet" placeholder="192.168.100.0/24" class="config-input">
                            </div>
                            <div class="form-row">
                                <label>VLAN ID:</label>
                                <input type="number" id="guest-vlan" placeholder="100" min="1" max="4094" class="config-input">
                            </div>
                        </div>
                    </div>
                    
                    <button class="action-btn" onclick="window.aitrixLab.validateNetworkDesign()">
                        🛡️ Implement Security Design
                    </button>
                    <div id="network-design-feedback" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generatePentestInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>🎯 AI Security Lab</h3>
                    <p>Welcome to our controlled penetration testing environment! I'm simulating a vulnerable server for ethical hacking practice. Remember, we're the good guys!</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Use ethical hacking tools to find security vulnerabilities and recommend fixes.</p>
                </div>
                
                <div class="interaction-panel">
                    <div class="pentest-terminal">
                        <div class="terminal-header">
                            <span>🖥️ Kali Linux Terminal</span>
                            <span style="float: right;">Target: vulnerable-server.local (192.168.1.100)</span>
                        </div>
                        <div class="terminal-content" id="terminal-output">
                            <div class="terminal-line">kali@kali:~$ <span class="cursor">_</span></div>
                        </div>
                        <div class="terminal-input">
                            <span>kali@kali:~$ </span>
                            <input type="text" id="command-input" placeholder="Try: nmap -sV 192.168.1.100" 
                                   onkeypress="if(event.key==='Enter') window.aitrixLab.executeCommand(this.value)"
                                   class="terminal-cmd-input">
                        </div>
                    </div>
                    
                    <div class="pentest-tools">
                        <h5>🔧 Available Tools:</h5>
                        <div class="tool-buttons">
                            <button onclick="window.aitrixLab.useTool('nmap')" class="tool-btn">📡 Nmap Scan</button>
                            <button onclick="window.aitrixLab.useTool('nikto')" class="tool-btn">🔍 Nikto Web Scan</button>
                            <button onclick="window.aitrixLab.useTool('dirb')" class="tool-btn">📁 Directory Enumeration</button>
                        </div>
                    </div>
                    
                    <div id="pentest-feedback" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generateDatabaseInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>🗄️ AI Database Analysis</h3>
                    <p>I've found a poorly designed database with serious normalization issues! There are duplicate entries, missing primary keys, and data integrity problems.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Fix this database by applying normalization rules from 1NF to 3NF.</p>
                </div>
                
                <div class="interaction-panel">
                    <h4>Current Database Problems</h4>
                    <div class="database-table">
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <thead>
                                <tr style="background: rgba(224, 131, 0, 0.2);">
                                    <th style="border: 1px solid #444; padding: 8px;">CustomerID</th>
                                    <th style="border: 1px solid #444; padding: 8px;">Name</th>
                                    <th style="border: 1px solid #444; padding: 8px;">Phone</th>
                                    <th style="border: 1px solid #444; padding: 8px;">Orders</th>
                                    <th style="border: 1px solid #444; padding: 8px;">Products</th>
                                    <th style="border: 1px solid #444; padding: 8px;">Prices</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #444; padding: 8px;">1</td>
                                    <td style="border: 1px solid #444; padding: 8px;">John Smith</td>
                                    <td style="border: 1px solid #444; padding: 8px;">555-1234</td>
                                    <td style="border: 1px solid #444; padding: 8px;">Coffee, Tea</td>
                                    <td style="border: 1px solid #444; padding: 8px;">Latte, Green Tea</td>
                                    <td style="border: 1px solid #444; padding: 8px;">4.99, 3.99</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #444; padding: 8px;">2</td>
                                    <td style="border: 1px solid #444; padding: 8px;">Mary Johnson</td>
                                    <td style="border: 1px solid #444; padding: 8px;">555-5678</td>
                                    <td style="border: 1px solid #444; padding: 8px;">Coffee</td>
                                    <td style="border: 1px solid #444; padding: 8px;">Cappuccino</td>
                                    <td style="border: 1px solid #444; padding: 8px;">5.49</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <h4>Database Normalization Steps</h4>
                    <div class="normalization-steps">
                        <div class="norm-step">
                            <h5>Step 1: First Normal Form (1NF)</h5>
                            <label>
                                <input type="checkbox" onclick="window.aitrixLab.checkNormalizationStep(1)"> 
                                Eliminate repeating groups and create atomic values
                            </label>
                        </div>
                        
                        <div class="norm-step">
                            <h5>Step 2: Second Normal Form (2NF)</h5>
                            <label>
                                <input type="checkbox" onclick="window.aitrixLab.checkNormalizationStep(2)">
                                Remove partial dependencies on composite keys
                            </label>
                        </div>
                        
                        <div class="norm-step">
                            <h5>Step 3: Third Normal Form (3NF)</h5>
                            <label>
                                <input type="checkbox" onclick="window.aitrixLab.checkNormalizationStep(3)">
                                Remove transitive dependencies
                            </label>
                        </div>
                    </div>
                    
                    <button class="action-btn" onclick="window.aitrixLab.validateNormalization()">
                        🔧 Apply Database Fixes
                    </button>
                    <div id="database-feedback" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generateCLIInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>⚡ AI System Administrator</h3>
                    <p>Time for some hands-on Linux command line work! I'll give you system administration tasks that you need to solve using proper CLI commands.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Complete system administration tasks using Linux CLI commands. Think like a sysadmin!</p>
                </div>
                
                <div class="interaction-panel">
                    <div class="cli-challenges">
                        <div class="challenge-task" id="cli-task-1">
                            <h5>Task 1: File Management</h5>
                            <p>Create a directory called 'projects' in the home directory:</p>
                            <input type="text" id="task1-cmd" placeholder="Enter Linux command..." class="cli-input">
                            <button onclick="window.aitrixLab.checkCLICommand(1)" class="check-btn">Check</button>
                        </div>
                        
                        <div class="challenge-task" id="cli-task-2">
                            <h5>Task 2: User Management</h5>
                            <p>Create a new user account called 'developer':</p>
                            <input type="text" id="task2-cmd" placeholder="Enter Linux command..." class="cli-input">
                            <button onclick="window.aitrixLab.checkCLICommand(2)" class="check-btn">Check</button>
                        </div>
                        
                        <div class="challenge-task" id="cli-task-3">
                            <h5>Task 3: Process Management</h5>
                            <p>Show all running processes with full details:</p>
                            <input type="text" id="task3-cmd" placeholder="Enter Linux command..." class="cli-input">
                            <button onclick="window.aitrixLab.checkCLICommand(3)" class="check-btn">Check</button>
                        </div>
                        
                        <div class="challenge-task" id="cli-task-4">
                            <h5>Task 4: File Permissions</h5>
                            <p>Give read, write, and execute permissions to owner only for file 'script.sh':</p>
                            <input type="text" id="task4-cmd" placeholder="Enter Linux command..." class="cli-input">
                            <button onclick="window.aitrixLab.checkCLICommand(4)" class="check-btn">Check</button>
                        </div>
                    </div>
                    
                    <div id="cli-feedback" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    generateCloudInterface() {
        return `
            <div class="challenge-interface active">
                <div class="scenario-panel">
                    <h3>☁️ AI Cloud Architect</h3>
                    <p>A startup needs a scalable, secure cloud infrastructure! As their cloud architect, you need to design an AWS-based solution that can handle growth.</p>
                </div>
                
                <div class="task-panel">
                    <h3>🎯 Your Mission</h3>
                    <p>Design a cloud architecture using AWS services for scalability, security, and high availability.</p>
                </div>
                
                <div class="interaction-panel">
                    <h4>Cloud Architecture Components</h4>
                    <div class="cloud-design-form">
                        <div class="architecture-tier">
                            <h5>🌐 Web Tier</h5>
                            <select id="web-tier" class="cloud-select">
                                <option value="">Select Web Tier Service</option>
                                <option value="alb">Application Load Balancer</option>
                                <option value="cloudfront">CloudFront CDN</option>
                                <option value="route53">Route 53 DNS</option>
                                <option value="ec2">EC2 Web Servers</option>
                            </select>
                        </div>
                        
                        <div class="architecture-tier">
                            <h5>⚙️ Application Tier</h5>
                            <select id="app-tier" class="cloud-select">
                                <option value="">Select Application Service</option>
                                <option value="ecs">ECS Containers</option>
                                <option value="lambda">AWS Lambda</option>
                                <option value="elastic-beanstalk">Elastic Beanstalk</option>
                                <option value="ec2-auto-scaling">EC2 Auto Scaling</option>
                            </select>
                        </div>
                        
                        <div class="architecture-tier">
                            <h5>🗄️ Database Tier</h5>
                            <select id="db-tier" class="cloud-select">
                                <option value="">Select Database Service</option>
                                <option value="rds">Amazon RDS</option>
                                <option value="dynamodb">DynamoDB</option>
                                <option value="aurora">Amazon Aurora</option>
                                <option value="redshift">Amazon Redshift</option>
                            </select>
                        </div>
                        
                        <div class="architecture-tier">
                            <h5>🔐 Security & Monitoring</h5>
                            <div class="security-options">
                                <label><input type="checkbox" id="vpc"> VPC with Private Subnets</label>
                                <label><input type="checkbox" id="waf"> AWS WAF</label>
                                <label><input type="checkbox" id="cloudwatch"> CloudWatch Monitoring</label>
                                <label><input type="checkbox" id="iam"> IAM Roles & Policies</label>
                            </div>
                        </div>
                    </div>
                    
                    <button class="action-btn" onclick="window.aitrixLab.validateCloudArchitecture()">
                        🏗️ Deploy Architecture
                    </button>
                    <div id="cloud-feedback" class="result-panel"></div>
                </div>
            </div>
        `;
    }

    setupChallengeInteractions() {
        // Set up global reference for callback functions
        window.aitrixLab = this;

        // Initialize challenge-specific interactions based on type
        const challengeType = this.challengeData?.type;
        
        switch (challengeType) {
            case 'network_config':
                this.setupNetworkConfigInteractions();
                break;
            case 'security_quiz':
                this.setupSecurityQuizInteractions();
                break;
            case 'matching':
                this.setupMatchingInteractions();
                break;
            case 'network_builder':
                this.setupNetworkBuilderInteractions();
                break;
            case 'scenario_quiz':
                this.setupScenarioQuizInteractions();
                break;
            default:
                console.log('No specific interactions needed for challenge type:', challengeType);
        }
    }

    setupNetworkConfigInteractions() {
        const testBtn = document.getElementById('test-network');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testNetworkConfiguration());
        }
    }

    setupSecurityQuizInteractions() {
        // Password classification buttons are handled via onclick attributes in HTML
        console.log('Security quiz interactions set up');
    }

    setupMatchingInteractions() {
        // Set up click handlers for scenario and OS cards
        console.log('Setting up matching interactions');
        
        // Add click handlers for scenario cards
        const scenarioCards = document.querySelectorAll('.scenario-card');
        scenarioCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selections
                document.querySelectorAll('.scenario-card').forEach(c => {
                    c.classList.remove('selected');
                    c.style.borderColor = '#444';
                    c.style.backgroundColor = 'transparent';
                });
                
                // Select this card
                card.classList.add('selected');
                card.style.borderColor = '#e08300';
                card.style.backgroundColor = 'rgba(224, 131, 0, 0.1)';
                
                this.selectedScenario = card.dataset.answer;
                console.log('Selected scenario:', this.selectedScenario);
                
                this.updateAIMessage(`Good choice! You've selected "${card.querySelector('h5').textContent}". Now choose the best operating system for this scenario.`);
            });
        });
        
        // Add click handlers for OS cards
        const osCards = document.querySelectorAll('.os-card');
        osCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selections
                document.querySelectorAll('.os-card').forEach(c => {
                    c.classList.remove('selected');
                    c.style.borderColor = '#444';
                    c.style.backgroundColor = 'transparent';
                });
                
                // Select this card
                card.classList.add('selected');
                card.style.borderColor = '#e08300';
                card.style.backgroundColor = 'rgba(224, 131, 0, 0.1)';
                
                this.selectedOS = card.dataset.os;
                console.log('Selected OS:', this.selectedOS);
                
                this.updateAIMessage(`Excellent! You've chosen ${card.querySelector('h5').textContent}. Click "Validate Matches" to see if this is the optimal choice!`);
            });
        });
        
        // Initialize selection tracking
        this.selectedScenario = null;
        this.selectedOS = null;
        this.matches = [];
    }

    setupNetworkBuilderInteractions() {
        // Network building buttons are handled via onclick attributes in HTML
        console.log('Network builder interactions set up');
    }

    setupScenarioQuizInteractions() {
        // Quiz answer buttons are handled via onclick attributes in HTML
        console.log('Scenario quiz interactions set up');
    }

    testNetworkConfiguration() {
        const deviceAIP = document.getElementById('device-a-ip').value;
        const deviceBIP = document.getElementById('device-b-ip').value;
        const deviceASubnet = document.getElementById('device-a-subnet').value;
        const deviceBSubnet = document.getElementById('device-b-subnet').value;
        
        const resultDiv = document.getElementById('network-test-result');
        
        // Basic validation
        if (!deviceAIP || !deviceBIP) {
            resultDiv.innerHTML = '<div class="error-result"><h4>❌ Configuration Incomplete</h4><p>Please enter IP addresses for both devices.</p></div>';
            this.updateAIMessage("I see some missing IP addresses! Make sure both devices have valid IP configurations before testing connectivity.");
            return;
        }
        
        // Check if IPs are in same subnet
        const sameSubnet = this.areIPsInSameSubnet(deviceAIP, deviceBIP, deviceASubnet);
        
        if (sameSubnet) {
            resultDiv.innerHTML = `
                <div class="success-result">
                    <h4>✅ Connection Successful!</h4>
                    <p>Ping from ${deviceAIP} to ${deviceBIP}: SUCCESS</p>
                    <p>Both devices are on the same network and can communicate!</p>
                    <div class="ai-explanation">
                        🤖 Great job! The devices are properly configured on the same subnet, allowing them to communicate directly.
                    </div>
                </div>
            `;
            this.updateScore(100);
            this.updateAIMessage("Excellent work! You've successfully configured the network. Both devices can now communicate because they're on the same subnet. This is exactly how local networks function!");
        } else {
            resultDiv.innerHTML = `
                <div class="error-result">
                    <h4>❌ Connection Failed</h4>
                    <p>Ping from ${deviceAIP} to ${deviceBIP}: TIMEOUT</p>
                    <p>The devices cannot communicate. Check your network configuration.</p>
                    <div class="ai-hint">
                        💡 Hint: For devices to communicate directly, they need to be on the same network subnet.
                    </div>
                </div>
            `;
            this.attempts++;
            this.updateAIMessage("Almost there! The devices can't communicate yet because they're not on the same network. Try using IP addresses that are in the same subnet, like 192.168.1.10 and 192.168.1.20.");
        }
    }

    areIPsInSameSubnet(ip1, ip2, subnet) {
        // Simple subnet check for /24 networks
        const ip1Parts = ip1.split('.');
        const ip2Parts = ip2.split('.');
        
        // Check if first 3 octets are the same (assuming /24)
        return ip1Parts[0] === ip2Parts[0] && 
               ip1Parts[1] === ip2Parts[1] && 
               ip1Parts[2] === ip2Parts[2];
    }

    classifyPassword(index, classification) {
        const passwords = [
            { text: 'password123', correct: 'weak' },
            { text: 'MyS3cur3P@ssw0rd!', correct: 'strong' },
            { text: '12345678', correct: 'weak' },
            { text: 'Tr0ub4dor&3', correct: 'strong' },
            { text: 'admin', correct: 'weak' }
        ];
        
        const password = passwords[index];
        const isCorrect = classification === password.correct;
        const passwordItem = document.getElementById(`password-${index}`);
        
        // Update button states
        const buttons = passwordItem.querySelectorAll('.strength-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
            if (btn.textContent === classification.toUpperCase()) {
                btn.classList.add('selected');
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
        
        if (isCorrect) {
            this.updateScore(20);
            this.updateAIMessage(`Correct! "${password.text}" is indeed ${classification}. ${this.getPasswordExplanation(password.text, classification)}`);
        } else {
            this.attempts++;
            this.updateAIMessage(`Not quite right. "${password.text}" is actually ${password.correct}. ${this.getPasswordExplanation(password.text, password.correct)}`);
        }
        
        // Check if all passwords are classified
        const totalScore = this.score;
        if (totalScore >= 100) {
            setTimeout(() => {
                this.updateAIMessage("Outstanding! You've demonstrated excellent understanding of password security. Strong passwords are crucial for protecting digital assets!");
            }, 1500);
        }
    }

    getPasswordExplanation(password, strength) {
        const explanations = {
            'password123': 'This uses a common word with simple numbers - very predictable and easy to crack.',
            'MyS3cur3P@ssw0rd!': 'This has mixed case, numbers, special characters, and good length - very secure!',
            '12345678': 'Sequential numbers are extremely weak and among the most commonly used passwords.',
            'Tr0ub4dor&3': 'Despite being readable, it has good complexity with mixed case, numbers, and symbols.',
            'admin': 'Default/common usernames as passwords are incredibly insecure and easily guessed.'
        };
        
        return explanations[password] || 'Remember: strong passwords have 8+ characters, mixed case, numbers, and symbols!';
    }

    completeNetworkStep(stepNumber) {
        this.updateScore(33);
        
        const messages = {
            1: "Great! Physical connections are the foundation of networking. Ethernet cables create the data pathways between devices.",
            2: "Excellent IP configuration! You've assigned addresses that allow both PCs to communicate on the same network segment.",
            3: "Perfect! The ping test confirms successful communication. You've built a working network from scratch!"
        };
        
        this.updateAIMessage(messages[stepNumber] || "Step completed successfully!");
        
        if (stepNumber === 3) {
            setTimeout(() => this.completeChallenge(), 1500);
        }
    }

    answerSecurityQuestion(answer) {
        const correctAnswer = 'B'; // Delete email and contact bank directly
        
        if (answer === correctAnswer) {
            this.updateScore(100);
            this.updateAIMessage("Excellent choice! You correctly identified this as a phishing attempt. Always verify suspicious communications through official channels. This is exactly the right cybersecurity mindset!");
        } else {
            this.attempts++;
            this.updateAIMessage("That's not the safest option. The correct answer is B - delete the email and contact the bank directly. Phishing emails often create urgency to trick people into clicking malicious links. Always verify through official channels!");
        }
    }

    // Challenge validation methods
    validateNetworkDesign() {
        const hrSubnet = document.getElementById('hr-subnet').value;
        const itSubnet = document.getElementById('it-subnet').value;
        const guestSubnet = document.getElementById('guest-subnet').value;
        const hrVlan = document.getElementById('hr-vlan').value;
        const itVlan = document.getElementById('it-vlan').value;
        const guestVlan = document.getElementById('guest-vlan').value;
        
        const feedback = document.getElementById('network-design-feedback');
        
        let score = 0;
        let messages = [];
        
        // Validate subnets
        if (this.isValidSubnet(hrSubnet)) {
            score += 20;
            messages.push("✅ HR subnet configuration looks good");
        } else {
            messages.push("❌ HR subnet needs proper CIDR notation (e.g., 192.168.10.0/24)");
        }
        
        if (this.isValidSubnet(itSubnet)) {
            score += 20;
            messages.push("✅ IT subnet configuration looks good");
        } else {
            messages.push("❌ IT subnet needs proper CIDR notation (e.g., 192.168.20.0/24)");
        }
        
        if (this.isValidSubnet(guestSubnet)) {
            score += 20;
            messages.push("✅ Guest subnet configuration looks good");
        } else {
            messages.push("❌ Guest subnet needs proper CIDR notation (e.g., 192.168.100.0/24)");
        }
        
        // Validate VLANs
        if (hrVlan && itVlan && guestVlan && 
            hrVlan !== itVlan && hrVlan !== guestVlan && itVlan !== guestVlan) {
            score += 40;
            messages.push("✅ VLAN IDs are unique and properly assigned");
        } else {
            messages.push("❌ VLAN IDs must be unique numbers between 1-4094");
        }
        
        feedback.innerHTML = `
            <div class="${score >= 80 ? 'success-result' : 'error-result'}">
                <h4>Network Design Results (${score}/100)</h4>
                ${messages.map(msg => `<p>${msg}</p>`).join('')}
                ${score >= 80 ? '<p><strong>Excellent network segmentation design!</strong></p>' : ''}
            </div>
        `;
        
        if (score >= 80) {
            this.updateScore(100);
            this.updateAIMessage("Fantastic network design! You've properly segmented the network for security while maintaining functionality. This is exactly how enterprise networks should be designed!");
        } else {
            this.attempts++;
            this.updateAIMessage("Good effort! Network segmentation is complex. Review the feedback and try again. Remember: different departments should have different subnets and VLANs for security.");
        }
    }

    isValidSubnet(subnet) {
        const subnetRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
        return subnetRegex.test(subnet);
    }

    executeCommand(command) {
        const output = document.getElementById('terminal-output');
        const input = document.getElementById('command-input');
        
        if (!output || !input) return;
        
        // Add command to terminal
        const cmdDiv = document.createElement('div');
        cmdDiv.className = 'terminal-line';
        cmdDiv.innerHTML = `kali@kali:~$ ${command}`;
        output.appendChild(cmdDiv);
        
        // Process command
        const response = this.processPentestCommand(command);
        
        if (response) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'terminal-line';
            responseDiv.innerHTML = response.replace(/\n/g, '<br>');
            output.appendChild(responseDiv);
        }
        
        // Add new prompt
        const promptDiv = document.createElement('div');
        promptDiv.className = 'terminal-line';
        promptDiv.innerHTML = 'kali@kali:~$ <span class="cursor">_</span>';
        output.appendChild(promptDiv);
        
        // Clear input and scroll
        input.value = '';
        output.scrollTop = output.scrollHeight;
    }

    processPentestCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        if (cmd.includes('nmap') && cmd.includes('192.168.1.100')) {
            this.updateScore(50);
            return `Starting Nmap scan...
Host is up (0.0010s latency).
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 7.4
80/tcp   open  http       Apache httpd 2.4.6
443/tcp  open  https      Apache httpd 2.4.6
3306/tcp open  mysql      MySQL 5.7.30
Service detection performed. Please report any incorrect results.`;
        } else if (cmd.includes('nikto') && cmd.includes('192.168.1.100')) {
            this.updateScore(30);
            return `- Nikto v2.1.6
+ Target IP:          192.168.1.100
+ Target Hostname:    vulnerable-server.local
+ Target Port:        80
+ Start Time:         2024-01-15 10:30:00
--
+ Server: Apache/2.4.6 (CentOS)
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined.
+ Root page / redirects to: login.php
+ Uncommon header 'x-ob_mode' found, with contents: 1
+ Directory indexing found.
+ OSVDB-3092: /admin/: This might be interesting...`;
        } else if (cmd.includes('dirb') || cmd.includes('dirbuster')) {
            this.updateScore(20);
            return `DIRB v2.22    
By The Dark Raver
-----------------
START_TIME: Mon Jan 15 10:30:00 2024
URL_BASE: http://192.168.1.100/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt
-----------------
GENERATED WORDS: 4612
---- Scanning URL: http://192.168.1.100/ ----
+ http://192.168.1.100/admin (CODE:200|SIZE:1024)
+ http://192.168.1.100/backup (CODE:200|SIZE:512)
+ http://192.168.1.100/config (CODE:403|SIZE:278)
+ http://192.168.1.100/login.php (CODE:200|SIZE:2048)
-----------------
END_TIME: Mon Jan 15 10:32:15 2024
DOWNLOADED: 4612 - FOUND: 4`;
        } else {
            return `bash: ${command}: command not found`;
        }
    }

    useTool(toolName) {
        const commands = {
            'nmap': 'nmap -sV 192.168.1.100',
            'nikto': 'nikto -h 192.168.1.100',
            'dirb': 'dirb http://192.168.1.100/ /usr/share/dirb/wordlists/common.txt'
        };
        
        const input = document.getElementById('command-input');
        if (input && commands[toolName]) {
            input.value = commands[toolName];
            input.focus();
        }
    }

    checkNormalizationStep(step) {
        // Simple tracking of normalization steps
        this.updateScore(20);
        this.updateAIMessage(`Good! Step ${step} of database normalization is important. Each step removes different types of data redundancy and improves data integrity.`);
    }

    validateNormalization() {
        const checkedSteps = document.querySelectorAll('.norm-step input:checked').length;
        const feedback = document.getElementById('database-feedback');
        
        if (!feedback) return;
        
        if (checkedSteps >= 3) {
            feedback.innerHTML = `
                <div class="success-result">
                    <h4>✅ Database Normalization Complete!</h4>
                    <p>Excellent work! You've successfully normalized the database through 3NF:</p>
                    <ul>
                        <li>1NF: Eliminated repeating groups</li>
                        <li>2NF: Removed partial dependencies</li>
                        <li>3NF: Eliminated transitive dependencies</li>
                    </ul>
                    <p>The database now has proper structure and data integrity!</p>
                </div>
            `;
            this.updateScore(100);
            this.updateAIMessage("Outstanding database work! You've transformed a messy database into a well-structured, normalized system. This is exactly how professional database designers work!");
        } else {
            feedback.innerHTML = `
                <div class="error-result">
                    <h4>❌ More Normalization Needed</h4>
                    <p>You need to complete all normalization steps (1NF, 2NF, 3NF) to properly fix the database issues.</p>
                </div>
            `;
            this.updateAIMessage("You're on the right track! Database normalization requires completing all three normal forms. Each step is crucial for eliminating different types of data problems.");
        }
    }

    checkCLICommand(taskNumber) {
        const commands = {
            1: { correct: ['mkdir ~/projects', 'mkdir projects', 'mkdir /home/$USER/projects'], cmd: 'mkdir ~/projects' },
            2: { correct: ['useradd developer', 'sudo useradd developer', 'adduser developer'], cmd: 'useradd developer' },
            3: { correct: ['ps aux', 'ps -ef', 'ps -aux'], cmd: 'ps aux' },
            4: { correct: ['chmod 700 script.sh', 'chmod u+rwx script.sh'], cmd: 'chmod 700 script.sh' }
        };
        
        const input = document.getElementById(`task${taskNumber}-cmd`);
        if (!input) return;
        
        const userCmd = input.value.trim().toLowerCase();
        const task = commands[taskNumber];
        
        const isCorrect = task.correct.some(cmd => 
            userCmd === cmd.toLowerCase() || userCmd.includes(cmd.toLowerCase())
        );
        
        const taskElement = document.getElementById(`cli-task-${taskNumber}`);
        
        if (taskElement && isCorrect) {
            taskElement.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
            taskElement.style.borderLeft = '4px solid var(--color-success)';
            this.updateScore(25);
            this.updateAIMessage(`Perfect! "${task.cmd}" is exactly the right command for this task. You're thinking like a system administrator!`);
        } else if (taskElement) {
            taskElement.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
            taskElement.style.borderLeft = '4px solid var(--color-error)';
            this.updateAIMessage(`Not quite right. The correct command is "${task.cmd}". Linux commands are case-sensitive and syntax matters!`);
        }
    }

    validateCloudArchitecture() {
        const webTier = document.getElementById('web-tier')?.value;
        const appTier = document.getElementById('app-tier')?.value;
        const dbTier = document.getElementById('db-tier')?.value;
        
        const vpc = document.getElementById('vpc')?.checked;
        const waf = document.getElementById('waf')?.checked;
        const cloudwatch = document.getElementById('cloudwatch')?.checked;
        const iam = document.getElementById('iam')?.checked;
        
        const feedback = document.getElementById('cloud-feedback');
        if (!feedback) return;
        
        let score = 0;
        let messages = [];
        
        // Validate architecture tiers
        if (webTier && ['alb', 'cloudfront'].includes(webTier)) {
            score += 25;
            messages.push("✅ Good web tier selection for scalability");
        } else {
            messages.push("❌ Web tier needs load balancing or CDN for scalability");
        }
        
        if (appTier && ['ecs', 'lambda', 'ec2-auto-scaling'].includes(appTier)) {
            score += 25;
            messages.push("✅ Excellent application tier choice for scaling");
        } else {
            messages.push("❌ Application tier needs auto-scaling capabilities");
        }
        
        if (dbTier && ['rds', 'aurora'].includes(dbTier)) {
            score += 25;
            messages.push("✅ Great database choice for managed reliability");
        } else {
            messages.push("❌ Consider managed database services for better reliability");
        }
        
        // Validate security
        const securityCount = [vpc, waf, cloudwatch, iam].filter(Boolean).length;
        if (securityCount >= 3) {
            score += 25;
            messages.push("✅ Strong security and monitoring implementation");
        } else {
            messages.push("❌ Need more security components (VPC, WAF, CloudWatch, IAM)");
        }
        
        feedback.innerHTML = `
            <div class="${score >= 80 ? 'success-result' : 'error-result'}">
                <h4>Cloud Architecture Assessment (${score}/100)</h4>
                ${messages.map(msg => `<p>${msg}</p>`).join('')}
                ${score >= 80 ? '<p><strong>Excellent cloud architecture design!</strong></p>' : ''}
            </div>
        `;
        
        if (score >= 80) {
            this.updateScore(100);
            this.updateAIMessage("Incredible cloud architecture! You've designed a scalable, secure, and highly available system. This architecture could handle startup growth from zero to millions of users!");
        } else {
            this.attempts++;
            this.updateAIMessage("Good start on the cloud design! Remember the key principles: scalability, security, and high availability. Each tier needs the right AWS services to handle growth.");
        }
    }

    validateMatching() {
        // Check if user has made selections
        if (!this.selectedScenario || !this.selectedOS) {
            this.updateAIMessage("Please select both a scenario and an operating system first!");
            return;
        }
        
        // Check if the match is correct
        const isCorrect = this.selectedScenario === this.selectedOS;
        const resultDiv = document.getElementById('matching-result');
        
        if (!resultDiv) return;
        
        if (isCorrect) {
            resultDiv.innerHTML = `
                <div class="success-result">
                    <h4>✅ Perfect Match!</h4>
                    <p>You correctly matched the scenario with ${this.getOSName(this.selectedOS)}!</p>
                    <div class="ai-explanation">
                        🤖 ${this.getMatchingExplanation(this.selectedScenario, this.selectedOS)}
                    </div>
                </div>
            `;
            this.updateScore(100);
            this.updateAIMessage(`Excellent choice! ${this.getMatchingExplanation(this.selectedScenario, this.selectedOS)}`);
            
            // Auto-complete after successful match
            setTimeout(() => this.completeChallenge(), 2000);
        } else {
            resultDiv.innerHTML = `
                <div class="error-result">
                    <h4>❌ Not the Best Match</h4>
                    <p>This scenario would work better with a different operating system.</p>
                    <div class="ai-hint">
                        💡 Hint: ${this.getMatchingHint(this.selectedScenario)}
                    </div>
                </div>
            `;
            this.attempts++;
            this.updateAIMessage(`That's not the optimal choice. ${this.getMatchingHint(this.selectedScenario)} Try again!`);
        }
        
        // Reset selections for another attempt
        this.selectedScenario = null;
        this.selectedOS = null;
        document.querySelectorAll('.scenario-card, .os-card').forEach(card => {
            card.classList.remove('selected');
            card.style.borderColor = '#444';
            card.style.backgroundColor = 'transparent';
        });
    }
    
    getOSName(osId) {
        const osNames = {
            'windows': 'Windows 11',
            'linux': 'Ubuntu Linux',
            'macos': 'macOS'
        };
        return osNames[osId] || osId;
    }
    
    getMatchingExplanation(scenario, os) {
        const explanations = {
            'gaming-windows': 'Windows is perfect for gaming with excellent DirectX support and compatibility with most games.',
            'server-linux': 'Linux is ideal for servers due to its stability, security, and lower resource requirements.',
            'creative-macos': 'macOS excels in creative work with optimized software for video editing and design.'
        };
        return explanations[`${scenario}-${os}`] || 'Good match!';
    }
    
    getMatchingHint(scenario) {
        const hints = {
            'gaming': 'Think about which OS has the best game compatibility and DirectX support.',
            'server': 'Consider which OS is most commonly used for web servers and has lower overhead.',
            'creative': 'Which OS is known for professional creative software and video editing?'
        };
        return hints[scenario] || 'Think about the specific requirements of this use case.';
    }

    abortMission() {
        if (confirm('Are you sure you want to abort this mission? Your progress will be lost.')) {
            // Reset challenge state
            this.currentDifficulty = null;
            this.currentChallenge = null;
            this.score = 0;
            this.attempts = 0;
            this.currentStep = 0;
            this.challengeData = null;
            this.conversationHistory = [];
            
            // Redirect to difficulty selection screen
            this.showDifficultySelection();
        }
    }

    updateAIMessage(message) {
        // Update AI message display
        const aiMessageElement = this.container?.querySelector('#ai-message') || 
                                this.container?.querySelector('.ai-message') ||
                                document.querySelector('#ai-message') ||
                                document.querySelector('.ai-message');
        
        if (aiMessageElement) {
            aiMessageElement.textContent = message;
        } else {
            console.log('🤖 AI Message:', message);
        }

        // Add to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    updateScore(points) {
        // Update score
        this.score += points;
        
        // Update score display
        const scoreElement = this.container?.querySelector('#current-score') ||
                           this.container?.querySelector('.current-score') ||
                           document.querySelector('#current-score') ||
                           document.querySelector('.current-score');
        
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }

        console.log(`🎯 Score updated: +${points} points (Total: ${this.score})`);
    }

    completeChallenge() {
        // Mark challenge as completed
        const completionMessage = `🎉 Challenge Complete! You scored ${this.score} points with ${this.attempts} attempts.`;
        this.updateAIMessage(completionMessage);
        
        // Report progress to tracking systems
        this.reportProgressToCenter();
        
        // Show completion feedback
        setTimeout(() => {
            if (this.currentChallenge < 5) {
                // Auto-progress to next challenge
                this.startChallenge(this.currentChallenge + 1);
            } else {
                // Report room completion
                this.reportRoomCompletion();
                
                // Return to command center
                if (window.commandCenter) {
                    window.commandCenter.showCommandDashboard();
                } else {
                    this.showChallengeSelection();
                }
            }
        }, 2000);
    }

    getHint() {
        // Provide context-specific hints
        const hintMessages = {
            'network_config': 'Remember: devices need to be on the same subnet to communicate directly. Try using IP addresses like 192.168.1.10 and 192.168.1.20.',
            'security_quiz': 'Think about password complexity: length, mixed case, numbers, and special characters make passwords stronger.',
            'matching': 'Consider what each operating system is typically used for: gaming, servers, or creative work.',
            'network_builder': 'Follow the steps in order: physical connections first, then IP configuration, finally connectivity testing.',
            'scenario_quiz': 'When in doubt about security, always choose the safest option that verifies through official channels.'
        };
        
        const challengeType = this.challengeData?.type;
        const hint = hintMessages[challengeType] || 'Review the challenge requirements and think about the best approach.';
        
        this.updateAIMessage(`💡 Hint: ${hint}`);
    }

    resetChallenge() {
        // Reset challenge state
        this.score = 0;
        this.attempts = 0;
        this.currentStep = 0;
        
        // Reload the challenge interface
        this.initChallengeInterface();
        
        this.updateAIMessage('Challenge reset! You can start fresh with your learning journey.');
    }

    // Helper method to report progress to command center and database
    async reportProgressToCenter() {
        try {
            if (window.progressTracker) {
                // Use the improved completeChallenge method for proper validation
                await window.progressTracker.completeChallenge('aitrix', {
                    level: this.currentChallenge,
                    score: this.score,
                    timeSpent: this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                    attempts: this.attempts,
                    difficulty: this.currentDifficulty,
                    aiPersona: this.aiPersona
                });
                
                // Award level completion badge
                if (window.achievementManager) {
                    await window.achievementManager.checkLevelCompletion(
                        'aitrix',
                        this.currentChallenge,
                        this.score,
                        this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                        { difficulty: this.currentDifficulty, aiPersona: this.aiPersona }
                    );
                }
                
                // Dispatch event to update command center display
                window.dispatchEvent(new CustomEvent('progressUpdated', {
                    detail: {
                        roomName: 'aitrix',
                        progress: this.currentChallenge * 20, // Each challenge = 20%
                        score: this.score,
                        level: this.currentChallenge
                    }
                }));
                
                console.log(`📊 Challenge ${this.currentChallenge}/5 progress reported for AITRIX`);
            }
        } catch (error) {
            console.warn('Could not report progress to progress tracker:', error);
        }
    }

    // Helper method to report room completion with detailed stats
    async reportRoomCompletion() {
        try {
            if (window.progressTracker) {
                await window.progressTracker.markRoomComplete('aitrix', this.score);
                
                // Check for room completion badge
                if (window.achievementManager) {
                    const totalTime = this.roomStartTime ? Math.floor((Date.now() - this.roomStartTime) / 1000) : 0;
                    await window.achievementManager.checkRoomCompletion(
                        'aitrix',
                        this.score,
                        totalTime,
                        5, // All 5 levels completed
                        { difficulty: this.currentDifficulty, aiPersona: this.aiPersona }
                    );
                    
                    // Check for cross-room achievements
                    await window.achievementManager.checkAllRoomsCompletion();
                }
                
                // Dispatch room completion event
                window.dispatchEvent(new CustomEvent('roomCompleted', {
                    detail: {
                        roomName: 'aitrix',
                        completionStats: {
                            timeSpent: Math.floor((Date.now() - this.roomStartTime) / 1000),
                            totalAttempts: this.attempts,
                            finalScore: this.score,
                            difficulty: this.currentDifficulty,
                            totalChallenges: 5
                        }
                    }
                }));
                
                console.log('🏆 AITRIX room completion reported successfully');
            }
        } catch (error) {
            console.warn('Could not report room completion:', error);
        }
    }
}

// Export the class for use by command center
window.AitrixLab = AitrixLab;
window.aitrixLab = null;

// Don't auto-initialize when loaded independently
console.log('AitrixLab class loaded and ready for AI-powered IT training');
