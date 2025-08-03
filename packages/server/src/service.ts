import {getDbGet} from "./database.js";

async function fetchScheduleFromDb(dateStr: string): Promise<string | null> {
    try {
        const dbGet = getDbGet();
        const row = await dbGet(
            `SELECT
                CASE
                    WHEN s.regularity != 'special'
                    THEN (
                        SELECT rs.schedule_json
                        FROM regular_schedules rs
                        WHERE rs.regularity = s.regularity
                    )
                    END AS schedule_json
            FROM schedules s
            WHERE s.date = ?;`,
            [dateStr]
        );

        if (row && row.schedule_json) {
            let scheduleData = row.schedule_json;

            if (typeof scheduleData === 'string') {
                try {
                    const unescapedString = scheduleData.replace(/\\"/g, '"');
                    const parsed = JSON.parse(unescapedString);
                    return JSON.stringify(parsed);
                } catch (secondParseError) {
                    console.error(`Invalid JSON string from DB for ${dateStr}`, scheduleData, secondParseError);
                    return null;
                }
            }
        }
        return null;
    } catch (error) {
        console.error(`Error fetching schedule for ${dateStr} from DB:`, error);
        return null;
    }
}

export { fetchScheduleFromDb };
