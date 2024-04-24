import db from '../db';
import {
    Status,
    SESSION_TYPE,
    SessionInterface
} from '../types/sessionTypes'

import { userConfiguration } from '../types/configurationTypes';

const createSession = async (userId: number): Promise<SessionInterface> => {
    const getUserConfigurationQuery = `
      SELECT * FROM configurations
      WHERE user_id = $1;
    `;
  
    return db.query(getUserConfigurationQuery, [userId])
      .then(userQueryResult => {
        if (userQueryResult.rowCount === 0) {
          throw new Error('No User Configuration Found');
        }
        const configData: userConfiguration = userQueryResult.rows[0];
  
        const createSessionQuery = `
          INSERT INTO sessions (user_id, start_time, time_left, status, session_type)
          VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4)
          RETURNING *;
        `;
  
        // Use default or fetched configurations for time_left and session_type
        const timeLeft = configData.work_duration; 
        const sessionType = SESSION_TYPE.WORK_INTERVAL
        const status = Status.ACTIVE
  
        return db.query(createSessionQuery, [userId, timeLeft, status, sessionType]);
      })
      .then(sessionCreationResult => {
        console.log('Session created');
        return sessionCreationResult.rows[0] as SessionInterface;
      })
      .catch(error => {
        console.error("Error creating session", error);
        throw error;
      });
  };

  const endSession = async (sessionId: number): Promise<SessionInterface> => {
    const getCurrentSessionStatus = `
        SELECT * FROM sessions
        WHERE id = $1;
    `;

    const endSessionQuery = `
        UPDATE sessions
        SET
            start_time = CURRENT_TIMESTAMP,
            time_left = $2,
            status = $3,
            session_type = $4,
            completed_work_intervals = $5
        WHERE id = $1
        RETURNING *;
    `;

    const getUserConfigurationQuery = `
        SELECT * FROM configurations
        WHERE user_id = $1;
    `;

    try {
        // Get the current session status
        const sessionResult = await db.query(getCurrentSessionStatus, [sessionId]);
        if (sessionResult.rowCount === 0) {
            throw new Error('No session with such ID found');
        }
        const currentSession: SessionInterface = sessionResult.rows[0];

        // Get user configuration details
        const configResult = await db.query(getUserConfigurationQuery, [currentSession.user_id]);
        if (configResult.rowCount === 0) {
            throw new Error('User configuration not found');
        }
        const configData: userConfiguration = configResult.rows[0];

        // Set new session values based on session type
        let timeLeft: number = 0; // Assuming timeLeft needs to be reset or recalculated
        const status: string = Status.ACTIVE;
        let sessionType: string = SESSION_TYPE.WORK_INTERVAL;
        let completedWorkIntervals: number = currentSession.completed_work_intervals;

        if (currentSession.session_type === SESSION_TYPE.WORK_INTERVAL) {
            completedWorkIntervals++; // Increment if it's a work session ending
            if (currentSession.completed_work_intervals !== 0 && currentSession.completed_work_intervals % configData.longBreakInterval === 0) {
                timeLeft = configData.longBreakDuration
                sessionType = SESSION_TYPE.LONG_BREAK
            }
            else {
                timeLeft = configData.short_break_duration
                sessionType = SESSION_TYPE.SHORT_BREAK
            }
                            
        } else {
            //new work interval
            timeLeft = configData.work_duration;
            sessionType = SESSION_TYPE.WORK_INTERVAL;
        }

        // End the current session with updated values
        const updateResult = await db.query(endSessionQuery, [
            sessionId, timeLeft, status, sessionType, completedWorkIntervals
        ]);
        console.log('Session ended and updated successfully');
        return updateResult.rows[0]; 

    } catch (error) {
        console.error("Error ending session:", error);
        throw error; 
    }
}

const pauseSession = async (sessionId: number): Promise<SessionInterface> => {
    const pauseSessionQuery = `
        UPDATE sessions
        SET
            status = $2,
            time_left = $3
            pause_time = $4
        WHERE
            id = $1
        RETURNING *
    `

    const currentSessionQuery = `
        SELECT * FROM sessions
        WHERE
            id = $1
    `

    try {
        //get the current session status
        const sessionResult = await db.query(currentSessionQuery, [sessionId]);
        if(!sessionResult.rowCount)
            throw new Error ('No session with such id found')
        const currentSession: SessionInterface = sessionResult.rows[0]

        const sessionPauseTime: Date  = new Date();
        const elapsed: number = Math.floor((sessionPauseTime.getTime() - currentSession.start_time.getTime())/1000);
        const newTimeLeft: number = currentSession.time_left -=elapsed;
        const  pauseSessionData = await db.query(pauseSessionQuery, [sessionId, Status.PAUSED, newTimeLeft, new Date()]);
        console.log("Session Paused");
        return pauseSessionData.rows[0]
    }
    catch(e) {
        console.error("Error pausing session", e)
        throw e
    }
}

const resumeSession = async (sessionId: number) : Promise<SessionInterface> => {
    const resumeSessionQuery = `
        UPDATE sessions
        SET
            status = $2,
            start_time = $3
        WHERE
            id = $1
        RETURNING *
    `

    try {
        const resumeSession = await db.query(resumeSessionQuery, [sessionId, Status.ACTIVE, new Date()])
        console.log('Session Resumed')
        return resumeSession.rows[0];
    } catch(e){
        console.error('Failed to resume session', e);
        throw e;
    }
}

const getSessionInfo = async (sessionId: number) : Promise<SessionInterface> => {
    const getSessionInfoQuery = `
    SELECT * FROM sessions WHERE id = $1
    `

    try {
        const result = await db.query(getSessionInfoQuery, [sessionId]);
        const sessionInfo = result.rows[0];

        if (sessionInfo.status === Status.PAUSED)
            return sessionInfo;
        else  {
            const timeNow : Date = new Date();
            const elapsed =  Math.floor((timeNow.getTime() - sessionInfo.start_time.getTime())/1000)
            const updatedRemainingTime = sessionInfo.time_left -= elapsed;
            return {
                ...sessionInfo, 
                remaining_time: updatedRemainingTime
            }
        }
    }
    catch(e) {
        console.error('Error Getting Session Info:',e)
        throw e
    }
}



export default {
    createSession, 
    endSession,
    pauseSession,
    resumeSession,
    getSessionInfo
}