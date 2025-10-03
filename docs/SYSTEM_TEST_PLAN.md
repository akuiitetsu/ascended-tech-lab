# System Test Plan - Ascended Tech Lab

## 1. Document Information

| Field | Details |
|-------|---------|
| **Project Name** | Ascended Tech Lab |
| **Version** | 1.0 |
| **Date** | December 2024 |
| **Test Lead** | System Administrator |
| **Document Status** | Draft |

## 2. Test Objectives

### Primary Objectives
- Validate all major system functionalities across authentication, admin management, and learning modules
- Ensure proper user role-based access control and security measures
- Verify database operations and real-time monitoring capabilities
- Test all learning room validation systems and progress tracking
- Confirm system stability under normal and edge case scenarios

### Success Criteria
- All authentication flows work correctly for admin and user roles
- Admin dashboard displays real-time data from database
- All learning rooms (CODEVANCE, AITRIX, SCHEMAX, FLOWBYTE, NETXUS) function properly
- User progress tracking and scoring systems operate accurately
- System handles invalid inputs and edge cases gracefully

## 3. Test Scope

### In Scope
- **Authentication System**: Login validation, role-based redirection, session management
- **Admin Dashboard**: User management, analytics, real-time monitoring, system settings
- **Learning Rooms**: All five specialized learning environments and their validation systems
- **Database Operations**: User data management, progress tracking, activity logging
- **User Interface**: Navigation, responsiveness, error handling
- **Security**: Access control, input validation, session security

### Out of Scope
- Performance testing under high load
- Cross-browser compatibility testing
- Mobile device optimization
- Third-party integrations

## 4. Test Environment

### System Requirements
- **Operating System**: Windows 10/11
- **Python**: 3.8+
- **Database**: SQLite
- **Web Browser**: Chrome, Firefox, Edge (latest versions)
- **Server**: Flask development server

### Test Data Requirements
- Admin user account: username `admin`, password `admin123`
- Regular user accounts for testing user flows
- Sample database with user progress data
- Test cases for each learning room challenge

## 5. Major Test Modules

### 5.1 Authentication System Module

#### Test Case: AUTH-001 - Admin Login Success
- **Objective**: Verify admin can log in successfully
- **Preconditions**: Admin account exists in database
- **Test Steps**:
  1. Navigate to admin login page (`/admin-login`)
  2. Enter username: `admin`
  3. Enter password: `admin123`
  4. Click "Login" button
- **Expected Result**: Redirect to admin dashboard (`/admin-dashboard`)
- **Pass/Fail Criteria**: ✅ Pass if redirected to admin dashboard, ❌ Fail if login rejected or error occurs

#### Test Case: AUTH-002 - Invalid Admin Login
- **Objective**: Verify system rejects invalid admin credentials
- **Preconditions**: System is running
- **Test Steps**:
  1. Navigate to admin login page
  2. Enter invalid username: `wronguser`
  3. Enter invalid password: `wrongpass`
  4. Click "Login" button
- **Expected Result**: Error message displayed, remain on login page
- **Pass/Fail Criteria**: ✅ Pass if error shown and login prevented, ❌ Fail if unauthorized access granted

#### Test Case: AUTH-003 - User Role Redirection
- **Objective**: Verify users are redirected to appropriate dashboards based on role
- **Preconditions**: Both admin and regular user accounts exist
- **Test Steps**:
  1. Login as admin user
  2. Verify redirection to admin dashboard
  3. Logout and login as regular user
  4. Verify redirection to user dashboard
- **Expected Result**: Proper role-based redirection occurs
- **Pass/Fail Criteria**: ✅ Pass if both redirections work correctly, ❌ Fail if wrong dashboard shown

### 5.2 Admin Dashboard Module

#### Test Case: ADMIN-001 - Dashboard Data Loading
- **Objective**: Verify admin dashboard loads with real database data
- **Preconditions**: Admin logged in, test data exists in database
- **Test Steps**:
  1. Access admin dashboard
  2. Check user statistics display
  3. Verify analytics charts load
  4. Confirm activity monitoring shows real data
- **Expected Result**: All sections display actual database data, not dummy data
- **Pass/Fail Criteria**: ✅ Pass if real data displayed, ❌ Fail if dummy data or loading errors

#### Test Case: ADMIN-002 - User Management Functions
- **Objective**: Verify admin can manage user accounts
- **Preconditions**: Admin logged in, test users exist
- **Test Steps**:
  1. Navigate to user management section
  2. View list of users
  3. Test user search functionality
  4. Test user role modification
  5. Test user account activation/deactivation
