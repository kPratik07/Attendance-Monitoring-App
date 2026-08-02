import type { Model } from 'mongoose';
import type { AttendanceDocument } from '../models/attendance.model.js';

const memoryAttendanceRecords: Array<{
  student: string;
  date: string;
  status: string;
  distanceMeters: number;
}> = [];

export const duplicateAttendanceExists = async (
  AttendanceModel: Model<AttendanceDocument>,
  studentId: string,
  date: string,
) => {
  try {
    const record = await AttendanceModel.findOne({ student: studentId, date }).lean();
    if (!record) return false;
    return record.status !== 'out_of_range';
  } catch {
    return memoryAttendanceRecords.some((entry) => entry.student === studentId && entry.date === date && entry.status !== 'out_of_range');
  }
};

export const saveAttendanceRecord = async (
  AttendanceModel: Model<AttendanceDocument>,
  record: Omit<AttendanceDocument, '_id' | 'createdAt' | 'updatedAt'>,
) => {
  try {
    return await AttendanceModel.create(record);
  } catch {
    memoryAttendanceRecords.push({
      student: String(record.student),
      date: String(record.date),
      status: String(record.status),
      distanceMeters: Number(record.distanceMeters ?? 0),
    });
    return record;
  }
};
