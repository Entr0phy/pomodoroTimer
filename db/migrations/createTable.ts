const createTables = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP WITH TIME ZONE,
        duration_minutes INTEGER DEFAULT 25,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS configurations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        work_duration INTEGER DEFAULT 25,
        short_break_duration INTEGER DEFAULT 5,
        long_break_duration INTEGER DEFAULT 15,
        long_break_interval INTEGER DEFAULT 4,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`;

export default createTables
