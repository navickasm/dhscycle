import {DateTime} from 'luxon';
import {getDbRun} from "../database.js";

export async function populateDb(startDate: string, endDate: string): Promise<void> {
    try {
        const dbRun = getDbRun();

        const start = DateTime.fromISO(startDate, {zone: 'America/Chicago'}).startOf('day');
        const end = DateTime.fromISO(endDate, {zone: 'America/Chicago'}).startOf('day');

        for (let current = start; current <= end; current = current.plus({days: 1})) {
            const dayOfWeek = current.weekday;
            let regularity: string | null = null;
            switch (dayOfWeek) {
                case 1:
                    regularity = 'A';
                    break;
                case 2:
                    regularity = '16';
                    break;
                case 3:
                    regularity = '27';
                    break;
                case 4:
                    regularity = '38';
                    break;
                case 5:
                    regularity = '45';
                    break;
                default:
                    continue;
            }

            const dateStr = current.toISODate(); // Returns YYYY-MM-DD directly

            await dbRun(
                `INSERT INTO schedules (date, regularity) VALUES (?, ?) ON CONFLICT(date) DO NOTHING;`,
                [dateStr, regularity]
            );
        }
    } catch (error) {
        console.error(`Error populating db with default data from ${startDate} to ${endDate}:`, error);
    }
}
