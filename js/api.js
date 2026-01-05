const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : '/api';

export const api = {
    token: localStorage.getItem('token'),

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    },

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    },

    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['x-auth-token'] = this.token;
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            if (response.status === 401) {
                this.logout();
                return Promise.reject('Unauthorized');
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API Error');
            }
            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    },

    login(email, password) {
        return this.request('/auth/login', 'POST', { email, password })
            .then(data => {
                this.setToken(data.token);
                return data.user;
            });
    },

    getUsers() {
        return this.request('/users');
    },

    createGroup(name) {
        return this.request('/groups', 'POST', { name });
    },

    startGame(userId, minutes) {
        return this.request('/game/start', 'POST', { userId, minutes });
    },

    getCurrentUser() {
        return this.request('/auth/me');
    },

    // Add other methods as needed based on gameController logic
};