- **Expected Result**: All user management functions work correctly
- **Pass/Fail Criteria**: ✅ Pass if all operations complete successfully, ❌ Fail if any function fails

#### Test Case: ADMIN-003 - Real-time Monitoring
- **Objective**: Verify real-time activity monitoring displays current data
- **Preconditions**: Admin logged in, users active in system
- **Test Steps**:
  1. Open monitoring section
  2. Generate user activity (login, room access)
  3. Check if monitoring updates reflect new activity
  4. Verify activity timestamps are accurate
- **Expected Result**: Monitoring displays real-time user activities
- **Pass/Fail Criteria**: ✅ Pass if real-time updates work, ❌ Fail if data is stale or inaccurate

### 5.3 CODEVANCE Room Module

#### Test Case: CODEV-001 - Challenge Selection and Loading
- **Objective**: Verify CODEVANCE room loads challenges correctly
- **Preconditions**: User has access to CODEVANCE room
- **Test Steps**:
  1. Navigate to CODEVANCE room
  2. Select difficulty level (Beginner/Intermediate/Advanced)
  3. Choose a specific challenge
  4. Verify challenge interface loads correctly
- **Expected Result**: Challenge interface displays with proper tools and instructions
- **Pass/Fail Criteria**: ✅ Pass if interface loads without errors, ❌ Fail if loading fails or interface incomplete

#### Test Case: CODEV-002 - Code Validation System
- **Objective**: Verify code validation works correctly for HTML/CSS challenges
- **Preconditions**: CODEVANCE challenge is loaded
- **Test Steps**:
  1. Enter correct HTML/CSS code for a challenge
  2. Submit solution
  3. Verify validation passes and score updates
  4. Enter incorrect code and verify validation fails
- **Expected Result**: Correct code receives 100 points, incorrect code is rejected
- **Pass/Fail Criteria**: ✅ Pass if validation logic works correctly, ❌ Fail if incorrect scoring or validation

#### Test Case: CODEV-003 - Progress Reset Between Challenges
- **Objective**: Verify progress resets properly when switching challenges
- **Preconditions**: User has completed or partially completed a challenge
- **Test Steps**:
  1. Work on Challenge 1, make some progress
  2. Switch to Challenge 2
  3. Verify progress from Challenge 1 doesn't carry over
  4. Return to Challenge 1 and verify fresh start
- **Expected Result**: Each challenge starts with clean state
- **Pass/Fail Criteria**: ✅ Pass if progress isolation works, ❌ Fail if progress bleeds between challenges

### 5.4 AITRIX Room Module

#### Test Case: AITRIX-001 - Network Design Validation
- **Objective**: Verify network design challenges validate correctly
- **Preconditions**: AITRIX room loaded with network design challenge
- **Test Steps**:
  1. Access network design challenge
  2. Enter valid subnet configurations (e.g., 192.168.10.0/24)
  3. Set unique VLAN IDs for different departments
  4. Submit solution and verify validation
- **Expected Result**: Valid network configurations receive high scores (80+ points)
- **Pass/Fail Criteria**: ✅ Pass if valid configurations pass, ❌ Fail if valid configs rejected

#### Test Case: AITRIX-002 - Security Quiz Functionality
- **Objective**: Verify security quiz questions and scoring
- **Preconditions**: AITRIX security quiz challenge loaded
- **Test Steps**:
  1. Navigate to security quiz interface
  2. Answer quiz questions with correct responses
  3. Submit quiz and verify score calculation
  4. Test incorrect answers to verify penalty system
- **Expected Result**: Correct answers increase score, incorrect answers provide feedback
- **Pass/Fail Criteria**: ✅ Pass if scoring logic works, ❌ Fail if scoring incorrect

#### Test Case: AITRIX-003 - AI Chat Integration
- **Objective**: Verify AI conversation feature works in AITRIX challenges
- **Preconditions**: AITRIX room loaded with AI chat enabled
- **Test Steps**:
  1. Start challenge with AI conversation feature
  2. Verify AI provides contextual hints and feedback
  3. Test AI responses to user progress
  4. Confirm AI messages update based on challenge state
- **Expected Result**: AI provides relevant, contextual assistance
- **Pass/Fail Criteria**: ✅ Pass if AI responses are appropriate, ❌ Fail if AI unresponsive or irrelevant

### 5.5 SCHEMAX Room Module

