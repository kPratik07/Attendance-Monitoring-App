import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], required: true, index: true },
    studentId: { type: String, index: true, sparse: true },
    accountId: { type: String, index: true, sparse: true },
    department: { type: String, index: true, sparse: true },
    resetPasswordToken: { type: String, index: true, sparse: true },
    resetPasswordExpiresAt: { type: Date, index: true, sparse: true },
    otpCode: { type: String, index: true, sparse: true },
    otpExpiresAt: { type: Date, index: true, sparse: true },
    profile: {
      phone: String,
      year: String,
    },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
