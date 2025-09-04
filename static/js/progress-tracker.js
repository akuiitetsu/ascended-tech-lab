/**
 * Progress Tracker Module
 * Handles user progress tracking across all rooms and provides
 * seamless integration with the backend API
 */

class ProgressTracker {
    constructor() {
        this.currentUser = null;
        this.progressCache = new Map();
        this.updateQueue = [];
        this.isOnline = navigator.onLine;
        this.autoSaveInterval = null;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineProgress();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Get current user from localStorage or session
            this.currentUser = this.getCurrentUser();
            
            if (this.currentUser) {
                await this.loadUserProgress();
                this.startAutoSave();
            }
            
            console.log('📊 Progress Tracker initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Progress Tracker:', error);
        }
    }
    
    getCurrentUser() {
        // Try multiple sources for user data
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        const username = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        
        if (userId && username) {
            return {
                id: parseInt(userId),
                username: username,
                email: localStorage.getItem('currentEmail') || sessionStorage.getItem('currentEmail')
            };
        }
        
        return null;
    }
    
    async loadUserProgress() {
        if (!this.currentUser) {
            console.warn('No current user found for progress loading');
            return;
        }
        
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/progress/summary`);
            
            if (response.ok) {
                const data = await response.json();
                
                // Cache the progress data
                this.progressCache.clear();
                data.room_progress.forEach(room => {
                    this.progressCache.set(room.room_name, room);
                });
                
                console.log('✅ User progress loaded successfully:', data.overall_stats);
                
                // Trigger event for UI updates
                this.dispatchProgressEvent('progress-loaded', {
                    userId: this.currentUser.id,
                    progress: data
                });
                
                return data;
            } else {
                throw new Error(`Failed to load progress: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading user progress:', error);
            // Load from localStorage as fallback
            this.loadProgressFromStorage();
        }
    }
    
    loadProgressFromStorage() {
        try {
            const storedProgress = localStorage.getItem(`progress_${this.currentUser.id}`);
            if (storedProgress) {
                const progressData = JSON.parse(storedProgress);
                progressData.forEach(room => {
                    this.progressCache.set(room.room_name, room);
                });
                console.log('📋 Loaded progress from local storage');
            }
        } catch (error) {
            console.error('❌ Error loading progress from storage:', error);
        }
    }
    
    saveProgressToStorage() {
        if (!this.currentUser) return;
        
        try {
            const progressArray = Array.from(this.progressCache.values());
            localStorage.setItem(`progress_${this.currentUser.id}`, JSON.stringify(progressArray));
        } catch (error) {
            console.error('❌ Error saving progress to storage:', error);
        }
    }
    
    async updateProgress(roomName, progressData) {
        if (!this.currentUser) {
            console.warn('Cannot update progress: No current user');
            return false;
        }
        
        try {
            // Validate progress data
            const validatedData = this.validateProgressData(roomName, progressData);
            
            // Update local cache immediately
            const currentProgress = this.progressCache.get(roomName) || {
                room_name: roomName,
                progress_percentage: 0,
                score: 0,
                current_level: 1,
                time_spent: 0,
                attempts: 0,
                completed: false
            };
            
            // Merge with new data, keeping higher values for progress and score
            const updatedProgress = {
                ...currentProgress,
                ...validatedData,
                progress_percentage: Math.max(currentProgress.progress_percentage || 0, validatedData.progress_percentage || 0),
                score: Math.max(currentProgress.score || 0, validatedData.score || 0),
                time_spent: (currentProgress.time_spent || 0) + (validatedData.time_spent || 0),
                attempts: (currentProgress.attempts || 0) + (validatedData.attempts || 1),
                last_accessed: new Date().toISOString()
            };
            
            // Mark as completed if progress is 100%
            if (updatedProgress.progress_percentage >= 100) {
                updatedProgress.completed = true;
            }
            
            this.progressCache.set(roomName, updatedProgress);
            this.saveProgressToStorage();
            
            // Queue for server update
            if (this.isOnline) {
                await this.syncProgressToServer(roomName, updatedProgress);
            } else {
                this.queueProgressUpdate(roomName, updatedProgress);
            }
            
            // Trigger event for UI updates
            this.dispatchProgressEvent('progress-updated', {
                roomName,
                progress: updatedProgress,
                userId: this.currentUser.id
            });
            
            console.log(`📈 Progress updated for ${roomName}:`, updatedProgress);
            return true;
            
        } catch (error) {
            console.error(`❌ Error updating progress for ${roomName}:`, error);
            return false;
        }
    }
    
    validateProgressData(roomName, data) {
        const validated = {
            room_name: roomName,
            progress_percentage: Math.max(0, Math.min(100, parseInt(data.progress_percentage) || 0)),
            current_level: Math.max(1, parseInt(data.current_level) || 1),
            score: Math.max(0, parseInt(data.score) || 0),
            time_spent: Math.max(0, parseInt(data.time_spent) || 0),
            attempts: Math.max(1, parseInt(data.attempts) || 1),
            notes: data.notes || ''
        };
        
        return validated;
    }
    
    async syncProgressToServer(roomName, progressData) {
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(progressData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Progress synced to server for ${roomName}`);
                
                // Update cache with server response if it has more recent data
                if (result.progress) {
                    this.progressCache.set(roomName, result.progress);
                    this.saveProgressToStorage();
                }
                
                return result;
            } else {
                throw new Error(`Server sync failed: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Failed to sync progress for ${roomName}:`, error);
            // Queue for retry
            this.queueProgressUpdate(roomName, progressData);
            throw error;
        }
    }
    
    queueProgressUpdate(roomName, progressData) {
        // Add to queue for offline sync
        this.updateQueue.push({
            roomName,
            progressData,
            timestamp: Date.now()
        });
        
        // Save queue to localStorage
        localStorage.setItem(`progress_queue_${this.currentUser.id}`, JSON.stringify(this.updateQueue));
    }
    
    async syncOfflineProgress() {
        if (!this.isOnline || this.updateQueue.length === 0) return;
        
        console.log(`🔄 Syncing ${this.updateQueue.length} offline progress updates...`);
        
        const successfulUpdates = [];
        
        for (const update of this.updateQueue) {
            try {
                await this.syncProgressToServer(update.roomName, update.progressData);
                successfulUpdates.push(update);
            } catch (error) {
                console.error(`Failed to sync queued update for ${update.roomName}:`, error);
            }
        }
        
        // Remove successful updates from queue
        this.updateQueue = this.updateQueue.filter(update => !successfulUpdates.includes(update));
        localStorage.setItem(`progress_queue_${this.currentUser.id}`, JSON.stringify(this.updateQueue));
        
        console.log(`✅ Synced ${successfulUpdates.length} offline progress updates`);
    }
    
    getProgressForRoom(roomName) {
        return this.progressCache.get(roomName) || {
            room_name: roomName,
            progress_percentage: 0,
            score: 0,
            current_level: 1,
            time_spent: 0,
            attempts: 0,
            completed: false,
            last_accessed: null
        };
    }
    
    getAllProgress() {
        return Array.from(this.progressCache.values());
    }
    
    getOverallStats() {
        const allProgress = this.getAllProgress();
        
        if (allProgress.length === 0) {
            return {
                total_progress: 0,
                completed_rooms: 0,
                total_rooms: 0,
                total_score: 0,
                avg_progress: 0
            };
        }
        
        const totalProgress = allProgress.reduce((sum, room) => sum + (room.progress_percentage || 0), 0);
        const completedRooms = allProgress.filter(room => room.completed).length;
        const totalScore = allProgress.reduce((sum, room) => sum + (room.score || 0), 0);
        
        return {
            total_progress: totalProgress,
            completed_rooms: completedRooms,
            total_rooms: allProgress.length,
            total_score: totalScore,
            avg_progress: Math.round(totalProgress / allProgress.length * 10) / 10
        };
    }
    
    startAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveProgressToStorage();
        }, 30000);
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    dispatchProgressEvent(eventType, data) {
        const event = new CustomEvent(eventType, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
        
        // Also trigger dashboard refresh if we're on dashboard page
        if (window.location.pathname.includes('dashboard') && eventType === 'progress-updated') {
            // Trigger dashboard update
            if (typeof window.loadUserProgress === 'function') {
                setTimeout(() => window.loadUserProgress(), 100);
            }
        }
    }
    
    // Convenience methods for common progress updates
    async completeChallenge(roomName, challengeData = {}) {
        const progressUpdate = {
            progress_percentage: Math.min(100, (this.getProgressForRoom(roomName).progress_percentage || 0) + 20),
            score: challengeData.score || 10,
            time_spent: challengeData.timeSpent || 0,
            attempts: 1,
            current_level: challengeData.level || 1
        };
        
        return await this.updateProgress(roomName, progressUpdate);
    }
    
    async markRoomComplete(roomName, finalScore = 100) {
        const progressUpdate = {
            progress_percentage: 100,
            score: finalScore,
            completed: true,
            attempts: 1
        };
        
        return await this.updateProgress(roomName, progressUpdate);
    }
    
    async incrementLevel(roomName, newLevel) {
        const currentProgress = this.getProgressForRoom(roomName);
        const progressUpdate = {
            current_level: newLevel,
            progress_percentage: Math.min(100, (currentProgress.progress_percentage || 0) + 10),
            attempts: 1
        };
        
        return await this.updateProgress(roomName, progressUpdate);
    }
    
    // Method to reset progress (for testing or user request)
    async resetProgress(roomName) {
        if (!confirm(`Are you sure you want to reset your progress in ${roomName}?`)) {
            return false;
        }
        
        const resetData = {
            progress_percentage: 0,
            score: 0,
            current_level: 1,
            time_spent: 0,
            attempts: 0,
            completed: false,
            notes: ''
        };
        
        return await this.updateProgress(roomName, resetData);
    }
    
    // Method to get progress for display in UI
    getProgressDisplay(roomName) {
        const progress = this.getProgressForRoom(roomName);
        const roomNames = {
            'flowchart': 'FLOWBYTE',
            'networking': 'NETXUS',
            'ai-training': 'AITRIX',
            'database': 'SCHEMAX',
            'programming': 'CODEVANCE'
        };
        
        return {
            displayName: roomNames[roomName] || roomName.toUpperCase(),
            progress: progress.progress_percentage || 0,
            score: progress.score || 0,
            level: progress.current_level || 1,
            completed: progress.completed || false,
            timeSpent: this.formatTime(progress.time_spent || 0),
            lastAccessed: progress.last_accessed ? new Date(progress.last_accessed).toLocaleDateString() : 'Never'
        };
    }
    
    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
    
    // Cleanup method
    destroy() {
        this.stopAutoSave();
        this.progressCache.clear();
        this.updateQueue = [];
    }
}

// Create global instance
window.progressTracker = new ProgressTracker();

// Export for module usage
export default ProgressTracker;

console.log('📊 Progress Tracker module loaded successfully');
