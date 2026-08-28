import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoUser, UserRole } from '../types';

export const DEMO_PERSONAS: DemoUser[] = [
  {
    email: 'operator.aarav@revenuerescue.ai',
    name: 'Aarav Mehta',
    role: 'RECOVERY_OPERATOR',
    title: 'Senior Recovery Specialist',
    department: 'Daily Recovery Operations',
    organization: 'RevenueRescue AI Org',
    permissions: [
      'can_view_dashboard',
      'can_view_recovery_cases',
      'can_run_recovery_detection',
      'can_diagnose_recovery_case',
      'can_execute_recovery_action',
      'can_escalate_case',
      'can_investigate_exception',
      'can_trigger_ai_investigation',
      'can_view_audit_logs',
      'can_view_calculator'
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
      'can_view_dashboard',
      'can_view_recovery_cases',
      'can_view_all_cases',
      'can_diagnose_recovery_case',
      'can_approve_high_value_action',
      'can_approve_recovery',
      'can_view_recovery_analytics',
      'can_simulate_policy',
      'can_view_policy_violations',
      'can_view_audit_logs',
      'can_view_risk_cases',
      'can_view_calculator'
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
      'can_view_dashboard',
      'can_view_recovery_cases',
      'can_view_all_cases',
      'can_run_recovery_detection',
      'can_diagnose_recovery_case',
      'can_execute_recovery_action',
      'can_escalate_case',
      'can_approve_high_value_action',
      'can_approve_recovery',
      'can_view_recovery_analytics',
      'can_run_recovery_batch',
      'can_configure_guardrails',
      'can_simulate_policy',
      'can_apply_policy',
      'can_manage_users',
      'can_view_system_audit',
      'can_view_audit_logs',
      'can_view_anomalies',
      'can_view_risk_cases',
      'can_view_policy_violations',
      'can_view_calculator',
      'can_run_reconciliation',
      'can_view_full_reconciliation'
    ]
  }
];

interface AuthContextType {
  currentUser: DemoUser;
  availableUsers: DemoUser[];
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (emailOrRole: string) => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'revenuerescue_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = DEMO_PERSONAS.find(
          (u) => u.email.toLowerCase() === parsed.email?.toLowerCase() || u.role === parsed.role
        );
        if (match) return match;
      }
    } catch (e) {
      console.error('Failed to load session from localStorage', e);
    }
    // Default to Administrator
    return DEMO_PERSONAS[2];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  const login = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    const match = DEMO_PERSONAS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        (cleanEmail.includes('aarav') && u.role === 'RECOVERY_OPERATOR') ||
        (cleanEmail.includes('priya') && u.role === 'RECOVERY_MANAGER') ||
        (cleanEmail.includes('arjun') && u.role === 'RECOVERY_ADMIN') ||
        (cleanEmail.includes('operator') && u.role === 'RECOVERY_OPERATOR') ||
        (cleanEmail.includes('manager') && u.role === 'RECOVERY_MANAGER') ||
        (cleanEmail.includes('admin') && u.role === 'RECOVERY_ADMIN')
    );

    if (match) {
      setCurrentUser(match);
      return true;
    } else {
      const customUser: DemoUser = {
        email: cleanEmail,
        name: cleanEmail.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role: 'RECOVERY_ADMIN',
        title: 'Recovery Systems Specialist',
        department: 'Autonomous Recovery',
        organization: 'RevenueRescue AI Org',
        permissions: DEMO_PERSONAS[2].permissions
      };
      setCurrentUser(customUser);
      return true;
    }
  };

  const logout = () => {
    setCurrentUser(DEMO_PERSONAS[2]);
  };

  const switchUser = (emailOrRole: string) => {
    const query = emailOrRole.toLowerCase();
    const match = DEMO_PERSONAS.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.role.toLowerCase() === query ||
        u.name.toLowerCase().includes(query)
    );
    if (match) {
      setCurrentUser(match);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return currentUser.permissions.includes(permission);
  };

  const isRole = (role: UserRole): boolean => {
    return currentUser.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers: DEMO_PERSONAS,
        login,
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
