import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DemoUser, UserRole } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const USER_STORAGE_KEY = 'revenuerescue_active_user';
const TOKEN_STORAGE_KEY = 'revenuerescue_auth_token';

// ── Demo personas (kept for quick-access role buttons on login page) ──────────
export const DEMO_PERSONAS: DemoUser[] = [
  {
    email: 'operator.aarav@revenuerescue.ai',
    name: 'Aarav Mehta',
    role: 'RECOVERY_OPERATOR',
    title: 'Senior Recovery Specialist & Analyst',
    department: 'Daily Recovery Operations',
    organization: 'RevenueRescue AI Org',
    permissions: [
      'can_view_dashboard', 'can_view_recovery_cases', 'can_run_recovery_detection',
      'can_diagnose_recovery_case', 'can_execute_recovery_action', 'can_escalate_case',
      'can_investigate_exception', 'can_trigger_ai_investigation', 'can_view_audit_logs', 'can_view_calculator'
    ]
  },
  {
    email: 'manager.priya@revenuerescue.ai',
    name: 'Priya Sharma',
    role: 'RECOVERY_MANAGER',
    title: 'Revenue Exposure & Recovery Manager',
    department: 'Recovery Operations & Approvals',
    organization: 'RevenueRescue AI Org',
    permissions: [
      'can_view_dashboard', 'can_view_recovery_cases', 'can_view_all_cases',
      'can_diagnose_recovery_case', 'can_approve_high_value_action', 'can_approve_recovery',
      'can_view_recovery_analytics', 'can_simulate_policy', 'can_view_policy_violations',
      'can_view_audit_logs', 'can_view_risk_cases', 'can_view_calculator'
    ]
  },
  {
    email: 'admin.arjun@revenuerescue.ai',
    name: 'Arjun Rao',
    role: 'RECOVERY_ADMIN',
    title: 'Principal Recovery Architect & Controller',
    department: 'Autonomous Recovery Leadership',
    organization: 'RevenueRescue AI Org',
    permissions: [
      'can_view_dashboard', 'can_view_recovery_cases', 'can_view_all_cases',
      'can_run_recovery_detection', 'can_diagnose_recovery_case', 'can_execute_recovery_action',
      'can_escalate_case', 'can_approve_high_value_action', 'can_approve_recovery',
      'can_view_recovery_analytics', 'can_run_recovery_batch', 'can_configure_guardrails',
      'can_simulate_policy', 'can_apply_policy', 'can_manage_users', 'can_view_system_audit',
      'can_view_audit_logs', 'can_view_anomalies', 'can_view_risk_cases', 'can_view_policy_violations',
      'can_view_calculator', 'can_run_reconciliation', 'can_view_full_reconciliation'
    ]
  }
];

// ── Context types ─────────────────────────────────────────────────────────────
interface AuthContextType {
  currentUser: DemoUser | null;
  isAuthenticated: boolean;
  availableUsers: DemoUser[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, company?: string, jobRole?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  switchUser: (emailOrRole: string) => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────
function saveSession(user: DemoUser, token: string) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function loadSession(): { user: DemoUser | null; token: string | null } {
  try {
    const userRaw = localStorage.getItem(USER_STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (userRaw && token) {
      return { user: JSON.parse(userRaw) as DemoUser, token };
    }
  } catch {}
  return { user: null, token: null };
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => loadSession().user);
  const isAuthenticated = currentUser !== null;

  // Keep header in sync for API client
  useEffect(() => {
    const { token } = loadSession();
    if (!token && currentUser) {
      // Edge case: user in storage but no token — clear
      setCurrentUser(null);
    }
  }, []);

  // ── Real login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.detail || 'Authentication failed.' };
      }
      const user: DemoUser = data.user;
      saveSession(user, data.token);
      setCurrentUser(user);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: 'Unable to connect to server. Please check your connection.' };
    }
  }, []);

  // ── Real signup ─────────────────────────────────────────────────────────────
  const signup = useCallback(async (
    name: string, email: string, password: string,
    company = '', jobRole = 'Revenue Operations'
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          company,
          job_role: jobRole,
          role: 'RECOVERY_OPERATOR'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.detail || 'Registration failed.' };
      }
      const user: DemoUser = data.user;
      saveSession(user, data.token);
      setCurrentUser(user);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: 'Unable to connect to server. Please check your connection.' };
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  // ── Switch demo user (quick-role buttons, no real auth required) ────────────
  const switchUser = useCallback((emailOrRole: string) => {
    const query = emailOrRole.toLowerCase();
    const match = DEMO_PERSONAS.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.role.toLowerCase() === query ||
        u.name.toLowerCase().includes(query)
    );
    if (match) {
      // For demo role switching, we call the real API so a token is also issued
      fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: match.email, password: 'demo' })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            saveSession(match, data.token);
          } else {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(match));
          }
          setCurrentUser(match);
        })
        .catch(() => {
          // Fallback: set user without token (demo mode)
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(match));
          setCurrentUser(match);
        });
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    return currentUser?.permissions?.includes(permission) ?? false;
  }, [currentUser]);

  const isRole = useCallback((role: UserRole): boolean => {
    return currentUser?.role === role;
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        availableUsers: DEMO_PERSONAS,
        login,
        signup,
        logout,
        switchUser,
        hasPermission,
        isRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
