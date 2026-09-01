import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { catchError, of, startWith } from 'rxjs';
import { Api, UserRecord } from '../../services/api';

@Component({
  imports: [AsyncPipe, NgFor],
  selector: 'app-users',
  styleUrl: './users.css',
  templateUrl: './users.html',
})
export class Users {
  private readonly api = inject(Api);
  readonly demoUsers: UserRecord[] = [
    { id: 27, username: 'Abra Nelle Barron', email: 'Abra.Nelle@gmail.com', role: 'HR Manager', isActive: true },
    { id: 28, username: 'Thomas Goodman', email: 'Gapana@gmail.com', role: 'Payroll Admin', isActive: true },
    { id: 29, username: 'Khubaib Ahmed', email: 'Khuba@gmail.com', role: 'Manager', isActive: true },
    { id: 30, username: 'Uma Stafford', email: 'Nocun@gmail.com', role: 'Employee', isActive: true },
  ];

  readonly users$ = this.api.getUsers().pipe(
    catchError(() => of(this.demoUsers)),
    startWith(this.demoUsers),
  );
}
