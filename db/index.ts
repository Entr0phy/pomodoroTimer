import pg from 'pg';

// Define an interface for the pool configuration
interface PoolConfig {
    host: string | undefined;
    port: number | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
}

// Configuration with proper type handling
const config: PoolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Create a new pool using the configuration
const db = new pg.Pool(config);

export default db;
