import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Users } from './components/users/users';
import { ResourcePage } from './components/resource-page/resource-page';
import { Login } from './components/login/login';
import { authGuard } from './services/auth';

export const resourceConfigs: Record<string, any> = {
  'employees': { title: 'Employees', eyebrow: 'Workforce management', description: 'Manage employee profiles and records', resource: 'employees', columns: [{ key: 'imageUrl', label: 'Photo' }, { key: 'id', label: 'ID' }, { key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' }, { key: 'departmentId', label: 'Department' }, { key: 'positionId', label: 'Position' }] },
  'positions': { title: 'Positions', eyebrow: 'Organization structure', description: 'Manage job titles, codes, and salary ranges', resource: 'positions', columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Position Name' }, { key: 'title', label: 'Title' }, { key: 'code', label: 'Code' }, { key: 'minSalary', label: 'Min Salary' }, { key: 'masSalary', label: 'Max Salary' }] },
  'departments': { title: 'Departments', eyebrow: 'Organization', description: 'Manage teams, managers, and department codes', resource: 'departments', columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Department' }, { key: 'code', label: 'Code' }, { key: 'mangerId', label: 'Manager' }] },
  'salaries': { title: 'Salaries', eyebrow: 'Compensation', description: 'Manage basic salary, allowances, and deductions', resource: 'salaries', columns: [{ key: 'id', label: 'ID' }, { key: 'employeeId', label: 'Employee ID' }, { key: 'basicSalary', label: 'Basic Salary' }, { key: 'allowances', label: 'Allowances' }, { key: 'deductionsPercentage', label: 'Deductions %' }, { key: 'effectiveDate', label: 'Effective Date' }] },
  'payroll': { title: 'Payroll', eyebrow: 'Finance operations', description: 'Review payroll entries and payment status', resource: 'payrolls', columns: [{ key: 'id', label: 'ID' }, { key: 'employeeId', label: 'Employee' }, { key: 'payPeriodEnd', label: 'Pay period' }, { key: 'netPay', label: 'Net pay' }, { key: 'paymentStatus', label: 'Status' }] },
  'leave': { title: 'Leave & attendance', eyebrow: 'Workforce operations', description: 'Review leave requests and attendance records', resource: 'leaves', columns: [{ key: 'id', label: 'ID' }, { key: 'employeeId', label: 'Employee' }, { key: 'startDate', label: 'Start date' }, { key: 'endDate', label: 'End date' }, { key: 'totalDays', label: 'Days' }] },
  'leave-types': { title: 'Leave Types', eyebrow: 'Leave management', description: 'Configure leave categories and annual day limits', resource: 'leave-types', columns: [{ key: 'leaveType', label: 'Type ID' }, { key: 'name', label: 'Category Name' }, { key: 'defaultDaysPerYear', label: 'Days Per Year' }] },
  'roles': { title: 'Roles & Permissions', eyebrow: 'Access control', description: 'Manage user roles and parent role hierarchies', resource: 'roles', columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Role Name' }, { key: 'descriptions', label: 'Description' }] }
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: ':resourceType', component: ResourcePage, canActivate: [authGuard] }
];
