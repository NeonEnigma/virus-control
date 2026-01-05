const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();




let dbName = process.env.DB_NAME || 'virus_control';
let dbUser = process.env.DB_USER || 'postgres';
let dbPass = process.env.DB_PASS || 'password';
let dbHost = process.env.DB_HOST || 'localhost';
let dbPort = process.env.DB_PORT || 5432;

// Check for Cloud Foundry environment
if (process.env.VCAP_SERVICES) {
    try {
        const vcap = JSON.parse(process.env.VCAP_SERVICES);
        // Adapting to typical CF Postgres service structure (e.g., 'postgresql', 'postgres', 'elephantsql')
        const pgService = vcap['postgresql'] ? vcap['postgresql'][0] : (vcap['postgres'] ? vcap['postgres'][0] : null);

        if (pgService && pgService.credentials) {
            dbName = pgService.credentials.database || pgService.credentials.name || dbName;
            dbUser = pgService.credentials.username || dbUser;
            dbPass = pgService.credentials.password || dbPass;
            dbHost = pgService.credentials.host || pgService.credentials.hostname || dbHost;
            dbPort = pgService.credentials.port || dbPort;
        }
    } catch (e) {
        console.error("Error parsing VCAP_SERVICES", e);
    }
}

const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPass,
    {
        host: dbHost,
        dialect: 'postgres',
        port: dbPort,
        logging: false
    }
);

module.exports = sequelize;
