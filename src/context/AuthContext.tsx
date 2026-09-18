'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Verifies a plain password against a stored password (bcrypt hash or plain text).
 */
export function verifyPassword(plainPassword: string, storedPasswordOrHash?: string | null): boolean {
  if (!plainPassword || !storedPasswordOrHash) return false;

  const trimmedStored = storedPasswordOrHash.trim();

  // If stored value is a standard bcrypt hash ($2a$, $2b$, or $2y$)
  if (
    trimmedStored.startsWith('$2a$') ||
    trimmedStored.startsWith('$2b$') ||
    trimmedStored.startsWith('$2y$')
  ) {
    try {
      return bcrypt.compareSync(plainPassword, trimmedStored);
    } catch (err) {
      console.warn('Bcrypt compare failed:', err);
      return false;
    }
  }

  // Fallback: plain text comparison
  return plainPassword === trimmedStored;
}

/**
 * Hashes a plain password using bcrypt (10 rounds).
 */
export function hashPassword(plainPassword: string): string {
  return bcrypt.hashSync(plainPassword.trim(), 10);
}

export type UserRole = 'admin' | 'delivery' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt?: string;
}

// 7 Weeks = 49 Days session duration (4,233,600 seconds)
export const ADMIN_SESSION_WEEKS = 7;
export const ADMIN_SESSION_DAYS = 49;
export const ADMIN_SESSION_DURATION_MS = 49 * 24 * 60 * 60 * 1000;
export const ADMIN_SESSION_DURATION_SEC = 49 * 24 * 60 * 60;

export interface AuthSession {
  user: User;
  createdAt: number;
  expiresAt: number; // timestamp in ms
  durationDays: number;
}

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  sessionExpiresAt: number | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback((redirectTo?: string) => {
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('electronics_auth_user');
        localStorage.removeItem('electronics_auth_session');
        localStorage.removeItem('electronics_admin_auth');
        document.cookie = 'electronics_session_role=; max-age=0; path=/; SameSite=Lax';
        document.cookie = 'electronics_session_expires=; max-age=0; path=/; SameSite=Lax';
      } catch (e) {
        console.warn('Logout cleanup error', e);
      }
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    }
  }, []);

  // Load session from localStorage with 7-week validity check on mount
  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('electronics_auth_session');
      const userStr = localStorage.getItem('electronics_auth_user');

      let currentSession: AuthSession | null = null;

      if (sessionStr) {
        currentSession = JSON.parse(sessionStr);
      } else if (userStr) {
        // Migration: ensure user has 7 weeks active session
        const parsed = JSON.parse(userStr);
        if (parsed && parsed.email && parsed.role) {
          const now = Date.now();
          currentSession = {
            user: parsed,
            createdAt: now,
            expiresAt: now + ADMIN_SESSION_DURATION_MS,
            durationDays: ADMIN_SESSION_DAYS,
          };
          localStorage.setItem('electronics_auth_session', JSON.stringify(currentSession));
        }
      }

      if (currentSession && currentSession.user && currentSession.expiresAt) {
        // Check 7-week expiration
        if (Date.now() > currentSession.expiresAt) {
          console.warn('Session expired after 7 weeks');
          logout();
        } else {
          setUser(currentSession.user);
          setSession(currentSession);
          if (currentSession.user.role === 'admin') {
            localStorage.setItem('electronics_admin_auth', 'true');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const login = useCallback(
    async (
      emailInput: string,
      passwordInput: string
    ): Promise<{ success: boolean; error?: string; user?: User }> => {
      const email = emailInput.trim().toLowerCase();
      const password = passwordInput.trim();

      if (!email || !password) {
        return {
          success: false,
          error: 'Veuillez saisir votre email et mot de passe / يرجى إدخال البريد وكلمة المرور',
        };
      }

      // Query Supabase public.users directly - NO static data fallback
      if (isSupabaseConfigured && supabase) {
        try {
          // Attempt 1: Direct search by email
          const { data: userByEmail, error: emailErr } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          let userRow = userByEmail;

          // Attempt 2: Resilience if the bcrypt hash was mistakenly pasted into the email column
          if (!userRow) {
            const fallbackId =
              email === 'admin@electronics.dz'
                ? 'usr-admin-01'
                : email === 'delivery@electronics.dz'
                ? 'usr-delivery-01'
                : email === 'client@electronics.dz'
                ? 'usr-customer-01'
                : null;

            if (fallbackId) {
              const { data: userById } = await supabase
                .from('users')
                .select('*')
                .eq('id', fallbackId)
                .maybeSingle();

              if (userById) {
                userRow = userById;
              }
            }
          }

          if (userRow) {
            // Verify password:
            // 1. Standard: stored in userRow.password (supports bcrypt or plain)
            let isMatch = verifyPassword(password, userRow.password);

            // 2. Resilience: if bcrypt hash was accidentally placed in userRow.email
            if (!isMatch && userRow.email && (userRow.email.startsWith('$2a$') || userRow.email.startsWith('$2b$') || userRow.email.startsWith('$2y$'))) {
              isMatch = verifyPassword(password, userRow.email) || userRow.password === password;
            }

            if (isMatch) {
              const loggedInUser: User = {
                id: userRow.id,
                email: userRow.email.includes('@') ? userRow.email : email,
                name: userRow.name,
                phone: userRow.phone || '',
                role: (userRow.role as UserRole) || 'customer',
                createdAt: userRow.created_at,
              };

              const now = Date.now();
              const expiresAt = now + ADMIN_SESSION_DURATION_MS; // 7 Weeks (49 days)
              const authSession: AuthSession = {
                user: loggedInUser,
                createdAt: now,
                expiresAt,
                durationDays: ADMIN_SESSION_DAYS,
              };

              setUser(loggedInUser);
              setSession(authSession);

              localStorage.setItem('electronics_auth_user', JSON.stringify(loggedInUser));
              localStorage.setItem('electronics_auth_session', JSON.stringify(authSession));

              if (loggedInUser.role === 'admin') {
                localStorage.setItem('electronics_admin_auth', 'true');
              } else {
                localStorage.removeItem('electronics_admin_auth');
              }

              // Set browser cookie with 7-week expiry (4,233,600 seconds)
              if (typeof document !== 'undefined') {
                document.cookie = `electronics_session_role=${loggedInUser.role}; max-age=${ADMIN_SESSION_DURATION_SEC}; path=/; SameSite=Lax`;
                document.cookie = `electronics_session_expires=${expiresAt}; max-age=${ADMIN_SESSION_DURATION_SEC}; path=/; SameSite=Lax`;
              }

              return { success: true, user: loggedInUser };
            }
          }
        } catch (err) {
          console.warn('Supabase auth query error:', err);
        }
      }

      return {
        success: false,
        error: 'Identifiants invalides / البريد الإلكتروني أو كلمة المرور غير صحيحة',
      };
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        sessionExpiresAt: session?.expiresAt || null,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
