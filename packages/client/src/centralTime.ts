const FLIP_HOUR_CT = 16;

// en-CA yields YYYY-MM-DD
const ctDateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

const ctTimeFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

export function centralDateStr(d: Date = new Date()): string {
    return ctDateFmt.format(d);
}

export function centralSecondsOfDay(d: Date = new Date()): number {
    const parts = ctTimeFmt.formatToParts(d);
    const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
    return get('hour') * 3600 + get('minute') * 60 + get('second');
}

export function addDaysToDateStr(dateStr: string, days: number): string {
    const d = new Date(`${dateStr}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
}

export function displayDateStr(d: Date = new Date()): string {
    const date = centralDateStr(d);
    return centralSecondsOfDay(d) >= FLIP_HOUR_CT * 3600 ? addDaysToDateStr(date, 1) : date;
}
