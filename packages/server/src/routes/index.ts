import {Router} from 'express';

import scheduleRouter from './schedule.js';
import calendarRouter from './calendar.js';
import adminRouter from './admin.js';
import publicRouter from './public.js';

const router = Router();

router.use(scheduleRouter);
router.use(calendarRouter);
router.use(adminRouter);
router.use(publicRouter);

export default router;
