class CodevanceLab {
    constructor() {
        this.currentDifficulty = null;
        this.currentChallenge = null;
        this.container = null;
        this.initialized = false;
        this.score = 0;
        this.attempts = 0;
        this.currentStep = 0;
        this.challengeData = null;
        this.codeEditor = null;
        this.executionHistory = [];
        
        this.challengeCategories = {
            easy: {
                name: 'Easy Mode (HTML/CSS)',
                description: 'Visual web development challenges for beginners',
                challenges: [
                    {
                        name: 'Basic Webpage',
                        objective: 'Create a webpage with a title, heading, and paragraph',
                        description: 'Learn the fundamentals of HTML structure',
                        type: 'basic_html',
                        concepts: ['HTML Structure', 'Basic Tags', 'Document Layout'],
                        expectedOutput: 'A webpage displaying "Hello, World!" heading and paragraph'
                    },
                    {
                        name: 'Image Display',
                        objective: 'Add an image that is 300px wide',
                        description: 'Master HTML image elements and attributes',
                        type: 'html_image',
                        concepts: ['IMG tag', 'Attributes', 'Image sizing'],
                        expectedOutput: 'Image displayed at 300px width with proper alt text'
                    },
                    {
                        name: 'Favorite Fruits List',
                        objective: 'Make an unordered list of 3 fruits',
                        description: 'Create structured lists in HTML',
                        type: 'html_list',
                        concepts: ['UL/LI tags', 'List structure', 'Content organization'],
                        expectedOutput: 'Bulleted list showing Apple, Banana, Mango'
                    },
                    {
                        name: 'Styled Page',
                        objective: 'Change background color to lightblue and center text',
                        description: 'Apply CSS styling to HTML elements',
                        type: 'css_styling',
                        concepts: ['CSS Styles', 'Background colors', 'Text alignment'],
                        expectedOutput: 'Light blue page with centered text'
                    },
                    {
                        name: 'Button with CSS',
                        objective: 'Create a button with green background and white text',
                        description: 'Style interactive elements with CSS',
                        type: 'css_button',
                        concepts: ['Button styling', 'CSS classes', 'Color properties'],
                        expectedOutput: 'Green button with white text and rounded corners'
                    }
                ]
            },
            hard: {
                name: 'Hard Mode (Python)',
                description: 'Logic-heavy backend programming challenges',
                challenges: [
                    {
                        name: 'Fibonacci Sequence',
                        objective: 'Print the first 10 Fibonacci numbers',
                        description: 'Generate mathematical sequences using loops',
                        type: 'python_fibonacci',
                        concepts: ['Loops', 'Variables', 'Mathematical sequences'],
                        expectedOutput: '0 1 1 2 3 5 8 13 21 34'
                    },
                    {
                        name: 'File Reader',
                        objective: 'Read and print the contents of sample.txt',
                        description: 'Handle file operations and text processing',
                        type: 'python_file',
                        concepts: ['File handling', 'Context managers', 'Text processing'],
                        expectedOutput: 'Contents of sample.txt displayed line by line'
                    },
                    {
                        name: 'Student Grade Average',
                        objective: 'Given grades in a list, compute the average',
                        description: 'Process data collections and perform calculations',
                        type: 'python_average',
                        concepts: ['Lists', 'Mathematical operations', 'Data processing'],
                        expectedOutput: 'Average grade: 86.6'
                    },
                    {
                        name: 'Login Validation',
                        objective: 'Validate a login using a dictionary of users',
                        description: 'Implement user authentication logic',
                        type: 'python_login',
                        concepts: ['Dictionaries', 'Conditionals', 'User input'],
                        expectedOutput: 'Login successful! or Invalid login message'
                    },
                    {
                        name: 'Word Counter',
                        objective: 'Count word frequency in a string',
                        description: 'Analyze text data and create frequency maps',
                        type: 'python_counter',
                        concepts: ['String processing', 'Dictionaries', 'Data analysis'],
                        expectedOutput: "{'hello': 2, 'world': 2, 'python': 1}"
                    }
                ]
            }
        };
    }

