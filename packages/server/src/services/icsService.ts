import ical, {ICalCalendar} from 'ical-generator';
import {getVtimezoneComponent} from '@touch4it/ical-timezones';
import {DateTime} from 'luxon';
import {getDb} from '../database.js';
import {parseScheduleData} from '../utils.js';
import {getCachedIcs, setCachedIcs} from './cacheService.js';
import {getYearForMonth} from './schoolYearService.js';

const TIMEZONE = 'America/Chicago';
const API_HOST = 'api.dhscycle.com';
const UID_DOMAIN = API_HOST;
const FEED_PATH = '/calendar.ics';

export interface IcsOptions {
    lunch?: 1 | 2 | 3;
    friLunch?: 'A' | 'B' | 'C';
    fri6?: 'A' | 'B';
    eb?: boolean;
    sc?: boolean;
}

interface IcsScheduleRow {
    date: string;
    regularity: string;
    special_schedule_name: string | null;
    schedule_json: string | null;
    calendar_events: string | null;
}

interface RegularScheduleRow {
    regularity: string;
    name: string | null;
    schedule_json: string | null;
}

export function icsVariantKey(options: IcsOptions): string {
    return `l${options.lunch ?? 'x'}-f${options.friLunch ?? 'x'}${options.fri6 ?? ''}-e${options.eb === false ? '0' : '1'}-s${options.sc === false ? '0' : '1'}`;
}

export function icsFeedUrl(options: IcsOptions): string {
    const params = new URLSearchParams();
    if (options.lunch !== undefined) params.set('lunch', String(options.lunch));
    if (options.friLunch !== undefined) params.set('friLunch', options.friLunch);
    if (options.fri6 !== undefined) params.set('fri6', options.fri6);
    if (options.eb !== undefined) params.set('eb', options.eb ? '1' : '0');
    if (options.sc !== undefined) params.set('sc', options.sc ? '1' : '0');
    const query = params.toString();
    return `https://${API_HOST}${FEED_PATH}${query ? `?${query}` : ''}`;
}

export function enumerateIcsVariants(): IcsOptions[] {
    const variants: IcsOptions[] = [{}]; // default: full feed
    for (const lunch of [1, 2, 3] as const) {
        for (const fri of [{friLunch: 'A', fri6: 'A'}, {friLunch: 'A', fri6: 'B'}, {friLunch: 'B'}, {friLunch: 'C'}] as const) {
            for (const eb of [true, false]) {
                for (const sc of [true, false]) {
                    variants.push({lunch, ...fri, eb, sc});
                }
            }
        }
    }
    return variants;
}

export function getIcsFeed(options: IcsOptions = {}): string {
    const key = icsVariantKey(options);
    const cached = getCachedIcs(key);
    if (cached !== undefined) {
        return cached;
    }

    const feed = buildIcsFeed(options);
    setCachedIcs(key, feed);
    return feed;
}

function buildIcsFeed(options: IcsOptions): string {
    const startYear = getYearForMonth(7);
    const rangeStart = `${startYear}-07-01`;
    const rangeEnd = `${startYear + 1}-06-30`;

    const rows = getDb().prepare<[string, string], IcsScheduleRow>(
        `SELECT date, regularity, special_schedule_name, schedule_json, calendar_events
         FROM schedules
         WHERE date BETWEEN ? AND ?
         ORDER BY date;`
    ).all(rangeStart, rangeEnd);

    const regularSchedules = new Map<string, RegularScheduleRow>();
    for (const row of getDb().prepare<[], RegularScheduleRow>(
        `SELECT regularity, name, schedule_json FROM regular_schedules;`
    ).all()) {
        regularSchedules.set(row.regularity, row);
    }

    const calendar = ical({
        name: 'DHS Cycle',
        prodId: {company: 'dhscycle.com', product: 'dhscycle', language: 'EN'},
        ttl: 60 * 60 * 12,
        source: icsFeedUrl(options),
        url: 'https://www.dhscycle.com',
    });
    calendar.timezone({name: TIMEZONE, generator: getVtimezoneComponent});

    for (const row of rows) {
        try {
            addEventsForDay(calendar, row, regularSchedules, options);
        } catch (error) {
            console.error(`Error building ICS events for ${row.date}:`, error);
        }
    }

    return calendar.toString();
}

