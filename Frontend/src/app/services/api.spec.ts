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
    service.getEmployeeOverview().subscribe((result) => overview = result);

    httpTesting.expectOne('http://localhost:9091/api/employees').flush([
      { id: 7, firstName: 'Alex', lastName: 'Morgan', departmentId: 3, positionId: 4 },
    ]);
    httpTesting.expectOne('http://localhost:9091/api/departments').flush([{ id: 3, name: 'People' }]);
    httpTesting.expectOne('http://localhost:9091/api/positions').flush([{ id: 4, title: 'Analyst' }]);
    httpTesting.expectOne('http://localhost:9093/api/salaries').flush([{ employeeId: 7, basicSalary: 4800, effectiveDate: '2026-01-01' }]);
    httpTesting.expectOne('http://localhost:9093/api/payrolls').flush([{ employeeId: 7, netPay: 4200, paymentStatus: 'PAID', payPeriodEnd: '2026-01-31' }]);
    httpTesting.expectOne('http://localhost:9092/api/leaves').flush([{ employeeId: 7, leaveType: 2, totalDays: 3, startDate: '2026-02-01' }]);
    httpTesting.expectOne('http://localhost:9092/api/leave-types').flush([{ leaveType: 2, name: 'Annual' }]);

    expect(overview).toEqual([{
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
    }]);
  });
});