    init(container = null) {
        console.log('💻 CodevanceLab.init() called');
        this.container = container || document;
        
        if (!this.container) {
            console.error('❌ No valid container provided to CodevanceLab.init()');
            return;
        }
        
        const initWhenReady = () => {
            const difficultyScreen = this.container.querySelector('#difficulty-screen');
            const levelScreen = this.container.querySelector('#level-screen');
            const gameScreen = this.container.querySelector('#game-screen');
            
            if (difficultyScreen && levelScreen && gameScreen) {
                this.setupEventListeners();
                this.showDifficultySelection();
                this.initialized = true;
                console.log('🎉 CodevanceLab initialized successfully!');
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
            { id: '#run-code-btn', handler: () => this.runCode() },
            { id: '#validate-solution-btn', handler: () => this.validateSolution() },
            { id: '#get-hint-btn', handler: () => this.getHint() },
            { id: '#reset-challenge-btn', handler: () => this.resetChallenge() },
            { id: '#abort-mission-btn', handler: () => this.abortMission() }
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
    }

    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.showChallengeSelection();
    }

    showChallengeSelection() {
        if (!this.currentDifficulty) return;
        
        const categoryData = this.challengeCategories[this.currentDifficulty];
        const container = this.container;
        
        const titleElement = container.querySelector('#difficulty-title');
        const descElement = container.querySelector('#difficulty-description');
        
        if (titleElement) titleElement.textContent = `CODEVANCE - ${categoryData.name}`;
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

    showExecutionResult(message, type) {
        // Display execution results in console and optionally in UI
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Try to update validation panel if it exists
        const validationPanel = this.container.querySelector('#validation-output');
        if (validationPanel) {
            const resultMessage = document.createElement('div');
            resultMessage.style.cssText = `
                margin: 10px 0;
                padding: 8px;
                border-radius: 4px;
                font-size: 0.9rem;
                background: ${type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
                            type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
                            'rgba(33, 150, 243, 0.1)'};
                color: ${type === 'success' ? '#4CAF50' : 
                        type === 'error' ? '#f44336' : 
                        '#2196F3'};
                border: 1px solid ${type === 'success' ? '#4CAF50' : 
                                  type === 'error' ? '#f44336' : 
                                  '#2196F3'};
            `;
            resultMessage.textContent = message;
            
            // Insert at the top of validation output
            validationPanel.insertBefore(resultMessage, validationPanel.firstChild);
            
            // Remove old messages after 5 seconds
            setTimeout(() => {
                if (resultMessage.parentNode) {
                    resultMessage.remove();
                }
            }, 5000);
        }
    }

    updateChallengeProgress() {
        const progressElement = this.container.querySelector('#challenge-progress');
        if (progressElement) {
            const progress = Math.min((this.score / 100) * 100, 100);
            progressElement.textContent = `${Math.round(progress)}%`;
        }
        
        // Also update any progress bars
        const progressBars = this.container.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const progress = Math.min((this.score / 100) * 100, 100);
            bar.style.width = `${progress}%`;
        });
        
        // Update challenge display counter
        const currentDisplay = this.container.querySelector('#current-challenge-display');
        if (currentDisplay) {
            currentDisplay.textContent = `${this.currentChallenge}/5`;
        }
        
        console.log(`📊 Progress updated: ${this.score}% for challenge ${this.currentChallenge}`);
    }

    startChallenge(challengeNumber) {
        this.currentChallenge = challengeNumber;
        this.score = 0; // Reset score to 0
        this.attempts = 0;
        this.currentStep = 0;
        
        const categoryData = this.challengeCategories[this.currentDifficulty];
        this.challengeData = categoryData.challenges[challengeNumber - 1];
        
        this.initChallengeInterface();
        this.showScreen('game-screen');
        
        // FIX: Immediately update progress display to show 0%
        this.updateChallengeProgress();
        
        console.log(`🎯 Started challenge ${challengeNumber} with reset progress: ${this.score}%`);
    }

