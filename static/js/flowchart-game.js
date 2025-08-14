class FlowByteGame {
    constructor() {
        this.currentDifficulty = null;
        this.currentLevel = null;
        this.currentTool = 'select';
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.connectionSource = null;
        this.nodeCounter = 0;
        this.gameContainer = null;
        
        this.difficulties = {
            easy: {
                name: 'Easy',
                description: 'Basic flowchart construction with guided instructions',
                levels: [
                    { name: 'Simple Start-End Flow', objective: 'Create a basic start-to-end flowchart' },
                    { name: 'Decision Making', objective: 'Add decision nodes to your flowchart' },
                    { name: 'Input-Output Flow', objective: 'Create flowchart with input/output operations' },
                    { name: 'Process Chain', objective: 'Build a multi-step process flowchart' },
                    { name: 'Complete Workflow', objective: 'Combine all elements into complex flowchart' }
                ]
            },
            hard: {
                name: 'Hard',
                description: 'Advanced flowchart design with complex logic patterns',
                levels: [
                    { name: 'Nested Decisions', objective: 'Create flowchart with multiple decision branches' },
                    { name: 'Loop Structures', objective: 'Design flowcharts with iterative processes' },
                    { name: 'Error Handling', objective: 'Build flowcharts with exception handling' },
                    { name: 'Parallel Processing', objective: 'Design concurrent workflow patterns' },
                    { name: 'System Architecture', objective: 'Create comprehensive system flowchart' }
                ]
            }
        };
    }

    init() {
        this.showRoomSelection();
    }

    showRoomSelection() {
        document.body.innerHTML = `
            <div class="flowbyte-container">
                <div class="room-header">
                    <h1>FLOWBYTE</h1>
                    <p>Flowchart Construction Lab</p>
                </div>
                <div class="difficulty-selection">
                    <h2>Select Difficulty Level</h2>
                    <div class="difficulty-cards">
                        <div class="difficulty-card easy" onclick="flowByteGame.selectDifficulty('easy')">
                            <h3>Easy</h3>
                            <p>Basic flowchart construction with guided instructions</p>
                            <div class="level-count">5 Levels</div>
                        </div>
                        <div class="difficulty-card hard" onclick="flowByteGame.selectDifficulty('hard')">
                            <h3>Hard</h3>
                            <p>Advanced flowchart design with complex logic patterns</p>
                            <div class="level-count">5 Levels</div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .flowbyte-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                .room-header { text-align: center; margin-bottom: 40px; }
                .room-header h1 { font-size: 3em; color: #2c5aa0; margin: 0; }
                .room-header p { font-size: 1.2em; color: #666; margin: 10px 0; }
                .difficulty-selection h2 { text-align: center; margin-bottom: 30px; color: #333; }
                .difficulty-cards { display: flex; gap: 30px; justify-content: center; }
                .difficulty-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; width: 250px; text-align: center; }
                .difficulty-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .difficulty-card.easy { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
                .difficulty-card.hard { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
                .difficulty-card h3 { margin: 0 0 15px 0; font-size: 1.5em; }
                .difficulty-card p { margin: 0 0 20px 0; opacity: 0.9; }
                .level-count { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; }
            </style>
        `;
    }

    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.showLevelSelection();
    }

    showLevelSelection() {
        const difficultyData = this.difficulties[this.currentDifficulty];
        
        document.body.innerHTML = `
            <div class="flowbyte-container">
                <div class="level-header">
                    <button class="back-btn" onclick="flowByteGame.showRoomSelection()">← Back to Difficulty</button>
                    <h1>FLOWBYTE - ${difficultyData.name}</h1>
                    <p>${difficultyData.description}</p>
                </div>
                <div class="level-selection">
                    <h2>Select Level</h2>
                    <div class="level-grid">
                        ${difficultyData.levels.map((level, index) => `
                            <div class="level-card" onclick="flowByteGame.startLevel(${index + 1})">
                                <div class="level-number">${index + 1}</div>
                                <h3>${level.name}</h3>
                                <p>${level.objective}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <style>
                .flowbyte-container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                .level-header { text-align: center; margin-bottom: 40px; position: relative; }
                .back-btn { position: absolute; left: 0; top: 0; background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
                .back-btn:hover { background: #5a6268; }
                .level-header h1 { font-size: 2.5em; color: #2c5aa0; margin: 0; }
                .level-header p { font-size: 1.1em; color: #666; margin: 10px 0; }
                .level-selection h2 { text-align: center; margin-bottom: 30px; color: #333; }
                .level-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                .level-card { background: white; border: 2px solid #e9ecef; padding: 25px; border-radius: 10px; cursor: pointer; transition: all 0.3s; text-align: center; }
                .level-card:hover { border-color: #007bff; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                .level-number { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em; margin: 0 auto 15px; }
                .level-card h3 { margin: 0 0 10px 0; color: #333; }
                .level-card p { margin: 0; color: #666; font-size: 0.9em; }
            </style>
        `;
    }

    startLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.initGame();
    }

    initGame() {
        const difficultyData = this.difficulties[this.currentDifficulty];
        const levelData = difficultyData.levels[this.currentLevel - 1];
        
        document.body.innerHTML = `
            <div class="game-interface">
                <div class="game-header">
                    <button class="back-btn" onclick="flowByteGame.showLevelSelection()">← Back to Levels</button>
                    <div class="level-info">
                        <h2>${difficultyData.name} - Level ${this.currentLevel}</h2>
                        <p><strong>Objective:</strong> ${levelData.objective}</p>
                    </div>
                    <div class="game-controls">
                        <button class="reset-btn" onclick="flowByteGame.resetCanvas()">Reset Canvas</button>
                        <button class="export-btn" onclick="flowByteGame.exportFlowchart()">Export</button>
                    </div>
                </div>
                
                <div class="game-content">
                    <div class="toolbar">
                        <h3>Tools</h3>
                        <div class="tool-group">
                            <button class="tool-btn active" data-tool="select" onclick="flowByteGame.selectTool('select')">
                                <span>📋</span> Select
                            </button>
                            <button class="tool-btn" data-tool="arrow" onclick="flowByteGame.selectTool('arrow')">
                                <span>🔗</span> Connect
                            </button>
                            <button class="tool-btn" data-tool="delete" onclick="flowByteGame.selectTool('delete')">
                                <span>🗑️</span> Delete
                            </button>
                        </div>
                        
                        <h3>Node Types</h3>
                        <div class="node-types">
                            <button class="node-btn" onclick="flowByteGame.addNode('oval')">
                                <div class="node-preview oval"></div>
                                Start/End
                            </button>
                            <button class="node-btn" onclick="flowByteGame.addNode('rectangle')">
                                <div class="node-preview rectangle"></div>
                                Process
                            </button>
                            <button class="node-btn" onclick="flowByteGame.addNode('diamond')">
                                <div class="node-preview diamond"></div>
                                Decision
                            </button>
                            <button class="node-btn" onclick="flowByteGame.addNode('parallelogram')">
                                <div class="node-preview parallelogram"></div>
                                Input/Output
                            </button>
                        </div>
                        
                        <div class="status-panel">
                            <h3>Status</h3>
                            <div class="status-item">Nodes: <span id="node-count">0</span></div>
                            <div class="status-item">Connections: <span id="connection-count">0</span></div>
                            <div class="status-item">Tool: <span id="current-tool">Select</span></div>
                        </div>
                    </div>
                    
                    <div class="canvas-area">
                        <div id="flowchart-canvas" class="flowchart-canvas">
                            <svg id="connection-svg" class="connection-svg"></svg>
                        </div>
                        <div class="canvas-info">
                            <p>Click on node types to add them to the canvas. Use tools to connect, select, or delete nodes.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8f9fa; }
                
                .game-interface { display: flex; flex-direction: column; height: 100vh; }
                
                .game-header { background: white; padding: 15px 20px; border-bottom: 2px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; }
                .back-btn, .reset-btn, .export-btn { background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-left: 10px; }
                .back-btn:hover, .reset-btn:hover, .export-btn:hover { background: #5a6268; }
                .level-info h2 { margin: 0; color: #2c5aa0; }
                .level-info p { margin: 5px 0 0 0; color: #666; }
                
                .game-content { display: flex; flex: 1; }
                
                .toolbar { width: 250px; background: white; border-right: 2px solid #e9ecef; padding: 20px; overflow-y: auto; }
                .toolbar h3 { margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #e9ecef; padding-bottom: 5px; }
                
                .tool-group { margin-bottom: 30px; }
                .tool-btn { display: block; width: 100%; background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; margin-bottom: 5px; border-radius: 5px; cursor: pointer; text-align: left; transition: all 0.3s; }
                .tool-btn:hover, .tool-btn.active { background: #007bff; color: white; }
                .tool-btn span { margin-right: 8px; }
                
                .node-types { margin-bottom: 30px; }
                .node-btn { display: flex; align-items: center; width: 100%; background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; margin-bottom: 8px; border-radius: 5px; cursor: pointer; transition: all 0.3s; }
                .node-btn:hover { background: #e9ecef; }
                
                .node-preview { width: 20px; height: 20px; margin-right: 10px; border: 2px solid #333; }
                .node-preview.oval { border-radius: 50%; background: linear-gradient(135deg, #28a745, #20c997); }
                .node-preview.rectangle { border-radius: 3px; background: linear-gradient(135deg, #007bff, #6610f2); }
                .node-preview.diamond { transform: rotate(45deg); background: linear-gradient(135deg, #fd7e14, #e83e8c); }
                .node-preview.parallelogram { transform: skew(-20deg); background: linear-gradient(135deg, #6f42c1, #e83e8c); }
                
                .status-panel { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                .status-item { margin-bottom: 5px; font-size: 0.9em; }
                
                .canvas-area { flex: 1; display: flex; flex-direction: column; }
                .flowchart-canvas { flex: 1; position: relative; background: linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent); background-size: 50px 50px; overflow: hidden; cursor: crosshair; }
                
                .connection-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
                .connection-svg line { pointer-events: all; }
                
                .canvas-info { background: #e9ecef; padding: 10px 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; }
                
                .flowchart-node { position: absolute; width: 120px; height: 60px; border: 2px solid #333; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); transition: all 0.3s; z-index: 2; font-size: 12px; text-align: center; line-height: 1.2; }
                .flowchart-node:hover { transform: scale(1.05); }
                .flowchart-node.selected { border-color: #ffc107; box-shadow: 0 0 10px rgba(255,193,7,0.5); }
                .flowchart-node.highlight-source { border-color: #28a745; box-shadow: 0 0 10px rgba(40,167,69,0.5); }
                
                .node-oval { border-radius: 50%; background: linear-gradient(135deg, #28a745, #20c997); }
                .node-rectangle { border-radius: 8px; background: linear-gradient(135deg, #007bff, #6610f2); }
                .node-diamond { transform: rotate(45deg); background: linear-gradient(135deg, #fd7e14, #e83e8c); border-radius: 8px; }
                .node-parallelogram { transform: skew(-20deg); background: linear-gradient(135deg, #6f42c1, #e83e8c); border-radius: 8px; }
                
                .connection-line { stroke: #333; stroke-width: 2; fill: none; transition: stroke-width 0.3s; }
                .connection-line:hover { stroke-width: 4; }
                .connection-invisible { stroke: transparent; stroke-width: 10; fill: none; cursor: pointer; }
                
                .feedback-message { position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000; animation: fadeInOut 3s ease-in-out; }
                .feedback-message.error { background: #dc3545; }
                
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(100px); }
                    10%, 90% { opacity: 1; transform: translateX(0); }
                    100% { opacity: 0; transform: translateX(100px); }
                }
            </style>
        `;
        
        this.gameContainer = document.getElementById('flowchart-canvas');
        this.setupEventListeners();
        this.updateStatus();
    }

    setupEventListeners() {
        this.gameContainer.addEventListener('click', (e) => {
            if (e.target === this.gameContainer) {
                this.handleCanvasClick(e);
            }
        });
    }

    selectTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        this.gameContainer.style.cursor = tool === 'delete' ? 'not-allowed' : 
                                         tool === 'arrow' ? 'crosshair' : 'default';
        
        if (tool !== 'arrow') {
            this.clearConnectionSource();
        }
        
        this.updateStatus();
    }

    addNode(type) {
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
        this.updateStatus();
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
        this.updateStatus();
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
        arrowhead.setAttribute('fill', '#333');
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
            
            this.updateStatus();
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
            this.updateStatus();
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
            this.updateStatus();
            this.showFeedback('Canvas reset!');
        }
    }

    exportFlowchart() {
        const flowchartData = {
            nodes: this.nodes,
            connections: this.connections,
            difficulty: this.currentDifficulty,
            level: this.currentLevel,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(flowchartData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `flowchart-${this.currentDifficulty}-level${this.currentLevel}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showFeedback('Flowchart exported!');
    }

    updateStatus() {
        document.getElementById('node-count').textContent = this.nodes.length;
        document.getElementById('connection-count').textContent = this.connections.length;
        document.getElementById('current-tool').textContent = 
            this.currentTool.charAt(0).toUpperCase() + this.currentTool.slice(1);
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
            document.getElementById(this.selectedNode.id).classList.remove('selected');
            this.selectedNode = null;
        }
        
        if (this.connectionSource) {
            this.clearConnectionSource();
            this.showFeedback('Connection cancelled.');
        }
    }
}

// Initialize the game
const flowByteGame = new FlowByteGame();
document.addEventListener('DOMContentLoaded', () => {
    flowByteGame.init();
});
