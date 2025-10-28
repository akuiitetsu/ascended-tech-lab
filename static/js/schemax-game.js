// ============================================
// MOBILE UTILITIES FOR SCHEMAX LAB
// ============================================

const SchemaxMobileUtils = {
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
        const interactiveElements = document.querySelectorAll('.difficulty-btn, .sql-btn, .table-cell, button, .btn, .schema-element');
        
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

class SchemaxLab {
    constructor() {
        this.currentDifficulty = null;
        this.currentChallenge = null;
        this.container = null;
        this.initialized = false;
        this.score = 0;
        this.attempts = 0;
        this.currentStep = 0;
        this.challengeData = null;
        this.sqlEditor = null;
        this.executionHistory = [];
        this.challengeStartTime = null;
        this.roomStartTime = null;
        
        // Initialize mobile enhancements
        SchemaxMobileUtils.init();
        
        this.challengeCategories = {
            easy: {
                name: 'Easy SQL Schema',
                description: 'Basic table creation, queries, and relationships',
                challenges: [
                    {
                        name: 'Employee Directory Table',
                        objective: 'Create an IT employees table with proper structure',
                        description: 'Design a database table for IT staff management',
                        type: 'table_creation',
                        concepts: ['CREATE TABLE', 'Primary Keys', 'Data Types']
                    },
                    {
                        name: 'Add IT Staff Records',
                        objective: 'Insert IT employee data into the directory',
                        description: 'Practice INSERT statements with tech staff information',
                        type: 'data_insertion',
                        concepts: ['INSERT INTO', 'Data Values', 'Multiple Records']
                    },
                    {
                        name: 'Query IT Personnel',
                        objective: 'Find IT staff based on department criteria',
                        description: 'Write SELECT statements to filter tech employees',
                        type: 'basic_query',
                        concepts: ['SELECT', 'WHERE clause', 'Comparison operators']
                    },
                    {
                        name: 'System Access Constraints',
                        objective: 'Create secure user accounts table with constraints',
                        description: 'Implement primary keys and unique constraints for user management',
                        type: 'constraints',
                        concepts: ['Primary Keys', 'UNIQUE constraints', 'Table constraints']
                    },
                    {
                        name: 'Department Relationships',
                        objective: 'Link employees to IT departments',
                        description: 'Create foreign key constraints for organizational structure',
                        type: 'foreign_keys',
                        concepts: ['Foreign Keys', 'References', 'Relational integrity']
                    }
                ]
            },
            hard: {
                name: 'Advanced SQL Schema',
                description: 'Complex normalization, optimization, and enterprise patterns',
                challenges: [
                    {
                        name: 'Enterprise Data Normalization',
                        objective: 'Normalize enterprise system data into proper table structure',
                        description: 'Apply 1NF, 2NF, and 3NF principles to eliminate IT system redundancy',
                        type: 'normalization',
                        concepts: ['Normalization', 'Data redundancy', 'Table relationships']
                    },
                    {
                        name: 'Financial System Schema',
                        objective: 'Design secure enterprise accounting database',
                        description: 'Create tables for financial transactions with proper audit trails',
                        type: 'transactions_schema',
                        concepts: ['Financial data', 'Transaction integrity', 'Audit management']
                    },
                    {
                        name: 'Database Performance Optimization',
                        objective: 'Optimize enterprise query performance with indexes',
                        description: 'Create indexes to speed up critical business database queries',
                        type: 'indexing',
                        concepts: ['Database indexes', 'Query optimization', 'Performance tuning']
                    },
                    {
                        name: 'System User-Role Relationships',
                        objective: 'Design complex enterprise permission schemas',
                        description: 'Create junction tables for user-role-permission management',
                        type: 'many_to_many',
                        concepts: ['Junction tables', 'Composite keys', 'Complex relationships']
                    },
                    {
                        name: 'Enterprise Security Schema',
                        objective: 'Implement secure enterprise user management system',
                        description: 'Create tables with advanced constraints and security features',
                        type: 'security_schema',
                        concepts: ['CHECK constraints', 'Security patterns', 'Data validation']
                    }
                ]
            }
        };
    }

    init(container = null) {
        console.log('🗄️ SchemaxLab.init() called');
        this.container = container || document;
        
        if (!this.container) {
            console.error('❌ No valid container provided to SchemaxLab.init()');
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
                console.log('🎉 SchemaxLab initialized successfully!');
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
            { id: '#execute-sql-btn', handler: () => this.executeSQL() },
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
        
        if (titleElement) titleElement.textContent = `SCHEMAX - ${categoryData.name}`;
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
        
        // Reset hints for new challenge
        this.resetHints();
        
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
        
        // Initialize SQL editor
        this.initializeSQLEditor();
        
        // Set global reference for callbacks
        window.schemaxLab = this;
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
            case 'table_creation':
                return this.generateTableCreationInterface();
            case 'data_insertion':
                return this.generateDataInsertionInterface();
            case 'basic_query':
                return this.generateBasicQueryInterface();
            case 'constraints':
                return this.generateConstraintsInterface();
            case 'foreign_keys':
                return this.generateForeignKeysInterface();
            case 'normalization':
                return this.generateNormalizationInterface();
            case 'transactions_schema':
                return this.generateTransactionsInterface();
            case 'indexing':
                return this.generateIndexingInterface();
            case 'many_to_many':
                return this.generateManyToManyInterface();
            case 'security_schema':
                return this.generateSecurityInterface();
            default:
                return '<div class="challenge-interface active"><p>Challenge interface loading...</p></div>';
        }
    }

    generateTableCreationInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🗄️ Create IT Employee Directory</h3>
                    <p>Design an employees table for IT department staff management.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li><strong>employee_id:</strong> Primary Key, Integer</li>
                        <li><strong>name:</strong> Text (VARCHAR)</li>
                        <li><strong>department:</strong> Text (VARCHAR) - IT departments</li>
                        <li><strong>role:</strong> Text (VARCHAR) - Job position</li>
                    </ul>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Write your CREATE TABLE statement here
CREATE TABLE employees (
    -- Add your columns here
);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="schema-preview" id="schema-preview">
                        <h5>🏗️ Table Structure Preview</h5>
                        <div id="table-structure">No table created yet</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateDataInsertionInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>📝 Add IT Staff Records</h3>
                    <p>Insert IT employee data into the company directory.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 IT Staff to Add</h4>
                    <div class="data-table">
                        <table>
                            <thead>
                                <tr><th>employee_id</th><th>name</th><th>department</th><th>role</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>1</td><td>Sarah Chen</td><td>DevOps</td><td>Senior Engineer</td></tr>
                                <tr><td>2</td><td>Michael Torres</td><td>Cybersecurity</td><td>Security Analyst</td></tr>
                                <tr><td>3</td><td>Jessica Kim</td><td>Backend</td><td>Database Admin</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Write your INSERT statements here
INSERT INTO employees (employee_id, name, department, role) VALUES
    -- Add your data here
;"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="data-preview" id="data-preview">
                        <h5>📋 Table Data Preview</h5>
                        <div id="table-data">No data inserted yet</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateBasicQueryInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔍 Query IT Personnel</h3>
                    <p>Write a SELECT statement to find IT staff based on department criteria.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Query Requirements</h4>
                    <ul>
                        <li>Select <strong>all employees</strong> from the <strong>DevOps</strong> department</li>
                        <li>Return all columns for matching records</li>
                        <li>Use proper WHERE clause syntax</li>
                    </ul>
                    
                    <div class="sample-data">
                        <h5>Sample Data in employees table:</h5>
                        <table>
                            <thead>
                                <tr><th>employee_id</th><th>name</th><th>department</th><th>role</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>1</td><td>Sarah Chen</td><td>DevOps</td><td>Senior Engineer</td></tr>
                                <tr><td>2</td><td>Michael Torres</td><td>Cybersecurity</td><td>Security Analyst</td></tr>
                                <tr><td>3</td><td>Jessica Kim</td><td>Backend</td><td>Database Admin</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Write your SELECT statement here
SELECT * FROM employees 
WHERE -- Add your condition here
;"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Query Results</h5>
                        <div id="execution-output">Ready to execute query...</div>
                    </div>
                    <div class="query-analysis" id="query-analysis">
                        <h5>📈 Query Analysis</h5>
                        <div id="query-stats">Execute query to see analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateConstraintsInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔒 System Access Constraints</h3>
                    <p>Create a secure user accounts table with proper constraints for system access.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Security Requirements</h4>
                    <ul>
                        <li><strong>user_id:</strong> Primary Key, Integer</li>
                        <li><strong>username:</strong> Text (VARCHAR), Unique constraint</li>
                        <li>Ensure no duplicate usernames can be created</li>
                        <li>Primary key should uniquely identify each system user</li>
                    </ul>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Write your CREATE TABLE statement with constraints
CREATE TABLE user_accounts (
    -- Add your columns with appropriate constraints
);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="constraints-info" id="constraints-info">
                        <h5>🔐 Constraint Analysis</h5>
                        <div id="constraint-details">Create table to see constraint analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateForeignKeysInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔗 Department Relationships</h3>
                    <p>Link employees to their IT departments with referential integrity.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Relationship Requirements</h4>
                    <ul>
                        <li>Modify the <strong>employees</strong> table to include <strong>dept_id</strong></li>
                        <li>Create foreign key constraint referencing <strong>departments(dept_id)</strong></li>
                        <li>Ensure referential integrity is maintained</li>
                        <li>Employees can only be assigned to existing departments</li>
                    </ul>
                    
                    <div class="existing-tables">
                        <h5>Existing Tables:</h5>
                        <div class="table-info">
                            <strong>departments:</strong> dept_id (PK), dept_name (UNIQUE)<br>
                            <strong>employees:</strong> employee_id (PK), name, department, role
                        </div>
                    </div>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Modify employees table to add foreign key relationship
ALTER TABLE employees 
ADD COLUMN dept_id INTEGER,
ADD FOREIGN KEY (dept_id) REFERENCES departments(dept_id);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="relationship-diagram" id="relationship-diagram">
                        <h5>📊 Table Relationships</h5>
                        <div id="relationship-info">Execute to see relationship diagram</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateNormalizationInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>📊 Database Normalization</h3>
                    <p>Normalize the denormalized data into proper table structure following 1NF, 2NF, and 3NF.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Current Denormalized Data</h4>
                    <div class="denormalized-table">
                        <table>
                            <thead>
                                <tr><th>student_id</th><th>name</th><th>courses_taken</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>1</td><td>Anna</td><td>IT, CS</td></tr>
                                <tr><td>2</td><td>Mark</td><td>IS</td></tr>
                                <tr><td>3</td><td>John</td><td>IT, IS, CS</td></tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <h5>🎯 Normalization Goals:</h5>
                    <ul>
                        <li>Create separate <strong>students</strong> table</li>
                        <li>Create separate <strong>courses</strong> table</li>
                        <li>Create <strong>enrollments</strong> junction table</li>
                        <li>Eliminate data redundancy and ensure atomicity</li>
                    </ul>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor - Create Normalized Schema</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Create normalized table structure
-- Students table
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Courses table
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name VARCHAR(50) UNIQUE NOT NULL
);

-- Enrollments junction table
CREATE TABLE enrollments (
    student_id INTEGER,
    course_id INTEGER,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="normalization-analysis" id="normalization-analysis">
                        <h5>📈 Normalization Analysis</h5>
                        <div id="normal-forms">Execute to see normalization analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTransactionsInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🏦 Banking Transactions Schema</h3>
                    <p>Design a secure banking system with accounts and transactions tables.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Banking System Requirements</h4>
                    <h5>Accounts Table:</h5>
                    <ul>
                        <li><strong>account_id:</strong> Primary Key</li>
                        <li><strong>account_name:</strong> Account holder name</li>
                        <li><strong>balance:</strong> Account balance (DECIMAL)</li>
                    </ul>
                    
                    <h5>Transactions Table:</h5>
                    <ul>
                        <li><strong>tx_id:</strong> Primary Key</li>
                        <li><strong>account_id:</strong> Foreign Key to accounts</li>
                        <li><strong>amount:</strong> Transaction amount</li>
                        <li><strong>tx_date:</strong> Transaction timestamp</li>
                    </ul>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor - Banking Schema</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Create banking system tables
CREATE TABLE accounts (
    account_id INTEGER PRIMARY KEY,
    account_name VARCHAR(100) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00
);

CREATE TABLE transactions (
    tx_id INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    tx_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="banking-analysis" id="banking-analysis">
                        <h5>🏦 Banking Schema Analysis</h5>
                        <div id="security-features">Execute to see security analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateIndexingInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>⚡ Index Optimization</h3>
                    <p>Optimize query performance by adding appropriate indexes.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Performance Problem</h4>
                    <div class="problem-scenario">
                        <p>The <strong>users</strong> table has thousands of records. Queries using:</p>
                        <code>WHERE email = 'example@test.com'</code>
                        <p>are running very slowly because there's no index on the email column.</p>
                    </div>
                    
                    <h5>🎯 Optimization Task:</h5>
                    <ul>
                        <li>Add an index on the <strong>email</strong> column</li>
                        <li>Choose appropriate index type for email lookups</li>
                        <li>Consider uniqueness constraints</li>
                    </ul>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor - Create Index</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Create index to optimize email searches
-- Consider: Should this be a unique index?
CREATE INDEX idx_users_email ON users(email);

-- Alternative: Create unique index if emails should be unique
-- CREATE UNIQUE INDEX idx_users_email ON users(email);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="performance-analysis" id="performance-analysis">
                        <h5>📈 Performance Impact</h5>
                        <div id="index-benefits">Execute to see performance analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateManyToManyInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔄 Many-to-Many Relationships</h3>
                    <p>Design a schema where students can enroll in many courses, and courses can have many students.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Many-to-Many Requirements</h4>
                    <h5>Business Rules:</h5>
                    <ul>
                        <li>A student can enroll in multiple courses</li>
                        <li>A course can have multiple students enrolled</li>
                        <li>Track enrollment information (date, status, etc.)</li>
                    </ul>
                    
                    <h5>Required Tables:</h5>
                    <ul>
                        <li><strong>students:</strong> Basic student information</li>
                        <li><strong>courses:</strong> Course details</li>
                        <li><strong>enrollments:</strong> Junction table with composite primary key</li>
                    </ul>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor - Many-to-Many Schema</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Create many-to-many relationship schema
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credits INTEGER DEFAULT 3
);

CREATE TABLE enrollments (
    student_id INTEGER,
    course_id INTEGER,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active',
    grade VARCHAR(2),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="relationship-analysis" id="relationship-analysis">
                        <h5>🔄 Relationship Analysis</h5>
                        <div id="junction-table-info">Execute to see relationship analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSecurityInterface() {
        return `
            <div class="challenge-interface active">
                <div class="challenge-header">
                    <h3>🔐 Constraints and Security</h3>
                    <p>Create a secure users table with advanced constraints and validation rules.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Security Requirements</h4>
                    <h5>Users Table Constraints:</h5>
                    <ul>
                        <li><strong>user_id:</strong> Primary Key</li>
                        <li><strong>username:</strong> Unique, Not Null</li>
                        <li><strong>password_hash:</strong> Not Null (never store plain passwords!)</li>
                        <li><strong>created_at:</strong> Default to current timestamp</li>
                        <li><strong>role:</strong> CHECK constraint (must be 'student' or 'admin')</li>
                    </ul>
                    
                    <h5>Security Best Practices:</h5>
                    <ul>
                        <li>Enforce data validation at database level</li>
                        <li>Prevent invalid role assignments</li>
                        <li>Ensure usernames are unique</li>
                        <li>Track when accounts are created</li>
                    </ul>
                </div>
                
                <div class="sql-workspace">
                    <div class="editor-header">
                        <h4>💻 SQL Editor - Secure Schema</h4>
                        <div class="editor-controls">
                            <button onclick="window.schemaxLab.executeSQL()" class="execute-btn">Execute SQL</button>
                            <button onclick="window.schemaxLab.clearEditor()" class="clear-btn">Clear</button>
                        </div>
                    </div>
                    <textarea id="sql-editor" placeholder="-- Create secure users table with constraints
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(10) NOT NULL CHECK (role IN ('student', 'admin')),
    email VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP
);

-- Additional security: Create index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);"></textarea>
                </div>
                
                <div class="results-section">
                    <div class="output-panel" id="sql-output">
                        <h5>📊 Execution Results</h5>
                        <div id="execution-output">Ready to execute SQL...</div>
                    </div>
                    <div class="security-analysis" id="security-analysis">
                        <h5>🔒 Security Analysis</h5>
                        <div id="constraint-validation">Execute to see security analysis</div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeSQLEditor() {
        const editor = this.container.querySelector('#sql-editor');
        if (editor) {
            this.sqlEditor = editor;
            
            // Add syntax highlighting class
            editor.classList.add('sql-syntax');
            
            // Add line numbers and basic formatting
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

    executeSQL() {
        const editor = this.container.querySelector('#sql-editor');
        if (!editor || !editor.value.trim()) {
            this.showExecutionResult('Please enter a SQL statement to execute.', 'error');
            return;
        }

        const sql = editor.value.trim();
        console.log('Executing SQL:', sql);

        // Simulate SQL execution
        const result = this.simulateSQLExecution(sql);
        
        this.executionHistory.push({
            sql: sql,
            result: result,
            timestamp: new Date()
        });

        this.showExecutionResult(result.message, result.type);
        this.updateChallengeProgress(result);
    }

    simulateSQLExecution(sql) {
        const sqlUpper = sql.toUpperCase().trim();
        
        try {
            if (sqlUpper.startsWith('CREATE TABLE')) {
                return this.simulateCreateTable(sql);
            } else if (sqlUpper.startsWith('INSERT INTO')) {
                return this.simulateInsert(sql);
            } else if (sqlUpper.startsWith('SELECT')) {
                return this.simulateSelect(sql);
            } else if (sqlUpper.startsWith('ALTER TABLE')) {
                return this.simulateAlterTable(sql);
            } else if (sqlUpper.startsWith('CREATE INDEX') || sqlUpper.startsWith('CREATE UNIQUE INDEX')) {
                return this.simulateCreateIndex(sql);
            } else {
                return {
                    type: 'success',
                    message: 'SQL statement executed successfully.\n\nNote: This is a simulation environment. In a real database, this would execute against actual data.',
                    details: { executed: true }
                };
            }
        } catch (error) {
            return {
                type: 'error',
                message: `SQL Error: ${error.message}`,
                details: { error: error }
            };
        }
    }

    simulateCreateTable(sql) {
        const tableNameMatch = sql.match(/CREATE TABLE\s+(\w+)/i);
        if (!tableNameMatch) {
            throw new Error('Invalid CREATE TABLE syntax');
        }

        const tableName = tableNameMatch[1];
        
        // Extract column definitions
        const columnsMatch = sql.match(/\((.*)\)/s);
        if (!columnsMatch) {
            throw new Error('Missing column definitions');
        }

        const columnsText = columnsMatch[1];
        const constraints = this.parseTableConstraints(columnsText);

        return {
            type: 'success',
            message: `✅ Table '${tableName}' created successfully!\n\nColumns: ${constraints.columns.length}\nPrimary Keys: ${constraints.primaryKeys.length}\nForeign Keys: ${constraints.foreignKeys.length}\nUnique Constraints: ${constraints.unique.length}`,
            details: {
                tableName: tableName,
                constraints: constraints
            }
        };
    }

    parseTableConstraints(columnsText) {
        const constraints = {
            columns: [],
            primaryKeys: [],
            foreignKeys: [],
            unique: []
        };

        // Simple parsing for column definitions
        const lines = columnsText.split(',').map(line => line.trim());
        
        lines.forEach(line => {
            if (line.toUpperCase().includes('PRIMARY KEY')) {
                const columnMatch = line.match(/(\w+)/);
                if (columnMatch) {
                    constraints.primaryKeys.push(columnMatch[1]);
                    constraints.columns.push(columnMatch[1]);
                }
            } else if (line.toUpperCase().includes('FOREIGN KEY')) {
                const fkMatch = line.match(/FOREIGN KEY\s*\((\w+)\)/i);
                if (fkMatch) {
                    constraints.foreignKeys.push(fkMatch[1]);
                }
            } else if (line.toUpperCase().includes('UNIQUE')) {
                const columnMatch = line.match(/(\w+)/);
                if (columnMatch) {
                    constraints.unique.push(columnMatch[1]);
                    constraints.columns.push(columnMatch[1]);
                }
            } else if (line.match(/^\w+/)) {
                const columnMatch = line.match(/(\w+)/);
                if (columnMatch) {
                    constraints.columns.push(columnMatch[1]);
                }
            }
        });

        return constraints;
    }

    simulateInsert(sql) {
        const tableMatch = sql.match(/INSERT INTO\s+(\w+)/i);
        if (!tableMatch) {
            throw new Error('Invalid INSERT syntax');
        }

        const tableName = tableMatch[1];
        
        // Count VALUES clauses
        const valuesMatches = sql.match(/VALUES/gi);
        const recordCount = valuesMatches ? valuesMatches.length : 1;

        return {
            type: 'success',
            message: `✅ ${recordCount} record(s) inserted into '${tableName}' successfully!\n\nData has been added to the table and is available for querying.`,
            details: {
                tableName: tableName,
                recordCount: recordCount
            }
        };
    }

    simulateSelect(sql) {
        const tableMatch = sql.match(/FROM\s+(\w+)/i);
        if (!tableMatch) {
            throw new Error('Invalid SELECT syntax - missing FROM clause');
        }

        const tableName = tableMatch[1];
        
        // Simulate different results based on the challenge
        let resultMessage = '';
        let resultRows = [];

        if (this.challengeData.type === 'basic_query') {
            if (sql.toUpperCase().includes('WHERE') && sql.toUpperCase().includes('AGE')) {
                resultRows = [
                    { student_id: 2, name: 'Mark Reyes', age: 19, course: 'CS' }
                ];
                resultMessage = `✅ Query executed successfully!\n\nFound ${resultRows.length} student(s) matching the criteria.\n\nResult:\nstudent_id | name        | age | course\n2          | Mark Reyes  | 19  | CS`;
            } else {
                resultMessage = `❌ Query needs a WHERE clause to filter students by age.`;
            }
        } else {
            resultMessage = `✅ SELECT query executed successfully!\n\nQuery returned results from table '${tableName}'.`;
        }

        return {
            type: resultRows.length > 0 || !sql.toUpperCase().includes('WHERE') ? 'success' : 'warning',
            message: resultMessage,
            details: {
                tableName: tableName,
                resultRows: resultRows
            }
        };
    }

    simulateAlterTable(sql) {
        const tableMatch = sql.match(/ALTER TABLE\s+(\w+)/i);
        if (!tableMatch) {
            throw new Error('Invalid ALTER TABLE syntax');
        }

        const tableName = tableMatch[1];
        
        let message = `✅ Table '${tableName}' altered successfully!\n\n`;
        
        if (sql.toUpperCase().includes('ADD COLUMN')) {
            message += 'New column added to the table structure.';
        }
        
        if (sql.toUpperCase().includes('FOREIGN KEY')) {
            message += '\nForeign key constraint added - referential integrity enforced.';
        }

        return {
            type: 'success',
            message: message,
            details: {
                tableName: tableName,
                operation: 'ALTER'
            }
        };
    }

    simulateCreateIndex(sql) {
        const indexMatch = sql.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)/i);
        const tableMatch = sql.match(/ON\s+(\w+)/i);
        const columnMatch = sql.match(/\(([^)]+)\)/);

        if (!indexMatch || !tableMatch) {
            throw new Error('Invalid CREATE INDEX syntax');
        }

        const indexName = indexMatch[1];
        const tableName = tableMatch[1];
        const columns = columnMatch ? columnMatch[1] : 'unknown';
        
        const isUnique = sql.toUpperCase().includes('UNIQUE INDEX');

        return {
            type: 'success',
            message: `✅ ${isUnique ? 'Unique i' : 'I'}ndex '${indexName}' created successfully!\n\nTable: ${tableName}\nColumns: ${columns}\n\nQuery performance for searches on these columns should improve significantly.`,
            details: {
                indexName: indexName,
                tableName: tableName,
                columns: columns,
                unique: isUnique
            }
        };
    }

    showExecutionResult(message, type) {
        const outputDiv = this.container.querySelector('#execution-output');
        if (!outputDiv) return;

        outputDiv.className = `execution-result ${type}`;
        outputDiv.innerHTML = `<pre>${message}</pre>`;

        // Also update any challenge-specific preview areas
        this.updateChallengeSpecificPreviews(type, message);
    }

    updateChallengeSpecificPreviews(type, message) {
        // Update schema preview for table creation
        const schemaPreview = this.container.querySelector('#table-structure');
        if (schemaPreview && type === 'success' && message.includes('created successfully')) {
            schemaPreview.innerHTML = '<div class="schema-success">✅ Table structure created and validated</div>';
        }

        // Update data preview for insertions
        const dataPreview = this.container.querySelector('#table-data');
        if (dataPreview && type === 'success' && message.includes('inserted')) {
            dataPreview.innerHTML = '<div class="data-success">✅ Sample data successfully inserted</div>';
        }

        // Update constraint analysis
        const constraintDetails = this.container.querySelector('#constraint-details');
        if (constraintDetails && type === 'success') {
            constraintDetails.innerHTML = '<div class="constraint-success">✅ Constraints properly defined and enforced</div>';
        }
    }

    updateChallengeProgress(result) {
        if (result.type === 'success') {
            this.score += 20;
            
            const progressElement = this.container.querySelector('#challenge-progress');
            if (progressElement) {
                const progress = Math.min((this.score / 100) * 100, 100);
                progressElement.textContent = `${Math.round(progress)}%`;
            }
        }
    }

    validateSolution() {
        const validationResult = this.validateCurrentChallenge();
        
        if (validationResult.isValid) {
            this.score = Math.max(this.score, 100);
            this.showFeedback('🎉 Excellent work! Your SQL solution is correct and follows best practices!', 'success');
            
            // Report progress to tracking systems
            this.reportProgressToCenter();
            
            if (this.currentChallenge < 5) {
                setTimeout(() => {
                    this.startChallenge(this.currentChallenge + 1);
                }, 2000);
            } else {
                // Report room completion
                this.reportRoomCompletion();
                
                setTimeout(() => {
                    if (window.commandCenter) {
                        window.commandCenter.showCommandDashboard();
                    } else {
                        this.showDifficultySelection();
                    }
                }, 2000);
            }
        } else {
            this.attempts++;
            this.showFeedback(`❌ ${validationResult.message} Try reviewing the requirements and your SQL syntax.`, 'error');
        }
    }

    validateCurrentChallenge() {
        if (!this.executionHistory.length) {
            return { isValid: false, message: 'Please execute your SQL statement first.' };
        }

        const lastExecution = this.executionHistory[this.executionHistory.length - 1];
        
        if (lastExecution.result.type === 'error') {
            return { isValid: false, message: 'Your SQL contains syntax errors.' };
        }

        // Challenge-specific validation
        switch (this.challengeData.type) {
            case 'table_creation':
                return this.validateTableCreation(lastExecution);
            case 'data_insertion':
                return this.validateDataInsertion(lastExecution);
            case 'basic_query':
                return this.validateBasicQuery(lastExecution);
            case 'constraints':
                return this.validateConstraints(lastExecution);
            case 'foreign_keys':
                return this.validateForeignKeys(lastExecution);
            case 'normalization':
                return this.validateNormalization(lastExecution);
            case 'transactions_schema':
                return this.validateTransactionsSchema(lastExecution);
            case 'indexing':
                return this.validateIndexing(lastExecution);
            case 'many_to_many':
                return this.validateManyToMany(lastExecution);
            case 'security_schema':
                return this.validateSecuritySchema(lastExecution);
            default:
                return { isValid: true, message: 'Solution validated successfully!' };
        }
    }

    validateTableCreation(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE EMPLOYEES')) {
            return { isValid: false, message: 'Table name should be "employees".' };
        }
        
        if (!sql.includes('EMPLOYEE_ID') || !sql.includes('PRIMARY KEY')) {
            return { isValid: false, message: 'Missing employee_id primary key column.' };
        }
        
        if (!sql.includes('NAME') || !sql.includes('DEPARTMENT') || !sql.includes('ROLE')) {
            return { isValid: false, message: 'Missing required columns: name, department, role.' };
        }
        
        return { isValid: true, message: 'Perfect IT employee table structure!' };
    }

    validateDataInsertion(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('INSERT INTO EMPLOYEES')) {
            return { isValid: false, message: 'Should insert into employees table.' };
        }
        
        if (!sql.includes('SARAH CHEN') || !sql.includes('MICHAEL TORRES') || !sql.includes('JESSICA KIM')) {
            return { isValid: false, message: 'Missing required IT staff records: Sarah Chen, Michael Torres, Jessica Kim.' };
        }
        
        return { isValid: true, message: 'All required IT staff data inserted correctly!' };
    }

    validateBasicQuery(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('SELECT') || !sql.includes('FROM EMPLOYEES')) {
            return { isValid: false, message: 'Should be a SELECT query from employees table.' };
        }
        
        if (!sql.includes('WHERE') || !sql.includes('DEPARTMENT')) {
            return { isValid: false, message: 'Missing WHERE clause to filter by department.' };
        }
        
        if (!sql.includes('DEVOPS')) {
            return { isValid: false, message: 'Should filter for DevOps department employees.' };
        }
        
        return { isValid: true, message: 'Perfect query to find DevOps team members!' };
    }

    validateConstraints(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE USER_ACCOUNTS')) {
            return { isValid: false, message: 'Should create a user_accounts table.' };
        }
        
        if (!sql.includes('USER_ID') || !sql.includes('PRIMARY KEY')) {
            return { isValid: false, message: 'Missing user_id primary key.' };
        }
        
        if (!sql.includes('USERNAME') || !sql.includes('UNIQUE')) {
            return { isValid: false, message: 'Missing username with UNIQUE constraint.' };
        }
        
        return { isValid: true, message: 'Excellent security constraints for user accounts!' };
    }

    validateForeignKeys(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('ALTER TABLE EMPLOYEES')) {
            return { isValid: false, message: 'Should modify the employees table.' };
        }
        
        if (!sql.includes('DEPT_ID')) {
            return { isValid: false, message: 'Should add dept_id column.' };
        }
        
        if (!sql.includes('FOREIGN KEY') || !sql.includes('REFERENCES')) {
            return { isValid: false, message: 'Missing foreign key constraint to departments table.' };
        }
        
        return { isValid: true, message: 'Perfect foreign key relationship!' };
    }

    validateNormalization(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE STUDENTS') || !sql.includes('CREATE TABLE COURSES') || !sql.includes('CREATE TABLE ENROLLMENTS')) {
            return { isValid: false, message: 'Should create three tables: students, courses, and enrollments.' };
        }
        
        if (!sql.includes('PRIMARY KEY') || !sql.includes('FOREIGN KEY')) {
            return { isValid: false, message: 'Missing primary keys or foreign key relationships.' };
        }
        
        if (!sql.includes('STUDENT_ID') || !sql.includes('COURSE_ID')) {
            return { isValid: false, message: 'Missing proper ID columns for relationships.' };
        }
        
        return { isValid: true, message: 'Excellent normalized database schema!' };
    }

    validateTransactionsSchema(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE ACCOUNTS') || !sql.includes('CREATE TABLE TRANSACTIONS')) {
            return { isValid: false, message: 'Should create both accounts and transactions tables.' };
        }
        
        if (!sql.includes('ACCOUNT_ID') && !sql.includes('TX_ID')) {
            return { isValid: false, message: 'Missing proper primary keys for financial tables.' };
        }
        
        if (!sql.includes('DECIMAL') && !sql.includes('BALANCE') && !sql.includes('AMOUNT')) {
            return { isValid: false, message: 'Missing proper decimal columns for financial amounts.' };
        }
        
        if (!sql.includes('FOREIGN KEY') || !sql.includes('REFERENCES')) {
            return { isValid: false, message: 'Missing foreign key relationship between accounts and transactions.' };
        }
        
        return { isValid: true, message: 'Perfect banking system schema with proper relationships!' };
    }

    validateIndexing(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE INDEX') && !sql.includes('CREATE UNIQUE INDEX')) {
            return { isValid: false, message: 'Should create an index using CREATE INDEX statement.' };
        }
        
        if (!sql.includes('EMAIL')) {
            return { isValid: false, message: 'Should create an index on the email column.' };
        }
        
        if (!sql.includes('USERS')) {
            return { isValid: false, message: 'Should create index on the users table.' };
        }
        
        return { isValid: true, message: 'Excellent index optimization for email searches!' };
    }

    validateManyToMany(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE STUDENTS') || !sql.includes('CREATE TABLE COURSES') || !sql.includes('CREATE TABLE ENROLLMENTS')) {
            return { isValid: false, message: 'Should create students, courses, and enrollments junction table.' };
        }
        
        if (!sql.includes('PRIMARY KEY (STUDENT_ID, COURSE_ID)')) {
            return { isValid: false, message: 'Junction table should have composite primary key (student_id, course_id).' };
        }
        
        if (!sql.includes('FOREIGN KEY')) {
            return { isValid: false, message: 'Missing foreign key constraints in junction table.' };
        }
        
        return { isValid: true, message: 'Perfect many-to-many relationship with proper junction table!' };
    }

    validateSecuritySchema(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE USERS')) {
            return { isValid: false, message: 'Should create a users table.' };
        }
        
        if (!sql.includes('CHECK') || !sql.includes('ROLE')) {
            return { isValid: false, message: 'Missing CHECK constraint for role validation.' };
        }
        
        if (!sql.includes('UNIQUE') || !sql.includes('USERNAME')) {
            return { isValid: false, message: 'Missing UNIQUE constraint on username.' };
        }
        
        if (!sql.includes('NOT NULL')) {
            return { isValid: false, message: 'Missing NOT NULL constraints for required fields.' };
        }
        
        return { isValid: true, message: 'Excellent security schema with proper constraints!' };
    }

    clearEditor() {
        const editor = this.container.querySelector('#sql-editor');
        if (editor) {
            editor.value = '';
            editor.focus();
        }
        
        // Clear results
        const outputDiv = this.container.querySelector('#execution-output');
        if (outputDiv) {
            outputDiv.innerHTML = 'Ready to execute SQL...';
            outputDiv.className = 'execution-result';
        }
    }

    getHint() {
        // Initialize hint tracking
        if (!this.hintTracker) {
            this.hintTracker = {
                currentLevel: 0,
                maxLevel: 3,
                hintsUsed: 0
            };
        }

        const progressiveHints = this.getProgressiveHints();
        const currentHint = progressiveHints[this.hintTracker.currentLevel];
        
        if (currentHint) {
            this.showFeedback(`💡 SQL Hint ${this.hintTracker.currentLevel + 1}/${this.hintTracker.maxLevel + 1}: ${currentHint}`, 'info');
            
            // Update hint button
            const hintBtn = document.getElementById('get-hint-btn');
            if (hintBtn) {
                this.hintTracker.currentLevel = Math.min(this.hintTracker.currentLevel + 1, this.hintTracker.maxLevel);
                this.hintTracker.hintsUsed++;
                
                if (this.hintTracker.currentLevel >= this.hintTracker.maxLevel) {
                    hintBtn.innerHTML = '💡 All Hints Used';
                    hintBtn.disabled = true;
                    hintBtn.style.opacity = '0.6';
                } else {
                    hintBtn.innerHTML = `💡 Next Hint (${this.hintTracker.currentLevel + 1}/${this.hintTracker.maxLevel + 1})`;
                }
            }
        }
    }

    getProgressiveHints() {
        const easyHints = {
            1: [ // Employee Directory Table - Challenge 1
                "Start with CREATE TABLE employees. Use proper naming conventions (lowercase, underscores).",
                "Add employee_id as PRIMARY KEY with AUTO_INCREMENT for automatic numbering.",
                "Include name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE, department VARCHAR(50).",
                "Complete syntax: CREATE TABLE employees (employee_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE, department VARCHAR(50));"
            ],
            2: [ // Add IT Staff Records - Challenge 2
                "Use INSERT INTO employees to add new IT staff records to your table.",
                "Specify column names: INSERT INTO employees (name, email, department, role).",
                "Add multiple IT staff: VALUES ('Alice Johnson', 'alice@company.com', 'IT', 'DevOps Engineer').",
                "Insert 3-4 records for different IT roles: DevOps, Network Admin, Database Admin, Security Analyst."
            ],
            3: [ // Query IT Personnel - Challenge 3
                "SELECT statement retrieves data. Use SELECT * FROM employees to get all columns.",
                "Add WHERE clause to filter IT staff: WHERE department = 'IT' OR department = 'DevOps'.",
                "Use comparison operators: =, !=, LIKE for pattern matching with wildcards (%).",
                "Example: SELECT name, role FROM employees WHERE department IN ('IT', 'DevOps', 'Security');"
            ],
            4: [ // System Access Constraints - Challenge 4
                "Create users table with security constraints: username UNIQUE, password NOT NULL.",
                "Add PRIMARY KEY constraint: user_id INT AUTO_INCREMENT PRIMARY KEY.",
                "Include CHECK constraints for data validation: access_level IN ('user', 'admin').",
                "Example: CREATE TABLE users (user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, access_level ENUM('user', 'admin'));"
            ],
            5: [ // Department Relationships - Challenge 5
                "Create departments table first: CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50)).",
                "Modify employees table to add foreign key: ALTER TABLE employees ADD COLUMN dept_id INT.",
                "Add foreign key constraint: ALTER TABLE employees ADD FOREIGN KEY (dept_id) REFERENCES departments(dept_id).",
                "Use ON DELETE CASCADE or SET NULL to handle referential integrity when departments are deleted."
            ]
        };

        const hardHints = {
            1: [ // Enterprise Data Normalization - Challenge 1
                "Identify repeating groups in your data and separate them into individual tables (1NF).",
                "Remove partial dependencies - non-key attributes must depend on the entire primary key (2NF).",
                "Eliminate transitive dependencies - non-key attributes shouldn't depend on other non-key attributes (3NF).",
                "Create separate tables: employees, departments, projects, and employee_projects junction table."
            ],
            2: [ // Financial System Schema - Challenge 2
                "Design core tables: users, accounts, transactions with proper relationships.",
                "Use DECIMAL(15,2) for currency amounts to maintain precision in financial calculations.",
                "Include audit fields: created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP.",
                "Add CHECK constraints: CHECK (amount > 0), CHECK (account_balance >= 0) for business rules."
            ],
            3: [ // Database Performance Optimization - Challenge 3
                "Analyze query patterns to identify columns frequently used in WHERE clauses.",
                "Create single-column indexes: CREATE INDEX idx_email ON employees(email) for unique lookups.",
                "Use composite indexes for multi-column searches: CREATE INDEX idx_dept_role ON employees(department, role).",
                "Monitor index usage with EXPLAIN to ensure indexes are actually improving query performance."
            ],
            4: [ // System User-Role Relationships - Challenge 4
                "Design three tables: users, roles, user_roles (junction table for many-to-many relationship).",
                "Junction table needs composite primary key: PRIMARY KEY (user_id, role_id).",
                "Add foreign keys: FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (role_id) REFERENCES roles(id).",
                "Include metadata in junction table: assigned_date TIMESTAMP, assigned_by INT for audit trail."
            ],
            5: [ // Enterprise Security Schema - Challenge 5
                "Create security tables: users, permissions, user_permissions with advanced constraints.",
                "Use CHECK constraints for validation: CHECK (password_strength IN ('weak', 'medium', 'strong')).",
                "Add triggers for audit logging: CREATE TRIGGER log_user_changes AFTER UPDATE ON users.",
                "Implement row-level security: CREATE POLICY user_policy ON users FOR SELECT USING (user_id = current_user_id())."
            ]
        };

        const currentChallenge = this.currentChallenge || 1;
        const isEasy = this.currentDifficulty === 'easy';
        
        return isEasy ? 
            (easyHints[currentChallenge] || easyHints[1]) :
            (hardHints[currentChallenge] || hardHints[1]);
    }

    resetHints() {
        // Reset hint tracking for new challenge
        this.hintTracker = {
            currentLevel: 0,
            maxLevel: 3,
            hintsUsed: 0
        };
        
        // Reset hint button appearance
        const hintBtn = document.getElementById('get-hint-btn');
        if (hintBtn) {
            hintBtn.innerHTML = '💡 Get Hint (1/4)';
            hintBtn.disabled = false;
            hintBtn.style.opacity = '1';
        }
    }

    resetChallenge() {
        if (confirm('Are you sure you want to reset this challenge? Your progress will be lost.')) {
            this.score = 0;
            this.attempts = 0;
            this.executionHistory = [];
            
            this.clearEditor();
            this.loadChallengeInterface();
            
            this.showFeedback('Challenge reset! Start fresh with your SQL solution.', 'warning');
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

    // Helper method to report progress to command center and database
    async reportProgressToCenter() {
        try {
            if (window.progressTracker) {
                // Use the improved completeChallenge method for proper validation
                await window.progressTracker.completeChallenge('schemax', {
                    level: this.currentChallenge,
                    score: this.score,
                    timeSpent: this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                    attempts: this.attempts,
                    difficulty: this.currentDifficulty,
                    sqlStatements: this.executionHistory.length
                });
                
                // Award level completion badge
                if (window.achievementManager) {
                    await window.achievementManager.checkLevelCompletion(
                        'schemax',
                        this.currentChallenge,
                        this.score,
                        this.challengeStartTime ? Math.floor((Date.now() - this.challengeStartTime) / 1000) : 0,
                        { difficulty: this.currentDifficulty, sqlStatements: this.executionHistory.length }
                    );
                }
                
                // Dispatch event to update command center display
                window.dispatchEvent(new CustomEvent('progressUpdated', {
                    detail: {
                        roomName: 'schemax',
                        progress: this.currentChallenge * 20, // Each challenge = 20%
                        score: this.score,
                        level: this.currentChallenge
                    }
                }));
                
                console.log(`📊 Challenge ${this.currentChallenge}/5 progress reported for SCHEMAX`);
            }
        } catch (error) {
            console.warn('Could not report progress to progress tracker:', error);
        }
    }

    // Helper method to report room completion with detailed stats
    async reportRoomCompletion() {
        try {
            if (window.progressTracker) {
                await window.progressTracker.markRoomComplete('schemax', this.score);
                
                // Check for room completion badge
                if (window.achievementManager) {
                    const totalTime = this.roomStartTime ? Math.floor((Date.now() - this.roomStartTime) / 1000) : 0;
                    await window.achievementManager.checkRoomCompletion(
                        'schemax',
                        this.score,
                        totalTime,
                        5, // All 5 levels completed
                        { difficulty: this.currentDifficulty, totalSQLStatements: this.executionHistory.length }
                    );
                    
                    // Check for cross-room achievements
                    await window.achievementManager.checkAllRoomsCompletion();
                }
                
                // Dispatch room completion event
                window.dispatchEvent(new CustomEvent('roomCompleted', {
                    detail: {
                        roomName: 'schemax',
                        completionStats: {
                            timeSpent: Math.floor((Date.now() - this.roomStartTime) / 1000),
                            totalAttempts: this.attempts,
                            finalScore: this.score,
                            difficulty: this.currentDifficulty,
                            totalChallenges: 5,
                            totalSQLStatements: this.executionHistory.length
                        }
                    }
                }));
                
                console.log('🏆 SCHEMAX room completion reported successfully');
            }
        } catch (error) {
            console.warn('Could not report room completion:', error);
        }
    }
}

// Export the class for use by command center
window.SchemaxLab = SchemaxLab;
window.schemaxLab = null;

// Don't auto-initialize when loaded independently
console.log('SchemaxLab class loaded and ready for database schema training');