    initChallengeInterface() {
        const container = this.container;
        
        // Update UI elements
        const currentDisplay = container.querySelector('#current-challenge-display');
        if (currentDisplay) currentDisplay.textContent = `${this.currentChallenge}/5`;
        
        // Load challenge-specific interface
        this.loadChallengeInterface();
        
        // Initialize code editor
        this.initializeCodeEditor();
        
        // FIX: Reset progress display immediately when interface loads
        this.score = 0; // Ensure score is 0
        this.updateChallengeProgress();
        
        // Clear any previous validation results
        const validationOutput = container.querySelector('#validation-output');
        if (validationOutput) {
            validationOutput.innerHTML = 'Complete the requirements and run your code to see validation results.';
        }
        
        // Set global reference for callbacks
        window.codevanceLab = this;
        
        console.log(`🔧 Challenge interface initialized for challenge ${this.currentChallenge}`);
    }

    loadChallengeInterface() {
        const workspace = this.container.querySelector('#challenge-workspace');
        if (!workspace) return;
        
        const challengeType = this.challengeData.type;
        const interfaceHTML = this.generateChallengeInterface(challengeType);
        
        workspace.innerHTML = interfaceHTML;
    }

    generateChallengeInterface(type) {
        switch (type) {
            case 'basic_html':
                return this.generateBasicHTMLInterface();
            case 'html_image':
                return this.generateHTMLImageInterface();
            case 'html_list':
                return this.generateHTMLListInterface();
            case 'css_styling':
                return this.generateCSSStylingInterface();
            case 'css_button':
                return this.generateCSSButtonInterface();
            case 'python_fibonacci':
                return this.generatePythonFibonacciInterface();
            case 'python_file':
                return this.generatePythonFileInterface();
            case 'python_average':
                return this.generatePythonAverageInterface();
            case 'python_login':
                return this.generatePythonLoginInterface();
            case 'python_counter':
                return this.generatePythonCounterInterface();
            default:
                return '<div class="challenge-interface active"><p>Challenge interface loading...</p></div>';
        }
    }

    generateBasicHTMLInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🌐 Basic Webpage Creation</h3>
                    <p>Create a complete HTML page with proper structure, title, heading, and paragraph.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Complete HTML document structure with DOCTYPE</li>
                        <li>Page title: "My First Page"</li>
                        <li>H1 heading: "Hello, World!"</li>
                        <li>Paragraph: "This is my first HTML page."</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>💻 HTML Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run HTML</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <!-- Your HTML content here -->
</body>
</html>"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>🖥️ Live Preview</h5>
                        <iframe id="html-preview" style="width: 100%; height: 200px; border: 1px solid #ccc; background: white;"></iframe>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>✅ Validation Results</h5>
                        <div id="validation-output">Write your HTML code and click "Run HTML" to see the preview</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateHTMLImageInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🖼️ Image Display Challenge</h3>
                    <p>Add an image element with proper attributes and sizing.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Use the IMG tag to display an image</li>
                        <li>Set width to exactly 300 pixels</li>
                        <li>Include alt text: "Sample Image"</li>
                        <li>Use placeholder image: "https://via.placeholder.com/300x200"</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>💻 HTML Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run HTML</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="<!-- Create an IMG tag with the specified attributes -->
<img src=&quot;https://via.placeholder.com/300x200&quot; alt=&quot;Sample Image&quot; width=&quot;300&quot;>"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>🖥️ Live Preview</h5>
                        <iframe id="html-preview" style="width: 100%; height: 250px; border: 1px solid #ccc; background: white;"></iframe>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>✅ Validation Results</h5>
                        <div id="validation-output">Add your image element and run to see the preview</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateHTMLListInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>📝 HTML List Creation</h3>
                    <p>Create an unordered list containing exactly three fruit items.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Use UL tag for unordered list</li>
                        <li>Create exactly 3 list items (LI tags)</li>
                        <li>List items must contain: Apple, Banana, Mango</li>
                        <li>Proper HTML structure and nesting</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>💻 HTML Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run HTML</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="<!-- Create an unordered list with 3 fruits -->
<ul>
    <li>Apple</li>
    <!-- Add more list items here -->
</ul>"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>🖥️ Live Preview</h5>
                        <iframe id="html-preview" style="width: 100%; height: 180px; border: 1px solid #ccc; background: white;"></iframe>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>✅ Validation Results</h5>
                        <div id="validation-output">Create your fruit list and run to see the result</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCSSStylingInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🎨 CSS Styling Challenge</h3>
                    <p>Apply CSS styles to change background color and text alignment.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Complete HTML document with CSS in the head</li>
                        <li>Body background color: lightblue</li>
                        <li>All text centered using text-align property</li>
                        <li>Include heading "My Styled Page" and paragraph</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>💻 HTML + CSS Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run HTML</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            background-color: lightblue;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>My Styled Page</h1>
    <p>This is centered text.</p>
</body>
</html>"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>🖥️ Live Preview</h5>
                        <iframe id="html-preview" style="width: 100%; height: 200px; border: 1px solid #ccc; background: white;"></iframe>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>✅ Validation Results</h5>
                        <div id="validation-output">Apply your CSS styles and see the styled result</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCSSButtonInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔘 CSS Button Styling</h3>
                    <p>Create and style a button with specific colors and appearance.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Button with class "btn" and text "Click Me"</li>
                        <li>Green background color</li>
                        <li>White text color</li>
                        <li>Padding: 10px 20px</li>
                        <li>No border and 6px border-radius</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>💻 HTML + CSS Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run HTML</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="<!DOCTYPE html>
<html>
<head>
    <style>
        .btn {
            background: green;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <button class=&quot;btn&quot;>Click Me</button>
</body>
</html>"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>🖥️ Live Preview</h5>
                        <iframe id="html-preview" style="width: 100%; height: 150px; border: 1px solid #ccc; background: white;"></iframe>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>✅ Validation Results</h5>
                        <div id="validation-output">Style your button and see the interactive result</div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePythonFibonacciInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔢 Fibonacci Sequence Generator</h3>
                    <p>Create a function to generate and print the first 10 Fibonacci numbers.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Define a function called <code>fibonacci(n)</code></li>
                        <li>Use two variables to track sequence (a=0, b=1)</li>
                        <li>Use a loop to generate n numbers</li>
                        <li>Call fibonacci(10) to print first 10 numbers</li>
                        <li>Expected output: 0 1 1 2 3 5 8 13 21 34</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>🐍 Python Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run Python</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=' ')
        a, b = b, a + b

fibonacci(10)"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>📺 Console Output</h5>
                        <div id="python-output" style="font-family: 'Courier New', monospace; background: #000; color: #0f0; padding: 15px; min-height: 150px; white-space: pre-wrap;">Click "Run Python" to see output...</div>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>✅ Algorithm Analysis</h5>
                        <div id="validation-output">Run your code to analyze the Fibonacci sequence generation</div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePythonFileInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>📄 File Reading Challenge</h3>
                    <p>Read and process the contents of a text file using Python file operations.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Use context manager (with statement) for file handling</li>
                        <li>Read "sample.txt" file</li>
                        <li>Print each line with .strip() to remove whitespace</li>
                        <li>Handle file operations safely</li>
                        <li>Note: File will be simulated in this environment</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>🐍 Python Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run Python</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="# File reading with context manager
with open('sample.txt', 'r') as file:
    for line in file:
        print(line.strip())"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>📺 Console Output</h5>
                        <div id="python-output" style="font-family: 'Courier New', monospace; background: #000; color: #0f0; padding: 15px; min-height: 150px; white-space: pre-wrap;">Click "Run Python" to see file contents...</div>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>📄 File Operations Analysis</h5>
                        <div id="validation-output">Run your file reading code to see the analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePythonAverageInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>📊 Grade Average Calculator</h3>
                    <p>Process a list of student grades and calculate the average score.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Given grades list: [85, 90, 78, 92, 88]</li>
                        <li>Use sum() function to add all grades</li>
                        <li>Use len() function to count grades</li>
                        <li>Calculate average by dividing sum by count</li>
                        <li>Print result: "Average grade: XX.X"</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>🐍 Python Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run Python</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="grades = [85, 90, 78, 92, 88]
average = sum(grades) / len(grades)
print('Average grade:', average)"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>📺 Console Output</h5>
                        <div id="python-output" style="font-family: 'Courier New', monospace; background: #000; color: #0f0; padding: 15px; min-height: 150px; white-space: pre-wrap;">Click "Run Python" to calculate average...</div>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>📈 Data Analysis</h5>
                        <div id="validation-output">Run your calculation to see the statistical analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePythonLoginInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔐 User Login Validation</h3>
                    <p>Implement a login system using dictionary-based user authentication.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Create users dictionary: {"anna": "1234", "mark": "abcd"}</li>
                        <li>Get username and password from user (simulated input)</li>
                        <li>Check if username exists in dictionary</li>
                        <li>Verify password matches stored value</li>
                        <li>Print "Login successful!" or "Invalid login"</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>🐍 Python Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run Python</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="users = {'anna': '1234', 'mark': 'abcd'}

# Simulated user input (replace with actual input() in real scenario)
username = 'anna'  # Try changing this
password = '1234'  # Try changing this

if username in users and users[username] == password:
    print('Login successful!')
else:
    print('Invalid login')"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>📺 Console Output</h5>
                        <div id="python-output" style="font-family: 'Courier New', monospace; background: #000; color: #0f0; padding: 15px; min-height: 150px; white-space: pre-wrap;">Click "Run Python" to test login...</div>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>🔒 Security Analysis</h5>
                        <div id="validation-output">Run your authentication code to see security validation</div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePythonCounterInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔤 Word Frequency Counter</h3>
                    <p>Analyze text data to count word frequencies and create a frequency dictionary.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li>Given text: "hello world hello python world"</li>
                        <li>Split text into words using .split() method</li>
                        <li>Use dictionary to count word frequencies</li>
                        <li>Use .get() method with default value 0</li>
                        <li>Print final counter dictionary</li>
                    </ul>
                </div>
                
