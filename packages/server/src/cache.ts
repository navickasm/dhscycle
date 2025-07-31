import { getCentralTimeDateString } from '@/lib/utils.js';

interface ScheduleCache {
    schedule: string | null;
    timestamp: Date | null;
}

const scheduleCache: ScheduleCache = {
    schedule: null,
    timestamp: null
};

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
