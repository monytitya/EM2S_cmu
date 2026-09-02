import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Users } from './components/users/users';
import { ResourcePage } from './components/resource-page/resource-page';
import { Login } from './components/login/login';
import { authGuard } from './services/auth';

const resource = (title: string, eyebrow: string, description: string, resourceName: string, columns: { key: string; label: string }[]) => ({ title, eyebrow, description, resource: resourceName, columns });

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: 'employees', component: ResourcePage, canActivate: [authGuard], data: { resource: resource('Employees', 'Workforce management', 'Manage employee profiles and records', 'employees', [{ key: 'imageUrl', label: 'Photo' }, { key: 'id', label: 'ID' }, { key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' }, { key: 'departmentId', label: 'Department' }, { key: 'positionId', label: 'Position' }]) } },
  { path: 'payroll', component: ResourcePage, canActivate: [authGuard], data: { resource: resource('Payroll', 'Finance operations', 'Review payroll entries and payment status', 'payrolls', [{ key: 'id', label: 'ID' }, { key: 'employeeId', label: 'Employee' }, { key: 'payPeriodEnd', label: 'Pay period' }, { key: 'netPay', label: 'Net pay' }, { key: 'paymentStatus', label: 'Status' }]) } },
  { path: 'departments', component: ResourcePage, canActivate: [authGuard], data: { resource: resource('Departments', 'Organization', 'Manage teams, managers, and salary bands', 'departments', [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Department' }, { key: 'code', label: 'Code' }, { key: 'managerId', label: 'Manager' }]) } },
  { path: 'leave', component: ResourcePage, canActivate: [authGuard], data: { resource: resource('Leave & attendance', 'Workforce operations', 'Review leave requests and attendance records', 'leaves', [{ key: 'id', label: 'ID' }, { key: 'employeeId', label: 'Employee' }, { key: 'startDate', label: 'Start date' }, { key: 'endDate', label: 'End date' }, { key: 'totalDays', label: 'Days' }]) } }
];
