export type ScheduleType = 'A' | '16' | '27' | '38' | '45' | 'other';
export type StartTime = '8:20' | '8:40' | 'other';

export type CalendarCells =
    | { // Yes school
    date: string;
    startTime: StartTime;
    specialNote?: string;
    specialModifications?: string[];
    scheduleType: ScheduleType;
    isSpecial?: boolean;
    isNoSchool?: false;
    noSchoolReason?: never;
}
    | { // No school
    date: string;
    startTime?: never;
    specialNote?: string;
    specialModifications?: string[];
    isSpecial?: never;
    scheduleType?: never;
    isNoSchool: true;
    noSchoolReason?: string;
};
