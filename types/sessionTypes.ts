export enum Status {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED'
}

export enum SESSION_TYPE {
    WORK_INTERVAL = 'WORK_INTERVAL',
    SHORT_BREAK = 'SHORT_BREAK',
    LONG_BREAK = 'LONG_BREAK'
}

export interface  SessionInterface {
    id: Number,
    user_id: Number,
    start_time: Date,
    time_left: number,
    status: String,
    session_type: String,
    completed_work_intervals: number,
    pause_time: Date |  null,
}