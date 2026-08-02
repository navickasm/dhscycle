import {getDbRun} from "../database.js";

export async function incrementCounter(): Promise<void> {
    const dbRun = getDbRun();
    try {
        await dbRun(`
            INSERT INTO analytics (name, value, date) 
            VALUES ('get_schedule_requests', 1, CURRENT_DATE) 
            ON CONFLICT (name, date) 
            DO UPDATE SET value = analytics.value + 1;
        `);
    } catch (error) {
        console.error('Error incrementing counter:', error);
    }
}
