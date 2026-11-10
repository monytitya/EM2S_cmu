import { AsyncPipe, LowerCasePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, forkJoin, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { Api, ResourceRecord } from '../../services/api';
import { ResourceConfig, resourceConfigs } from '../../app.routes';

interface LeaveStats {
  requests: number;
  requestedDays: number;
  employeesOnLeaveToday: number;
}

@Component({
  imports: [AsyncPipe, FormsModule, LowerCasePipe, NgFor, NgIf, SlicePipe],
  selector: 'app-resource-page',
  styleUrl: './resource-page.css',
  templateUrl: './resource-page.html',
})
export class ResourcePage {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  private readonly refresh$ = new Subject<void>();

  readonly config$ = this.route.paramMap.pipe(
    map((params) => resourceConfigs[params.get('resourceType') || ''] as ResourceConfig | undefined),
  );

  readonly state$ = this.config$.pipe(
    filter((config): config is ResourceConfig => !!config),
    switchMap((config) =>
      this.refresh$.pipe(
        startWith(void 0),
        switchMap(() => this.loadRecords(config.resource)),
        map((records) => ({
          records,
          loading: false,
          error: false,
          leaveStats: config.resource === 'leaves' ? this.getLeaveStats(records) : undefined,
        })),
        catchError(() => of({ records: [], loading: false, error: true, leaveStats: undefined })),
        startWith({ records: [], loading: true, error: false, leaveStats: undefined }),
      ),
    ),
  );

  query = '';
  modalOpen = false;
  editingId: number | string | null = null;
  formError = '';
  formData: Record<string, unknown> = {};
  currentConfig: ResourceConfig | null = null;

  private loadRecords(resource: string): Observable<ResourceRecord[]> {
    if (resource !== 'leaves') return this.api.list(resource);

    return forkJoin({
      leaves: this.api.list('leaves'),
      employees: this.api.list('employees'),
      leaveTypes: this.api.list('leave-types'),
    }).pipe(
      map(({ leaves, employees, leaveTypes }) => leaves.map((leave) => {
        const employeeId = this.numberField(leave, 'employeeId');
        const employee = employees.find((record) => this.numberField(record, 'id') === employeeId);
        const firstName = this.stringField(employee || {}, 'firstName') || '';
        const lastName = this.stringField(employee || {}, 'lastName') || '';
        const leaveTypeId = this.numberField(leave, 'leaveType');
        const leaveType = leaveTypes.find((record) => this.numberField(record, 'leaveType') === leaveTypeId);

        return {
          ...leave,
          employeeName: `${firstName} ${lastName}`.trim() || (employeeId !== undefined ? `Employee #${employeeId}` : 'Unknown employee'),
          leaveTypeName: this.stringField(leaveType || {}, 'name') || (leaveTypeId !== undefined ? `Leave type #${leaveTypeId}` : 'Unknown leave type'),
        };
      })),
    );
  }

  private getLeaveStats(records: ResourceRecord[]): LeaveStats {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const employeesOnLeave = new Set(
      records
        .filter((record) => {
          const startDate = this.stringField(record, 'startDate')?.slice(0, 10);
          const endDate = this.stringField(record, 'endDate')?.slice(0, 10);
          return !!startDate && !!endDate && startDate <= today && endDate >= today;
        })
        .map((record) => this.numberField(record, 'employeeId'))
        .filter((employeeId): employeeId is number => employeeId !== undefined),
    );

    return {
      requests: records.length,
      requestedDays: records.reduce((total, record) => total + (this.numberField(record, 'totalDays') || 0), 0),
      employeesOnLeaveToday: employeesOnLeave.size,
    };
  }

  private numberField(record: ResourceRecord, field: string): number | undefined {
    const value = record[field];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim()) {
      const number = Number(value);
      return Number.isFinite(number) ? number : undefined;
    }
    return undefined;
  }

  private stringField(record: ResourceRecord, field: string): string | undefined {
    const value = record[field];
    return typeof value === 'string' ? value : undefined;
  }

  /** Build an empty form from the field definitions */
  emptyForm(config: ResourceConfig): Record<string, unknown> {
    const form: Record<string, unknown> = {};
    for (const field of config.fields) {
      if (field.type === 'select' && field.options?.length) {
        form[field.key] = field.options[0].value;
      } else {
        form[field.key] = '';
      }
    }
    return form;
  }

  /** Open the Create / Edit modal */
  openEditor(config: ResourceConfig, record?: ResourceRecord): void {
    this.currentConfig = config;
    this.formError = '';
    const idKey = config.idKey || 'id';
    this.editingId = record ? (record[idKey] as number | string | null) ?? null : null;
    this.formData = record ? { ...this.emptyForm(config), ...record } : this.emptyForm(config);
    this.modalOpen = true;
  }

  closeEditor(): void {
    this.modalOpen = false;
    this.formError = '';
  }

  /** Handle PNG image selection */
  handleImageSelected(event: Event, fieldKey: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'image/png') {
      this.formError = 'Please select a PNG image.';
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.formError = 'PNG images must be smaller than 2 MB.';
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.formData[fieldKey] = String(reader.result || '');
      this.formError = '';
    };
    reader.readAsDataURL(file);
  }

  /** Generic save – works for all resource types */
  saveRecord(): void {
    const config = this.currentConfig;
    if (!config) return;

    // Validate required fields
    for (const field of config.fields) {
      if (field.required) {
        const value = this.formData[field.key];
        if (value === '' || value === null || value === undefined) {
          this.formError = `${field.label} is required.`;
          return;
        }
      }
    }

    // Coerce numeric fields
    const payload: Record<string, unknown> = { ...this.formData };
    for (const field of config.fields) {
      if (field.type === 'number' && payload[field.key] !== '' && payload[field.key] !== null && payload[field.key] !== undefined) {
        payload[field.key] = Number(payload[field.key]);
      }
      // Append timezone for datetime fields
      if (field.type === 'datetime' && typeof payload[field.key] === 'string' && payload[field.key] && !(payload[field.key] as string).endsWith('Z')) {
        payload[field.key] = payload[field.key] + ':00Z';
      }
    }

    const idKey = config.idKey || 'id';
    const request = this.editingId === null
      ? this.api.create(config.resource, payload)
      : this.api.update(config.resource, this.editingId as number, payload);

    request.subscribe({
      next: () => {
        this.closeEditor();
        this.refresh$.next();
      },
      error: (error: HttpErrorResponse) => {
        this.formError = this.getSaveErrorMessage(error);
      },
    });
  }

  private getSaveErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Could not reach the API. Check the server or port-forward and try again.';
    }
    if (error.status === 401) {
      return 'Your session may have expired. Sign in again and retry.';
    }
    if (error.status === 403) {
      return 'Your account cannot save this record. Sign in with an ADMIN account.';
    }

    const body = error.error;
    const message = typeof body === 'string'
      ? body
      : body && typeof body === 'object'
        ? [body.message, body.detail, body.error].find((value): value is string =>
            typeof value === 'string' && value.trim().length > 0,
          )
        : undefined;

    if (error.status === 409) {
      return message || 'A record with this data already exists.';
    }
    if (error.status === 400) {
      return message || 'The server rejected the submitted data. Check required fields and IDs.';
    }
    if (error.status >= 500) {
      return message || `The server failed to save this record (HTTP ${error.status}).`;
    }
    return message || `Unable to save this record (HTTP ${error.status}).`;
  }

  /** Generic delete – works for all resource types */
  deleteRecord(config: ResourceConfig, record: ResourceRecord): void {
    const idKey = config.idKey || 'id';
    const id = record[idKey];
    const name = config.displayName ? config.displayName(record) : `Record #${id}`;
    if (id === null || id === undefined || !window.confirm(`Delete ${name}?`)) return;
    this.api.remove(config.resource, id as number).subscribe({
      next: () => this.refresh$.next(),
      error: () => { this.formError = `Unable to delete ${name}.`; },
    });
  }

  /** Filter records by search query */
  visible(records: ResourceRecord[]): ResourceRecord[] {
    const q = this.query.trim().toLowerCase();
    return q ? records.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : records;
  }

  /** Safely display a field value */
  display(record: ResourceRecord, key: string): string {
    const value = record[key];
    return value === null || value === undefined || value === '' ? '–' : String(value);
  }
}
