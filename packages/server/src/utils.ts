export function getCentralTimeDateString(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Chicago'
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    let year = '';
    let month = '';
    let day = '';
    for (const part of parts) {
        if (part.type === 'year') year = part.value;
        if (part.type === 'month') month = part.value;
        if (part.type === 'day') day = part.value;
    }
    return `${year}-${month}-${day}`;
}

export function parseScheduleData(scheduleData: string): any {
    try {
        return JSON.parse(scheduleData.replace(/\\"/g, '"'));
    } catch (err: unknown) {
        throw new Error(`Invalid JSON string: ${err}`);
    }
}