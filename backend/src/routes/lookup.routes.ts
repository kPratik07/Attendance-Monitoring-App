import { Router } from 'express';
import { ok } from '../utils/response.js';
import { getDepartments } from '../services/department.service.js';
import { attendanceCities } from '../constants/lookup.js';

const router = Router();

router.get('/departments', (_req, res) => {
  res.json(ok(getDepartments(), 'Departments fetched successfully'));
});

router.get('/cities', (_req, res) => {
  res.json(ok(attendanceCities, 'Attendance cities fetched successfully'));
});

export { router as lookupRoutes };
