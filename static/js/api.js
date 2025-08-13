class APIClient {
    constructor() {
        this.baseURL = '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // User operations
    async getUsers() {
        return this.request('/users');
    }

    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUser(userId) {
        return this.request(`/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Item operations (for learning content, progress, etc.)
    async getItems() {
        return this.request('/items');
    }

    async createItem(itemData) {
        return this.request('/items', {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    }

    async deleteItem(itemId) {
        return this.request(`/items/${itemId}`, {
            method: 'DELETE'
        });
    }
}

const api = new APIClient();
export default api;
