class FlowchartGame {
    constructor() {
        this.gameDisplay = document.getElementById('gameDisplay');
        this.currentRoom = null;
        this.completionScore = 0;
        this.nodesPlaced = 0;
        this.currentLevel = 1;
        this.maxLevels = 5;
        this.isLearning = false;
        this.selectedTool = null;
        this.placedNodes = [];
        this.connections = [];
        this.connectionStart = null;
        this.attempts = 3;
        this.hintsUsed = 0;
        
        this.levelData = this.createDefaultLevelData();
        this.currentLevelData = this.levelData.levels[0];
        
        this.initializeGame();
    }

    createDefaultLevelData() {
        return {
            levels: [
                {
                    id: 1,
                    name: "Sarah's Coffee Shop Opening",
                    scenario: "Coffee Shop Process Flow",
                    character: "Sarah - Cafe Owner",
                    story: "Sarah is opening her first coffee shop and needs a simple process flowchart for her opening day routine. Help her create a basic flow that shows how she starts and ends her day.",
                    instruction: "Create Sarah's opening day flowchart: START → END (with proper connections)",
                    hint: "Every business process needs a clear beginning and end. Use oval shapes for START and END points.",
                    requiredNodes: ['oval', 'oval'],
                    requiredConnections: 1
                }
            ]
        };
    }

    initializeGame() {
        if (!this.gameDisplay) {
            console.error('Game display not found');
            return;
        }
        
        this.render();
    }

    render() {
        this.gameDisplay.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-diagram-3 text-6xl text-blue-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-blue-400">FLOWCHART CONSTRUCTION LAB</h2>
                    <p class="text-gray-300 mt-2">Learn to create proper flowcharts step by step!</p>
                </div>
                
                <div class="defense-status grid grid-cols-3 gap-4 mb-6">
                    <div class="status-card bg-green-900 p-4 rounded text-center">
                        <i class="bi bi-check-circle text-green-400 text-2xl"></i>
                        <p class="text-sm text-green-200">Learning Progress</p>
                        <p id="completion-score" class="text-2xl font-bold text-green-100">${this.completionScore}%</p>
                        <p class="text-xs ${this.completionScore > 70 ? 'text-green-400' : 'text-yellow-400'}">
                            ${this.completionScore > 70 ? 'EXCELLENT' : 'LEARNING'}
                        </p>
                    </div>
                    <div class="status-card bg-purple-900 p-4 rounded text-center">
                        <i class="bi bi-puzzle text-purple-400 text-2xl"></i>
                        <p class="text-sm text-purple-200">Current Level</p>
                        <p id="current-level" class="text-2xl font-bold text-purple-100">${this.currentLevel}/5</p>
                        <p class="text-xs text-purple-300">Number of Mistakes</p>
                    </div>
                    <div class="status-card bg-red-900 p-4 rounded text-center">
                        <i class="bi bi-heart-fill text-red-400 text-2xl"></i>
                        <p class="text-sm text-red-200">Attempts Left</p>
                        <p id="attempts-left" class="text-2xl font-bold text-red-100">${this.attempts}</p>
                        <p class="text-xs text-red-300">0</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="flex gap-4 mb-4">
                        <!-- Flowchart Canvas -->
                        <div class="game-area-container bg-black rounded-lg p-4 flex-1">
                            <h4 class="text-white font-bold mb-3 text-center">🔄 Flowchart Canvas</h4>
                            <div id="defense-game" class="relative bg-gray-900 rounded" style="width: 800px; height: 600px; margin: 0 auto; border: 2px solid #4299e1;">
                                <!-- Flowchart creation area -->
                            </div>
                        </div>
                        
                        <!-- Tool Palette -->
                        <div class="tool-palette bg-gray-800 rounded-lg p-4" style="width: 200px;">
                            <h4 class="text-white font-bold mb-3 text-center">🛠️ Tools</h4>
                            <div id="flowchart-tools" class="space-y-2">
                                <!-- Tools will be populated -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Instructions Panel -->
                    <div class="instruction-panel bg-gray-800 p-4 rounded-lg mb-4">
                        <div class="flex items-start gap-4 mb-3">
                            <div class="scenario-info flex-1">
                                <h4 class="text-white font-bold mb-2 flex items-center">
                                    📋 <span id="scenario-title" class="ml-2">${this.currentLevelData.name}</span>
                                </h4>
                                <div class="scenario-context bg-gray-700 p-3 rounded mb-3">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="text-blue-400 font-bold">🎭 Scenario:</span>
                                        <span id="scenario-name" class="text-blue-300">${this.currentLevelData.scenario}</span>
                                    </div>
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="text-green-400 font-bold">👤 Character:</span>
                                        <span id="character-name" class="text-green-300">${this.currentLevelData.character}</span>
                                    </div>
                                    <div class="text-gray-300 text-sm">
                                        <span class="text-purple-400 font-bold">📖 Story:</span>
                                        <p id="scenario-story" class="mt-1">${this.currentLevelData.story}</p>
                                    </div>
                                </div>
                                <div class="task-instruction bg-blue-900 p-3 rounded">
                                    <p class="text-blue-200 font-bold mb-1">🎯 Your Task:</p>
                                    <p id="current-instruction" class="text-gray-300 text-sm">${this.currentLevelData.instruction}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hint-section bg-gray-700 p-3 rounded">
                            <span class="text-xs text-gray-400">💡 Hint: </span>
                            <span id="current-hint" class="text-xs text-blue-300">${this.currentLevelData.hint}</span>
                        </div>
                    </div>
                    
                    <div class="control-buttons text-center mb-4">
                        <button id="complete-level" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-sm transition-colors mr-2">
                            <i class="bi bi-check-square"></i> Complete Level
                        </button>
                        <button id="abort-mission" class="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg text-sm transition-colors mr-2">
                            <i class="bi bi-x-circle"></i> Abort Mission
                        </button>
                        <button id="get-hint" class="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-lg text-sm transition-colors mr-2">
                            <i class="bi bi-lightbulb"></i> Get Hint
                        </button>
                        <button id="reset-canvas" class="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg text-sm transition-colors mr-2">
                            <i class="bi bi-arrow-clockwise"></i> Reset Canvas
                        </button>
                    </div>
                    
                    <div class="instructions text-center text-sm text-gray-400">
                        <p class="mb-2">🎯 Create flowcharts following the scenario instructions</p>
                        <p class="mb-2">🔄 Use arrows to connect nodes properly</p>
                        <p class="text-yellow-300">⚠️ <strong>Required:</strong> Connect all nodes with arrows to complete the level!</p>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.setupFlowchartTools();
        this.setupCanvas();
    }

