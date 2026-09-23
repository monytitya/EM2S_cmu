import { AsyncPipe, CurrencyPipe, LowerCasePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, map, of, startWith, Subject, switchMap } from 'rxjs';
import { Api, ResourceRecord } from '../../services/api';
import { ResourceConfig, resourceConfigs } from '../../app.routes';

@Component({
  imports: [AsyncPipe, CurrencyPipe, FormsModule, LowerCasePipe, NgFor, NgIf, SlicePipe],
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
        switchMap(() => this.api.list(config.resource)),
        map((records) => ({ records, loading: false, error: false })),
        catchError(() => of({ records: [], loading: false, error: true })),
        startWith({ records: [], loading: true, error: false }),
      ),
    ),
  );

  query = '';
  modalOpen = false;
  editingId: number | string | null = null;
  formError = '';
  formData: Record<string, unknown> = {};
  currentConfig: ResourceConfig | null = null;

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
        this.formError = error.status === 409
          ? String(error.error?.message || 'A record with this data already exists.')
          : `Unable to save. ${error.error?.message || 'Check your data and try again.'}`;
      },
    });
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
