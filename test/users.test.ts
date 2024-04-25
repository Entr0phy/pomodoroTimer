import user from '../controller/user';
import db from '../db';

jest.mock('../db');

describe('createUser', () => {
    const mockUserParams = { name: 'John Doe', email: 'john.doe@example.com' };
    const mockUser = { id: 1, ...mockUserParams };

    beforeEach(() => {
        (db.query as jest.Mock).mockImplementation((sql, params) => {


            const normalizedSql = sql.replace(/\s+/g, ' ').trim();

            // Handle the user insertion
            if (normalizedSql.startsWith('INSERT INTO users')) {
                return Promise.resolve({
                    rows: [{ id: 1, name: params[0], email: params[1] }],
                    rowCount: 1
                });
            }

            // Handle configuration insertion
            if (normalizedSql.startsWith('INSERT INTO configurations')) {
                // Check if it's missing handling specific configurations
                return Promise.resolve({
                    rowCount: 1,
                    rows: [{
                        id: 1,
                        user_id: 1,
                        short_break_duration: 300,
                        longBreakDuration: 900,
                        longBreakInterval: 4,
                        work_duration: 1500
                    }]
                });
            }

            // Handle transaction commands
            if (sql.trim() === 'BEGIN' || sql.trim() === 'COMMIT' || sql.trim() === 'ROLLBACK') {
                return Promise.resolve();
            }

            // Default to error if the query is not handled
            console.log('Unhandled SQL:', sql); // Debug which query is unhandled
            throw new Error('Database error');
        });
    });

    it('successfully creates a user and initializes configuration', async () => {
        const userResult = await user.createUser({ name: 'John Doe', email: 'john.doe@example.com' });
        expect(userResult).toEqual({ id: 1, name: 'John Doe', email: 'john.doe@example.com' });
        expect(db.query).toHaveBeenCalledTimes(4); // Including BEGIN, INSERT user, INSERT configuration, and COMMIT
    });
});

it('rolls back the transaction if an error occurs during user creation', async () => {
    // Prepare to simulate an error on user creation
    (db.query as jest.Mock).mockImplementation((sql, params) => {
        const normalizedSql = sql.replace(/\s+/g, ' ').trim(); // Normalize SQL string

        if (normalizedSql.startsWith("INSERT INTO users")) {
            // Simulate a failure specifically for the user creation step
            return Promise.reject(new Error('Database error'));
        }

        if (normalizedSql.startsWith("INSERT INTO configurations")) {
            return Promise.resolve({ rows: [{ user_id: 1 }], rowCount: 1 });
        }

        if (normalizedSql === 'BEGIN' || normalizedSql === 'ROLLBACK') {
            return Promise.resolve(); // Ensure these queries do not fail
        }

        if (normalizedSql === 'COMMIT') {
            throw new Error('Commit should not be reached');
        }

        return Promise.reject(new Error('Unhandled SQL'));
    });

    // Assert that the promise is rejected and the specific error is thrown
    await expect(user.createUser({ name: 'John Doe', email: 'john.doe@example.com' }))
        .rejects.toThrow('Database error');
    
    // Verify that the rollback is called after the error
    expect(db.query).toHaveBeenCalledWith('ROLLBACK');
});