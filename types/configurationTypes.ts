export interface updateConfigurationParams {
    userId: number,
    workDuration: number,
    shortBreakDuration: number,
    longBreakDuration: number,
    longBreakInterval: number,
}

export interface userConfiguration {
    id: number,
    user_id: number,
    work_duration: number,
    short_break_duration: number,
    longBreakDuration: number,
    longBreakInterval: number,
}