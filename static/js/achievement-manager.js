/**
 * Achievement Manager Module
 * Handles badge rewards and achievement tracking for all game rooms
 * Synchronized with actual room structures and level progressions
 */

class AchievementManager {
    constructor() {
        this.userId = null;
        this.achievementsCache = new Map();
        this.badgeDefinitions = {
            // AITRIX Game Badges (5 challenges per difficulty)
            'aitrix_level_1': {
                name: 'IP Detective',
                description: 'Complete AITRIX Challenge 1: IP Address Detective',
                icon: 'bi-search',
                color: '#FF6B35',
                type: 'level',
                points: 10,
                room: 'aitrix'
            },
            'aitrix_level_2': {
                name: 'Security Expert',
                description: 'Complete AITRIX Challenge 2: Secure Your Passwords',
                icon: 'bi-shield-lock',
                color: '#FF8E53',
                type: 'level',
                points: 15,
                room: 'aitrix'
            },
            'aitrix_level_3': {
                name: 'OS Specialist',
                description: 'Complete AITRIX Challenge 3: OS Matchmaker',
                icon: 'bi-pc-display',
                color: '#FFB380',
                type: 'level',
                points: 20,
                room: 'aitrix'
            },
            'aitrix_level_4': {
                name: 'Network Builder',
                description: 'Complete AITRIX Challenge 4: Build a Simple Network',
                icon: 'bi-diagram-3',
                color: '#FFC999',
                type: 'level',
                points: 25,
                room: 'aitrix'
            },
            'aitrix_level_5': {
                name: 'Cyber Guardian',
                description: 'Complete AITRIX Challenge 5: Cyber Hygiene Quiz',
                icon: 'bi-shield-check',
                color: '#FFD4B3',
                type: 'level',
                points: 30,
                room: 'aitrix'
            },
            'aitrix_easy_complete': {
                name: 'AITRIX Explorer',
                description: 'Complete all Easy AITRIX challenges',
                icon: 'bi-trophy',
                color: '#FFD700',
                type: 'difficulty',
                points: 50,
                room: 'aitrix'
            },
            'aitrix_hard_complete': {
                name: 'AITRIX Expert',
                description: 'Complete all Advanced AITRIX challenges',
                icon: 'bi-award',
                color: '#E91E63',
                type: 'difficulty',
                points: 100,
                room: 'aitrix'
            },
            'aitrix_room_complete': {
                name: 'AITRIX Champion',
                description: 'Complete the entire AITRIX room',
                icon: 'bi-trophy-fill',
                color: '#FF6B35',
                type: 'room',
                points: 150,
                room: 'aitrix'
            },

            // SCHEMAX Game Badges (5 challenges per difficulty)
            'schemax_level_1': {
                name: 'Database Creator',
                description: 'Complete SCHEMAX Challenge 1: Employee Directory Table',
                icon: 'bi-table',
                color: '#4CAF50',
                type: 'level',
                points: 10,
                room: 'schemax'
            },
            'schemax_level_2': {
                name: 'Data Inserter',
                description: 'Complete SCHEMAX Challenge 2: Add IT Staff Records',
                icon: 'bi-plus-circle',
                color: '#66BB6A',
                type: 'level',
                points: 15,
                room: 'schemax'
            },
            'schemax_level_3': {
                name: 'Query Master',
                description: 'Complete SCHEMAX Challenge 3: Query IT Personnel',
                icon: 'bi-search',
                color: '#81C784',
                type: 'level',
                points: 20,
                room: 'schemax'
            },
            'schemax_level_4': {
                name: 'Constraint Expert',
                description: 'Complete SCHEMAX Challenge 4: System Access Constraints',
                icon: 'bi-lock',
                color: '#A5D6A7',
                type: 'level',
                points: 25,
                room: 'schemax'
            },
            'schemax_level_5': {
                name: 'Relationship Builder',
                description: 'Complete SCHEMAX Challenge 5: Department Relationships',
                icon: 'bi-diagram-2',
                color: '#C8E6C9',
                type: 'level',
                points: 30,
                room: 'schemax'
            },
            'schemax_easy_complete': {
                name: 'SCHEMAX Explorer',
                description: 'Complete all Easy SCHEMAX challenges',
                icon: 'bi-trophy',
                color: '#FFD700',
                type: 'difficulty',
                points: 50,
                room: 'schemax'
            },
            'schemax_hard_complete': {
                name: 'SCHEMAX Expert',
                description: 'Complete all Advanced SCHEMAX challenges',
                icon: 'bi-award',
                color: '#E91E63',
                type: 'difficulty',
                points: 100,
                room: 'schemax'
            },
            'schemax_room_complete': {
                name: 'SCHEMAX Master',
                description: 'Complete the entire SCHEMAX room',
                icon: 'bi-award-fill',
                color: '#4CAF50',
                type: 'room',
                points: 150,
                room: 'schemax'
            },

            // CODEVANCE Game Badges (5 challenges per difficulty)
            'codevance_level_1': {
                name: 'Web Page Creator',
                description: 'Complete CODEVANCE Challenge 1: Basic Webpage',
                icon: 'bi-file-earmark-code',
                color: '#2196F3',
                type: 'level',
                points: 10,
                room: 'codevance'
            },
            'codevance_level_2': {
                name: 'Image Master',
                description: 'Complete CODEVANCE Challenge 2: Image Display',
                icon: 'bi-image',
                color: '#42A5F5',
                type: 'level',
                points: 15,
                room: 'codevance'
            },
            'codevance_level_3': {
                name: 'List Builder',
                description: 'Complete CODEVANCE Challenge 3: Favorite Fruits List',
                icon: 'bi-list-ul',
                color: '#64B5F6',
                type: 'level',
                points: 20,
                room: 'codevance'
            },
            'codevance_level_4': {
                name: 'Style Designer',
                description: 'Complete CODEVANCE Challenge 4: Styled Page',
                icon: 'bi-palette',
                color: '#90CAF9',
                type: 'level',
                points: 25,
                room: 'codevance'
            },
            'codevance_level_5': {
                name: 'Button Stylist',
                description: 'Complete CODEVANCE Challenge 5: Button with CSS',
                icon: 'bi-square',
                color: '#BBDEFB',
                type: 'level',
                points: 30,
                room: 'codevance'
            },
            'codevance_easy_complete': {
                name: 'CODEVANCE Explorer',
                description: 'Complete all Easy CODEVANCE challenges',
                icon: 'bi-trophy',
                color: '#FFD700',
                type: 'difficulty',
                points: 50,
                room: 'codevance'
            },
            'codevance_hard_complete': {
                name: 'CODEVANCE Expert',
                description: 'Complete all Advanced CODEVANCE challenges',
                icon: 'bi-award',
                color: '#E91E63',
                type: 'difficulty',
                points: 100,
                room: 'codevance'
            },
            'codevance_room_complete': {
                name: 'CODEVANCE Master',
                description: 'Complete the entire CODEVANCE room',
                icon: 'bi-mortarboard-fill',
                color: '#2196F3',
                type: 'room',
                points: 150,
                room: 'codevance'
            },

            // FlowByte Game Badges (5 levels per difficulty)
            'flowbyte_level_1': {
                name: 'Flow Starter',
                description: 'Complete FlowByte Level 1: Simple Start-End Flow',
                icon: 'bi-play-circle',
                color: '#9C27B0',
                type: 'level',
                points: 10,
                room: 'flowbyte'
            },
            'flowbyte_level_2': {
                name: 'Decision Maker',
                description: 'Complete FlowByte Level 2: Decision Making',
                icon: 'bi-arrow-down-up',
                color: '#AB47BC',
                type: 'level',
                points: 15,
                room: 'flowbyte'
            },
            'flowbyte_level_3': {
                name: 'Input-Output Expert',
                description: 'Complete FlowByte Level 3: Input-Output Flow',
                icon: 'bi-arrow-left-right',
                color: '#BA68C8',
                type: 'level',
                points: 20,
                room: 'flowbyte'
            },
            'flowbyte_level_4': {
                name: 'Process Engineer',
                description: 'Complete FlowByte Level 4: Process Chain',
                icon: 'bi-link',
                color: '#CE93D8',
                type: 'level',
                points: 25,
                room: 'flowbyte'
            },
            'flowbyte_level_5': {
                name: 'Workflow Master',
                description: 'Complete FlowByte Level 5: Complete Workflow',
                icon: 'bi-diagram-3',
                color: '#E1BEE7',
                type: 'level',
                points: 30,
                room: 'flowbyte'
            },
            'flowbyte_easy_complete': {
                name: 'FlowByte Explorer',
                description: 'Complete all Easy FlowByte levels',
                icon: 'bi-trophy',
                color: '#FFD700',
                type: 'difficulty',
                points: 50,
                room: 'flowbyte'
            },
            'flowbyte_hard_complete': {
                name: 'FlowByte Expert',
                description: 'Complete all Advanced FlowByte levels',
                icon: 'bi-award',
                color: '#E91E63',
                type: 'difficulty',
                points: 100,
                room: 'flowbyte'
            },
            'flowbyte_room_complete': {
                name: 'FlowByte Genius',
                description: 'Complete the entire FlowByte room',
                icon: 'bi-gem',
                color: '#9C27B0',
                type: 'room',
                points: 150,
                room: 'flowbyte'
            },

            // NetXus Game Badges (5 labs per difficulty)
            'netxus_level_1': {
                name: 'Network Novice',
                description: 'Complete NetXus Lab 1: Basic Device Connectivity',
                icon: 'bi-router',
                color: '#4CAF50',
                type: 'level',
                points: 10,
                room: 'netxus'
            },
            'netxus_level_2': {
                name: 'Connection Master',
                description: 'Complete NetXus Lab 2: Router-to-PC Connectivity',
                icon: 'bi-ethernet',
                color: '#2196F3',
                type: 'level',
                points: 15,
                room: 'netxus'
            },
            'netxus_level_3': {
                name: 'Network Builder',
                description: 'Complete NetXus Lab 3: Adding a Second Network',
                icon: 'bi-hdd-network',
                color: '#FF9800',
                type: 'level',
                points: 20,
                room: 'netxus'
            },
            'netxus_level_4': {
                name: 'Gateway Guardian',
                description: 'Complete NetXus Lab 4: Default Gateway Setup',
                icon: 'bi-shield-check',
                color: '#9C27B0',
                type: 'level',
                points: 25,
                room: 'netxus'
            },
            'netxus_level_5': {
                name: 'DHCP Specialist',
                description: 'Complete NetXus Lab 5: Basic DHCP Configuration',
                icon: 'bi-gear-fill',
                color: '#FF5722',
                type: 'level',
                points: 30,
                room: 'netxus'
            },
            'netxus_easy_complete': {
                name: 'NetXus Explorer',
                description: 'Complete all Easy NetXus labs',
                icon: 'bi-trophy',
                color: '#FFD700',
                type: 'difficulty',
                points: 50,
                room: 'netxus'
            },
            'netxus_hard_complete': {
                name: 'NetXus Expert',
                description: 'Complete all Advanced NetXus labs',
                icon: 'bi-award',
                color: '#E91E63',
                type: 'difficulty',
                points: 100,
                room: 'netxus'
            },
            'netxus_room_complete': {
                name: 'Network Engineering Master',
                description: 'Complete the entire NetXus room',
                icon: 'bi-mortarboard-fill',
                color: '#8E44AD',
                type: 'room',
                points: 150,
                room: 'netxus'
            },
            
            // Cross-Room Special Badges
            'perfect_score_specialist': {
                name: 'Perfectionist',
                description: 'Achieve perfect score in any room',
                icon: 'bi-star-fill',
                color: '#FFD700',
                type: 'special',
                points: 75,
                room: 'all'
            },
            'speed_runner': {
                name: 'Speed Demon',
                description: 'Complete any room in record time',
                icon: 'bi-lightning-fill',
                color: '#00BCD4',
                type: 'special',
                points: 100,
                room: 'all'
            },
            'room_explorer': {
                name: 'Room Explorer',
                description: 'Complete your first room',
                icon: 'bi-door-open',
                color: '#4CAF50',
                type: 'milestone',
                points: 25,
                room: 'all'
            },
            'tech_polymath': {
                name: 'Tech Polymath',
                description: 'Complete all available rooms',
                icon: 'bi-collection-fill',
                color: '#8E44AD',
                type: 'legendary',
                points: 500,
                room: 'all'
            }
        };
        
        this.initialize();
    }
    
