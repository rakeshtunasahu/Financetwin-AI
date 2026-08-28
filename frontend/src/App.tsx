import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Reconciliation from './pages/Reconciliation';
import Exceptions from './pages/Exceptions';
import ExceptionDetails from './pages/ExceptionDetails';
import Governance from './pages/Governance';
import Anomalies from './pages/Anomalies';
import About from './pages/About';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import AuditLogs from './pages/AuditLogs';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reconciliation" element={<Reconciliation />} />
            <Route path="/exceptions" element={<Exceptions />} />
            <Route path="/exceptions/:id" element={<ExceptionDetails />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