#### Test Case: SCHEM-001 - SQL Execution Simulation
- **Objective**: Verify SQL commands execute correctly in simulated environment
- **Preconditions**: SCHEMAX room loaded with SQL challenge
- **Test Steps**:
  1. Enter valid CREATE TABLE statement
  2. Execute SQL and verify table creation feedback
  3. Enter INSERT statements and verify data insertion
  4. Test SELECT queries and verify result display
- **Expected Result**: SQL commands execute with appropriate feedback and results
- **Pass/Fail Criteria**: ✅ Pass if SQL simulation works correctly, ❌ Fail if execution errors or wrong results

#### Test Case: SCHEM-002 - Constraint Validation
- **Objective**: Verify database constraint validation works properly
- **Preconditions**: SCHEMAX constraint challenge loaded
- **Test Steps**:
  1. Create table with PRIMARY KEY constraint
  2. Add UNIQUE constraints to appropriate columns
  3. Test FOREIGN KEY relationships
  4. Verify constraint validation provides proper feedback
- **Expected Result**: Proper constraints are recognized and validated
- **Pass/Fail Criteria**: ✅ Pass if constraint validation accurate, ❌ Fail if constraints not properly validated

#### Test Case: SCHEM-003 - Normalization Challenge
- **Objective**: Verify database normalization exercises work correctly
- **Preconditions**: SCHEMAX normalization challenge loaded
- **Test Steps**:
  1. Review denormalized data presentation
  2. Apply 1NF, 2NF, and 3NF transformations
  3. Submit normalized design
  4. Verify feedback on normalization quality
- **Expected Result**: Proper normalization receives positive feedback and score
- **Pass/Fail Criteria**: ✅ Pass if normalization validation works, ❌ Fail if incorrect evaluation

### 5.6 FLOWBYTE Room Module

#### Test Case: FLOW-001 - Flowchart Creation Tools
- **Objective**: Verify flowchart creation interface works properly
- **Preconditions**: FLOWBYTE room loaded
- **Test Steps**:
  1. Access flowchart creation interface
  2. Test shape toolbox functionality
  3. Verify Bootstrap icons display correctly in shapes
  4. Test drag-and-drop functionality
  5. Test connection tools between shapes
- **Expected Result**: All flowchart tools function smoothly
- **Pass/Fail Criteria**: ✅ Pass if all tools work without errors, ❌ Fail if tools malfunction

#### Test Case: FLOW-002 - Algorithm Logic Validation
- **Objective**: Verify flowchart logic validation system
- **Preconditions**: FLOWBYTE challenge with logic validation loaded
- **Test Steps**:
  1. Create a simple algorithmic flowchart
  2. Include decision points, loops, and processes
  3. Submit flowchart for validation
  4. Verify logic validation feedback
- **Expected Result**: Valid algorithmic logic receives approval
- **Pass/Fail Criteria**: ✅ Pass if logic validation accurate, ❌ Fail if validation incorrect

### 5.7 NETXUS Room Module

#### Test Case: NETX-001 - Network Topology Builder
- **Objective**: Verify network topology creation tools work correctly
- **Preconditions**: NETXUS room loaded
- **Test Steps**:
  1. Access network topology builder
  2. Test device placement (routers, switches, PCs)
  3. Test connection creation between devices
  4. Verify network configuration options
- **Expected Result**: Network topology tools function properly
- **Pass/Fail Criteria**: ✅ Pass if topology builder works, ❌ Fail if tools malfunction

#### Test Case: NETX-002 - Network Configuration Validation
- **Objective**: Verify network configurations are validated correctly
- **Preconditions**: NETXUS network challenge loaded
- **Test Steps**:
  1. Configure IP addresses for network devices
  2. Set up routing protocols
  3. Configure network security settings
  4. Submit configuration for validation
- **Expected Result**: Valid network configurations pass validation
- **Pass/Fail Criteria**: ✅ Pass if validation works correctly, ❌ Fail if validation errors

### 5.8 Database Integration Module

#### Test Case: DB-001 - User Progress Tracking
- **Objective**: Verify user progress is properly stored and retrieved from database
- **Preconditions**: Database initialized, user account exists
- **Test Steps**:
  1. Complete challenges in different rooms
  2. Verify progress is saved to database
  3. Logout and login again
  4. Verify progress persists across sessions
- **Expected Result**: User progress is consistently tracked and persisted
- **Pass/Fail Criteria**: ✅ Pass if progress tracking works, ❌ Fail if progress lost

#### Test Case: DB-002 - Admin Analytics Data
- **Objective**: Verify admin dashboard pulls accurate data from database
- **Preconditions**: Admin access, multiple users with activity data
- **Test Steps**:
  1. Generate user activity (logins, room completions)
  2. Check admin dashboard analytics
  3. Verify data accuracy against database
  4. Test real-time data updates
