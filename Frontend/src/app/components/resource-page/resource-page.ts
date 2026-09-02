import { AsyncPipe, LowerCasePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs';
import { Api, ResourceRecord } from '../../services/api';

interface ResourceConfig { title: string; eyebrow: string; description: string; resource: string; columns: { key: string; label: string }[]; }

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
  readonly config$ = this.route.data.pipe(map((data) => data['resource'] as ResourceConfig));
  readonly state$ = this.config$.pipe(
    switchMap((config) => this.refresh$.pipe(
      startWith(void 0),
      switchMap(() => this.api.list(config.resource)),
      map((records) => ({ records, loading: false, error: false })),
      catchError(() => of({ records: [], loading: false, error: true })),
      startWith({ records: [], loading: true, error: false }),
    )),
  );
  query = '';
  modalOpen = false;
  editingId: number | null = null;
  formError = '';
  employeeForm = this.emptyEmployee();

  emptyEmployee(): Record<string, unknown> {
    return { employeeCode: '', firstName: '', lastName: '', gender: '', dob: '', phone: '', address: '', departmentId: '', positionId: '', imageUrl: '' };
  }

  openEditor(record?: ResourceRecord): void {
    this.formError = '';
    this.editingId = record?.['id'] as number | null ?? null;
    this.employeeForm = record ? { ...this.emptyEmployee(), ...record } : this.emptyEmployee();
    this.modalOpen = true;
  }

  closeEditor(): void {
    this.modalOpen = false;
    this.formError = '';
  }

  handleImageSelected(event: Event): void {
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
      this.employeeForm['imageUrl'] = String(reader.result || '');
      this.formError = '';
    };
    reader.readAsDataURL(file);
  }

  saveEmployee(): void {
    const firstName = String(this.employeeForm['firstName'] || '').trim();
    const lastName = String(this.employeeForm['lastName'] || '').trim();
    if (!firstName || !lastName) {
      this.formError = 'First name and last name are required.';
      return;
    }

    const payload = { ...this.employeeForm, firstName, lastName };
    const request = this.editingId === null
      ? this.api.create('employees', payload)
      : this.api.update('employees', this.editingId, payload);
    request.subscribe({
      next: () => {
        this.closeEditor();
        this.refresh$.next();
      },
      error: () => { this.formError = 'Unable to save the employee. Check your data and permissions.'; },
    });
  }

  deleteEmployee(record: ResourceRecord): void {
    const id = record['id'];
    if (typeof id !== 'number' || !window.confirm(`Delete ${this.display(record, 'firstName')} ${this.display(record, 'lastName')}?`)) return;
    this.api.remove('employees', id).subscribe({
      next: () => this.refresh$.next(),
      error: () => { this.formError = 'Unable to delete the employee.'; },
    });
  }

  visible(records: ResourceRecord[]): ResourceRecord[] {
    const query = this.query.trim().toLowerCase();
    return query ? records.filter((record) => JSON.stringify(record).toLowerCase().includes(query)) : records;
  }

  display(record: ResourceRecord, key: string): string {
    const value = record[key];
    return value === null || value === undefined || value === '' ? '-' : String(value);
  }
}
