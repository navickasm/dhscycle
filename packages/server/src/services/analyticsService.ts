import {getDb} from "../database.js";

export const ANALYTICS_TYPES = ['today', 'future', 'ics'] as const;
export type AnalyticsType = (typeof ANALYTICS_TYPES)[number];

export interface AnalyticsOptions {
    types: AnalyticsType[];
    startDate: string;
    endDate: string;
}

const analyticsTypeToDatabaseNamespace: Record<AnalyticsType, string> = {
    "today": "get_schedule_requests",
    "future": "get_future_schedule_requests",
    "ics": "get_ics_requests"
};

type CompositeAnalyticsKey = `${string}::${string}`;

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

export function incrementIcsRequestCount(): void {
    try {
        getDb().prepare(`
            INSERT INTO analytics (name, value, date)
            VALUES ('get_ics_requests', 1, CURRENT_DATE)
            ON CONFLICT (name, date)
            DO UPDATE SET value = analytics.value + 1;
        `).run();
    } catch (error) {
        console.error('Error incrementing ics counter:', error);
    }
}

export function getAnalytics(opt: AnalyticsOptions): Record<CompositeAnalyticsKey, number>[] {
    const results: Record<CompositeAnalyticsKey, number>[] = [];
    const namespaces = opt.types.map(type => analyticsTypeToDatabaseNamespace[type]);

    if (namespaces.length == 0) {
        return results;
    }

    const placeholders = namespaces.map(() => "?").join(", ");
    const query = `
        SELECT name, date, value
        FROM analytics
        WHERE name IN (${placeholders}) AND date BETWEEN ? AND ?
    `;
    const rows = getDb().prepare(query).all(...namespaces, opt.startDate, opt.endDate);
    for (const row of rows as Array<{ name: string, date: string; value: number }>) {
        results.push({ [`${row.name}::${row.date}`]: row.value });
    }

    return results;
}
