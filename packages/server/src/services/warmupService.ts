import {getCentralTimeDateString} from '../utils.js';
import {registerCacheWarmer} from './cacheService.js';
import {getBellScheduleForDate} from './scheduleService.js';
import {getWeekNames} from './weekService.js';
import {getCalendarForMonth} from './calendarService.js';

export function warmCaches(): void {
    const todayStr = getCentralTimeDateString(new Date());
    const currentMonth = parseInt(todayStr.split('-')[1], 10);

    try {
        getBellScheduleForDate(todayStr);
        getWeekNames(todayStr);
        getCalendarForMonth(currentMonth);
        console.log(`Caches warmed for ${todayStr}`);
    } catch (error) {
        console.error('Error warming caches:', error);
    }
}

export function setupCacheWarming(): void {
    registerCacheWarmer(warmCaches);
    warmCaches();
}
