import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { createAccessToken, createPasswordResetToken, createUserAccount, resetPasswordWithToken, verifyUserCredentials } from '../services/auth.service.js';
import { canRegisterInDepartment } from '../services/department.service.js';
import { departments } from '../constants/lookup.js';
import { ok } from '../utils/response.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'admin']).default('student'),
  department: z.enum(departments),
});

type SignupPayload = z.infer<typeof signupSchema>;

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid signup payload' });
    return;
  }

  const payload = parsed.data as SignupPayload;
  const departmentCheck = await canRegisterInDepartment(payload.role, payload.department);
  if (!departmentCheck.allowed) {
    res.status(403).json({
      success: false,
      message: payload.role === 'admin'
        ? `Registration closed for ${payload.department} admins (max ${departmentCheck.limit}).`
        : `Registration closed for ${payload.department} students (max ${departmentCheck.limit}).`,
    });
    return;
  }

  const result = await createUserAccount(payload);

  if (result.status === 'exists') {
    res.status(409).json({ success: false, message: 'An account with this email already exists' });
    return;
  }

  const token = createAccessToken({
    id: result.user.id,
    email: result.user.email,
    role: result.user.role,
    name: result.user.name,
    accountId: result.user.accountId ?? undefined,
    department: result.user.department ?? undefined,
  });

  res.json(
    ok(
      {
        token,
        user: result.user,
      },
      'Account created successfully',
    ),
  );
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid login payload' });
    return;
  }

  const { email, password } = parsed.data;
  const verifiedUser = await verifyUserCredentials(email, password);

  if (!verifiedUser) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = createAccessToken({
    id: verifiedUser.id,
    email: verifiedUser.email,
    role: verifiedUser.role,
    name: verifiedUser.name,
    accountId: verifiedUser.accountId ?? undefined,
    department: verifiedUser.department ?? undefined,
  });

  res.json(
    ok(
      {
        token,
        user: {
          id: verifiedUser.id,
          name: verifiedUser.name,
          email: verifiedUser.email,
          role: verifiedUser.role,
          accountId: verifiedUser.accountId,
          department: verifiedUser.department,
        },
      },
      'Login successful',
    ),
  );
});

router.post('/forgot-password', async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid email address' });
    return;
  }

  const resetPayload = await createPasswordResetToken(parsed.data.email);

  if (!resetPayload) {
    res.json(ok(null, 'If the account exists, password reset instructions have been sent.'));
    return;
  }

  res.json(ok(null, 'Password reset instructions have been sent.'));
});

router.post('/reset-password', async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      otp: z.string().min(4),
      password: z.string().min(6),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid reset payload' });
    return;
  }

  const isUpdated = await resetPasswordWithToken(parsed.data.email, parsed.data.otp, parsed.data.password);

  if (!isUpdated) {
    res.status(400).json({ success: false, message: 'OTP is invalid or has expired' });
    return;
  }

  res.json(ok(null, 'Password reset successful'));
});

router.get('/me', requireAuth, (req, res) => {
  res.json(ok({ user: req.user }, 'Authenticated user info'));
});

export { router as authRoutes };
