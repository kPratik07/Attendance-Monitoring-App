import { Router } from 'express';
import { z } from 'zod';
import { AttendanceModel } from '../models/attendance.model.js';
import { CollegeModel } from '../models/college.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { UserModel } from '../models/user.model.js';
import { requireAuth } from '../middleware/auth.js';
import { duplicateAttendanceExists, saveAttendanceRecord } from '../services/attendance.service.js';
import { AttendanceCity, findNearestCity } from '../utils/geolocation.js';
import { ATTENDANCE_CITY_RADIUS_METERS, isAttendanceDayAllowed } from '../constants/lookup.js';
import { attendanceCities } from '../constants/lookup.js';
import { ok } from '../utils/response.js';

const router = Router();

const createNotification = async (recipientId: string, message: string) => {
  await NotificationModel.create({
    recipient: recipientId,
    type: 'system',
    message,
  });
};

const notifyDepartmentAdmins = async (department: string | null | undefined, message: string) => {
  const admins = await UserModel.find({ role: 'admin', department: department ?? undefined }).select('_id').lean();
  await Promise.all(admins.map((admin) => createNotification(admin._id.toString(), message)));
};

const resolveAttendanceCollege = async (city: AttendanceCity) => {
  const existingCollege = await CollegeModel.findOne().sort({ createdAt: 1 }).lean();

  if (existingCollege?._id) {
    return existingCollege._id;
  }

  const createdCollege = await CollegeModel.create({
    name: `${city.name} Attendance Center`,
    latitude: city.latitude,
    longitude: city.longitude,
    allowedRadiusMeters: ATTENDANCE_CITY_RADIUS_METERS,
    address: `${city.name}, ${city.state}`,
  });

  return createdCollege._id;
};

const markAttendanceSchema = z.object({
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  browser: z.string().optional(),
  device: z.string().optional(),
  os: z.string().optional(),
});

router.use(requireAuth);

router.get('/profile', async (req, res) => {
  try {
    const user = await UserModel.findById(req.user!.id).select('name email role').lean();
    const displayName = user?.name || req.user?.name || req.user?.email || 'Student';

    res.json(
      ok(
        {
          id: req.user?.id,
          email: user?.email || req.user?.email,
          role: user?.role || req.user?.role,
          name: displayName,
        },
        'Student profile fetched',
      ),
    );
  } catch {
    res.json(
      ok(
        {
          id: req.user?.id,
          email: req.user?.email,
          role: req.user?.role,
          name: req.user?.name || req.user?.email || 'Student',
        },
        'Student profile fetched',
      ),
    );
  }
});

router.get('/history', async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
    const startDateString = startDate.toISOString().slice(0, 10);
    const endDateString = today.toISOString().slice(0, 10);

    const history = await AttendanceModel.find({
      student: req.user!.id,
      date: { $gte: startDateString, $lte: endDateString },
    })
      .sort({ date: 1, createdAt: -1 })
      .select('date status checkInTime')
      .lean();

    const historyByDate = new Map(history.map((record) => [record.date, record]));
    const monthHistory = Array.from({ length: 30 }, (_, index) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + index);
      const dateKey = day.toISOString().slice(0, 10);
      const record = historyByDate.get(dateKey);

      return {
        id: record?._id?.toString() ?? `${req.user!.id}-${dateKey}`,
        date: dateKey,
        status: record?.status ?? 'absent',
        checkInTime: record?.checkInTime?.toISOString(),
      };
    });

    res.json(ok(monthHistory, 'Attendance history fetched'));
  } catch {
    res.json(ok([], 'Attendance history fetched'));
  }
});

router.post('/mark-attendance', async (req, res) => {
  const parsed = markAttendanceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    return;
  }

  const { latitude, longitude, userAgent, ipAddress, browser, device, os } = parsed.data;
  const targetLocation = { latitude, longitude };
  const nearest = findNearestCity(targetLocation, attendanceCities);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const currentHour = now.getHours();
  const inTimeWindow = currentHour >= 9 && currentHour < 12;
  const student = await UserModel.findById(req.user!.id).select('name email department').lean();
  const existingRecord = await AttendanceModel.findOne({ student: req.user!.id, date: today });
  const studentName = student?.name ?? student?.email ?? req.user!.email;

  if (!isAttendanceDayAllowed(now)) {
    res.status(403).json({
      success: false,
      message: 'Attendance can be marked only from Monday to Saturday, excluding national holidays.',
    });
    return;
  }

  if (existingRecord && existingRecord.status !== 'out_of_range') {
    res.status(409).json({ success: false, message: 'Your attendance has already been marked for today.' });
    return;
  }

  const attendanceCollegeId = await resolveAttendanceCollege(nearest.city);

  if (nearest.distanceMeters > ATTENDANCE_CITY_RADIUS_METERS) {
    res.status(403).json({
      success: false,
      message: `You are outside the allowed city range. Please move into the city area near ${nearest.city.name}, ${nearest.city.state}, then try again.`,
      data: {
        nearestCity: nearest.city,
        distanceMeters: Math.round(nearest.distanceMeters),
      },
    });
    return;
  }

  const attendanceStatus = inTimeWindow ? 'present' : 'late';
  const attendanceMessage = attendanceStatus === 'late'
    ? 'Attendance marked late because you checked in after the standard window.'
    : 'Attendance marked successfully while you are in range.';

  let savedAttendance;
  if (existingRecord) {
    existingRecord.status = attendanceStatus;
    existingRecord.cityName = nearest.city.name;
    existingRecord.distanceMeters = Math.round(nearest.distanceMeters);
    existingRecord.checkInTime = new Date();
    existingRecord.deviceInfo = {
      browser,
      device,
      os,
      userAgent,
    };
    existingRecord.ipAddress = ipAddress;
    existingRecord.location = {
      latitude,
      longitude,
    };
    savedAttendance = await existingRecord.save();
  } else {
    savedAttendance = await AttendanceModel.create({
      student: req.user!.id,
      college: attendanceCollegeId,
      date: today,
      status: attendanceStatus,
      cityName: nearest.city.name,
      checkInTime: new Date(),
      distanceMeters: Math.round(nearest.distanceMeters),
      deviceInfo: {
        browser,
        device,
        os,
        userAgent,
      },
      ipAddress,
      location: {
        latitude,
        longitude,
      },
    } as never);
  }

  const departmentNotificationMessage = attendanceStatus === 'late'
    ? `Student ${studentName} has checked in late today.`
    : `Student ${studentName} has marked attendance successfully today.`;

  if (attendanceStatus === 'present' || attendanceStatus === 'late') {
    await notifyDepartmentAdmins(student?.department, departmentNotificationMessage);
  }

  await createNotification(req.user!.id, attendanceMessage);

  res.json(
    ok(
      {
        attendance: savedAttendance,
        distanceMeters: Math.round(nearest.distanceMeters),
        status: 'marked',
      },
      'Attendance marked successfully',
    ),
  );
});

export { router as studentRoutes };
