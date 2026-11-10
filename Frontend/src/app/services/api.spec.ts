import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Api } from './api';

describe('Api', () => {
  let service: Api;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Api);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    window.history.replaceState({}, '', '/');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('routes local resource requests to the combined API by default', () => {
    service.list('employees').subscribe();
    httpTesting.expectOne('/api/employees').flush([]);

    service.list('leaves').subscribe();
    httpTesting.expectOne('/api/leaves').flush([]);

    service.list('payrolls').subscribe();
    httpTesting.expectOne('/api/payrolls').flush([]);

    service.getUsers().subscribe();
    httpTesting.expectOne('/api/users').flush([]);
  });

  it('loads and updates the signed-in user profile through authenticated endpoints', () => {
    let profile: unknown;
    service.getCurrentProfile().subscribe((result) => profile = result);
    httpTesting.expectOne('/api/auth/me').flush({
      id: 8,
      username: 'admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
    });

    expect(profile).toEqual({
      id: 8,
      username: 'admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
    });

    let updatedProfile: unknown;
    service.updateCurrentProfile({ username: 'manager', email: 'manager@example.com' })
      .subscribe((result) => updatedProfile = result);
    const request = httpTesting.expectOne('/api/auth/me');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ username: 'manager', email: 'manager@example.com' });
    request.flush({
      id: 8,
      username: 'manager',
      email: 'manager@example.com',
      role: 'ADMIN',
      isActive: true,
      jwt: 'updated-token',
    });
    expect(updatedProfile).toEqual({
      id: 8,
      username: 'manager',
      email: 'manager@example.com',
      role: 'ADMIN',
      isActive: true,
      jwt: 'updated-token',
    });
  });

  it('fetches safe registration roles and submits the selected role', () => {
    let roles: string[] | undefined;
    service.getRegistrationRoles().subscribe((result) => roles = result);
    httpTesting.expectOne('/api/auth/registration-roles').flush(['USER']);

    expect(roles).toEqual(['USER']);

    service.register('new-user', 'new@example.com', 'password123', 'USER').subscribe();
    const request = httpTesting.expectOne('/api/auth/register');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      username: 'new-user',
      email: 'new@example.com',
      password: 'password123',
      role: 'USER',
    });
    request.flush({
      message: 'User registered successfully',
      userId: 9,
      username: 'new-user',
      role: 'USER',
      jwt: 'token',
    });
  });

  it('routes to separate local services when microservice mode is selected', () => {
    window.history.replaceState({}, '', '/?apiMode=microservices');
    service.list('employees').subscribe();
    httpTesting.expectOne('http://localhost:9091/api/employees').flush([]);

    service.list('leaves').subscribe();
    httpTesting.expectOne('http://localhost:9092/api/leaves').flush([]);

    service.list('payrolls').subscribe();
    httpTesting.expectOne('http://localhost:9093/api/payrolls').flush([]);
  });

  it('surfaces HTTP errors from the combined API without retrying another host', () => {
    let errorStatus: number | undefined;
    service.list('employees').subscribe({
      error: (error: HttpErrorResponse) => errorStatus = error.status,
    });

    httpTesting.expectOne('/api/employees').flush({}, {
      status: 500,
      statusText: 'Server Error',
    });

    expect(errorStatus).toBe(500);
  });

  it('combines dashboard data from all domain services', () => {
    window.history.replaceState({}, '', '/?apiMode=microservices');
    let overview: unknown;
    service.getWorkforceOverview().subscribe((result) => overview = result);

    httpTesting.expectOne('http://localhost:9091/api/employees').flush([
      { id: 7, firstName: 'Alex', lastName: 'Morgan', departmentId: 3, positionId: 4 },
    ]);
    httpTesting.expectOne('http://localhost:9091/api/departments').flush([{ id: 3, name: 'People' }]);
    httpTesting.expectOne('http://localhost:9091/api/positions').flush([{ id: 4, title: 'Analyst' }]);
    httpTesting.expectOne('http://localhost:9093/api/salaries').flush([{ employeeId: 7, basicSalary: 4800, effectiveDate: '2026-01-01' }]);
    httpTesting.expectOne('http://localhost:9093/api/payrolls').flush([{ employeeId: 7, netPay: 4200, paymentStatus: 'PAID', payPeriodEnd: '2026-01-31' }]);
    httpTesting.expectOne('http://localhost:9092/api/leaves').flush([{ employeeId: 7, leaveType: 2, totalDays: 3, startDate: '2026-02-01' }]);
    httpTesting.expectOne('http://localhost:9092/api/leave-types').flush([{ leaveType: 2, name: 'Annual' }]);

    expect(overview).toEqual({
      employees: [{
        employeeId: 7,
        employeeFullName: 'Alex Morgan',
        gender: undefined,
        departmentName: 'People',
        positionTitle: 'Analyst',
        basicSalary: 4800,
        netPay: 4200,
        paymentStatus: 'PAID',
        leaveTypeName: 'Annual',
        leaveTotalDays: 3,
      }],
      averageSalary: 4800,
      payrollRecordCount: 1,
      payrollCoverage: 1,
      leaveDays: 3,
    });
  });

  it('keeps payroll and leave totals when records reference employees outside the current directory', () => {
    let overview: unknown;
    service.getWorkforceOverview().subscribe((result) => overview = result);

    httpTesting.expectOne('/api/employees').flush([{ id: 10, firstName: 'Alex', lastName: 'Morgan' }]);
    httpTesting.expectOne('/api/departments').flush([]);
    httpTesting.expectOne('/api/positions').flush([]);
    httpTesting.expectOne('/api/salaries').flush([{ employeeId: 1, basicSalary: 1000, effectiveDate: '2026-09-01' }]);
    httpTesting.expectOne('/api/payrolls').flush([
      { employeeId: 1, netPay: 900, payPeriodEnd: '2026-08-31' },
      { employeeId: 2, netPay: 250, payPeriodEnd: '2026-11-01' },
    ]);
    httpTesting.expectOne('/api/leaves').flush([{ employeeId: 2, totalDays: 10, startDate: '2026-10-01' }]);
    httpTesting.expectOne('/api/leave-types').flush([]);

    expect(overview).toEqual({
      employees: [{
        employeeId: 10,
        employeeFullName: 'Alex Morgan',
        gender: undefined,
        departmentName: undefined,
        positionTitle: undefined,
        basicSalary: undefined,
        netPay: undefined,
        paymentStatus: undefined,
        leaveTypeName: undefined,
        leaveTotalDays: 0,
      }],
      averageSalary: 1000,
      payrollRecordCount: 2,
      payrollCoverage: 0,
      leaveDays: 10,
    });
  });
});
