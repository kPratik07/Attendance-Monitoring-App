export type UserRole = 'student' | 'admin';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email: string;
  name?: string;
  accountId?: string;
  department?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
