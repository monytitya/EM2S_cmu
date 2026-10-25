import { AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';
import { Api, EmployeeOverview } from '../../services/api';

interface DepartmentSummary {
  name: string;
  employeeCount: number;
  averageSalary: number | undefined;
}

interface DashboardEmployee {
  id: string;
  name: string;
  department: string;
  position: string;
  netPay: number | undefined;
  basicSalary: number | undefined;
}

interface DashboardData {
  employees: DashboardEmployee[];
  departments: DepartmentSummary[];
  averageSalary: number | undefined;
  payrollCoverage: number;
  usingDemoData: boolean;
}

@Component({
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf, RouterLink, SlicePipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(Api);

  readonly demoEmployees: EmployeeOverview[] = [
    { employeeId: 1, employeeFullName: 'Ava Morgan', gender: 'Female', departmentName: 'Sales', positionTitle: 'Sales Executive', basicSalary: 6400, netPay: 5480 },
    { employeeId: 2, employeeFullName: 'Noah Chen', gender: 'Male', departmentName: 'Engineering', positionTitle: 'Software Engineer', basicSalary: 8200, netPay: 6960 },
    { employeeId: 3, employeeFullName: 'Mia Patel', gender: 'Female', departmentName: 'Technology', positionTitle: 'Data Analyst', basicSalary: 7200, netPay: 6110 },
    { employeeId: 4, employeeFullName: 'Liam Brooks', gender: 'Male', departmentName: 'Operations', positionTitle: 'HR Executive', basicSalary: 5800, netPay: 4920 },
    { employeeId: 5, employeeFullName: 'Sofia Reyes', gender: 'Female', departmentName: 'Finance', positionTitle: 'Marketing Executive', basicSalary: 6100, netPay: 5180 },
  ];

  readonly dashboard$ = this.api.getEmployeeOverview().pipe(
    map((employees) => this.buildDashboardData(employees, false)),
    catchError(() => of(this.buildDashboardData(this.demoEmployees, true))),
    startWith(this.buildDashboardData(this.demoEmployees, true)),
  );

  private buildDashboardData(employees: EmployeeOverview[], usingDemoData: boolean): DashboardData {
    const departments = new Map<string, { salaries: number[]; employeeCount: number }>();

    const employeeRows = employees.map((employee) => {
      const department = employee.departmentName || 'Unassigned';
      const summary = departments.get(department) || { salaries: [], employeeCount: 0 };
      summary.employeeCount += 1;
      if (employee.basicSalary !== undefined) summary.salaries.push(employee.basicSalary);
      departments.set(department, summary);

      return {
        id: employee.employeeId === undefined ? '—' : String(employee.employeeId),
        name: employee.employeeFullName || `Employee #${employee.employeeId ?? '—'}`,
        department,
        position: employee.positionTitle || '—',
        netPay: employee.netPay,
        basicSalary: employee.basicSalary,
      };
    });

    const departmentRows = Array.from(departments, ([name, summary]) => ({
      name,
      employeeCount: summary.employeeCount,
      averageSalary: summary.salaries.length
        ? summary.salaries.reduce((total, salary) => total + salary, 0) / summary.salaries.length
        : undefined,
    })).sort((a, b) => b.employeeCount - a.employeeCount);

    const salaries = employeeRows
      .map((employee) => employee.basicSalary)
      .filter((salary): salary is number => salary !== undefined);

    return {
      employees: employeeRows,
      departments: departmentRows,
      averageSalary: salaries.length ? salaries.reduce((total, salary) => total + salary, 0) / salaries.length : undefined,
      payrollCoverage: employeeRows.filter((employee) => employee.netPay !== undefined).length,
      usingDemoData,
    };
  }
}
