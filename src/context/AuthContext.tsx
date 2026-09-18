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

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('electronics_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && parsed.role) {
          setUser(parsed);
          // Keep legacy admin key in sync for backwards compatibility
          if (parsed.role === 'admin') {
            localStorage.setItem('electronics_admin_auth', 'true');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

              setUser(loggedInUser);
              localStorage.setItem('electronics_auth_user', JSON.stringify(loggedInUser));
              if (loggedInUser.role === 'admin') {
                localStorage.setItem('electronics_admin_auth', 'true');
              } else {
                localStorage.removeItem('electronics_admin_auth');
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

  const register = useCallback(
    async (userData: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: UserRole;
    }): Promise<{ success: boolean; error?: string; user?: User }> => {
      const email = userData.email.trim().toLowerCase();
      const role = userData.role || 'customer';
      const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const hashedPassword = hashPassword(userData.password);

      const newUser: User = {
        id,
        email,
        name: userData.name.trim(),
        phone: userData.phone?.trim() || '',
        role,
        createdAt: new Date().toISOString(),
      };

      // Insert directly into Supabase public.users
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('users').insert({
            id: newUser.id,
            email: newUser.email,
            password: hashedPassword,
            name: newUser.name,
            phone: newUser.phone,
            role: newUser.role,
          });

          if (error) {
            console.error('Supabase user register error:', error.message);
            if (error.code === '23505') {
              return { success: false, error: 'Cet email est déjà enregistré' };
            }
            return { success: false, error: error.message };
          }
        } catch (err: any) {
          console.warn('Failed to insert user into Supabase', err);
          return { success: false, error: 'Erreur de connexion à la base de données' };
        }
      }

      setUser(newUser);
      localStorage.setItem('electronics_auth_user', JSON.stringify(newUser));
      if (newUser.role === 'admin') {
        localStorage.setItem('electronics_admin_auth', 'true');
      }

      return { success: true, user: newUser };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('electronics_auth_user');
    localStorage.removeItem('electronics_admin_auth');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
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
