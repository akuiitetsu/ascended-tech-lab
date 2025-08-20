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
        
        this.challengeCategories = {
            easy: {
                name: 'Easy SQL Schema',
                description: 'Basic table creation, queries, and relationships',
                challenges: [
                    {
                        name: 'Create a Student Table',
                        objective: 'Write SQL to create a students table with proper structure',
                        description: 'Design a basic table with primary key and essential fields',
                        type: 'table_creation',
                        concepts: ['CREATE TABLE', 'Primary Keys', 'Data Types']
                    },
                    {
                        name: 'Insert Records',
                        objective: 'Insert sample data into the students table',
                        description: 'Practice INSERT statements with multiple records',
                        type: 'data_insertion',
                        concepts: ['INSERT INTO', 'Data Values', 'Multiple Records']
                    },
                    {
                        name: 'Basic Query',
                        objective: 'Select students based on age criteria',
                        description: 'Write SELECT statements with WHERE conditions',
                        type: 'basic_query',
                        concepts: ['SELECT', 'WHERE clause', 'Comparison operators']
                    },
                    {
                        name: 'Primary Key & Uniqueness',
                        objective: 'Create courses table with constraints',
                        description: 'Implement primary keys and unique constraints',
                        type: 'constraints',
                        concepts: ['Primary Keys', 'UNIQUE constraints', 'Table constraints']
                    },
                    {
                        name: 'Foreign Key Relationship',
                        objective: 'Establish relationships between tables',
                        description: 'Create foreign key constraints for referential integrity',
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
                        name: 'Database Normalization',
                        objective: 'Normalize denormalized data into proper table structure',
                        description: 'Apply 1NF, 2NF, and 3NF principles to eliminate redundancy',
                        type: 'normalization',
                        concepts: ['Normalization', 'Data redundancy', 'Table relationships']
                    },
                    {
                        name: 'Banking Transactions Schema',
                        objective: 'Design secure banking system tables',
                        description: 'Create tables for accounts and transactions with proper relationships',
                        type: 'transactions_schema',
                        concepts: ['Financial data', 'Transaction integrity', 'Account management']
                    },
                    {
                        name: 'Index Optimization',
                        objective: 'Optimize query performance with indexes',
                        description: 'Create indexes to speed up database queries',
                        type: 'indexing',
                        concepts: ['Database indexes', 'Query optimization', 'Performance tuning']
                    },
                    {
                        name: 'Many-to-Many Relationship',
                        objective: 'Design complex relationship schemas',
                        description: 'Create junction tables for many-to-many relationships',
                        type: 'many_to_many',
                        concepts: ['Junction tables', 'Composite keys', 'Complex relationships']
                    },
                    {
                        name: 'Constraints and Security',
                        objective: 'Implement secure user management schema',
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
                    <h3>🗄️ Create a Student Table</h3>
                    <p>Design a students table with the specified structure and constraints.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Requirements</h4>
                    <ul>
                        <li><strong>student_id:</strong> Primary Key, Integer</li>
                        <li><strong>name:</strong> Text (VARCHAR)</li>
                        <li><strong>age:</strong> Integer</li>
                        <li><strong>course:</strong> Text (VARCHAR)</li>
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
CREATE TABLE students (
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
                    <h3>📝 Insert Student Records</h3>
                    <p>Add the specified sample data to the students table.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Data to Insert</h4>
                    <div class="data-table">
                        <table>
                            <thead>
                                <tr><th>student_id</th><th>name</th><th>age</th><th>course</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>1</td><td>Anna Cruz</td><td>18</td><td>IT</td></tr>
                                <tr><td>2</td><td>Mark Reyes</td><td>19</td><td>CS</td></tr>
                                <tr><td>3</td><td>John Lim</td><td>17</td><td>IS</td></tr>
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
INSERT INTO students (student_id, name, age, course) VALUES
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
                    <h3>🔍 Basic Query Challenge</h3>
                    <p>Write a SELECT statement to find students based on specific criteria.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Query Requirements</h4>
                    <ul>
                        <li>Select <strong>all students</strong> who are <strong>older than 18</strong></li>
                        <li>Return all columns for matching records</li>
                        <li>Use proper WHERE clause syntax</li>
                    </ul>
                    
                    <div class="sample-data">
                        <h5>Sample Data in students table:</h5>
                        <table>
                            <thead>
                                <tr><th>student_id</th><th>name</th><th>age</th><th>course</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>1</td><td>Anna Cruz</td><td>18</td><td>IT</td></tr>
                                <tr><td>2</td><td>Mark Reyes</td><td>19</td><td>CS</td></tr>
                                <tr><td>3</td><td>John Lim</td><td>17</td><td>IS</td></tr>
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
SELECT * FROM students 
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
                    <h3>🔒 Primary Key & Uniqueness</h3>
                    <p>Create a courses table with proper constraints to ensure data integrity.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Table Requirements</h4>
                    <ul>
                        <li><strong>course_id:</strong> Primary Key, Integer</li>
                        <li><strong>course_name:</strong> Text (VARCHAR), Unique constraint</li>
                        <li>Ensure no duplicate course names can be inserted</li>
                        <li>Primary key should auto-identify each course uniquely</li>
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
CREATE TABLE courses (
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
                    <h3>🔗 Foreign Key Relationships</h3>
                    <p>Establish referential integrity between students and courses tables.</p>
                </div>
                
                <div class="requirements-panel">
                    <h4>📋 Relationship Requirements</h4>
                    <ul>
                        <li>Modify the <strong>students</strong> table to include <strong>course_id</strong></li>
                        <li>Create foreign key constraint referencing <strong>courses(course_id)</strong></li>
                        <li>Ensure referential integrity is maintained</li>
                        <li>Students can only be assigned to existing courses</li>
                    </ul>
                    
                    <div class="existing-tables">
                        <h5>Existing Tables:</h5>
                        <div class="table-info">
                            <strong>courses:</strong> course_id (PK), course_name (UNIQUE)<br>
                            <strong>students:</strong> student_id (PK), name, age, course
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
                    <textarea id="sql-editor" placeholder="-- Modify students table to add foreign key relationship
ALTER TABLE students 
ADD COLUMN course_id INTEGER,
ADD FOREIGN KEY (course_id) REFERENCES courses(course_id);"></textarea>
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
            
            // Update room progress in command center if available
            if (window.commandCenter && window.commandCenter.updateRoomProgress) {
                window.commandCenter.updateRoomProgress('database', this.currentChallenge, 5);
            }
            
            if (this.currentChallenge < 5) {
                setTimeout(() => {
                    this.startChallenge(this.currentChallenge + 1);
                }, 2000);
            } else {
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
            default:
                return { isValid: true, message: 'Solution validated successfully!' };
        }
    }

    validateTableCreation(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE STUDENTS')) {
            return { isValid: false, message: 'Table name should be "students".' };
        }
        
        if (!sql.includes('STUDENT_ID') || !sql.includes('PRIMARY KEY')) {
            return { isValid: false, message: 'Missing student_id primary key column.' };
        }
        
        if (!sql.includes('NAME') || !sql.includes('AGE') || !sql.includes('COURSE')) {
            return { isValid: false, message: 'Missing required columns: name, age, course.' };
        }
        
        return { isValid: true, message: 'Perfect table structure!' };
    }

    validateDataInsertion(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('INSERT INTO STUDENTS')) {
            return { isValid: false, message: 'Should insert into students table.' };
        }
        
        if (!sql.includes('ANNA CRUZ') || !sql.includes('MARK REYES') || !sql.includes('JOHN LIM')) {
            return { isValid: false, message: 'Missing required student records.' };
        }
        
        return { isValid: true, message: 'All required data inserted correctly!' };
    }

    validateBasicQuery(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('SELECT') || !sql.includes('FROM STUDENTS')) {
            return { isValid: false, message: 'Should be a SELECT query from students table.' };
        }
        
        if (!sql.includes('WHERE') || !sql.includes('AGE')) {
            return { isValid: false, message: 'Missing WHERE clause to filter by age.' };
        }
        
        if (!sql.includes('>') || !sql.includes('18')) {
            return { isValid: false, message: 'Should filter for students older than 18.' };
        }
        
        return { isValid: true, message: 'Perfect query with proper filtering!' };
    }

    validateConstraints(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('CREATE TABLE COURSES')) {
            return { isValid: false, message: 'Should create a courses table.' };
        }
        
        if (!sql.includes('COURSE_ID') || !sql.includes('PRIMARY KEY')) {
            return { isValid: false, message: 'Missing course_id primary key.' };
        }
        
        if (!sql.includes('COURSE_NAME') || !sql.includes('UNIQUE')) {
            return { isValid: false, message: 'Missing course_name with UNIQUE constraint.' };
        }
        
        return { isValid: true, message: 'Excellent use of constraints!' };
    }

    validateForeignKeys(execution) {
        const sql = execution.sql.toUpperCase();
        
        if (!sql.includes('ALTER TABLE STUDENTS')) {
            return { isValid: false, message: 'Should modify the students table.' };
        }
        
        if (!sql.includes('COURSE_ID')) {
            return { isValid: false, message: 'Should add course_id column.' };
        }
        
        if (!sql.includes('FOREIGN KEY') || !sql.includes('REFERENCES')) {
            return { isValid: false, message: 'Missing foreign key constraint.' };
        }
        
        return { isValid: true, message: 'Perfect foreign key relationship!' };
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
        const hints = {
            'table_creation': "💡 Use CREATE TABLE with column_name DATA_TYPE constraints. Don't forget PRIMARY KEY for student_id!",
            'data_insertion': "💡 Use INSERT INTO table_name (columns) VALUES (values1), (values2), (values3) for multiple records.",
            'basic_query': "💡 Use SELECT * FROM students WHERE age > 18 to find students older than 18.",
            'constraints': "💡 Add UNIQUE constraint after column definition: course_name VARCHAR(100) UNIQUE",
            'foreign_keys': "💡 Use ALTER TABLE to ADD COLUMN and ADD FOREIGN KEY constraint with REFERENCES.",
            'normalization': "💡 Create separate tables for students, courses, and a junction table for enrollments.",
            'transactions_schema': "💡 Use DECIMAL for money amounts and TIMESTAMP for dates. Don't forget foreign keys!",
            'indexing': "💡 CREATE INDEX index_name ON table_name(column_name) - consider UNIQUE for email addresses.",
            'many_to_many': "💡 Junction table needs composite primary key: PRIMARY KEY (student_id, course_id)",
            'security_schema': "💡 Use CHECK constraint for role validation: role VARCHAR(10) CHECK (role IN ('student', 'admin'))"
        };
        
        const hint = hints[this.challengeData.type] || "💡 Follow the requirements carefully and use proper SQL syntax. Check examples in the challenge description!";
        this.showFeedback(hint, 'info');
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
            if (window.commandCenter) {
                window.commandCenter.showCommandDashboard();
            } else {
                this.showDifficultySelection();
            }
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
window.SchemaxLab = SchemaxLab;
window.schemaxLab = null;

// Don't auto-initialize when loaded independently
console.log('SchemaxLab class loaded and ready for database schema training');