    setupEventListeners() {
        document.getElementById('complete-level').addEventListener('click', () => {
            this.checkSolution();
        });

        document.getElementById('abort-mission').addEventListener('click', () => {
            this.exitLab();
        });

        document.getElementById('get-hint').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('reset-canvas').addEventListener('click', () => {
            this.resetCanvas();
        });
    }

    setupFlowchartTools() {
        const toolsContainer = document.getElementById('flowchart-tools');
        const tools = [
            { type: 'oval', icon: '⭕', name: 'Oval', description: 'Start/End', color: '#10b981' },
            { type: 'rectangle', icon: '⬜', name: 'Rectangle', description: 'Process', color: '#3b82f6' },
            { type: 'diamond', icon: '♦️', name: 'Diamond', description: 'Decision', color: '#f59e0b' },
            { type: 'parallelogram', icon: '▱', name: 'Parallelogram', description: 'Input/Output', color: '#8b5cf6' },
            { type: 'arrow', icon: '➡️', name: 'Arrow', description: 'Connector', color: '#6b7280' },
            { type: 'delete', icon: '🗑️', name: 'Delete', description: 'Remove', color: '#ef4444' }
        ];

        tools.forEach(tool => {
            const toolElement = document.createElement('div');
            toolElement.className = 'tool-item p-3 rounded cursor-pointer border-2 border-gray-600 hover:border-blue-400 transition-colors mb-2';
            toolElement.style.backgroundColor = tool.color + '20';
            toolElement.setAttribute('data-tool-type', tool.type);
            toolElement.innerHTML = `
                <div class="text-center">
                    <div class="text-2xl mb-1">${tool.icon}</div>
                    <div class="text-xs font-bold text-white">${tool.name}</div>
                    <div class="text-xs text-gray-300">${tool.description}</div>
                </div>
            `;
            
            toolElement.addEventListener('click', () => {
                this.selectTool(tool.type);
            });
            
            toolsContainer.appendChild(toolElement);
        });
    }

