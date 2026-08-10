import {DateTime} from 'luxon';

function compute(): number {
    const now = DateTime.now().setZone('America/Chicago');
    return now.month >= 7 ? now.year : now.year - 1;
}

let startYear = compute();

export function recomputeSchoolYear(): void {
    startYear = compute();
}

export function getYearForMonth(month: number): number {
    return month >= 7 ? startYear : startYear + 1;
}
