import { hashPassword } from '../services/auth.service.js';
import { UserModel } from '../models/user.model.js';
import { departments } from '../constants/lookup.js';

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

export const seedData = async () => {
  const passwordHash = await hashPassword('Password123');

  let totalInserted = 0;

  for (const department of departments) {
    const existingStudents = await UserModel.find({ role: 'student', department }).select('email accountId').lean();
    const existingEmails = new Set(existingStudents.map((student) => student.email));
    const existingAccountIds = new Set(existingStudents.map((student) => student.accountId).filter(Boolean));
    const departmentCode = getDepartmentCode(department);

    const targetCount = 5;
    const studentsToCreate = [];
    let position = 1;

    while (studentsToCreate.length < Math.max(0, targetCount - existingStudents.length)) {
      const email = `student.${departmentCode.toLowerCase()}.${position}@example.com`;
      const accountId = generateAccountId(departmentCode, position);

      if (!existingEmails.has(email) && !existingAccountIds.has(accountId)) {
        studentsToCreate.push({
          name: `${departmentCode} Student ${position}`,
          email,
          passwordHash,
          role: 'student',
          department,
          studentId: generateStudentId(departmentCode, position),
          accountId,
        });
        existingEmails.add(email);
        existingAccountIds.add(accountId);
      }

      position += 1;
    }

    if (studentsToCreate.length > 0) {
      try {
        const created = await UserModel.insertMany(studentsToCreate, { ordered: false });
        totalInserted += created.length;
      } catch (error) {
        console.warn('Seed warning: some dummy students could not be inserted:', error instanceof Error ? error.message : error);
      }
    }
  }

  if (totalInserted > 0) {
    console.log(`Seeded ${totalInserted} dummy student records.`);
  } else {
    console.log('No additional dummy students were required.');
  }
};
