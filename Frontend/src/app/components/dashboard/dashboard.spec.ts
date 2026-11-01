import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Api, EmployeeOverview } from '../../services/api';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let employees: EmployeeOverview[];

  beforeEach(async () => {
    employees = [];
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: Api, useValue: { getEmployeeOverview: () => of(employees) } },
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
    employees = [
      {
        employeeId: 7,
        employeeFullName: 'Alex Morgan',
        gender: 'Female',
        departmentName: 'People',
        positionTitle: 'Analyst',
        basicSalary: 4800,
        netPay: 4200,
        leaveTotalDays: 3,
      },
    ];
    fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    fixture.detectChanges();

    const dashboardElement = fixture.nativeElement as HTMLElement;
    expect(dashboardElement.textContent).toContain('Alex Morgan');
    expect(dashboardElement.textContent).toContain('People');
    expect(dashboardElement.textContent).toContain('4,200');
    expect(dashboardElement.textContent).toContain('4,800');
    expect(dashboardElement.textContent).toContain('3');
  });
});
