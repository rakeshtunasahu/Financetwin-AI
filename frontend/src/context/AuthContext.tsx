import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoUser, UserRole } from '../types';

export const DEMO_PERSONAS: DemoUser[] = [
  {
    email: 'admin@financetwin.ai',
    name: 'Admin User',
    role: 'ADMIN',
    title: 'Chief Systems Architect & Controller',
    department: 'FinOps Leadership',
    organization: 'Razorpay FinTwin Org',
    permissions: [
      'can_view_dashboard',
      'can_run_reconciliation',
      'can_view_full_reconciliation',
      'can_investigate_exception',
      'can_trigger_ai_investigation',
      'can_simulate_policy',
      'can_apply_policy',
      'can_view_audit_logs',
      'can_manage_users',
      'can_view_risk_cases',
      'can_approve_high_risk_case',
      'can_view_anomalies',
      'can_view_calculator'
    ]
  },
  {
    email: 'analyst.priya@financetwin.ai',
    name: 'Priya Sharma',
    role: 'FINANCE_ANALYST',
    title: 'Senior Settlement Analyst',
    department: 'Daily Settlement Operations',
    organization: 'Razorpay FinTwin Org',
    permissions: [
      'can_view_dashboard',
      'can_run_reconciliation',
      'can_view_full_reconciliation',
      'can_investigate_exception',
      'can_trigger_ai_investigation',
      'can_view_audit_logs',
      'can_view_calculator'
    ]
  },
  {
    email: 'manager.rahul@financetwin.ai',
    name: 'Rahul Verma',
    role: 'FINANCE_MANAGER',
    title: 'Finance Operations Manager',
    department: 'Treasury & Exposure Control',
    organization: 'Razorpay FinTwin Org',
    permissions: [
      'can_view_dashboard',
      'can_view_full_reconciliation',
      'can_investigate_exception',
      'can_simulate_policy',
      'can_view_audit_logs',
      'can_view_risk_cases',
      'can_approve_high_risk_case',
      'can_view_calculator'
    ]
  },
  {
    email: 'risk.ananya@financetwin.ai',
    name: 'Ananya Singh',
    role: 'RISK_COMPLIANCE_OFFICER',
    title: 'Risk & Compliance Officer',
    department: 'FinCrime & Anomaly Governance',
    organization: 'Razorpay FinTwin Org',
    permissions: [
      'can_view_dashboard',
      'can_investigate_exception',
      'can_trigger_ai_investigation',
      'can_simulate_policy',
      'can_view_audit_logs',
      'can_view_risk_cases',
      'can_view_anomalies',
      'can_view_calculator'
    ]
  },
  {
    email: 'auditor.vikram@financetwin.ai',
    name: 'Vikram Mehta',
    role: 'AUDITOR',
    title: 'External Financial Auditor',
    department: 'Statutory Audit & Verification',
    organization: 'Razorpay FinTwin Org',
    permissions: [
      'can_view_dashboard',
      'can_view_audit_logs',
      'can_view_full_reconciliation',
      'can_view_historical_records',
      'can_view_calculator'
    ]
  }
];

interface AuthContextType {
  currentUser: DemoUser;
  availableUsers: DemoUser[];
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (email: string) => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'financetwin_active_user';

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
    return DEMO_PERSONAS[0]; // Default to Admin
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
        (cleanEmail.includes('priya') && u.role === 'FINANCE_ANALYST') ||
        (cleanEmail.includes('rahul') && u.role === 'FINANCE_MANAGER') ||
        (cleanEmail.includes('ananya') && u.role === 'RISK_COMPLIANCE_OFFICER') ||
        (cleanEmail.includes('auditor') && u.role === 'AUDITOR') ||
        (cleanEmail.includes('admin') && u.role === 'ADMIN')
    );

    if (match) {
      setCurrentUser(match);
      return true;
    } else {
      const customUser: DemoUser = {
        email: cleanEmail,
        name: cleanEmail.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role: 'ADMIN',
        title: 'Enterprise Finance Specialist',
        department: 'Operations & Settlement',
        organization: 'Enterprise FinOps Unit',
        permissions: DEMO_PERSONAS[0].permissions
      };
      setCurrentUser(customUser);
      return true;
    }
  };

  const logout = () => {
    setCurrentUser(DEMO_PERSONAS[0]);
  };

  const switchUser = (email: string) => {
    const match = DEMO_PERSONAS.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
