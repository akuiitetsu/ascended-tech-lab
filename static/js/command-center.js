class CommandCenter {
    constructor() {
        this.gameDisplay = document.getElementById('gameDisplay');
        this.currentRoom = null;
        this.initializeModuleButtons();
        this.loadUserInfo();
    }

    initializeModuleButtons() {
        const moduleButtons = document.querySelectorAll('.module-nav-btn');
        moduleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const roomType = button.classList[1]; // Get the second class (flowchart, networking, etc.)
                this.loadRoom(roomType);
            });
        });
    }

    async loadRoom(roomType) {
        // Show loading screen
        this.showLoadingScreen(roomType);
        
        try {
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Load the appropriate room content
            const roomContent = await this.getRoomContent(roomType);
            this.gameDisplay.innerHTML = roomContent;
            
            // Initialize room-specific JavaScript
            this.initializeRoomJS(roomType);
            
        } catch (error) {
            console.error('Error loading room:', error);
            this.showErrorScreen();
        }
    }

    showLoadingScreen(roomType) {
        const roomNames = {
            'flowchart': 'FLOWBYTE',
            'networking': 'NETXUS', 
            'ai-training': 'AITRIX',
            'database': 'SCHEMAX',
            'programming': 'CODEVANCE'
        };

        this.gameDisplay.innerHTML = `
            <div class="loading-screen">
                <i class="bi bi-cpu-fill"></i>
                <span>Loading ${roomNames[roomType] || 'Room'}...</span>
                <div class="loading-progress">
                    <div class="progress-bar-loading"></div>
                </div>
            </div>
        `;

        // Add loading animation styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-progress {
                width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 20px;
            }
            .progress-bar-loading {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #A069FF, #10a1fa);
                animation: loadingProgress 2s ease-in-out;
            }
            @keyframes loadingProgress {
                0% { width: 0%; }
                100% { width: 100%; }
            }
        `;
        
        if (!document.getElementById('loading-styles')) {
            style.id = 'loading-styles';
            document.head.appendChild(style);
        }
    }

    async getRoomContent(roomType) {
        const roomFiles = {
            'flowchart': '/src/rooms/flowchart-room.html'
        };

        if (roomFiles[roomType]) {
            try {
                const response = await fetch(roomFiles[roomType]);
                if (!response.ok) throw new Error('Room not found');
                return await response.text();
            } catch (error) {
                console.error('Error fetching room:', error);
                return this.getPlaceholderRoom(roomType);
            }
        } else {
            return this.getPlaceholderRoom(roomType);
        }
    }

    getPlaceholderRoom(roomType) {
        const roomInfo = {
            'flowchart': {
                name: 'FLOWBYTE',
                description: 'Master the art of flowchart design and logical thinking',
                icon: 'bi-diagram-3',
                color: '#005FFB'
            },
            'networking': {
                name: 'NETXUS',
                description: 'Dive deep into network protocols and infrastructure',
                icon: 'bi-hdd-network',
                color: '#00A949'
            },
            'ai-training': {
                name: 'AITRIX',
                description: 'Train AI models and understand machine learning concepts',
                icon: 'bi-robot',
                color: '#E08300'
            },
            'database': {
                name: 'SCHEMAX',
                description: 'Design and optimize database systems',
                icon: 'bi-database',
                color: '#FF3600'
            },
            'programming': {
                name: 'CODEVANCE',
                description: 'Master programming concepts and algorithms',
                icon: 'bi-code-slash',
                color: '#FF006D'
            }
        };

        const room = roomInfo[roomType] || roomInfo['flowchart'];

        return `
            <div class="room-placeholder">
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
                    <button class="back-to-rooms-btn" onclick="window.commandCenter.showRoomSelection()">
                        <i class="bi bi-arrow-left"></i> Back to Room Selection
                    </button>
                </div>
            </div>
            <style>
                .room-placeholder {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #ffffff;
                    padding: 40px;
                }
                .room-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                    padding: 20px 40px;
                    border: 2px solid;
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.05);
                }
                .room-header i {
                    font-size: 3rem;
                }
                .room-header h2 {
                    margin: 0;
                    font-size: 2.5rem;
                }
                .room-description {
                    margin-bottom: 40px;
                    max-width: 600px;
                }
                .room-description p {
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
                .back-to-rooms-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                }
                .back-to-rooms-btn:hover {
                    background: #0056b3;
                    transform: translateY(-2px);
                }
            </style>
        `;
    }

    initializeRoomJS(roomType) {
        if (roomType === 'flowchart') {
            // Load and initialize flowchart game
            this.loadFlowchartGame();
        }
        // Add other room initializations as needed
    }

    loadFlowchartGame() {
        // Create script element for flowchart game
        const script = document.createElement('script');
        script.src = '/static/js/flowchart-game.js';
        script.onload = () => {
            // Initialize the game after script loads
            if (window.FlowchartGame) {
                window.flowchartGame = new window.FlowchartGame();
            }
        };
        document.head.appendChild(script);
    }

    showRoomSelection() {
        this.gameDisplay.innerHTML = `
            <div class="room-selection">
                <div class="selection-header">
                    <h2><i class="bi bi-command"></i> Select a Training Room</h2>
                    <p>Choose your learning adventure from the available modules</p>
                </div>
                <div class="room-grid">
                    <div class="room-card flowchart" onclick="window.commandCenter.loadRoom('flowchart')">
                        <i class="bi bi-diagram-3"></i>
                        <h3>FLOWBYTE</h3>
                        <p>Flowchart Logic</p>
                        <div class="room-status available">Available</div>
                    </div>
                    <div class="room-card networking" onclick="window.commandCenter.loadRoom('networking')">
                        <i class="bi bi-hdd-network"></i>
                        <h3>NETXUS</h3>
                        <p>Network Engineering</p>
                        <div class="room-status coming-soon">Coming Soon</div>
                    </div>
                    <div class="room-card ai-training" onclick="window.commandCenter.loadRoom('ai-training')">
                        <i class="bi bi-robot"></i>
                        <h3>AITRIX</h3>
                        <p>AI & Machine Learning</p>
                        <div class="room-status coming-soon">Coming Soon</div>
                    </div>
                    <div class="room-card database" onclick="window.commandCenter.loadRoom('database')">
                        <i class="bi bi-database"></i>
                        <h3>SCHEMAX</h3>
                        <p>Database Management</p>
                        <div class="room-status coming-soon">Coming Soon</div>
                    </div>
                    <div class="room-card programming" onclick="window.commandCenter.loadRoom('programming')">
                        <i class="bi bi-code-slash"></i>
                        <h3>CODEVANCE</h3>
                        <p>Advanced Programming</p>
                        <div class="room-status coming-soon">Coming Soon</div>
                    </div>
                </div>
            </div>
            <style>
                .room-selection {
                    height: 100%;
                    padding: 40px;
                    color: #ffffff;
                }
                .selection-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .selection-header h2 {
                    color: #10a1fa;
                    margin-bottom: 10px;
                }
                .room-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .room-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 30px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    position: relative;
                }
                .room-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                .room-card.flowchart { border-color: #005FFB; }
                .room-card.flowchart:hover { background: rgba(0, 95, 251, 0.1); }
                .room-card.networking { border-color: #00A949; }
                .room-card.networking:hover { background: rgba(0, 169, 73, 0.1); }
                .room-card.ai-training { border-color: #E08300; }
                .room-card.ai-training:hover { background: rgba(224, 131, 0, 0.1); }
                .room-card.database { border-color: #FF3600; }
                .room-card.database:hover { background: rgba(255, 54, 0, 0.1); }
                .room-card.programming { border-color: #FF006D; }
                .room-card.programming:hover { background: rgba(255, 0, 109, 0.1); }
                .room-card i {
                    font-size: 3rem;
                    margin-bottom: 20px;
                }
                .room-card h3 {
                    margin: 10px 0;
                    font-size: 1.5rem;
                }
                .room-card p {
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 20px;
                }
                .room-status {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                .room-status.available {
                    background: #28a745;
                    color: white;
                }
                .room-status.coming-soon {
                    background: #ffc107;
                    color: #000;
                }
            </style>
        `;
    }

    showErrorScreen() {
        this.gameDisplay.innerHTML = `
            <div class="error-screen">
                <i class="bi bi-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>Unable to load the selected room. Please try again.</p>
                <button class="retry-btn" onclick="window.commandCenter.showRoomSelection()">
                    <i class="bi bi-arrow-clockwise"></i> Back to Room Selection
                </button>
            </div>
            <style>
                .error-screen {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    text-align: center;
                }
                .error-screen i {
                    font-size: 4rem;
                    color: #dc3545;
                    margin-bottom: 20px;
                }
                .error-screen h3 {
                    color: #dc3545;
                    margin-bottom: 15px;
                }
                .retry-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                }
                .retry-btn:hover {
                    background: #0056b3;
                    transform: translateY(-2px);
                }
            </style>
        `;
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