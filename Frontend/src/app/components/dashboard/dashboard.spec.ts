import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Api, WorkforceOverview } from '../../services/api';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let overview: WorkforceOverview;

  beforeEach(async () => {
    overview = {
      employees: [],
      payrollRecordCount: 0,
      payrollCoverage: 0,
      leaveDays: 0,
    };
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: Api, useValue: { getWorkforceOverview: () => of(overview) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the redesigned workforce overview and a useful empty state', () => {
    fixture.detectChanges();

    const dashboardElement = fixture.nativeElement as HTMLElement;
    expect(dashboardElement.textContent).toContain('Your people, at a glance.');
    expect(dashboardElement.textContent).toContain('Teams at a glance');
    expect(dashboardElement.textContent).toContain('People & pay');
    expect(dashboardElement.textContent).toContain('Your employee directory is ready.');
    expect(dashboardElement.querySelectorAll('table')).toHaveLength(0);
  });

  it('uses live employee, department, salary and leave data', async () => {
    overview = {
      employees: [{
        employeeId: 7,
        employeeFullName: 'Alex Morgan',
        gender: 'Female',
        departmentName: 'People',
        positionTitle: 'Analyst',
        basicSalary: 4800,
        netPay: 4200,
        leaveTotalDays: 3,
      }],
      averageSalary: 4800,
      payrollRecordCount: 1,
      payrollCoverage: 1,
      leaveDays: 3,
    };
    fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    fixture.detectChanges();

    const dashboardElement = fixture.nativeElement as HTMLElement;
    expect(dashboardElement.textContent).toContain('Alex Morgan');
    expect(dashboardElement.textContent).toContain('People');
    expect(dashboardElement.textContent).toContain('4,200');
    expect(dashboardElement.textContent).toContain('4,800');
    expect(dashboardElement.textContent).toContain('3');
    expect(dashboardElement.textContent).toContain('Payroll records');
    expect(dashboardElement.textContent).toContain('1 linked to current employees');
  });

  it('shows payroll records and leave days even when their employee IDs are unmatched', async () => {
    overview = {
      employees: [{ employeeId: 10, employeeFullName: 'Alex Morgan' }],
      averageSalary: 1000,
      payrollRecordCount: 2,
      payrollCoverage: 0,
      leaveDays: 10,
    };
    fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    fixture.detectChanges();

    const dashboardElement = fixture.nativeElement as HTMLElement;
    expect(dashboardElement.textContent).toContain('Payroll records');
    expect(dashboardElement.textContent).toContain('2');
    expect(dashboardElement.textContent).toContain('0 linked to current employees');
    expect(dashboardElement.textContent).toContain('10');
    expect(dashboardElement.textContent).toContain('1,000');
  });
});
