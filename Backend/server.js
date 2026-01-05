const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));

// Test route
app.get('/', (req, res) => {
    res.send('Virus Control Backend is running.');
});

// Database connection
db.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

// Sync models (in development, use { force: true } carefully)
// db.sync();

app.listen(PORT, console.log(`Server started on port ${PORT}`));
