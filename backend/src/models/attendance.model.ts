import { Schema, model, type InferSchemaType } from 'mongoose';

const attendanceSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'out_of_range', 'duplicate_attempt'],
      required: true,
    },
    cityName: { type: String },
    checkInTime: { type: Date },
    distanceMeters: { type: Number, default: 0 },
    deviceInfo: {
      browser: String,
      device: String,
      os: String,
      userAgent: String,
    },
    ipAddress: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true },
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

export type AttendanceDocument = InferSchemaType<typeof attendanceSchema>;

export const AttendanceModel = model('Attendance', attendanceSchema);
