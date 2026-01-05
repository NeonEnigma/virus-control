// This script mimics front-end calls to verify the API
// You need to install dependencies (or run in env with them) but since we are just creating the file for the user:
// usage: node test_api.js

const API_URL = 'http://localhost:8080/api';

async function testBackend() {
    console.log('Testing Backend...');

    // 1. Health Check
    // Note: Root route is just text.
    // const res = await fetch('http://localhost:8080');
    // console.log('Root:', await res.text());

    // 2. Register
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Registering user: ${email}`);
    let res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'super-admin' })
    });
    let data = await res.json();
    console.log('Register Response:', data);

    // 3. Login
    console.log('Logging in...');
    res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    data = await res.json();
    console.log('Login Response:', data.token ? 'Success (Token received)' : 'Failed');
    const token = data.token;
    const userId = data.user.id;

    if (!token) return;

    // 4. Create Group
    console.log('Creating Group...');
    res = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ name: 'Test Group' })
    });
    data = await res.json();
    console.log('Create Group Response:', data);

    // 5. Start Game
    console.log('Starting Game...');
    res = await fetch(`${API_URL}/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ userId, minutes: 60 })
    });
    data = await res.json();
    console.log('Start Game Response:', data);

    console.log('Verification Complete.');
}

if (require.main === module) {
    // Check if fetch is available (Node 18+) or needs polyfill
    if (!global.fetch) {
        console.log("Fetch not found, please use Node 18+ or install node-fetch");
    } else {
        testBackend();
    }
}
