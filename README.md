# 🚀 AscendEd Tech Lab: Interactive Learning Platform

> **"Only A True Tech Master Can Escape!"** - A gamified learning simulation for mastering technical skills through immersive, hands-on challenges.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)](https://github.com/akuiitetsu/ascended-tech-lab)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com/akuiitetsu/ascended-tech-lab)

---

## 📋 Table of Contents

- [Introduction](#-introduction)
- [System Requirements](#-system-requirements)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [User Guide](#-user-guide)
- [Learning Modules](#-learning-modules)
- [Screenshots](#-screenshots)
- [Technologies](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Introduction

**AscendEd Tech Lab** is an innovative, gamified educational platform designed to transform technical learning into an engaging adventure. Players are trapped in a virtual tech lab and must solve increasingly complex challenges across five specialized training rooms to "escape" and prove their technical mastery.

### Key Features

✨ **Story-Driven Learning**: Each module features immersive narratives that contextualize technical concepts  
🎮 **Gamification**: Earn XP, unlock achievements, and track progress through comprehensive dashboards  
🧠 **Adaptive Difficulty**: Choose between easy (beginner) and hard (advanced) challenge modes  
🤖 **AI-Powered Mentoring**: Get intelligent hints and personalized guidance (AITRIX module)  
📊 **Real-Time Validation**: Instant feedback on your solutions with detailed explanations  
📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices  
🔄 **Progressive Learning**: Master fundamentals before advancing to complex scenarios

### Target Audience

- **Students**: Computer Science, IT, and Engineering majors
- **Self-Learners**: Individuals pursuing technical skills independently
- **Educators**: Teachers seeking interactive learning tools for classrooms
- **Professionals**: IT practitioners reinforcing foundational concepts

---

## 💻 System Requirements

### Hardware Requirements

#### Minimum Specifications
- **Processor**: Dual-core CPU (2.0 GHz or higher)
- **RAM**: 4 GB
- **Storage**: 100 MB available space
- **Display**: 1366x768 resolution
- **Internet**: Broadband connection (5 Mbps+)

#### Recommended Specifications
- **Processor**: Quad-core CPU (2.5 GHz or higher)
- **RAM**: 8 GB or more
- **Storage**: 500 MB available space (for development)
- **Display**: 1920x1080 resolution or higher
- **Internet**: High-speed connection (25 Mbps+)

### Software Requirements

#### Required
- **Web Browser** (one of the following):
  - Google Chrome 90+ (Recommended)
  - Mozilla Firefox 88+
  - Microsoft Edge 90+
  - Safari 14+ (macOS/iOS)
  - Opera 76+

#### For Development/Local Hosting
- **Runtime Environment**:
  - Python 3.8+ OR Node.js 14+
  - Git 2.30+

- **Backend Dependencies** (Python):
  ```
  Flask 2.3.3
  flask-cors 4.0.0
  python-dotenv
  supabase
  resend
  ```

- **Backend Dependencies** (Node.js):
  ```
  express 4.17.1+
  ```

#### Optional Tools
- **Code Editor**: VS Code, Sublime Text, or similar
- **Database Client**: SQLite Browser (for local database inspection)
- **API Testing**: Postman or Insomnia (for backend development)

### Supported Platforms

| Platform | Support Level | Notes |
|----------|---------------|-------|
| Windows 10/11 | ✅ Full Support | Recommended for development |
| macOS 10.15+ | ✅ Full Support | Safari and Chrome tested |
| Linux (Ubuntu 20.04+) | ✅ Full Support | All distributions supported |
| iOS 14+ | ✅ Mobile Optimized | Safari browser |
| Android 10+ | ✅ Mobile Optimized | Chrome browser |
| Tablets | ✅ Tablet Optimized | iPad, Android tablets |

---

## 🏗️ Project Structure

```
ascended-tech-lab/
│
├── index.html                      # Application entry point (login/registration)
├── app.py                          # Flask backend server (Python)
├── package.json                    # Node.js dependencies (Express server)
├── requirements.txt                # Python dependencies
├── runtime.txt                     # Python version specification
├── vercel.json                     # Vercel deployment configuration
├── database_schema.sql             # SQLite database schema
├── init_database.py                # Database initialization script
├── setup_supabase_permissions.sql  # Supabase permission setup
│
├── .env.template                   # Environment variables template
├── .gitignore                      # Git ignore rules
├── README.md                       # This file
├── LICENSE                         # MIT License
│
├── server/                         # Backend server implementations
│   ├── app.js                      # Express.js server entry
│   ├── node/
│   │   └── server.js              # Node.js server implementation
│   └── python/
│       └── server.py              # Python Flask server implementation
│
├── src/                            # Source files
│   ├── pages/                     # Application pages
│   │   ├── admin-login.html       # Administrator login portal
│   │   ├── command-center.html    # Main module selection hub
│   │   └── dashboard/             # User dashboard
│   │       ├── admin-dashboard.html   # Admin analytics and management
│   │       └── user-dashboard.html    # User progress tracking
│   │
│   └── rooms/                     # Learning module interfaces
│       ├── flowchart-room.html    # FLOWBYTE - Flowchart Lab
│       ├── netxus-room.html       # NETXUS - Network Engineering Lab
│       ├── aitrix-room.html       # AITRIX - AI-Powered IT Training
│       ├── schemax-room.html      # SCHEMAX - Database Design Lab
│       └── codevance-room.html    # CODEVANCE - Programming Challenge Lab
│
├── static/                        # Static assets
│   ├── css/                       # Stylesheets
│   │   ├── main.css              # Global styles
│   │   ├── style.css             # Base styling
│   │   ├── admin.css             # Admin panel styles
│   │   ├── dashboard.css         # Dashboard styles
│   │   └── command-center.css    # Command center styles
│   │
│   ├── js/                        # JavaScript modules
│   │   ├── main.js               # Main application logic
│   │   ├── auth.js               # Authentication handling
│   │   ├── login.js              # Login page logic
│   │   ├── api.js                # API communication layer
│   │   ├── command-center.js     # Command center controller
│   │   ├── dashboard.js          # Dashboard logic
│   │   ├── progress-tracker.js   # Progress tracking system
│   │   ├── achievement-manager.js # Achievement system
│   │   ├── responsive-manager.js  # Responsive UI handler
│   │   ├── flowchart-game.js     # FLOWBYTE game engine
│   │   ├── netxus.js             # NETXUS simulation engine
│   │   ├── aitrix-game.js        # AITRIX challenge system
│   │   ├── schemax-game.js       # SCHEMAX database trainer
│   │   ├── codevance-game.js     # CODEVANCE code challenges
│   │   ├── admin.js              # Admin panel logic
│   │   └── command.js            # Command execution utilities
│   │
│   ├── img/                       # Image assets
│   │   └── palbot.png            # PAL mascot character
│   │
│   └── video/                     # Video content
│       └── intro-cutscene.mp4    # Introduction animation
│
└── venv/                          # Python virtual environment (local only)
```

### File Organization Principles

- **`/src`**: Contains all HTML pages and UI components
- **`/static`**: Houses all static assets (CSS, JavaScript, images, videos)
- **`/server`**: Backend server implementations (Python Flask & Node.js Express)
- **Root Level**: Configuration files, entry points, and documentation

---

## 🚀 Installation & Setup

### Quick Start (3 Steps)

#### Option A: Using Python

```bash
# 1. Clone the repository
git clone https://github.com/akuiitetsu/ascended-tech-lab.git
cd ascended-tech-lab

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
python app.py
```

Open your browser and navigate to: `http://localhost:5000`

#### Option B: Using Node.js

```bash
# 1. Clone the repository
git clone https://github.com/akuiitetsu/ascended-tech-lab.git
cd ascended-tech-lab

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Open your browser and navigate to: `http://localhost:3000`

### Detailed Setup Instructions

#### 1. Prerequisites Installation

**Install Git:**
```bash
# Windows: Download from https://git-scm.com/download/win
# macOS:
brew install git

# Linux (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install git
```

**Install Python 3.8+ (Option A):**
```bash
# Windows: Download from https://www.python.org/downloads/
# macOS:
brew install python3

# Linux (Ubuntu/Debian):
sudo apt-get install python3 python3-pip
```

**Install Node.js 14+ (Option B):**
```bash
# Windows/macOS: Download from https://nodejs.org/
# Linux (Ubuntu/Debian):
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/akuiitetsu/ascended-tech-lab.git
cd ascended-tech-lab

# Create environment configuration (optional)
cp .env.template .env

# Edit .env with your configuration
# nano .env  # Linux/macOS
# notepad .env  # Windows
```

#### 3. Database Setup (Optional - for user progress tracking)

```bash
# Initialize SQLite database
python init_database.py

# Verify database creation
# You should see: tech_lab.db file created
```

#### 4. Launch Application

**Python Backend:**
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py

# Server starts at: http://localhost:5000
```

**Node.js Backend:**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or production server
npm start

# Server starts at: http://localhost:3000
```

#### 5. Access the Application

1. Open your web browser
2. Navigate to `http://localhost:5000` (Python) or `http://localhost:3000` (Node.js)
3. You should see the login/registration page

### Troubleshooting Common Issues

**Port Already in Use:**
```bash
# Change port in app.py (line with app.run())
app.run(debug=True, port=8080)  # Use different port
```

**Dependencies Not Installing:**
```bash
# Python: Upgrade pip
python -m pip install --upgrade pip

# Node.js: Clear npm cache
npm cache clean --force
npm install
```

**Database Errors:**
```bash
# Delete existing database and reinitialize
rm tech_lab.db
python init_database.py
```

---

## 📚 User Guide

### Step-by-Step Instructions

#### 1️⃣ **Registration & Login**

**Page**: `index.html` (Landing Page)

![Login Screenshot Placeholder]

**Steps:**
1. **New Users - Registration**:
   - Click the **"Register"** tab
   - Enter your **Username** (3-20 characters, alphanumeric)
   - Enter your **Email** (valid email format)
   - Create a **Password** (minimum 8 characters)
   - Click **"Create Account"** button
   - System validates credentials and creates your account

2. **Existing Users - Login**:
   - Enter your **Username**
   - Enter your **Password**
   - Click **"Login"** button
   - System authenticates and redirects to Command Center

**Features**:
- 🔒 Secure password hashing
- ✉️ Email validation
- 🎨 Animated intro cutscene (PAL mascot)
- 📱 Mobile-responsive design

**Troubleshooting**:
- **"Username already exists"**: Choose a different username
- **"Invalid credentials"**: Verify username/password spelling
- **Email format error**: Ensure valid email format (user@domain.com)

---

#### 2️⃣ **Command Center (Module Hub)**

**Page**: `src/pages/command-center.html`

![Command Center Screenshot Placeholder]

**Purpose**: Central hub for accessing all learning modules and tracking overall progress.

**Steps**:
1. **View Your Profile**:
   - Top-right corner displays **Username** and **Total XP**
   - Click profile icon to access **User Dashboard**

2. **Select a Learning Module**:
   - **FLOWBYTE** (Purple) - Flowchart Construction Lab
   - **NETXUS** (Blue) - Network Engineering Simulation
   - **AITRIX** (Green) - AI-Powered IT Training
   - **SCHEMAX** (Cyan) - Database Design Lab
   - **CODEVANCE** (Magenta) - Programming Challenge Lab

3. **Check Module Status**:
   - Each module card shows:
     - ✅ **Completion Status**: Percentage completed
     - 🏆 **Achievements**: Badges earned
     - ⭐ **Difficulty Level**: Easy/Medium/Hard

4. **Navigate**:
   - Click any module card to enter that learning lab
   - Click **"Dashboard"** button for detailed progress tracking
   - Click **"Logout"** to exit safely

**Features**:
- 🎮 Interactive module cards with hover effects
- 📊 Real-time progress synchronization
- 🌈 Color-coded modules for easy identification
- 🔔 Achievement notifications

---

#### 3️⃣ **User Dashboard**

**Page**: `src/pages/dashboard/user-dashboard.html`

![User Dashboard Screenshot Placeholder]

**Purpose**: Comprehensive view of your learning progress, achievements, and statistics.

**Dashboard Sections**:

**A. Overview Panel**
- **Total XP**: Accumulated experience points
- **Level**: Current skill level (calculated from XP)
- **Rank**: Position among all learners
- **Completion Rate**: Overall progress percentage

**B. Module Progress**
- Visual progress bars for each module
- Individual module XP breakdown
- Time spent per module
- Challenges completed vs. total

**C. Achievements**
- 🏆 Badge gallery with unlock dates
- Achievement categories:
  - **Bronze**: Beginner milestones
  - **Silver**: Intermediate accomplishments
  - **Gold**: Advanced mastery
  - **Platinum**: Expert-level achievements

**D. Recent Activity**
- Timeline of recent completions
- Last accessed modules
- Recent achievements unlocked

**E. Statistics**
- Learning streak (consecutive days)
- Most improved skill area
- Average challenge completion time
- Success rate by difficulty

**Navigation**:
- Click **"Back to Command Center"** to return
- Click **"Export Progress"** to download report (PDF)
- Click specific module for detailed breakdown

---

#### 4️⃣ **FLOWBYTE - Flowchart Construction Lab**

**Page**: `src/rooms/flowchart-room.html`

![Flowbyte Screenshot Placeholder]

**Learning Objectives**: Master flowchart design, logical thinking, and process visualization.

**How to Use**:

**Step 1: Choose Difficulty**
- **Easy Mode**: Beginner-friendly scenarios with step-by-step guidance
- **Hard Mode**: Complex real-world processes requiring advanced logic

**Step 2: Read the Scenario**
- Each challenge presents a story-driven problem
- Example: *"Sarah's Coffee Shop Order System"*
- Read carefully to understand the process flow

**Step 3: Build Your Flowchart**
- **Drag & Drop Shapes**:
  - 🟢 **Oval**: Start/End terminals
  - 🔷 **Rectangle**: Process steps
  - 🔶 **Diamond**: Decision points
  - ➡️ **Arrows**: Flow connectors

- **Connect Elements**:
  - Click a shape to select it
  - Drag connection points to create arrows
  - Double-click shapes to edit text

**Step 4: Validate Your Solution**
- Click **"Validate Solution"** button
- System checks:
  - ✅ All required steps present
  - ✅ Proper start/end terminals
  - ✅ Logical flow sequence
  - ✅ Decision paths handled correctly

**Step 5: Review Feedback**
- **Success**: Earn XP and unlock next challenge
- **Partial Success**: See which parts are correct
- **Errors**: Receive specific hints for improvement

**Features**:
- 🖱️ Intuitive drag-and-drop interface
- 💾 Auto-save progress
- 💡 Progressive hint system
- 🎨 Customizable shape colors
- ↩️ Undo/Redo functionality

**Tips**:
- Always start with an oval "Start" shape
- Use descriptive labels for each process
- Ensure all decision diamonds have "Yes" and "No" paths
- End with an oval "End" shape

---

#### 5️⃣ **NETXUS - Network Engineering Lab**

**Page**: `src/rooms/netxus-room.html`

![Netxus Screenshot Placeholder]

**Learning Objectives**: Hands-on Cisco networking, topology design, and CLI commands.

**How to Use**:

**Step 1: Select Challenge**
- Choose from difficulty levels:
  - **Beginner**: Basic connectivity (2-3 devices)
  - **Intermediate**: VLAN configuration
  - **Advanced**: Routing protocols (OSPF, EIGRP)

**Step 2: Build Network Topology**
- **Add Devices**:
  - Click device icons (routers, switches, PCs, servers)
  - Drag onto canvas
  - Position devices logically

- **Connect Devices**:
  - Select cable type (Ethernet, Serial, Fiber)
  - Click device port, then click destination port
  - Verify green link lights

**Step 3: Configure Devices**
- **Access CLI (Command Line Interface)**:
  - Double-click any device
  - CLI terminal opens

- **Enter Commands**:
  ```cisco
  Router> enable
  Router# configure terminal
  Router(config)# hostname R1
  R1(config)# interface GigabitEthernet0/0
  R1(config-if)# ip address 192.168.1.1 255.255.255.0
  R1(config-if)# no shutdown
  ```

**Step 4: Test Connectivity**
- Use **ping** command:
  ```
  PC1> ping 192.168.1.2
  ```
- Check routing tables:
  ```
  Router# show ip route
  ```

**Step 5: Validate Configuration**
- Click **"Run Tests"** button
- System validates:
  - ✅ Correct topology
  - ✅ Proper IP addressing
  - ✅ Successful connectivity
  - ✅ Routing protocols configured

**Features**:
- 🌐 Realistic Cisco IOS simulation
- 📡 Real-time packet visualization
- 📝 Command auto-completion
- 🔍 Built-in protocol analyzer
- 📚 Integrated command reference

**Common Commands**:
| Command | Purpose |
|---------|---------|
| `enable` | Enter privileged mode |
| `configure terminal` | Enter configuration mode |
| `show ip interface brief` | View interface status |
| `show running-config` | Display current configuration |
| `ping <IP>` | Test connectivity |

---

#### 6️⃣ **AITRIX - AI-Powered IT Training**

**Page**: `src/rooms/aitrix-room.html`

![Aitrix Screenshot Placeholder]

**Learning Objectives**: IT fundamentals with AI mentorship and adaptive learning.

**How to Use**:

**Step 1: Choose Difficulty**
- **Easy Challenges** (5 scenarios):
  - IP Address Detective
  - Password Security Master
  - OS Matchmaker
  - Network Builder
  - Cyber Hygiene Expert

- **Hard Challenges** (5 scenarios):
  - Network Segmentation
  - Ethical Hacking
  - Database Normalization
  - Linux Command Line
  - Cloud Architecture

**Step 2: Engage with Scenario**
- **Read the Story**:
  - Each challenge has a narrative context
  - Example: *"You're a sysadmin troubleshooting network issues..."*

- **Analyze the Problem**:
  - Review provided information
  - Identify key technical requirements

**Step 3: Solve the Challenge**
- **Answer Questions**:
  - Multiple-choice questions
  - Fill-in-the-blank exercises
  - Practical configuration tasks

- **Use AI Assistant (PAL)**:
  - Click **"Get Hint"** for contextual help
  - AI provides progressive hints (doesn't give away answer)
  - Maximum 3 hints per challenge

**Step 4: Submit and Review**
- Click **"Submit Answer"**
- **Instant Feedback**:
  - ✅ Correct: Detailed explanation of why
  - ❌ Incorrect: Specific guidance for improvement

**Step 5: Learn from Mistakes**
- Review **"Explanation"** section
- Access **"Learn More"** resources
- Retry challenge with new understanding

**Features**:
- 🤖 Intelligent AI mentoring (PAL character)
- 📈 Adaptive difficulty adjustment
- 💬 Conversational learning interface
- 🎓 Detailed explanations for every answer
- 🔄 Unlimited retries with learning focus

**AI Hint System**:
- **Hint 1**: Broad conceptual guidance
- **Hint 2**: Narrows down the approach
- **Hint 3**: Specific direction (not the answer)

---

#### 7️⃣ **SCHEMAX - Database Design Lab**

**Page**: `src/rooms/schemax-room.html`

![Schemax Screenshot Placeholder]

**Learning Objectives**: SQL database design, normalization, and query optimization.

**How to Use**:

**Step 1: Select Challenge Level**
- **Beginner**: Basic CREATE TABLE statements
- **Intermediate**: Foreign keys and relationships
- **Advanced**: Complex queries and optimization

**Step 2: Read Requirements**
- **Business Scenario**: Understand the use case
- **Data Requirements**: What information needs to be stored
- **Constraints**: Rules and relationships

**Step 3: Design Your Schema**
- **Visual Designer**:
  - Drag table shapes onto canvas
  - Add columns with data types
  - Define primary keys (🔑)
  - Create relationships (drag between tables)

- **SQL Editor** (Alternative):
  ```sql
  CREATE TABLE users (
      user_id INT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE
  );
  
  CREATE TABLE orders (
      order_id INT PRIMARY KEY,
      user_id INT,
      order_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
  );
  ```

**Step 4: Preview Table Structure**
- Click **"Preview Schema"**
- See table structure display:
  - Column names
  - Data types
  - Constraints (PK, FK, UNIQUE, NOT NULL)

**Step 5: Write Queries**
- **Query Editor**:
  ```sql
  SELECT users.username, COUNT(orders.order_id) AS total_orders
  FROM users
  LEFT JOIN orders ON users.user_id = orders.user_id
  GROUP BY users.username;
  ```

**Step 6: Test and Validate**
- Click **"Run Query"**
- View results in output panel
- System validates:
  - ✅ Schema structure
  - ✅ Normalization level
  - ✅ Query correctness
  - ✅ Performance optimization

**Features**:
- 📊 Interactive ER diagram builder
- 💻 SQL syntax highlighting
- 🔍 Query execution visualization
- 📈 Performance analysis
- 🎯 Normalization checker (1NF → BCNF)

**Common Data Types**:
| Type | Usage | Example |
|------|-------|---------|
| `INT` | Whole numbers | `user_id INT` |
| `VARCHAR(n)` | Variable text | `name VARCHAR(100)` |
| `DATE` | Dates | `created_date DATE` |
| `DECIMAL(p,s)` | Precise decimals | `price DECIMAL(10,2)` |
| `BOOLEAN` | True/False | `is_active BOOLEAN` |

---

#### 8️⃣ **CODEVANCE - Programming Challenge Lab**

**Page**: `src/rooms/codevance-room.html`

![Codevance Screenshot Placeholder]

**Learning Objectives**: Master HTML/CSS and Python programming fundamentals.

**How to Use**:

**Step 1: Choose Difficulty**
- **Easy Mode (HTML/CSS)** - 5 Challenges:
  1. Basic Webpage (HTML structure)
  2. Image Display (IMG tag attributes)
  3. Favorite Fruits List (UL/LI tags)
  4. Styled Page (CSS background/alignment)
  5. Button with CSS (Styling interactive elements)

- **Hard Mode (Python)** - 5 Challenges:
  1. Fibonacci Sequence (Loops and sequences)
  2. File Reader (File operations)
  3. Student Grade Average (Data processing)
  4. Login Validation (Dictionaries and logic)
  5. Word Counter (String manipulation)

**Step 2: Read Challenge Description**
- **Scenario**: Real-world context (e.g., "Corporate IT Portal")
- **Requirements**: Specific technical requirements
- **Expected Output**: What your code should produce

**Step 3: Write Your Code**
- **HTML/CSS Editor** (Easy Mode):
  - Placeholder shows: `<!DOCTYPE html><html>…`
  - Write complete HTML document
  - Include CSS within `<style>` tags

- **Python Editor** (Hard Mode):
  - Placeholder shows: `# Write your Python code here...`
  - Implement required algorithm
  - Use proper Python syntax

**Step 4: Run and Test**
- Click **"▶ Run HTML"** or **"▶ Run Python"**
- **HTML Preview**: Live rendering in iframe
- **Python Output**: Console output in terminal

**Step 5: Validate Solution**
- Click **"Validate Solution"** (or automatic on run)
- System checks:
  - ✅ Code structure
  - ✅ Required elements/logic
  - ✅ Output matches expectations
  - ✅ Best practices followed

**Step 6: Debug and Iterate**
- **Validation Feedback**:
  - ✅ Green: Correct implementation
  - ⚠️ Yellow: Partial success
  - ❌ Red: Errors to fix

- **Use Hints**:
  - Click **"Get Hint"** for guidance
  - Progressive hints without giving away solution

**Features**:
- 💻 Live code editor with syntax highlighting
- 🖥️ Real-time HTML preview
- 🐍 Python execution simulation
- 🎨 Randomized scenarios for variety
- 📝 Auto-save your code
- ↩️ Reset challenge anytime

**Tips**:
- **HTML/CSS**: Use proper indentation and closing tags
- **Python**: Follow PEP 8 style guidelines
- **Testing**: Run code frequently to catch errors early
- **Learning**: Review hints and explanations

---

#### 9️⃣ **Admin Dashboard** (Instructor/Admin Only)

**Page**: `src/pages/dashboard/admin-dashboard.html`

![Admin Dashboard Screenshot Placeholder]

**Access**: Requires admin credentials via `src/pages/admin-login.html`

**Features**:
- 📊 View all user statistics
- 👥 Manage user accounts
- 🏆 Create custom achievements
- 📈 Analytics and reporting
- ⚙️ System configuration

**Admin Capabilities**:
1. **User Management**:
   - View all registered users
   - Reset passwords
   - Adjust XP and levels
   - Suspend/activate accounts

2. **Content Management**:
   - Add new challenges
   - Modify difficulty levels
   - Update learning content

3. **Analytics**:
   - Track completion rates
   - Identify struggling users
   - Popular modules statistics
   - Time-on-task metrics

---

## 🎨 Learning Modules

### FLOWBYTE - Flowchart Construction Lab 🔄
**Skill Focus**: Logical thinking, process visualization, algorithm design

**Easy Challenges** (5 Scenarios):
1. **Morning Routine** - Basic sequential processes
2. **Coffee Shop Order** - Simple decision trees
3. **ATM Withdrawal** - Conditional logic with loops
4. **Student Grading** - Multiple decision points
5. **Online Shopping** - Complex multi-path flows

**Hard Challenges** (5 Scenarios):
1. **Inventory Management** - Nested loops and conditions
2. **User Authentication** - Security workflow
3. **Data Backup System** - Error handling flows
4. **Payment Processing** - Multi-step validation
5. **Emergency Response** - Time-critical decision trees

---

### NETXUS - Network Engineering Lab 🌐
**Skill Focus**: Cisco networking, IP addressing, routing protocols

**Topics Covered**:
- Basic network topology design
- Cisco IOS command-line interface
- IP addressing and subnetting
- VLAN configuration
- Static and dynamic routing (RIP, OSPF, EIGRP)
- Network security (ACLs, port security)
- Troubleshooting methodologies

**Challenge Types**:
- Build and configure small office networks
- Implement VLAN segmentation
- Configure inter-VLAN routing
- Set up WAN connections
- Troubleshoot connectivity issues

---

### AITRIX - AI-Powered IT Training 🤖
**Skill Focus**: IT fundamentals with intelligent mentoring

**Easy Challenges** (5 Scenarios):
1. **IP Address Detective** - Network troubleshooting basics
2. **Password Security Master** - Cybersecurity fundamentals
3. **OS Matchmaker** - Operating system selection
4. **Network Builder** - Basic network setup
5. **Cyber Hygiene Expert** - Digital security practices

**Hard Challenges** (5 Scenarios):
1. **Network Segmentation** - Advanced security architecture
2. **Ethical Hacking** - Penetration testing concepts
3. **Database Normalization** - Schema design optimization
4. **Linux Command Line** - System administration
5. **Cloud Architecture** - AWS infrastructure design

**AI Features**:
- Context-aware hints
- Adaptive difficulty
- Personalized learning paths
- Conversational feedback

---

### SCHEMAX - Database Design Lab 🗄️
**Skill Focus**: SQL, database normalization, query optimization

**Topics Covered**:
- Database design principles
- Entity-Relationship (ER) modeling
- Normalization (1NF → BCNF)
- SQL DDL (CREATE, ALTER, DROP)
- SQL DML (SELECT, INSERT, UPDATE, DELETE)
- Joins and subqueries
- Indexing and performance optimization

**Challenge Types**:
- Design schemas from requirements
- Normalize existing databases
- Write complex queries
- Optimize slow queries
- Implement constraints and triggers

---

### CODEVANCE - Programming Challenge Lab 💻
**Skill Focus**: HTML/CSS and Python programming

**Easy Mode (HTML/CSS)** - 5 Challenges:
1. **Basic Webpage** - HTML document structure
2. **Image Display** - IMG tag and attributes
3. **Favorite Fruits List** - UL/LI tags
4. **Styled Page** - CSS background and alignment
5. **Button with CSS** - Interactive element styling

**Hard Mode (Python)** - 5 Challenges:
1. **Fibonacci Sequence** - Loops and mathematical sequences
2. **File Reader** - File I/O and context managers
3. **Student Grade Average** - List processing and calculations
4. **Login Validation** - Dictionary lookup and conditionals
5. **Word Counter** - String manipulation and frequency analysis

**Scenarios**:
- Real-world IT contexts (e.g., "Corporate IT Portal")
- Randomized scenarios for variety
- Industry-relevant applications

---

## 📸 Screenshots

> **Note**: Screenshots are placeholders. Replace with actual application screenshots.

### 1. Login/Registration Page
![Login Page](docs/screenshots/login.png)
*Modern authentication interface with animated PAL mascot*

### 2. Command Center
![Command Center](docs/screenshots/command-center.png)
*Central hub showing all 5 learning modules with progress indicators*

### 3. User Dashboard
![User Dashboard](docs/screenshots/user-dashboard.png)
*Comprehensive progress tracking with XP, achievements, and statistics*

### 4. FLOWBYTE Lab
![Flowbyte](docs/screenshots/flowbyte-lab.png)
*Drag-and-drop flowchart builder with validation feedback*

### 5. NETXUS Lab
![Netxus](docs/screenshots/netxus-lab.png)
*Cisco network simulation with interactive topology and CLI*

### 6. AITRIX Lab
![Aitrix](docs/screenshots/aitrix-lab.png)
*AI-powered IT training with intelligent hint system*

### 7. SCHEMAX Lab
![Schemax](docs/screenshots/schemax-lab.png)
*SQL editor and visual schema designer*

### 8. CODEVANCE Lab
![Codevance](docs/screenshots/codevance-lab.png)
*Code editor with live preview and validation*

### 9. Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)
*Administrative analytics and user management interface*

---

## 🛠️ Technologies Used

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Semantic structure and content |
| CSS3 | - | Styling and animations |
| JavaScript (ES6+) | ES2020+ | Interactive functionality |
| Bootstrap Icons | 1.13.1 | Icon library |
| SVG | 1.1 | Graphics and diagrams |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Server-side logic (Flask) |
| Flask | 2.3.3 | Web framework |
| Node.js | 14+ | Alternative runtime (Express) |
| Express.js | 4.17.1 | Alternative web framework |

### Database & Storage
| Technology | Version | Purpose |
|------------|---------|---------|
| SQLite | 3.x | Local user data storage |
| Supabase | Latest | Cloud database (optional) |
| LocalStorage | HTML5 | Client-side state persistence |

### Development Tools
| Tool | Purpose |
|------|---------|
| Git | Version control |
| VS Code | Recommended code editor |
| Chrome DevTools | Debugging and testing |
| Postman | API testing |

### Deployment & Hosting
| Platform | Purpose |
|----------|---------|
| Vercel | Cloud deployment (serverless) |
| GitHub Pages | Static hosting option |
| Local Server | Development environment |

### Libraries & Frameworks
- **flask-cors**: Cross-origin resource sharing
- **python-dotenv**: Environment variable management
- **resend**: Email service integration

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs** 🐛
   - Use GitHub Issues
   - Provide detailed reproduction steps
   - Include browser/OS information

2. **Suggest Features** 💡
   - Open a feature request issue
   - Explain the use case
   - Provide mockups if possible

3. **Submit Code** 💻
   - Fork the repository
   - Create a feature branch
   - Follow coding standards
   - Submit pull request

### Contribution Workflow

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/ascended-tech-lab.git
cd ascended-tech-lab

# 3. Create a feature branch
git checkout -b feature/amazing-new-feature

# 4. Make your changes
# ... edit files ...

# 5. Commit changes
git add .
git commit -m "Add amazing new feature"

# 6. Push to your fork
git push origin feature/amazing-new-feature

# 7. Open a Pull Request on GitHub
```

### Coding Standards

- **JavaScript**: Use ES6+ syntax, 2-space indentation
- **Python**: Follow PEP 8 style guide
- **HTML/CSS**: Semantic markup, BEM naming convention
- **Comments**: Document complex logic
- **Testing**: Include tests for new features

### Development Guidelines

- Test on multiple browsers before submitting
- Ensure mobile responsiveness
- Maintain consistent code style
- Update documentation for new features
- Add comments for complex algorithms

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 AscendEd Tech Lab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact & Support

### Project Links
- **GitHub Repository**: [https://github.com/akuiitetsu/ascended-tech-lab](https://github.com/akuiitetsu/ascended-tech-lab)
- **Documentation**: [https://github.com/akuiitetsu/ascended-tech-lab/wiki](https://github.com/akuiitetsu/ascended-tech-lab/wiki)
- **Issue Tracker**: [https://github.com/akuiitetsu/ascended-tech-lab/issues](https://github.com/akuiitetsu/ascended-tech-lab/issues)

### Get Help
- **Questions**: Open a GitHub Discussion
- **Bug Reports**: Create an Issue with [Bug] prefix
- **Feature Requests**: Create an Issue with [Feature] prefix

### Community
- Join our community discussions
- Share your learning experiences
- Contribute to the project

---

## 🎯 Roadmap & Future Features

### Version 2.0 (Planned)
- [ ] Multiplayer collaborative challenges
- [ ] Real-time leaderboards
- [ ] Video tutorial integration
- [ ] Advanced AI mentoring features
- [ ] Mobile native apps (iOS/Android)

### Version 3.0 (Future)
- [ ] VR/AR learning experiences
- [ ] Certification system
- [ ] LMS (Learning Management System) integration
- [ ] Internationalization (i18n) support
- [ ] Custom challenge creator for educators

---

## 🙏 Acknowledgments

- **Bootstrap Icons** for the icon library
- **Vercel** for hosting platform
- **Supabase** for backend services
- **Open Source Community** for continuous inspiration

---

## ⚠️ Disclaimer

This is an educational platform designed for learning purposes. All scenarios and challenges are fictional and intended for skill development. Always follow ethical guidelines and legal requirements when applying learned concepts in real-world situations.

---

<div align="center">

**Ready to escape the Tech Lab?**  
**Let the learning adventure begin!** 🚀

[![Star on GitHub](https://img.shields.io/github/stars/akuiitetsu/ascended-tech-lab?style=social)](https://github.com/akuiitetsu/ascended-tech-lab)
[![Fork on GitHub](https://img.shields.io/github/forks/akuiitetsu/ascended-tech-lab?style=social)](https://github.com/akuiitetsu/ascended-tech-lab/fork)

*Made with ❤️ by the AscendEd Team*

</div>
