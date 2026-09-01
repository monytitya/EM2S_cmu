import { AsyncPipe, LowerCasePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
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
  readonly config$ = this.route.data.pipe(map((data) => data['resource'] as ResourceConfig));
  readonly state$ = this.config$.pipe(
    switchMap((config) => this.api.list(config.resource).pipe(
      map((records) => ({ records, loading: false, error: false })),
      catchError(() => of({ records: [], loading: false, error: true })),
      startWith({ records: [], loading: true, error: false }),
    )),
  );
  query = '';

  visible(records: ResourceRecord[]): ResourceRecord[] {
    const query = this.query.trim().toLowerCase();
    return query ? records.filter((record) => JSON.stringify(record).toLowerCase().includes(query)) : records;
  }

  display(record: ResourceRecord, key: string): string {
    const value = record[key];
    return value === null || value === undefined || value === '' ? '-' : String(value);
  }
}