    async initialize() {
        try {
            this.userId = this.getCurrentUserId();
            if (this.userId) {
                await this.loadUserAchievements();
            }
            console.log('🏆 Achievement Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Achievement Manager:', error);
        }
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || sessionStorage.getItem('userId');
    }
    
    async loadUserAchievements() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) return;

            const response = await fetch('/api/achievements/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                }
            });
            
            if (response.ok) {
                const achievements = await response.json();
                achievements.forEach(achievement => {
                    this.achievementsCache.set(achievement.badge_name, achievement);
                });
            }
        } catch (error) {
            console.warn('Could not load user achievements:', error);
        }
    }
    
    async awardBadge(badgeKey, additionalData = {}) {
        try {
            // Check if badge already earned
            if (this.achievementsCache.has(badgeKey)) {
                console.log(`Badge ${badgeKey} already earned`);
                return;
            }
            
            const badgeInfo = this.badgeDefinitions[badgeKey];
            if (!badgeInfo) {
                console.warn(`Unknown badge: ${badgeKey}`);
                return;
            }
            
            console.log(`🏆 Awarding badge: ${badgeKey} - ${badgeInfo.name}`);
            
            // Cache the badge immediately
            this.achievementsCache.set(badgeKey, {
                badge_name: badgeKey,
                earned_at: new Date().toISOString(),
                ...badgeInfo,
                ...additionalData
            });
            
            // Show badge notification immediately (don't wait for database)
            this.showBadgeNotification(badgeInfo);
            
            // Dispatch achievement event
            window.dispatchEvent(new CustomEvent('badgeEarned', {
                detail: {
                    badgeKey,
                    badgeInfo,
                    additionalData
                }
            }));
            
            // Try to save to database (but don't block the notification)
            try {
                await this.saveBadgeToDatabase(badgeKey, badgeInfo, additionalData);
                console.log(`✅ Badge ${badgeKey} saved to database successfully`);
            } catch (dbError) {
                console.warn(`⚠️ Failed to save badge ${badgeKey} to database:`, dbError);
                // Badge still shows to user even if database save fails
            }
                
            console.log(`🏆 Badge awarded: ${badgeInfo.name}`);
        } catch (error) {
            console.error('Error awarding badge:', error);
        }
    }
    
    async saveBadgeToDatabase(badgeKey, badgeInfo, additionalData) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                console.warn('No user ID available for badge award');
                return false;
            }

            // Save to badges table
            const badgeResponse = await fetch('/api/badges/award', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                body: JSON.stringify({
                    badge_name: badgeKey,
                    badge_type: badgeInfo.type,
                    points: badgeInfo.points,
                    metadata: additionalData
                })
            });
            
            // Save to achievements table
            const achievementResponse = await fetch('/api/achievements/award', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                body: JSON.stringify({
                    achievement_key: badgeKey,
                    title: badgeInfo.name,
                    description: badgeInfo.description,
                    icon: badgeInfo.icon,
                    badge_color: badgeInfo.color,
                    points: badgeInfo.points,
                    category: badgeInfo.room,
                    progress_data: additionalData
                })
            });
            
            return badgeResponse.ok && achievementResponse.ok;
        } catch (error) {
            console.error('Error saving badge to database:', error);
            return false;
        }
    }
    
    showBadgeNotification(badgeInfo) {
        console.log('🎉 Showing badge notification for:', badgeInfo.name);
        
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, ${badgeInfo.color}22, ${badgeInfo.color}44);
            border: 2px solid ${badgeInfo.color};
            border-radius: 16px;
            padding: 30px;
            color: white;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            max-width: 400px;
            animation: badgeBounce 0.6s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">
                <i class="${badgeInfo.icon}" style="color: ${badgeInfo.color};"></i>
            </div>
            <h3 style="margin: 0 0 10px 0; color: ${badgeInfo.color}; font-size: 1.5rem;">
                🏆 Badge Earned!
            </h3>
            <h4 style="margin: 0 0 8px 0; color: white; font-size: 1.2rem;">
                ${badgeInfo.name}
            </h4>
            <p style="margin: 0; color: #ccc; font-size: 0.9rem;">
                ${badgeInfo.description}
            </p>
            <div style="margin-top: 15px; font-size: 0.8rem; color: ${badgeInfo.color};">
                +${badgeInfo.points} points
            </div>
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#badge-animations')) {
            const style = document.createElement('style');
            style.id = 'badge-animations';
            style.textContent = `
                @keyframes badgeBounce {
                    0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'badgeBounce 0.3s ease-in reverse';
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 300);
            }
        }, 4000);
    }
    
    // Generic badge checking methods for any room
    async checkLevelCompletion(roomName, level, score, timeSpent, additionalData = {}) {
        const badgeKey = `${roomName}_level_${level}`;
        await this.awardBadge(badgeKey, {
            roomName,
            level,
            score,
            timeSpent,
            completedAt: new Date().toISOString(),
            ...additionalData
        });
        
        // Check for special achievements
        if (score >= 95) {
            await this.checkPerfectScore(roomName);
        }
    }
    
    async checkRoomCompletion(roomName, totalScore, totalTime, completedLevels = 5, additionalData = {}) {
        if (completedLevels >= 5) {
            const badgeKey = `${roomName}_room_complete`;
            await this.awardBadge(badgeKey, {
                roomName,
                totalScore,
                totalTime,
                completedLevels,
                completedAt: new Date().toISOString(),
                ...additionalData
            });
            
            // Check speed runner achievement (under 30 minutes)
            if (totalTime < 1800) {
                await this.awardBadge('speed_runner', {
                    roomName,
                    totalTime,
                    completedAt: new Date().toISOString()
                });
            }
            
            // Check if this is the user's first room completion
            await this.checkFirstRoomCompletion(roomName);
        }
    }
    
    async checkDifficultyCompletion(roomName, difficulty, completedLevels, additionalData = {}) {
        if (completedLevels >= 5) {
            const badgeKey = `${roomName}_${difficulty}_complete`;
            const badgeInfo = this.badgeDefinitions[badgeKey];
            
            if (badgeInfo) {
                await this.awardBadge(badgeKey, {
                    roomName,
                    difficulty,
                    completedLevels,
                    completedAt: new Date().toISOString(),
                    ...additionalData
                });
            }
        }
    }
    
    async checkPerfectScore(roomName) {
        await this.awardBadge('perfect_score_specialist', {
            roomName,
            completedAt: new Date().toISOString()
        });
    }
    
    async checkFirstRoomCompletion(roomName) {
        // Check if user has any previous room completions
        const userBadges = this.getUserBadges();
        const roomCompletionBadges = userBadges.filter(badge => 
            badge.badge_name && badge.badge_name.endsWith('_room_complete')
        );
        
        if (roomCompletionBadges.length === 0) {
            await this.awardBadge('room_explorer', {
                firstRoom: roomName,
                completedAt: new Date().toISOString()
            });
        }
    }
    
    async checkAllRoomsCompletion() {
        // Check if user has completed all 5 main rooms
        const requiredRooms = ['aitrix', 'schemax', 'codevance', 'flowbyte', 'netxus'];
        const userBadges = this.getUserBadges();
        const completedRooms = requiredRooms.filter(room => 
            userBadges.some(badge => badge.badge_name === `${room}_room_complete`)
        );
        
        if (completedRooms.length === requiredRooms.length) {
            await this.awardBadge('tech_polymath', {
                completedRooms,
                completedAt: new Date().toISOString()
            });
        }
    }

    // NetXus specific badge checking methods (for backward compatibility)
    async checkNetXusLevelCompletion(level, difficulty, score, timeSpent) {
        await this.checkLevelCompletion('netxus', level, score, timeSpent, { difficulty });
    }

    async checkNetXusDifficultyCompletion(difficulty, completedLevels) {
        await this.checkDifficultyCompletion('netxus', difficulty, completedLevels);
    }

    async checkNetXusRoomCompletion(totalScore, totalTime, completedBothDifficulties = false) {
        if (completedBothDifficulties) {
            await this.checkRoomCompletion('netxus', totalScore, totalTime, 5);
        }
    }
    
    // Public method to get user's badges
    getUserBadges() {
        return Array.from(this.achievementsCache.values());
    }
    
    // Public method to check if user has specific badge
    hasBadge(badgeKey) {
        return this.achievementsCache.has(badgeKey);
    }
}

// Create global instance
window.achievementManager = new AchievementManager();

console.log('🏆 Achievement Manager loaded and ready');