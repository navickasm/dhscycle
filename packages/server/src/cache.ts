import { getCentralTimeDateString } from './lib/utils.js';

interface ScheduleCache {
    schedule: string | null;
    timestamp: Date | null;
}

const scheduleCache: ScheduleCache = (() => {
    let _schedule: string | null = null;

    return {
        get schedule() {
            return _schedule;
        },
        set schedule(value: string | null) {
            _schedule = value;
            this.timestamp = value ? new Date(Date.now()) : null;
        },
        timestamp: null
    };
})();

function isCacheValid(): boolean {
    if (scheduleCache.schedule === null || scheduleCache.timestamp === null) return false;
    const currentCentralDayStr = getCentralTimeDateString(new Date());
    const cachedDateCentralDayStr = getCentralTimeDateString(scheduleCache.timestamp);
    return cachedDateCentralDayStr === currentCentralDayStr;
}

function invalidateCache(): void {
    scheduleCache.schedule = null;
    scheduleCache.timestamp = null;
    console.log("Cache invalidated by admin request.");
}

export { scheduleCache, isCacheValid, invalidateCache };
