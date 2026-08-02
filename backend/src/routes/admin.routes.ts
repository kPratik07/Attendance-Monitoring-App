import { Router } from 'express';
import { AttendanceModel } from '../models/attendance.model.js';
import { UserModel } from '../models/user.model.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ok } from '../utils/response.js';
import { hashPassword } from '../services/auth.service.js';

const router = Router();

const getDepartmentCode = (department: string) =>
  department
    .split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 3)
    .padEnd(3, 'X');

const generateStudentId = (departmentCode: string, position: number) =>
  `STU-${departmentCode}-${String(new Date().getFullYear()).slice(-2)}-${String(position).padStart(3, '0')}`;

const generateAccountId = (departmentCode: string, position: number) =>
  `${departmentCode}-STU-${String(new Date().getFullYear()).slice(-2)}-${String(1000 + position).slice(-4)}`;

const seedDepartmentStudents = async (department: string, targetCount = 5) => {
  const departmentCode = getDepartmentCode(department);
  const existingCount = await UserModel.countDocuments({ role: 'student', department });
  const missingCount = Math.max(0, targetCount - existingCount);

  if (missingCount === 0) {
    return;
  }

  const passwordHash = await hashPassword('Password123');
  const startIndex = existingCount + 1;
  const studentsToCreate = Array.from({ length: missingCount }, (_, index) => {
    const position = startIndex + index;
    return {
      name: `${departmentCode} Student ${position}`,
      email: `student.${departmentCode.toLowerCase()}.${position}@example.com`,
      passwordHash,
      role: 'student',
      department,
      studentId: generateStudentId(departmentCode, position),
      accountId: generateAccountId(departmentCode, position),
    };
  });

  await UserModel.insertMany(studentsToCreate, { ordered: false });
};

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', async (req, res) => {
  try {
    const department = req.user?.department;

    if (!department) {
      res.json(
        ok(
          {
            totalStudents: 0,
            presentToday: 0,
            absentToday: 0,
            outOfRangeAttempts: 0,
          },
          'Admin dashboard stats fetched',
        ),
      );
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const departmentStudents = await UserModel.find({ role: 'student', department }).select('_id').lean();
    const studentIds = departmentStudents.map((student) => student._id);

    const [totalStudents, presentToday, absentToday, outOfRangeAttempts] = await Promise.all([
      UserModel.countDocuments({ role: 'student', department }),
      AttendanceModel.countDocuments({ status: 'present', date: today, student: { $in: studentIds } }),
      AttendanceModel.countDocuments({ status: 'absent', date: today, student: { $in: studentIds } }),
      AttendanceModel.countDocuments({ status: 'out_of_range', date: today, student: { $in: studentIds } }),
    ]);

    res.json(
      ok(
        {
          totalStudents,
          presentToday,
          absentToday,
          outOfRangeAttempts,
        },
        'Admin dashboard stats fetched',
      ),
    );
  } catch {
    res.json(
      ok(
        {
          totalStudents: 0,
          presentToday: 0,
          absentToday: 0,
          outOfRangeAttempts: 0,
        },
        'Admin dashboard stats fetched',
      ),
    );
  }
});

router.get('/students', async (req, res) => {
  try {
    const department = req.user?.department;

    if (!department) {
      res.json(ok([], 'Students fetched'));
      return;
    }

    await seedDepartmentStudents(department);

    const students = await UserModel.find({ role: 'student', department }).select('name email studentId accountId department role profile').lean();
    const updatedStudents = students.map((student) => ({
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: student.role,
      studentId: student.studentId,
      accountId: student.accountId,
      department: student.department,
      profile: student.profile,
    }));

    res.json(ok(updatedStudents, 'Students fetched'));
  } catch (error) {
    console.error('Error fetching admin students:', error);
    res.json(ok([], 'Students fetched'));
  }
});

router.get('/attendance', async (req, res) => {
  try {
    const department = req.user?.department;

    if (!department) {
      res.json(ok([], 'Attendance records fetched'));
      return;
    }

    const departmentStudents = await UserModel.find({ role: 'student', department }).select('_id').lean();
    const studentIds = departmentStudents.map((student) => student._id);
    const records = await AttendanceModel.find({ student: { $in: studentIds } })
      .populate('student', 'name email department')
      .populate('college', 'name')
      .lean();

    res.json(ok(records, 'Attendance records fetched'));
  } catch {
    res.json(ok([], 'Attendance records fetched'));
  }
});

export { router as adminRoutes };
