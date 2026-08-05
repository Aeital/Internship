import { createBrowserRouter, Navigate } from 'react-router'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EmployeesPage from '@/pages/EmployeesPage'
import DepartmentsPage from '@/pages/DepartmentsPage'
import AttendancePage from '@/pages/AttendancePage'
import LeavePage from '@/pages/LeavePage'
import PayrollPage from '@/pages/PayrollPage'
import DependentsPage from '@/pages/DependentsPage'
import AuditPage from '@/pages/AuditPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'departments', element: <DepartmentsPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'leave', element: <LeavePage /> },
      { path: 'payroll', element: <PayrollPage /> },
      { path: 'dependents', element: <DependentsPage /> },
      { path: 'audit', element: <ProtectedRoute roles={['ADMIN']}><AuditPage /></ProtectedRoute> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
