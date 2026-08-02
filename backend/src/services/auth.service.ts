import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { type UserRole } from '../types/index.js';

interface AuthenticatedUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  accountId?: string;
  department?: string;
}

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const createUserAccount = async (payload: { name: string; email: string; password: string; role: UserRole; department: string }) => {
  const normalizedEmail = payload.email.toLowerCase();

  const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    return { status: 'exists' as const };
  }

  const passwordHash = await hashPassword(payload.password);
  const departmentCode = payload.department
    .split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 3)
    .padEnd(3, 'X');

  const idSuffix = `${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedAccountId = `${departmentCode}-${payload.role === 'admin' ? 'ADM' : 'STU'}-${idSuffix}`;

  const user = await UserModel.create({
    name: payload.name,
    email: normalizedEmail,
    passwordHash,
    role: payload.role,
    accountId: generatedAccountId,
    department: payload.department,
  });

  return {
    status: 'created' as const,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      accountId: user.accountId,
      department: user.department,
    },
  };
};

export const comparePassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);

export const createAccessToken = (payload: { id: string; email: string; role: UserRole; name?: string; accountId?: string; department?: string }) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const createPasswordResetToken = async (email: string) => {
  const normalizedEmail = email.toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail }).select('_id email').lean();

  if (!user) {
    return null;
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        otpCode,
        otpExpiresAt: expiresAt,
      },
      $unset: {
        resetPasswordToken: '',
        resetPasswordExpiresAt: '',
      },
    },
  );

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: normalizedEmail,
      subject: 'Attendance Monitor – Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset OTP</h2>
          <p>Use the code below to reset your account password:</p>
          <p><strong>${otpCode}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.warn('Password reset email could not be sent:', (error as Error).message);
  }

  return { otpCode, expiresAt };
};

export const resetPasswordWithToken = async (email: string, otp: string, password: string) => {
  const normalizedEmail = email.toLowerCase();
  const user = await UserModel.findOne({
    email: normalizedEmail,
    otpCode: otp,
    otpExpiresAt: { $gt: new Date() },
  }).select('_id passwordHash').lean();

  if (!user) {
    return false;
  }

  const passwordHash = await hashPassword(password);
  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash },
      $unset: { otpCode: '', otpExpiresAt: '' },
    },
  );

  return true;
};

export const verifyUserCredentials = async (email: string, password: string): Promise<AuthenticatedUserRecord | null> => {
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await UserModel.findOne({ email: normalizedEmail }).lean();

    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.passwordHash,
      accountId: user.accountId ?? undefined,
      department: user.department ?? undefined,
    };
  } catch {
    return null;
  }
};
