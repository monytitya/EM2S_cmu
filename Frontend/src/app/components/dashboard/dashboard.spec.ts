import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows employee and department tables', () => {
    fixture.detectChanges();

    const dashboardElement = fixture.nativeElement as HTMLElement;
    const headings = Array.from(dashboardElement.querySelectorAll('h2'))
      .map((heading) => heading.textContent?.trim());

    expect(dashboardElement.querySelectorAll('table')).toHaveLength(2);
    expect(headings).toContain('Employee directory');
    expect(headings).toContain('Department overview');
  });
});
