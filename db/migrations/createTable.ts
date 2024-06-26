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
        time_left INTEGER, -- Time remaining in the current session
        status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', or 'completed'
        session_type VARCHAR(20) NOT NULL, -- 'work_interval', 'short_break', 'long_break'
        pause_time TIMESTAMP WITH TIME ZONE,
        completed_work_intervals INTEGER DEFAULT 0, -- Number of completed work intervals before this session
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    

    CREATE TABLE IF NOT EXISTS configurations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        work_duration INTEGER DEFAULT 1500,
        short_break_duration INTEGER DEFAULT 300,
        long_break_duration INTEGER DEFAULT 900,
        long_break_interval INTEGER DEFAULT 4,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`;

export default createTables
  