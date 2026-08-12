import {getDb} from "../database.js";

export function incrementTodayRequestCount(): void {
    try {
        getDb().prepare(`
            INSERT INTO analytics (name, value, date)
            VALUES ('get_schedule_requests', 1, CURRENT_DATE)
            ON CONFLICT (name, date)
            DO UPDATE SET value = analytics.value + 1;
        `).run();
    } catch (error) {
        console.error('Error incrementing counter:', error);
    }
}

export function incrementFutureRequestCount(): void {
    try {
        getDb().prepare(`
            INSERT INTO analytics (name, value, date)
            VALUES ('get_future_schedule_requests', 1, CURRENT_DATE)
            ON CONFLICT (name, date)
            DO UPDATE SET value = analytics.value + 1;
        `).run();
    } catch (error) {
        console.error('Error incrementing counter:', error);
    }
}
