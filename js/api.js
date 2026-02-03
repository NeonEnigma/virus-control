// REPLACE 'YOUR_BTP_BACKEND_URL' with your actual BTP application URL (e.g., https://virus-control.cfapps.eu10.hana.ondemand.com)
// AND ensure you do NOT have a trailing slash at the end.
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://virus-control-backend.cfapps.eu12.hana.ondemand.com/api';

export const api = {
    token: localStorage.getItem('token'),

    setToken(token) {
        console.log('>>> DEBUG: Setting Token:', token ? 'Token exists' : 'No Token');
        this.token = token;
        localStorage.setItem('token', token);
    },

    logout() {
        console.log('>>> DEBUG: Logging out...');
        this.token = null;
        localStorage.removeItem('token');
        // window.location.href = 'index.html'; // REMOVED because it causes loops on 401. 
        // Let the caller handle the UI update or redirect if explicitly requested.
        console.log('>>> DEBUG: Token cleared. Redirect disabled to prevent loops.');
    },

    async request(endpoint, method = 'GET', body = null) {
        console.log(`>>> DEBUG: Requesting ${endpoint} [${method}]`);
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            console.log('>>> DEBUG: Attaching Token to header');
            // headers['x-auth-token'] = this.token; // Legacy
            headers['Authorization'] = `Bearer ${this.token}`;
        } else {
            console.warn('>>> DEBUG: No token found for this request');
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            console.log(`>>> DEBUG: Fetching ${API_BASE_URL}${endpoint}`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            console.log('>>> DEBUG: Response Status:', response.status);

            if (response.status === 401) {
                console.warn('>>> DEBUG: 401 Unauthorized received');
                this.logout();
                return Promise.reject('Unauthorized');
            }
            if (!response.ok) {
                const errorData = await response.json();
                console.error('>>> DEBUG: API Error:', errorData);
                throw new Error(errorData.message || 'API Error');
            }
            const json = await response.json();
            console.log('>>> DEBUG: Response JSON:', json);
            return json;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    },

    login(email, password) {
        return this.request('/auth/login', 'POST', { email, password })
            .then(data => {
                console.log('>>> DEBUG: Login successful, received token');
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

    pauseGame(userId) {
        return this.request('/game/pause', 'POST', { userId });
    },

    resumeGame(userId) {
        return this.request('/game/resume', 'POST', { userId });
    },

    addTime(userId, minutes) {
        return this.request('/game/add-time', 'POST', { userId, minutes });
    },

    resetUserPuzzles(userId) {
        return this.request(`/game/reset/${userId}`, 'POST');
    },

    resetAllPuzzles() {
        return this.request('/game/reset-all', 'POST');
    },

    // Add other methods as needed based on gameController logic
};
