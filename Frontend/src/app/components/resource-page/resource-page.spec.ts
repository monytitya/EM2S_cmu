import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Api } from '../../services/api';
import { resourceConfigs } from '../../app.routes';
import { ResourcePage } from './resource-page';

describe('ResourcePage save errors', () => {
  let fixture: ComponentFixture<ResourcePage>;
  let create: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    create = vi.fn(() => of({}));
    await TestBed.configureTestingModule({
      imports: [ResourcePage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ resourceType: 'payroll' })) },
        },
        {
          provide: Api,
          useValue: {
            list: vi.fn(() => of([])),
            create,
            update: vi.fn(() => of({})),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePage);
    fixture.detectChanges();
  });

  function submitPayroll(): void {
    const page = fixture.componentInstance;
    page.openEditor(resourceConfigs['payroll']);
    page.formData = {
      employeeId: 7,
      payPeriodStart: '2026-01-01',
      payPeriodEnd: '2026-01-31',
      grossPay: 1000,
      netPay: 900,
    };
    page.saveRecord();
    fixture.detectChanges();
  }

  it('explains that only admins can save when the API returns forbidden', () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' })));

    submitPayroll();

    expect(fixture.componentInstance.formError).toContain('ADMIN account');
  });

  it('shows server validation details for invalid data', () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { message: 'Employee ID 7 does not exist.' },
    })));

    submitPayroll();

    expect(fixture.componentInstance.formError).toContain('Employee ID 7 does not exist.');
  });
});
