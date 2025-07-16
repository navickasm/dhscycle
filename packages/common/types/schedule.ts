import { Period } from '../enums/period.js';
import type { DateTime } from "luxon";

export type Schedule = Record<Period, [DateTime, DateTime]>;