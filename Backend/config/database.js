const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();




let dbName = process.env.DB_NAME || 'escape-db'; // Updated default per user
let dbUser = process.env.DB_USER || 'postgres';
let dbPass = process.env.DB_PASS || 'password';
let dbHost = process.env.DB_HOST || 'localhost';
let dbPort = process.env.DB_PORT || 5432;
let dbUri = null;

// Check for Cloud Foundry environment
if (process.env.VCAP_SERVICES) {
    try {
        const vcap = JSON.parse(process.env.VCAP_SERVICES);
        let pgService = null;

        // Strategy 1: Look for service with name 'escape-db'
        for (const serviceLabel in vcap) {
            const tempService = vcap[serviceLabel].find(s => s.name === 'escape-db');
            if (tempService) {
                pgService = tempService;
                break;
            }
        }

        // Strategy 2: Fallback to first postgres entry
        if (!pgService) {
            pgService = vcap['postgresql'] ? vcap['postgresql'][0] : (vcap['postgres'] ? vcap['postgres'][0] : null);
        }

        if (pgService && pgService.credentials) {
            // Prefer URI if available
            dbUri = pgService.credentials.uri || pgService.credentials.url;

            dbName = pgService.credentials.database || pgService.credentials.name || dbName;
            dbUser = pgService.credentials.username || dbUser;
            dbPass = pgService.credentials.password || dbPass;
            dbHost = pgService.credentials.host || pgService.credentials.hostname || dbHost;
            dbPort = pgService.credentials.port || dbPort;
            console.log(`Using Database Service: ${pgService.name} (DB: ${dbName})`);
        }
    } catch (e) {
        console.error("Error parsing VCAP_SERVICES", e);
    }
}

// Config Options
const config = {
    host: dbHost,
    dialect: 'postgres',
    port: dbPort,
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
};

let sequelize;
if (dbUri) {
    console.log('Connecting via URI...');
    sequelize = new Sequelize(dbUri, config);
} else {
    console.log(`Connecting via params to ${dbName}...`);
    sequelize = new Sequelize(dbName, dbUser, dbPass, config);
}

module.exports = sequelize;