    selectTool(toolType) {
        // Clear any existing connection state
        if (this.connectionStart) {
            this.clearHighlight(this.connectionStart.id);
            this.connectionStart = null;
        }
        
        // Remove previous selection
        document.querySelectorAll('.tool-item').forEach(tool => {
            tool.classList.remove('border-blue-400');
            tool.classList.add('border-gray-600');
        });
        
        // Select current tool
        const selectedTool = document.querySelector(`[data-tool-type="${toolType}"]`);
        if (selectedTool) {
            selectedTool.classList.remove('border-gray-600');
            selectedTool.classList.add('border-blue-400');
        }
        
        this.selectedTool = toolType;
        
        let message = '';
        if (toolType === 'arrow') {
            message = 'Arrow tool selected: Click a node, then click another node to connect them';
        } else if (toolType === 'delete') {
            message = 'Delete tool selected: Click on any node or connection to remove it';
        } else {
            message = `${toolType} tool selected - Click on canvas to place`;
        }
        
        this.showMessage(message, 'info');
    }

    setupCanvas() {
        const gameArea = document.getElementById('defense-game');
        if (!gameArea) return;
        
        // Add grid background
        gameArea.style.backgroundImage = `
            linear-gradient(to right, rgba(75, 85, 99, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.3) 1px, transparent 1px)
        `;
        gameArea.style.backgroundSize = '20px 20px';
        
        // Canvas click handler
        gameArea.addEventListener('click', (e) => {
            if (!this.selectedTool) {
                this.showMessage('Please select a tool first!', 'warning');
                return;
            }
            
            const rect = gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.selectedTool === 'arrow') {
                if (this.connectionStart) {
                    this.clearHighlight(this.connectionStart.id);
                    this.connectionStart = null;
                    this.showMessage('Connection cancelled. Click a node to start connecting.', 'info');
                }
                return;
            } else if (this.selectedTool === 'delete') {
                this.showMessage('Click on a node or connection to delete it', 'info');
                return;
            } else {
                // Place node
                const gridX = Math.round(x / 20) * 20;
                const gridY = Math.round(y / 20) * 20;
                this.placeFlowchartNode(this.selectedTool, gridX, gridY);
            }
        });
    }

    placeFlowchartNode(toolType, x, y) {
        const nodeId = `node_${Date.now()}`;
        const node = {
            id: nodeId,
            type: toolType,
            x: x,
            y: y,
            text: this.getDefaultText(toolType)
        };
        
        this.placedNodes.push(node);
        this.nodesPlaced++;
        this.createNodeElement(node);
        this.updateDisplay();
        
        this.showMessage(`${toolType} node placed!`, 'success');
    }

    getDefaultText(type) {
        const defaults = {
            'oval': 'START/END',
            'rectangle': 'PROCESS',
            'diamond': 'DECISION',
            'parallelogram': 'INPUT/OUTPUT'
        };
        return defaults[type] || 'NODE';
    }

    createNodeElement(node) {
        const gameArea = document.getElementById('defense-game');
        if (!gameArea) return;
        
        const element = document.createElement('div');
        element.className = 'flowchart-node absolute cursor-pointer transition-all duration-200';
        element.style.left = `${node.x - 30}px`;
        element.style.top = `${node.y - 20}px`;
        element.style.width = '60px';
        element.style.height = '40px';
        element.style.zIndex = '15';
        element.style.userSelect = 'none';
        element.setAttribute('data-node-id', node.id);
        
        this.styleNodeElement(element, node);
        
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (this.selectedTool === 'arrow') {
                this.handleNodeConnectionClick(node.id);
            } else if (this.selectedTool === 'delete') {
                this.handleNodeDeletion(node.id);
            }
        });
        
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.editNodeText(node.id);
        });
        
        node.element = element;
        gameArea.appendChild(element);
    }

    styleNodeElement(element, node) {
        const styles = {
            oval: {
                background: 'linear-gradient(45deg, #10b981, #059669)',
                borderRadius: '50%',
                icon: '⭕',
                text: 'START/END'
            },
            rectangle: {
                background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                borderRadius: '8px',
                icon: '⬜',
                text: 'PROCESS'
            },
            diamond: {
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                borderRadius: '0',
                icon: '♦️',
                text: 'DECISION',
                transform: 'rotate(45deg)'
            },
            parallelogram: {
                background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                borderRadius: '4px',
                icon: '▱',
                text: 'INPUT/OUTPUT',
                transform: 'skewX(-20deg)'
            }
        };
        
        const style = styles[node.type] || styles.rectangle;
        
        element.style.background = style.background;
        element.style.borderRadius = style.borderRadius;
        element.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.color = 'white';
        element.style.fontSize = '9px';
        element.style.fontWeight = 'bold';
        element.style.textAlign = 'center';
        element.style.transform = style.transform || 'none';
        
        element.innerHTML = `
            <div class="node-content" style="transform: ${style.transform && style.transform.includes('skew') ? 'skewX(20deg)' : style.transform && style.transform.includes('rotate') ? 'rotate(-45deg)' : 'none'}">
                <div style="font-size: 12px;">${style.icon}</div>
                <div style="font-size: 7px; margin-top: 2px; line-height: 1;">${node.text || style.text}</div>
            </div>
        `;
        
        element.addEventListener('mouseenter', () => {
            const currentTransform = style.transform || '';
            element.style.transform = currentTransform + ' scale(1.1)';
            element.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = style.transform || 'none';
            element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        });
    }

    handleNodeConnectionClick(nodeId) {
        if (!this.connectionStart) {
            this.connectionStart = this.placedNodes.find(n => n.id === nodeId);
            if (this.connectionStart) {
                this.highlightNode(nodeId, '#00ff00');
                this.showMessage(`Selected ${this.connectionStart.type} as connection start. Click another node to connect.`, 'info');
            }
        } else {
            if (nodeId !== this.connectionStart.id) {
                const existingConnection = this.connections.find(conn => 
                    conn.from === this.connectionStart.id && conn.to === nodeId
                );
                
                if (existingConnection) {
                    this.showMessage('Connection already exists between these nodes!', 'error');
                } else {
                    this.createConnection(this.connectionStart.id, nodeId);
                    const targetNode = this.placedNodes.find(n => n.id === nodeId);
                    this.showMessage(`Connected ${this.connectionStart.type} to ${targetNode.type}`, 'success');
                }
            } else {
                this.showMessage('Cannot connect a node to itself!', 'error');
            }
            
            this.clearHighlight(this.connectionStart.id);
            this.connectionStart = null;
        }
    }

    createConnection(fromNodeId, toNodeId) {
        const fromElement = document.querySelector(`[data-node-id="${fromNodeId}"]`);
        const toElement = document.querySelector(`[data-node-id="${toNodeId}"]`);
        
        if (!fromElement || !toElement) return;
        
        const gameArea = document.getElementById('defense-game');
        
        // Calculate positions
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();
        
        const fromCenterX = fromRect.left - gameRect.left + fromRect.width / 2;
        const fromCenterY = fromRect.top - gameRect.top + fromRect.height / 2;
        const toCenterX = toRect.left - gameRect.left + toRect.width / 2;
        const toCenterY = toRect.top - gameRect.top + toRect.height / 2;
        
        const dx = toCenterX - fromCenterX;
        const dy = toCenterY - fromCenterY;
        const angle = Math.atan2(dy, dx);
        
        const fromRadius = Math.max(fromRect.width, fromRect.height) / 2;
        const toRadius = Math.max(toRect.width, toRect.height) / 2;
        
        const x1 = fromCenterX + Math.cos(angle) * fromRadius;
        const y1 = fromCenterY + Math.sin(angle) * fromRadius;
        const x2 = toCenterX - Math.cos(angle) * toRadius;
        const y2 = toCenterY - Math.sin(angle) * toRadius;
        
        // Create SVG if doesn't exist
        let svg = gameArea.querySelector('svg');
        if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            svg.style.zIndex = '5';
            
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '12');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '12');
            marker.setAttribute('refY', '5');
            marker.setAttribute('orient', 'auto');
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 12 5, 0 10');
            polygon.setAttribute('fill', '#60a5fa');
            
            marker.appendChild(polygon);
            defs.appendChild(marker);
            svg.appendChild(defs);
            gameArea.appendChild(svg);
        }
        
        const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        connection.setAttribute('x1', x1);
        connection.setAttribute('y1', y1);
        connection.setAttribute('x2', x2);
        connection.setAttribute('y2', y2);
        connection.setAttribute('stroke', '#60a5fa');
        connection.setAttribute('stroke-width', '3');
        connection.setAttribute('marker-end', 'url(#arrowhead)');
        
        svg.appendChild(connection);
        
        this.connections.push({
            from: fromNodeId,
            to: toNodeId,
            element: connection
        });
    }

    handleNodeDeletion(nodeId) {
        const nodeToDelete = this.placedNodes.find(n => n.id === nodeId);
        if (!nodeToDelete) return;
        
        const confirmed = confirm(`Delete this ${nodeToDelete.type} node? This will also remove any connections to it.`);
        if (!confirmed) return;
        
        // Remove connections
        this.connections = this.connections.filter(conn => {
            if (conn.from === nodeId || conn.to === nodeId) {
                if (conn.element && conn.element.parentNode) {
                    conn.element.remove();
                }
                return false;
            }
            return true;
        });
        
        // Remove node
        this.placedNodes = this.placedNodes.filter(n => n.id !== nodeId);
        this.nodesPlaced = Math.max(0, this.nodesPlaced - 1);
        
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.remove();
        }
        
        this.updateDisplay();
        this.showMessage(`${nodeToDelete.type} node deleted successfully`, 'success');
    }

    editNodeText(nodeId) {
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (!nodeElement) return;
        
        const currentText = nodeElement.querySelector('.node-content div:last-child').textContent;
        const newText = prompt('Enter node text:', currentText);
        
        if (newText !== null) {
            nodeElement.querySelector('.node-content div:last-child').textContent = newText.toUpperCase();
            
            const node = this.placedNodes.find(n => n.id === nodeId);
            if (node) {
                node.text = newText;
            }
        }
    }

    highlightNode(nodeId, color) {
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.style.border = `3px solid ${color}`;
            nodeElement.style.boxShadow = `0 0 15px ${color}`;
        }
    }

    clearHighlight(nodeId) {
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            nodeElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        }
    }

    checkSolution() {
        const validation = this.validateSolution();
        
        if (validation.isCorrect) {
            this.completionScore = Math.min(100, this.completionScore + 20);
            this.showValidationFeedback(true, validation.feedback);
            
            setTimeout(() => {
                this.nextLevel();
            }, 2000);
        } else {
            this.attempts--;
            this.showValidationFeedback(false, validation.feedback);
            this.updateDisplay();
            
            if (this.attempts <= 0) {
                this.showMessage('No attempts left! Try the reset button and start over.', 'error');
            }
        }
    }

    validateSolution() {
        const requiredNodes = this.currentLevelData.requiredNodes || [];
        const requiredConnections = this.currentLevelData.requiredConnections || 0;
        
        // Check if we have the right number of nodes
        if (this.placedNodes.length < requiredNodes.length) {
            return {
                isCorrect: false,
                feedback: `You need ${requiredNodes.length} nodes but only have ${this.placedNodes.length}. Add more nodes!`
            };
        }
        
        // Check if we have the right types of nodes
        const placedTypes = this.placedNodes.map(n => n.type);
        for (const requiredType of requiredNodes) {
            if (!placedTypes.includes(requiredType)) {
                return {
                    isCorrect: false,
                    feedback: `Missing required ${requiredType} node. Check the instructions!`
                };
            }
        }
        
        // Check connections
        if (this.connections.length < requiredConnections) {
            return {
                isCorrect: false,
                feedback: `You need ${requiredConnections} connections but only have ${this.connections.length}. Use the arrow tool to connect nodes!`
            };
        }
        
        return {
            isCorrect: true,
            feedback: 'Perfect! All requirements met.'
        };
    }

    nextLevel() {
        this.currentLevel++;
        
        if (this.currentLevel > this.maxLevels) {
            this.showSuccessScreen();
        } else {
            // Load next level (for now, just show success since we only have 1 level)
            this.showSuccessScreen();
        }
    }

    showSuccessScreen() {
        this.gameDisplay.innerHTML = `
            <div class="defense-success text-center p-8">
                <i class="bi bi-trophy-fill text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">FLOWCHART MASTERY ACHIEVED!</h2>
                
                <div class="final-stats grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-green-800 p-4 rounded">
                        <p class="text-green-200">Final Score</p>
                        <p class="text-2xl font-bold text-green-400">${Math.round(this.completionScore)}%</p>
                        <p class="text-xs text-green-300">✓ Mastered</p>
                    </div>
                    <div class="bg-purple-800 p-4 rounded">
                        <p class="text-purple-200">Nodes Created</p>
                        <p class="text-2xl font-bold text-purple-400">${this.nodesPlaced}</p>
                        <p class="text-xs text-purple-300">✓ Experience</p>
                    </div>
                    <div class="bg-blue-800 p-4 rounded">
                        <p class="text-blue-200">Connections Made</p>
                        <p class="text-2xl font-bold text-blue-400">${this.connections.length}</p>
                        <p class="text-xs text-blue-300">✓ Flow Logic</p>
                    </div>
                </div>
                
                <div class="victory-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🎓 Learning Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Flowchart fundamentals mastered</p>
                        <p>✅ Proper symbol usage learned</p>
                        <p>✅ Connection logic understood</p>
                        <p>✅ Process flow completed</p>
                        <p>✅ Ready for advanced flowcharts</p>
                    </div>
                </div>
                
                <button class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg" onclick="window.commandCenter.showRoomSelection()">
                    Return to Command Center
                </button>
            </div>
        `;
    }

    showValidationFeedback(isCorrect, feedback) {
        const gameArea = document.getElementById('defense-game');
        
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'absolute text-white font-bold text-lg animate-pulse';
        feedbackElement.style.left = '50%';
        feedbackElement.style.top = '10px';
        feedbackElement.style.transform = 'translateX(-50%)';
        feedbackElement.style.zIndex = '30';
        feedbackElement.style.backgroundColor = isCorrect ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)';
        feedbackElement.style.padding = '10px 20px';
        feedbackElement.style.borderRadius = '8px';
        feedbackElement.innerHTML = `
            <div class="text-center">
                <div class="text-2xl mb-2">${isCorrect ? '✅' : '❌'}</div>
                <div>${feedback}</div>
            </div>
        `;
        
        gameArea.appendChild(feedbackElement);
        
        setTimeout(() => {
            if (feedbackElement.parentNode) {
                feedbackElement.remove();
            }
        }, 3000);
    }

    showHint() {
        this.hintsUsed++;
        this.showMessage(this.currentLevelData.hint, 'info');
    }

    resetCanvas() {
        if (confirm('Are you sure you want to reset the canvas? This will clear all nodes and connections.')) {
            // Clear connection state
            if (this.connectionStart) {
                this.clearHighlight(this.connectionStart.id);
                this.connectionStart = null;
            }
            
            // Clear data
            this.placedNodes = [];
            this.connections = [];
            this.nodesPlaced = 0;
            this.attempts = 3;
            
            // Clear visual elements
            const gameArea = document.getElementById('defense-game');
            if (gameArea) {
                gameArea.querySelectorAll('.flowchart-node').forEach(node => node.remove());
                gameArea.querySelectorAll('svg').forEach(svg => svg.remove());
            }
            
            this.updateDisplay();
            this.showMessage('Canvas reset! Start placing nodes to build your flowchart.', 'info');
        }
    }

    updateDisplay() {
        const scoreDisplay = document.getElementById('completion-score');
        if (scoreDisplay) {
            scoreDisplay.textContent = `${Math.round(this.completionScore)}%`;
        }
        
        const levelDisplay = document.getElementById('current-level');
        if (levelDisplay) {
            levelDisplay.textContent = `${this.currentLevel}/5`;
        }
        
        const attemptsDisplay = document.getElementById('attempts-left');
        if (attemptsDisplay) {
            attemptsDisplay.textContent = this.attempts;
        }
    }

    exitLab() {
        if (confirm('Are you sure you want to exit the lab? Your progress will be saved.')) {
            if (window.commandCenter) {
                window.commandCenter.showRoomSelection();
            }
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-20 right-4 p-3 rounded z-50 animate-pulse max-w-sm`;
        
        switch(type) {
            case 'success':
                messageDiv.classList.add('bg-green-800', 'text-green-200', 'border', 'border-green-500');
                break;
            case 'error':
                messageDiv.classList.add('bg-red-800', 'text-red-200', 'border', 'border-red-500');
                break;
            case 'info':
                messageDiv.classList.add('bg-blue-800', 'text-blue-200', 'border', 'border-blue-500');
                break;
            case 'warning':
                messageDiv.classList.add('bg-yellow-800', 'text-yellow-200', 'border', 'border-yellow-500');
                break;
            default:
                messageDiv.classList.add('bg-gray-800', 'text-gray-200', 'border', 'border-gray-500');
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Global functions for backwards compatibility
window.clearCanvas = function() {
    if (window.flowchartGame) {
        window.flowchartGame.resetCanvas();
    }
};

window.checkSolution = function() {
    if (window.flowchartGame) {
        window.flowchartGame.checkSolution();
    }
};

window.showHint = function() {
    if (window.flowchartGame) {
        window.flowchartGame.showHint();
    }
};

window.nextLevel = function() {
    if (window.flowchartGame) {
        window.flowchartGame.nextLevel();
    }
};

// Make FlowchartGame available globally
window.FlowchartGame = FlowchartGame;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('gameDisplay')) {
            window.flowchartGame = new FlowchartGame();
        }
    });
} else {
    if (document.getElementById('gameDisplay')) {
        window.flowchartGame = new FlowchartGame();
    }
}