                <div class="code-workspace">
                    <div class="editor-header">
                        <h4>🐍 Python Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.codevanceLab.runCode()" class="run-btn">▶ Run Python</button>
                            <button onclick="window.codevanceLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="code-editor" placeholder="text = 'hello world hello python world'
words = text.split()
counter = {}

for word in words:
    counter[word] = counter.get(word, 0) + 1

print(counter)"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="code-output">
                        <h5>📺 Console Output</h5>
                        <div id="python-output" style="font-family: 'Courier New', monospace; background: #000; color: #0f0; padding: 15px; min-height: 150px; white-space: pre-wrap;">Click "Run Python" to analyze text...</div>
                    </div>
                    <div class="validation-panel" id="validation-panel">
                        <h5>📝 Text Analysis</h5>
                        <div id="validation-output">Run your word counter to see frequency analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeCodeEditor() {
        const editor = this.container.querySelector('#code-editor');
        if (editor) {
            this.codeEditor = editor;
            
            // Add syntax highlighting class based on difficulty
            const syntaxClass = this.currentDifficulty === 'easy' ? 'html-syntax' : 'python-syntax';
            editor.classList.add(syntaxClass);
            
            // Add tab support
            editor.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
                    editor.selectionStart = editor.selectionEnd = start + 4;
                }
            });
        }
    }

    runCode() {
        const editor = this.container.querySelector('#code-editor');
        if (!editor || !editor.value.trim()) {
            this.showExecutionResult('Please enter your code before running.', 'error');
            return;
        }

        const code = editor.value.trim();
        console.log('Running code:', code);

        if (this.currentDifficulty === 'easy') {
            this.executeHTML(code);
        } else {
            this.executePython(code);
        }
        
        this.executionHistory.push({
            code: code,
            timestamp: new Date(),
            difficulty: this.currentDifficulty
        });
    }

    executeHTML(htmlCode) {
        const preview = this.container.querySelector('#html-preview');
        if (!preview) return;

        try {
            // Create a complete HTML document if just fragments are provided
            let fullHTML = htmlCode;
            if (!htmlCode.toLowerCase().includes('<!doctype') && !htmlCode.toLowerCase().includes('<html')) {
                fullHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Preview</title>
</head>
<body>
    ${htmlCode}
</body>
</html>`;
            }

            // Write HTML to iframe
            const doc = preview.contentDocument || preview.contentWindow.document;
            doc.open();
            doc.write(fullHTML);
            doc.close();

            this.showExecutionResult('✅ HTML rendered successfully! Check the preview above.', 'success');
            this.validateHTMLOutput(htmlCode);

        } catch (error) {
            this.showExecutionResult(`❌ HTML Error: ${error.message}`, 'error');
        }
    }

    executePython(pythonCode) {
        const outputDiv = this.container.querySelector('#python-output');
        if (!outputDiv) return;

        try {
            // Simulate Python execution (in a real environment, you'd use a Python interpreter)
            const result = this.simulatePythonExecution(pythonCode);
            
            outputDiv.textContent = result.output;
            this.showExecutionResult(result.message, result.type);
            this.validatePythonOutput(result);

        } catch (error) {
            outputDiv.textContent = `Error: ${error.message}`;
            this.showExecutionResult(`❌ Python Error: ${error.message}`, 'error');
        }
    }

    simulatePythonExecution(code) {
        const challengeType = this.challengeData.type;

        switch (challengeType) {
            case 'python_fibonacci':
                if (code.includes('fibonacci') && code.includes('def') && code.includes('fibonacci(10)')) {
                    return {
                        output: '0 1 1 2 3 5 8 13 21 34 ',
                        message: '✅ Fibonacci sequence generated correctly!',
                        type: 'success'
                    };
                } else {
                    return {
                        output: 'Function not found or not called properly',
                        message: '❌ Check your function definition and function call',
                        type: 'error'
                    };
                }

            case 'python_file':
                if (code.includes('with open') && code.includes('sample.txt')) {
                    return {
                        output: 'Line 1: Welcome to the file!\nLine 2: This is sample content.\nLine 3: File reading complete.',
                        message: '✅ File read successfully using context manager!',
                        type: 'success'
                    };
                } else {
                    return {
                        output: 'File reading error',
                        message: '❌ Use context manager (with statement) to read file',
                        type: 'error'
                    };
                }

            case 'python_average':
                if (code.includes('sum(grades)') && code.includes('len(grades)')) {
                    return {
                        output: 'Average grade: 86.6',
                        message: '✅ Grade average calculated correctly!',
                        type: 'success'
                    };
                } else {
                    return {
                        output: 'Calculation error',
                        message: '❌ Use sum() and len() functions to calculate average',
                        type: 'error'
                    };
                }

            case 'python_login':
                if (code.includes('users') && code.includes('in users') && code.includes('users[username]')) {
                    return {
                        output: 'Login successful!',
                        message: '✅ Login validation implemented correctly!',
                        type: 'success'
                    };
                } else {
                    return {
                        output: 'Authentication error',
                        message: '❌ Check dictionary lookup and password validation',
                        type: 'error'
                    };
                }

            case 'python_counter':
                if (code.includes('split()') && code.includes('.get(') && code.includes('counter[word]')) {
                    return {
                        output: "{'hello': 2, 'world': 2, 'python': 1}",
                        message: '✅ Word frequency counter working perfectly!',
                        type: 'success'
                    };
                } else {
                    return {
                        output: 'Counter error',
                        message: '❌ Use .split(), dictionary, and .get() method',
                        type: 'error'
                    };
                }

            default:
                return {
                    output: 'Code executed successfully',
                    message: '✅ Python code ran without errors',
                    type: 'success'
                };
        }
    }

    validateHTMLOutput(htmlCode) {
        const validationDiv = this.container.querySelector('#validation-output');
        if (!validationDiv) return;

        const challengeType = this.challengeData.type;
        let validationResults = [];

        switch (challengeType) {
            case 'basic_html':
                validationResults = [
                    { test: 'DOCTYPE declaration', passed: htmlCode.toLowerCase().includes('<!doctype html>') },
                    { test: 'HTML structure', passed: htmlCode.includes('<html>') && htmlCode.includes('</html>') },
                    { test: 'Head section', passed: htmlCode.includes('<head>') && htmlCode.includes('</head>') },
                    { test: 'Title element', passed: htmlCode.includes('<title>My First Page</title>') },
                    { test: 'H1 heading', passed: htmlCode.includes('<h1>Hello, World!</h1>') },
                    { test: 'Paragraph content', passed: htmlCode.includes('This is my first HTML page') }
                ];
                break;

            case 'html_image':
                validationResults = [
                    { test: 'IMG tag present', passed: htmlCode.toLowerCase().includes('<img') },
                    { test: 'Width attribute', passed: htmlCode.includes('width="300"') || htmlCode.includes("width='300'") },
                    { test: 'Alt text', passed: htmlCode.includes('alt="Sample Image"') || htmlCode.includes("alt='Sample Image'") },
                    { test: 'Valid src attribute', passed: htmlCode.includes('src=') }
                ];
                break;

            case 'html_list':
                validationResults = [
                    { test: 'UL tag present', passed: htmlCode.toLowerCase().includes('<ul>') },
                    { test: 'Apple list item', passed: htmlCode.toLowerCase().includes('<li>apple</li>') },
                    { test: 'Banana list item', passed: htmlCode.toLowerCase().includes('<li>banana</li>') },
                    { test: 'Mango list item', passed: htmlCode.toLowerCase().includes('<li>mango</li>') }
                ];
                break;

            case 'css_styling':
                validationResults = [
                    { test: 'CSS style block', passed: htmlCode.includes('<style>') },
                    { test: 'Background color', passed: htmlCode.includes('background-color: lightblue') },
                    { test: 'Text alignment', passed: htmlCode.includes('text-align: center') },
                    { test: 'Body selector', passed: htmlCode.includes('body {') }
                ];
                break;

            case 'css_button':
                validationResults = [
                    { test: 'Button element', passed: htmlCode.toLowerCase().includes('<button') },
                    { test: 'CSS class btn', passed: htmlCode.includes('class="btn"') || htmlCode.includes("class='btn'") },
                    { test: 'Green background', passed: htmlCode.includes('background: green') },
                    { test: 'White text color', passed: htmlCode.includes('color: white') },
                    { test: 'Border radius', passed: htmlCode.includes('border-radius: 6px') }
                ];
                break;

            default:
                validationResults = [{ test: 'Code structure', passed: true }];
        }

        const passedTests = validationResults.filter(r => r.passed).length;
        const totalTests = validationResults.length;
        
        validationDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Validation Score: ${passedTests}/${totalTests}</strong>
            </div>
            ${validationResults.map(result => `
                <div style="margin: 5px 0; display: flex; justify-content: space-between;">
                    <span>${result.test}</span>
                    <span style="color: ${result.passed ? '#4CAF50' : '#f44336'}">
                        ${result.passed ? '✅ PASS' : '❌ FAIL'}
                    </span>
                </div>
            `).join('')}
        `;

        // FIX: Set score based on completion percentage, not accumulation
        if (passedTests === totalTests) {
            this.score = 100; // Set to 100 when perfect, don't accumulate
            this.updateChallengeProgress();
            this.showExecutionResult('✅ Perfect! All validation tests passed!', 'success');
        } else {
            this.score = Math.round((passedTests / totalTests) * 100); // Proportional score
            this.updateChallengeProgress();
            this.showExecutionResult(`⚠️ ${passedTests}/${totalTests} tests passed. Check requirements.`, 'warning');
        }
    }

    validatePythonOutput(result) {
        const validationDiv = this.container.querySelector('#validation-output');
        if (!validationDiv) return;

        if (result.type === 'success') {
            this.score = 100; // FIX: Set to 100, don't accumulate
            this.updateChallengeProgress();
            
            validationDiv.innerHTML = `
                <div style="color: #4CAF50; margin-bottom: 10px;">
                    <strong>✅ Algorithm Validation: PASSED</strong>
                </div>
                <div style="margin: 5px 0;">✓ Code structure correct</div>
                <div style="margin: 5px 0;">✓ Expected output generated</div>
                <div style="margin: 5px 0;">✓ Logic implementation valid</div>
                <div style="margin: 5px 0;">✓ Best practices followed</div>
            `;
        } else {
            this.score = 0; // FIX: Set to 0 on failure
            validationDiv.innerHTML = `
                <div style="color: #f44336; margin-bottom: 10px;">
                    <strong>❌ Algorithm Validation: FAILED</strong>
                </div>
                <div style="margin: 5px 0;">Review the requirements and try again</div>
            `;
        }
    }

    validateSolution() {
        console.log(`🔍 Validating solution - Current score: ${this.score}%`);
        
        if (this.score >= 100) {
            this.showFeedback('🎉 Outstanding! Your code solution is correct and follows best practices!', 'success');
            
            // Update room progress in command center
            if (window.commandCenter && window.commandCenter.updateRoomProgress) {
                window.commandCenter.updateRoomProgress('programming', this.currentChallenge, 5);
            }
            
            if (this.currentChallenge < 5) {
                setTimeout(() => {
                    console.log(`➡️ Moving to next challenge: ${this.currentChallenge + 1}`);
                    this.startChallenge(this.currentChallenge + 1);
                }, 2000);
            } else {
                setTimeout(() => {
                    console.log('🏁 All challenges completed!');
                    if (window.commandCenter) {
                        window.commandCenter.showCommandDashboard();
                    } else {
                        this.showDifficultySelection();
                    }
                }, 2000);
            }
        } else {
            this.attempts++;
            this.showFeedback('❌ Solution needs improvement. Make sure your code passes all validation tests first.', 'error');
            console.log(`❌ Validation failed - Score: ${this.score}%, Attempts: ${this.attempts}`);
        }
    }

    resetChallenge() {
        if (confirm('Are you sure you want to reset this challenge? Your progress will be lost.')) {
            this.score = 0;
            this.attempts = 0;
            this.executionHistory = [];
            
            // Clear editor and outputs
            this.clearEditor();
            
            // Reload challenge interface (this will reset progress display)
            this.loadChallengeInterface();
            this.initializeCodeEditor();
            
            // Explicitly update progress display
            this.updateChallengeProgress();
            
            this.showFeedback('Challenge reset! Start fresh with your solution.', 'warning');
            console.log('🔄 Challenge reset - Progress: 0%');
        }
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
            this.executionHistory = [];
            
            // Redirect to difficulty selection screen
            this.showDifficultySelection();
        }
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
                feedback.style.backgroundColor = '#e53e3e';
                break;
            case 'warning':
                feedback.style.backgroundColor = '#dd6b20';
                break;
            case 'info':
                feedback.style.backgroundColor = '#3182ce';
                break;
            default:
                feedback.style.backgroundColor = '#38a169';
        }
        
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 4000);
    }
}

// Export the class for use by command center
window.CodevanceLab = CodevanceLab;
window.codevanceLab = null;

// Don't auto-initialize when loaded independently
console.log('CodevanceLab class loaded and ready for programming challenges');
// Export the class for use by command center
window.CodevanceLab = CodevanceLab;
window.codevanceLab = null;

// Don't auto-initialize when loaded independently
console.log('CodevanceLab class loaded and ready for programming challenges');
window.codevanceLab = null;

// Don't auto-initialize when loaded independently
console.log('CodevanceLab class loaded and ready for programming challenges');
