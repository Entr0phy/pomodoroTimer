import session from '../controller/session'
import db from '../db'; 
import { SessionInterface, SESSION_TYPE, Status } from '../types/sessionTypes';
import { userConfiguration } from '../types/configurationTypes';

jest.mock('../db');

describe('createSession', () => {
    it('should create a session successfully', async () => {
        const mockUserConfig: userConfiguration = {
            id: 1,
            user_id: 1,
            short_break_duration: 300,
            longBreakDuration: 900,
            longBreakInterval: 4,
            work_duration: 1500
        };
        const mockSession: SessionInterface = {
            id: 1,
            user_id: 1,
            start_time: new Date(),
            time_left: 1500,
            status: 'ACTIVE',
            session_type: 'WORK_INTERVAL',
            pause_time: null,
            completed_work_intervals: 0
        };

        // Mock the db.query function to simulate database responses
        (db.query as jest.Mock).mockImplementation((query: string, values: any[]) => {
            // Check if the query is attempting to select user configurations
            if (query.trim().startsWith('SELECT * FROM configurations')) {
                if (values[0] === 1) { 
                    return Promise.resolve({
                        rowCount: 1,
                        rows: [{ id: 1,
                            user_id: 1,
                            short_break_duration: 300,
                            longBreakDuration: 900,
                            longBreakInterval: 4,
                            work_duration: 1500 }]
                    });
                }
            }
            // Mocking the INSERT query
            if (query.trim().startsWith('INSERT INTO sessions')) {
                return Promise.resolve({
                    rowCount: 1,
                    rows: [mockSession]
                });
            }
            return Promise.reject(new Error('Query not handled'));
        });


        const result = await session.createSession(1);
        expect(result).toEqual(mockSession);
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [1]); // Check the first call for user config
        expect(db.query).toHaveBeenCalledWith(
            expect.any(String),
            [1, mockUserConfig.work_duration, 'ACTIVE', 'WORK_INTERVAL']
        ); // Check the second call for session creation
    });

    it('should throw an error if no user configuration is found', async () => {
        // Mock the db.query function to simulate no user configuration found
        (db.query as jest.Mock).mockImplementation((query, values) => {
            if (query.includes('SELECT * FROM configurations')) {
                return Promise.resolve({ rowCount: 0, rows: [] });
            }
            return Promise.reject(new Error('Query not handled'));
        });

        await expect(session.createSession(1)).rejects.toThrow('No User Configuration Found');
    });
});

describe('endSession', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully ends and updates a session', async () => {
        const mockSession: SessionInterface = {
            id: 1,
            user_id: 1,
            start_time: new Date(),
            time_left: 500,
            status: 'active',
            session_type: SESSION_TYPE.WORK_INTERVAL,
            completed_work_intervals: 3,
            pause_time: null
        };

        const mockConfig: userConfiguration = {
            id:1,
            user_id:1,
            work_duration: 1500,
            short_break_duration: 300,
            longBreakDuration: 900,
            longBreakInterval: 4
        };

        (db.query as jest.Mock).mockImplementation((sql, params) => {
            if (sql.includes('SELECT * FROM sessions')) {
                return Promise.resolve({ rowCount: 1, rows: [mockSession] });
            } else if (sql.includes('SELECT * FROM configurations')) {
                return Promise.resolve({ rowCount: 1, rows: [mockConfig] });
            } else if (sql.includes('UPDATE sessions')) {
                return Promise.resolve({ rowCount: 1, rows: [{ ...mockSession, time_left: mockConfig.short_break_duration }] });
            }
            throw new Error('Query not handled');
        });

        const result = await session.endSession(1);
        expect(result.time_left).toEqual(mockConfig.short_break_duration);
        expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('throws an error if no session is found', async () => {
        (db.query as jest.Mock).mockResolvedValue({ rowCount: 0, rows: [] });

        await expect(session.endSession(1)).rejects.toThrow('No session with such ID found');
        expect(db.query).toHaveBeenCalledTimes(1); // Only the session query should be called
    });

    it('throws an error if no user configuration is found', async () => {
        const mockSession: SessionInterface = {
            id: 1,
            user_id: 1,
            start_time: new Date(),
            time_left: 500,
            status: 'active',
            session_type: SESSION_TYPE.WORK_INTERVAL,
            completed_work_intervals: 3,
            pause_time:null
        };

        (db.query as jest.Mock).mockImplementationOnce((sql, params) => {
            if (sql.includes('SELECT * FROM sessions')) {
                return Promise.resolve({ rowCount: 1, rows: [mockSession] });
            }
            return Promise.resolve({ rowCount: 0, rows: [] });
        });

        await expect(session.endSession(1)).rejects.toThrow('User configuration not found');
        expect(db.query).toHaveBeenCalledTimes(2); // Both session and config queries are called
    });
});

