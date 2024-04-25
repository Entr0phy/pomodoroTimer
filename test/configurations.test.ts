import configurations from '../controller/configurations'
import db from '../db'; 
import { updateConfigurationParams } from '../types/configurationTypes';
import { userConfiguration } from '../types/configurationTypes';

jest.mock('../db');

describe('updateConfiguration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully updates configuration', async () => {
        const mockParams: updateConfigurationParams = {
            userId: 1,
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4
        };

        const expectedConfig: userConfiguration = {
           id:1,
           user_id:1,
           work_duration:25,
           short_break_duration:5,
           longBreakDuration:15,
           longBreakInterval:4
        };

        (db.query as jest.Mock).mockResolvedValueOnce({
            rows: [expectedConfig], rowCount: 1
        });

        const result = await configurations.updateConfiguration(mockParams);
        expect(result).toEqual(expectedConfig);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [
            mockParams.userId,
            mockParams.workDuration,
            mockParams.shortBreakDuration,
            mockParams.longBreakDuration,
            mockParams.longBreakInterval
        ]);
        console.log('Test passed: Configuration updated');
    });

    it('throws an error if the database query fails', async () => {
        (db.query as jest.Mock).mockRejectedValue(new Error('Database error'));

        await expect(configurations.updateConfiguration({
            userId: 1,
            workDuration: 30,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4
        })).rejects.toThrow('Database error');
        expect(db.query).toHaveBeenCalledTimes(1);
        console.log('Test passed: Error thrown as expected');
    });
});