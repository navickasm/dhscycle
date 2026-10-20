import {DateTime} from 'luxon';
import {getDb} from "../database.js";

export function populateDb(startDate: string, endDate: string): void {
    const db = getDb();

    const start = DateTime.fromISO(startDate, {zone: 'America/Chicago'}).startOf('day');
    const end = DateTime.fromISO(endDate, {zone: 'America/Chicago'}).startOf('day');

    const insert = db.prepare(
        `INSERT INTO schedules (date, regularity) VALUES (?, ?) ON CONFLICT(date) DO NOTHING;`
    );

    const insertRange = db.transaction(() => {
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

            insert.run(current.toISODate(), regularity);
        }
    });

    insertRange();
}
