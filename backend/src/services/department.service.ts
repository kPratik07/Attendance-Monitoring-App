import { UserModel } from '../models/user.model.js';
import { departments, MAX_ADMINS_PER_DEPARTMENT, MAX_STUDENTS_PER_DEPARTMENT } from '../constants/lookup.js';
import { type UserRole } from '../types/index.js';

export const getDepartments = () => departments;

export const canRegisterInDepartment = async (role: UserRole, department: string) => {
  const filter = role === 'admin' ? { role: 'admin', department } : { role: 'student', department };
  const count = await UserModel.countDocuments(filter);
  const limit = role === 'admin' ? MAX_ADMINS_PER_DEPARTMENT : MAX_STUDENTS_PER_DEPARTMENT;
  return { allowed: count < limit, count, limit };
};