function excludedPeriods(blockType: string, options: IcsOptions): Set<string> {
    const excluded = new Set<string>();

    if (blockType === 'friday') {
        if (options.friLunch === 'A') {
            excluded.add('LB').add('LC').add('3');
            excluded.add(options.fri6 === 'B' ? '6A' : '6B');
        } else if (options.friLunch === 'B') {
            excluded.add('LA').add('LC').add('6A');
        } else if (options.friLunch === 'C') {
            excluded.add('LA').add('LB').add('6B');
        }
    } else {
        if (options.lunch === 1) {
            excluded.add('L2').add('L3').add('4A').add('5A');
        } else if (options.lunch === 2) {
            excluded.add('L1').add('L3').add('4B').add('5A');
        } else if (options.lunch === 3) {
            excluded.add('L1').add('L2').add('4B').add('5B');
        }
    }

    return excluded;
}

function addEventsForDay(
    calendar: ICalCalendar,
    row: IcsScheduleRow,
    regularSchedules: Map<string, RegularScheduleRow>,
    options: IcsOptions
): void {
    if (row.regularity === 'no') {
        const reason = (row.special_schedule_name || 'No School').split('%%')[0];
        calendar.createEvent({
            id: uid(row.date, 'no-school'),
            start: DateTime.fromISO(row.date, {zone: TIMEZONE}),
            allDay: true,
            summary: `No School — ${reason}`,
            description: row.calendar_events ?? undefined,
        });
        return;
    }

    if (row.regularity === 's1finals' || row.regularity === 's2finals') {
        return;
    }

    let scheduleJson: string | null;
    let scheduleName: string;
    if (row.regularity === 'special') {
        scheduleJson = row.schedule_json;
        scheduleName = (row.special_schedule_name || 'Special Schedule').split('%%').join(' — ');
    } else {
        const regular = regularSchedules.get(row.regularity);
        scheduleJson = regular?.schedule_json ?? null;
        scheduleName = regular?.name || row.regularity;
    }

    if (!scheduleJson) return;

    const schedule = parseScheduleData(scheduleJson);
    if (!Array.isArray(schedule)) return;

    const description = row.calendar_events
        ? `${scheduleName}\n${row.calendar_events}`
        : scheduleName;

    for (const entry of schedule) {
        if (entry?.lunchBlock) {
            const excluded = excludedPeriods(entry.type ?? 'normal', options);
            for (const period of entry.periods ?? []) {
                if (excluded.has(period?.period)) continue;
                addPeriodEvent(calendar, row.date, period, description);
            }
            for (const lunch of entry.lunches ?? []) {
                if (excluded.has(lunch?.period)) continue;
                addPeriodEvent(calendar, row.date, lunch, description);
            }
        } else if (entry?.period) {
            if (options.eb === false && entry.period === 'EB') continue;
            if (options.sc === false && entry.period === 'SC') continue;
            addPeriodEvent(calendar, row.date, entry, description);
        }
    }
}

function addPeriodEvent(
    calendar: ICalCalendar,
    date: string,
    period: {period: string; start: string; end: string},
    description: string
): void {
    if (!period?.period || !period.start || !period.end) return;

    const start = DateTime.fromISO(`${date}T${period.start}`, {zone: TIMEZONE});
    const end = DateTime.fromISO(`${date}T${period.end}`, {zone: TIMEZONE});
    if (!start.isValid || !end.isValid) return;

    calendar.createEvent({
        id: uid(date, period.period),
        start,
        end,
        timezone: TIMEZONE,
        summary: periodDisplayName(period.period),
        description,
    });
}

function periodDisplayName(period: string): string {
    switch (period) {
        case 'EB': return 'Early Bird';
        case 'SC': return 'Staff Collab';
        case 'HR': return 'Homeroom';
        case 'FO': return 'Orientation';
    }
    if (period.startsWith('L') && period.length <= 2) {
        return `Lunch ${period.substring(1)}`;
    }
    return `Period ${period}`;
}

function uid(date: string, key: string): string {
    const safeKey = key.replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
    return `${date}-${safeKey}@${UID_DOMAIN}`;
}
