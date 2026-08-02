import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppUser = {
  id: string;
  email: string;
  role: 'student' | 'admin';
  name?: string;
  studentId?: string;
  accountId?: string;
  department?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  displayName: string;
  login: (user: AppUser, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseJwtPayload(token: string) {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const payload = decodeURIComponent(
      atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(payload) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenValid(token: string) {
  const payload = parseJwtPayload(token);
  return !!payload?.exp && Date.now() / 1000 < payload.exp;
}

function loadStoredAuth() {
  const storedToken = localStorage.getItem('attendance_access_token');
  const storedUser = localStorage.getItem('attendance_user');

  if (!storedToken || !storedUser || !isTokenValid(storedToken)) {
    localStorage.removeItem('attendance_access_token');
    localStorage.removeItem('attendance_user');
    return {
      token: null,
      user: null,
    };
  }

  return {
    token: storedToken,
    user: JSON.parse(storedUser) as AppUser,
  };
}

function computeDisplayName(user: AppUser | null) {
  if (!user) return '';
  const rawName = user.name || user.email || '';
  if (rawName && rawName !== 'Student User') {
    return rawName;
  }
  return user.email?.split('@')[0] ?? 'Student';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => loadStoredAuth().user);
  const [token, setToken] = useState<string | null>(() => loadStoredAuth().token);

  const login = (newUser: AppUser, newToken: string) => {
    localStorage.setItem('attendance_access_token', newToken);
    localStorage.setItem('attendance_user', JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('attendance_access_token');
    localStorage.removeItem('attendance_user');
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const handleStorage = () => {
      const storedAuth = loadStoredAuth();
      setUser(storedAuth.user);
      setToken(storedAuth.token);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const displayName = useMemo(() => computeDisplayName(user), [user]);

  const value = useMemo(
    () => ({ user, token, displayName, login, logout }),
    [user, token, displayName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
