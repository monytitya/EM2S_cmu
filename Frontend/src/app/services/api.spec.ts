import { TestBed } from '@angular/core/testing';
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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('routes local resource requests to their owning service', () => {
    service.list('employees').subscribe();
    httpTesting.expectOne('http://localhost:9091/api/employees').flush([]);

    service.list('leaves').subscribe();
    httpTesting.expectOne('http://localhost:9092/api/leaves').flush([]);

    service.list('payrolls').subscribe();
    httpTesting.expectOne('http://localhost:9093/api/payrolls').flush([]);

    service.getUsers().subscribe();
    httpTesting.expectOne('http://localhost:9090/api/users').flush([]);
  });

  it('combines dashboard data from all domain services', () => {
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
