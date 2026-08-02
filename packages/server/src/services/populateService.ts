import {DateTime} from 'luxon';
import {getDbRun} from "../database.js";

export async function populateDb(startDate: string, endDate: string): Promise<void> {
    try {
        const dbRun = getDbRun();

        const start = DateTime.fromISO(startDate).setZone('America/Chicago').toJSDate();
        const end = DateTime.fromISO(endDate).setZone('America/Chicago').toJSDate();

        for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
            const dayOfWeek = current.getDay();
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

            const dateStr = current.toISOString().split('T')[0];

            await dbRun(
                `INSERT INTO schedules (date, regularity) VALUES (?, ?) ON CONFLICT(date) DO NOTHING;`,
                [dateStr, regularity]
            );
        }
    } catch (error) {
        console.error(`Error populating db with default data from ${startDate} to ${endDate}:`, error);
    }
}