- **Expected Result**: Admin dashboard shows accurate, up-to-date analytics
- **Pass/Fail Criteria**: ✅ Pass if data is accurate and current, ❌ Fail if data inconsistencies

### 5.9 Security and Access Control Module

#### Test Case: SEC-001 - Unauthorized Access Prevention
- **Objective**: Verify system prevents unauthorized access to restricted areas
- **Preconditions**: System running, no user logged in
- **Test Steps**:
  1. Attempt direct access to admin dashboard without login
  2. Try accessing user dashboard without authentication
  3. Attempt to access API endpoints without proper authorization
- **Expected Result**: All unauthorized access attempts are blocked
- **Pass/Fail Criteria**: ✅ Pass if access is properly restricted, ❌ Fail if unauthorized access allowed

#### Test Case: SEC-002 - Session Management
- **Objective**: Verify user sessions are managed securely
- **Preconditions**: User logged in with active session
- **Test Steps**:
  1. Verify session timeout after inactivity
  2. Test session invalidation on logout
  3. Verify session security across different browser tabs
- **Expected Result**: Sessions are managed securely with proper timeouts
- **Pass/Fail Criteria**: ✅ Pass if session management is secure, ❌ Fail if session vulnerabilities exist

### 5.10 User Interface and Navigation Module

#### Test Case: UI-001 - Navigation Flow
- **Objective**: Verify all navigation links and buttons work correctly
- **Preconditions**: System loaded, user has appropriate access
- **Test Steps**:
  1. Test navigation between all major sections
  2. Verify breadcrumb navigation works
  3. Test back button functionality
  4. Verify external links open correctly
- **Expected Result**: All navigation elements function properly
- **Pass/Fail Criteria**: ✅ Pass if navigation is smooth and functional, ❌ Fail if navigation errors

#### Test Case: UI-002 - Error Handling and User Feedback
- **Objective**: Verify system provides appropriate error messages and feedback
- **Preconditions**: System running
- **Test Steps**:
  1. Trigger various error conditions (invalid inputs, network issues)
  2. Verify error messages are clear and helpful
  3. Test success feedback for completed actions
  4. Verify loading indicators during operations
- **Expected Result**: Users receive clear, actionable feedback
- **Pass/Fail Criteria**: ✅ Pass if feedback is appropriate and helpful, ❌ Fail if feedback is unclear or missing

## 6. Test Execution Schedule

### Phase 1: Core System Testing (Days 1-2)
- Authentication System Module
- Database Integration Module
- Security and Access Control Module

### Phase 2: Admin Features Testing (Day 3)
- Admin Dashboard Module
- User Management Functions
- Real-time Monitoring

### Phase 3: Learning Rooms Testing (Days 4-6)
- CODEVANCE Room Module
- AITRIX Room Module
- SCHEMAX Room Module
- FLOWBYTE Room Module
- NETXUS Room Module

### Phase 4: Integration and UI Testing (Day 7)
- Cross-module integration testing
- User Interface and Navigation Module
- End-to-end workflow validation

## 7. Test Deliverables

### Test Reports
- **Daily Test Execution Reports**: Status of test cases executed each day
- **Defect Reports**: Documentation of any issues found during testing
- **Final Test Summary Report**: Overall test results and system readiness assessment

### Test Artifacts
- **Test Data Sets**: Sample data used for testing
- **Test Scripts**: Automated test scripts where applicable
- **Screenshots**: Visual evidence of test execution and results

## 8. Risk Assessment

### High Risk Areas
- **Cross-room Progress Tracking**: Ensure progress doesn't leak between different learning rooms
- **Real-time Data Updates**: Verify admin monitoring reflects actual user activity
- **Session Security**: Ensure proper authentication and session management

### Mitigation Strategies
- **Thorough Validation Testing**: Extra focus on input validation and edge cases
- **Security Testing**: Comprehensive testing of authentication and authorization
- **Data Integrity Testing**: Verify database operations maintain data consistency

## 9. Test Sign-off Criteria

### Completion Criteria
- **95% Test Case Pass Rate**: At least 95% of test cases must pass
- **Zero Critical Defects**: No critical defects affecting core functionality
- **Performance Acceptable**: System responds within acceptable time limits
- **Security Validated**: All security measures function correctly

### Approval Required From
- **Development Team**: Confirmation all known issues are resolved
- **System Administrator**: Approval of system stability and security
- **Stakeholders**: Acceptance of system functionality and user experience

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Next Review Date**: January 2025