describe('pauseSession', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully pauses and updates a session', async () => {
        const mockSession: SessionInterface = {
            id: 1,
            user_id: 1,
            start_time: new Date(new Date().getTime() - 5000), // Start time 5 seconds ago
            time_left: 1200, 
            status: 'active',
            session_type: 'work_interval',
            completed_work_intervals: 3,
            pause_time: null
        };

        const expectedTimeLeft = mockSession.time_left - 5;

        (db.query as jest.Mock).mockImplementation((sql, values) => {
            if (sql.includes('SELECT * FROM sessions')) {
                return Promise.resolve({ rowCount: 1, rows: [mockSession] });
            }
            if (sql.includes('UPDATE sessions')) {
                return Promise.resolve({ rowCount: 1, rows: [{ ...mockSession, time_left: expectedTimeLeft, status: Status.PAUSED }] });
            }
            return Promise.reject(new Error('Query not handled'));
        });

        const result = await session.pauseSession(1);
        expect(result).toEqual({ ...mockSession, time_left: expectedTimeLeft, status: Status.PAUSED });
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sessions'), [1]);
        expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('throws an error if no session with such id is found', async () => {
        (db.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0, rows: [] }); // No session found

        await expect(session.pauseSession(1)).rejects.toThrow('No session with such id found');
        expect(db.query).toHaveBeenCalledTimes(1); // Only the SELECT query should be called
    });
});

describe('resumeSession', () => {
    const mockSession: SessionInterface = {
        id: 1,
        user_id: 1,
        start_time: new Date(),
        time_left: 1200,
        status: Status.PAUSED,
        session_type: SESSION_TYPE.WORK_INTERVAL,
        completed_work_intervals: 3,
        pause_time: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Set up the mock implementation for db.query
        (db.query as jest.Mock).mockImplementation((sql, params) => {
            if (sql.includes('UPDATE')) {
                // Make sure the mock returns the correct object structure
                return Promise.resolve({ rowCount: 1, rows: [{ ...mockSession, status: Status.ACTIVE }] });
            }
            return Promise.reject(new Error('Query not handled'));
        });
    });

    it('successfully resumes a session', async () => {
        const result = await session.resumeSession(1);
        expect(result.status).toEqual(Status.ACTIVE);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE sessions'), [1, Status.ACTIVE, expect.any(Date)]);
    });

    it('throws an error if the database query fails', async () => {
        // Make the db.query mock throw an error
        (db.query as jest.Mock).mockRejectedValue(new Error('Failed to resume session'));

        await expect(session.resumeSession(1)).rejects.toThrow('Failed to resume session');
        expect(db.query).toHaveBeenCalledTimes(1);
    });
});

describe('getSessionInfo', () => {
    const baseSession: SessionInterface = {
        id: 1,
        user_id: 1,
        start_time: new Date(new Date().getTime() - 10000), 
        time_left: 1500, 
        status: Status.ACTIVE,
        session_type: SESSION_TYPE.WORK_INTERVAL,
        completed_work_intervals: 3,
        pause_time: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns session info directly for paused sessions', async () => {
        const pausedSession = {
            ...baseSession,
            status: Status.PAUSED
        };

        (db.query as jest.Mock).mockResolvedValueOnce({
            rows: [pausedSession], rowCount: 1
        });

        const result = await session.getSessionInfo(1);
        expect(result).toEqual(pausedSession);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sessions'), [1]);
    });

    it('updates and returns session info for active sessions', async () => {
        const activeSession = {
            ...baseSession,
            status: Status.ACTIVE,
            
        };

        (db.query as jest.Mock).mockResolvedValueOnce({
            rows: [activeSession], rowCount: 1
        });

        await session.getSessionInfo(1);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sessions'), [1]);
    });

    it('throws an error when no session is found', async () => {
        (db.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await expect(session.getSessionInfo(1)).rejects.toThrow();
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sessions'), [1]);
    });
});