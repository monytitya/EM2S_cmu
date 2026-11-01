import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Users } from './components/users/users';
import { ResourcePage } from './components/resource-page/resource-page';
import { Login } from './components/login/login';
import { authGuard } from './services/auth';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'textarea' | 'select' | 'file';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ResourceConfig {
  title: string;
  eyebrow: string;
  description: string;
  resource: string;
  idKey: string;
  columns: { key: string; label: string }[];
  fields: FieldConfig[];
  displayName?: (record: Record<string, unknown>) => string;
}

export const resourceConfigs: Record<string, ResourceConfig> = {
  'employees': {
    title: 'Employees',
    eyebrow: 'Workforce management',
    description: 'Manage employee profiles and records',
    resource: 'employees',
    idKey: 'id',
    columns: [
      { key: 'imageUrl', label: 'Photo' },
      { key: 'id', label: 'ID' },
      { key: 'employeeCode', label: 'Code' },
      { key: 'firstName', label: 'First name' },
      { key: 'lastName', label: 'Last name' },
      { key: 'gender', label: 'Gender' },
      { key: 'departmentId', label: 'Department' },
      { key: 'positionId', label: 'Position' }
    ],
    fields: [
      { key: 'employeeCode', label: 'Employee Code', type: 'number', required: true },
      { key: 'firstName', label: 'First Name', type: 'text', required: true },
      { key: 'lastName', label: 'Last Name', type: 'text', required: true },
      { key: 'gender', label: 'Gender', type: 'select', options: [{ value: '', label: 'Select gender' }, { value: 'Female', label: 'Female' }, { value: 'Male', label: 'Male' }, { value: 'Other', label: 'Other' }] },
      { key: 'dob', label: 'Date of Birth', type: 'date' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'departmentId', label: 'Department ID', type: 'number' },
      { key: 'positionId', label: 'Position ID', type: 'number' },
      { key: 'imageUrl', label: 'Photo (PNG)', type: 'file' },
      { key: 'address', label: 'Address', type: 'textarea' }
    ],
    displayName: (r) => `${r['firstName'] || ''} ${r['lastName'] || ''}`.trim()
  },
  'positions': {
    title: 'Positions',
    eyebrow: 'Organization structure',
    description: 'Manage job titles, codes, and salary ranges',
    resource: 'positions',
    idKey: 'id',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Position Name' },
      { key: 'title', label: 'Title' },
      { key: 'code', label: 'Code' },
      { key: 'minSalary', label: 'Min Salary' },
      { key: 'maxSalary', label: 'Max Salary' }
    ],
    fields: [
      { key: 'name', label: 'Position Name', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'code', label: 'Code', type: 'number' },
      { key: 'minSalary', label: 'Min Salary', type: 'number' },
      { key: 'maxSalary', label: 'Max Salary', type: 'number' },
      { key: 'mangerId', label: 'Manager ID', type: 'number' }
    ],
    displayName: (r) => String(r['name'] || r['title'] || 'Position')
  },
  'departments': {
    title: 'Departments',
    eyebrow: 'Organization',
    description: 'Manage teams, managers, and department codes',
    resource: 'departments',
    idKey: 'id',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Department' },
      { key: 'code', label: 'Code' },
      { key: 'mangerId', label: 'Manager' }
    ],
    fields: [
      { key: 'name', label: 'Department Name', type: 'text', required: true },
      { key: 'code', label: 'Code', type: 'number' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'mangerId', label: 'Manager ID', type: 'number' },
      { key: 'minSalary', label: 'Min Salary', type: 'number' },
      { key: 'masSalary', label: 'Max Salary', type: 'number' }
    ],
    displayName: (r) => String(r['name'] || 'Department')
  },
  'salaries': {
    title: 'Salaries',
    eyebrow: 'Compensation',
    description: 'Manage basic salary, allowances, and deductions',
    resource: 'salaries',
    idKey: 'id',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'basicSalary', label: 'Basic Salary' },
      { key: 'allowances', label: 'Allowances' },
      { key: 'deductionsPercentage', label: 'Deductions %' },
      { key: 'effectiveDate', label: 'Effective Date' }
    ],
    fields: [
      { key: 'employeeId', label: 'Employee ID', type: 'number', required: true },
      { key: 'basicSalary', label: 'Basic Salary', type: 'number', required: true },
      { key: 'allowances', label: 'Allowances', type: 'number' },
      { key: 'deductionsPercentage', label: 'Deductions %', type: 'number' },
      { key: 'effectiveDate', label: 'Effective Date', type: 'date', required: true }
    ],
    displayName: (r) => `Salary #${r['id'] || 'new'}`
  },
  'payroll': {
    title: 'Payroll',
    eyebrow: 'Finance operations',
    description: 'Review payroll entries and payment status',
    resource: 'payrolls',
    idKey: 'id',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'employeeId', label: 'Employee' },
      { key: 'payPeriodStart', label: 'Period Start' },
      { key: 'payPeriodEnd', label: 'Period End' },
      { key: 'grossPay', label: 'Gross Pay' },
      { key: 'netPay', label: 'Net Pay' },
      { key: 'paymentStatus', label: 'Status' }
    ],
    fields: [
      { key: 'employeeId', label: 'Employee ID', type: 'number', required: true },
      { key: 'salaryId', label: 'Salary ID', type: 'number' },
      { key: 'payPeriodStart', label: 'Pay Period Start', type: 'date', required: true },
      { key: 'payPeriodEnd', label: 'Pay Period End', type: 'date', required: true },
      { key: 'grossPay', label: 'Gross Pay', type: 'number', required: true },
      { key: 'netPay', label: 'Net Pay', type: 'number', required: true },
      { key: 'taxAmount', label: 'Tax Amount', type: 'number' },
      { key: 'unpaidLeaveDeductions', label: 'Unpaid Leave Deductions', type: 'number' },
      { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: [{ value: 'PENDING', label: 'Pending' }, { value: 'PAID', label: 'Paid' }, { value: 'CANCELLED', label: 'Cancelled' }] },
      { key: 'paidAt', label: 'Paid At', type: 'datetime' }
    ],
    displayName: (r) => `Payroll #${r['id'] || 'new'}`
  },
  'leave': {
    title: 'Leave Management',
    eyebrow: 'Workforce operations',
    description: 'Review employee leave requests. Attendance records are not available in the current API.',
    resource: 'leaves',
    idKey: 'id',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'employeeName', label: 'Employee' },
      { key: 'leaveTypeName', label: 'Leave Type' },
      { key: 'startDate', label: 'Start date' },
      { key: 'endDate', label: 'End date' },
      { key: 'totalDays', label: 'Days' }
    ],
    fields: [
      { key: 'employeeId', label: 'Employee ID', type: 'number', required: true },
      { key: 'leaveType', label: 'Leave Type ID', type: 'number', required: true },
      { key: 'startDate', label: 'Start Date', type: 'date', required: true },
      { key: 'endDate', label: 'End Date', type: 'date', required: true },
      { key: 'totalDays', label: 'Total Days', type: 'number', required: true },
      { key: 'approveBy', label: 'Approved By (Employee ID)', type: 'number' }
    ],
    displayName: (r) => `Leave #${r['id'] || 'new'}`
  },
  'leave-types': {
    title: 'Leave Types',
    eyebrow: 'Leave management',
    description: 'Configure leave categories and annual day limits',
    resource: 'leave-types',
    idKey: 'leaveType',
    columns: [
      { key: 'leaveType', label: 'Type ID' },
      { key: 'name', label: 'Category Name' },
      { key: 'defaultDaysPerYear', label: 'Days Per Year' }
    ],
    fields: [
      { key: 'leaveType', label: 'Leave Type ID', type: 'number', required: true },
      { key: 'name', label: 'Category Name', type: 'text', required: true },
      { key: 'defaultDaysPerYear', label: 'Default Days Per Year', type: 'number', required: true }
    ],
    displayName: (r) => String(r['name'] || 'Leave Type')
  },
  'roles': {
    title: 'Roles & Permissions',
    eyebrow: 'Access control',
    description: 'Manage user roles and parent role hierarchies',
    resource: 'roles',
    idKey: 'id',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Role Name' },
      { key: 'descriptions', label: 'Description' }
    ],
    fields: [
      { key: 'name', label: 'Role Name', type: 'text', required: true },
      { key: 'descriptions', label: 'Description', type: 'textarea' }
    ],
    displayName: (r) => String(r['name'] || 'Role')
  }
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: ':resourceType', component: ResourcePage, canActivate: [authGuard] }
];
