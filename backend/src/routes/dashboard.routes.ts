import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../utils/response.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', (_req, res) => {
  res.json(
    ok(
      {
        attendanceRate: '92%',
        presentToday: 18,
        absentToday: 2,
      },
      'Dashboard summary fetched',
    ),
  );
});

export { router as dashboardRoutes };
