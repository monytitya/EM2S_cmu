import { AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import { Api, EmployeeOverview } from '../../services/api';

@Component({
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe, NgFor, NgIf],
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
    map((employees) => ({ employees, usingDemoData: false })),
    catchError(() => of({ employees: this.demoEmployees, usingDemoData: true })),
    startWith({ employees: this.demoEmployees, usingDemoData: true }),
  );

  countByDepartment(employees: EmployeeOverview[]): { name: string; value: number }[] {
    const counts = new Map<string, number>();
    employees.forEach((employee) => {
      const department = employee.departmentName || 'Unassigned';
      counts.set(department, (counts.get(department) || 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }

  averageSalary(employees: EmployeeOverview[]): number {
    const salaries = employees.map((employee) => employee.basicSalary || 0).filter(Boolean);
    return salaries.length ? salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length : 0;
  }

  countWithPayroll(employees: EmployeeOverview[]): number {
    return employees.filter((employee) => employee.netPay !== undefined).length;
  }

  countWithLeave(employees: EmployeeOverview[]): number {
    return employees.filter((employee) => employee.leaveTotalDays !== undefined).length;
  }

  countByRole(employees: EmployeeOverview[]): { name: string; value: number }[] {
    const counts = new Map<string, number>();
    employees.forEach((employee) => {
      const role = employee.positionTitle || 'Unassigned';
      counts.set(role, (counts.get(role) || 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }
}
