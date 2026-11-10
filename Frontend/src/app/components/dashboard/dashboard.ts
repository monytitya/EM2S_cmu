import { AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';
import { Api, WorkforceOverview } from '../../services/api';

interface DepartmentSummary {
  name: string;
  employeeCount: number;
  share: number;
}

interface DashboardEmployee {
  id: string;
  name: string;
  initials: string;
  department: string;
  position: string;
  gender: string;
  netPay?: number;
}

interface GenderSummary {
  name: string;
  count: number;
  share: number;
}

interface DashboardData {
  employees: DashboardEmployee[];
  departments: DepartmentSummary[];
  genders: GenderSummary[];
  averageSalary?: number;
  payrollRecordCount: number;
  payrollCoverage: number;
  leaveDays: number;
  loading: boolean;
  error?: string;
}

const EMPTY_DASHBOARD: DashboardData = {
  employees: [],
  departments: [],
  genders: [],
  payrollRecordCount: 0,
  payrollCoverage: 0,
  leaveDays: 0,
  loading: false,
};

@Component({
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf, RouterLink, SlicePipe],
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(Api);

  readonly dashboard$ = this.api.getWorkforceOverview().pipe(
    map((overview) => this.buildDashboardData(overview)),
    catchError((error: { status?: number }) => of({
      ...EMPTY_DASHBOARD,
      error: error.status
        ? `The workforce service returned an error (${error.status}). Check the API and try again.`
        : 'Could not connect to the workforce service. Check that the backend is running and try again.',
    })),
    startWith({ ...EMPTY_DASHBOARD, loading: true }),
  );

  private buildDashboardData(overview: WorkforceOverview): DashboardData {
    const employees = overview.employees;
    const departments = new Map<string, number>();
    const genders = new Map<string, number>();
    const employeeRows = employees.map((employee) => {
      const department = employee.departmentName || 'Unassigned';
      departments.set(department, (departments.get(department) || 0) + 1);
      if (employee.gender) genders.set(employee.gender, (genders.get(employee.gender) || 0) + 1);

      const name = employee.employeeFullName?.trim() || `Employee #${employee.employeeId ?? '—'}`;
      return {
        id: employee.employeeId === undefined ? '—' : String(employee.employeeId),
        name,
        initials: name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase(),
        department,
        position: employee.positionTitle || 'Position not set',
        gender: employee.gender || 'Not specified',
        netPay: employee.netPay,
      };
    });

    const departmentRows = Array.from(departments, ([name, employeeCount]) => ({
      name,
      employeeCount,
      share: employees.length ? Math.round((employeeCount / employees.length) * 100) : 0,
    })).sort((left, right) => right.employeeCount - left.employeeCount);

    const genderRows = Array.from(genders, ([name, count]) => ({
      name,
      count,
      share: employees.length ? Math.round((count / employees.length) * 100) : 0,
    })).sort((left, right) => right.count - left.count);

    return {
      employees: employeeRows,
      departments: departmentRows,
      genders: genderRows,
      averageSalary: overview.averageSalary,
      payrollRecordCount: overview.payrollRecordCount,
      payrollCoverage: overview.payrollCoverage,
      leaveDays: overview.leaveDays,
      loading: false,
    };
  }
}
