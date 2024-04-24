import db from "../db";
import {
    updateConfigurationParams,
    userConfiguration,
} from "../types/configurationTypes";

const updateConfiguration = async ({
    userId,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
}: updateConfigurationParams): Promise<userConfiguration> => {
    const updateConfigurationQuery = `
        UPDATE
            configurations
        SET
            work_duration = $2,
            short_break_duration = $3,
            long_break_duration = $4,
            long_break_interval = $5
        WHERE 
            user_id = $1
        RETURNING *
    `;

    try {
        const result = await db.query(updateConfigurationQuery,
            [userId, workDuration, shortBreakDuration, longBreakDuration, longBreakInterval]);
        console.log('Configuration Updated ')
        return result.rows[0]
    } catch (e) {
        console.log('Error updating a user', e)
        throw e
    }
};

export default {
    updateConfiguration
}