import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

export interface EmployeeOverview {
	employeeId?: number;
	employeeFullName?: string;
	gender?: string;
	departmentName?: string;
	positionTitle?: string;
	basicSalary?: number;
	netPay?: number;
	paymentStatus?: string;
	leaveTypeName?: string;
	leaveTotalDays?: number;
}

export interface UserRecord {
	id: number;
	username: string;
	email: string;
	role: string;
	isActive: boolean;
}

export type ResourceRecord = Record<string, unknown>;

export interface LoginResponse { jwt: string; }
export interface RegisterResponse {
	message: string;
	userId: number;
	username: string;
	role: string;
	jwt: string;
}

@Injectable({ providedIn: 'root' })
export class Api {
	private readonly http = inject(HttpClient);
	private readonly localPorts: Record<string, string> = {
		auth: '9090',
		employees: '9091',
		leave: '9092',
		payroll: '9093',
	};

	private getApiBaseUrl(service: string): string {
		const protocol = window.location.protocol;
		const hostname = window.location.hostname;
		const port = window.location.port ? `:${window.location.port}` : '';
		const baseHost = `${protocol}//${hostname}${port}`;
		if (hostname === 'localhost' || hostname === '127.0.0.1') {
			return `http://localhost:${this.localPorts[service]}/api`;
		}
		return `${baseHost}/api`;
	}

	private resourceService(resource: string): string {
		switch (resource) {
			case 'employees':
			case 'departments':
			case 'positions':
				return 'employees';
			case 'leaves':
			case 'leave-types':
				return 'leave';
			case 'payrolls':
			case 'salaries':
				return 'payroll';
			case 'users':
			case 'roles':
			default:
				return 'auth';
		}
	}

	getEmployeeOverview(): Observable<EmployeeOverview[]> {
		return forkJoin({
			employees: this.list('employees'),
			departments: this.list('departments'),
			positions: this.list('positions'),
			salaries: this.list('salaries'),
			payrolls: this.list('payrolls'),
			leaves: this.list('leaves'),
			leaveTypes: this.list('leave-types'),
		}).pipe(map(({ employees, departments, positions, salaries, payrolls, leaves, leaveTypes }) =>
			employees.map((employee) => {
				const employeeId = this.numberField(employee, 'id');
				const employeeLeaves = leaves.filter((leave) => this.numberField(leave, 'employeeId') === employeeId);
				const latestSalary = this.latestBy(salaries.filter((salary) => this.numberField(salary, 'employeeId') === employeeId), 'effectiveDate');
				const latestPayroll = this.latestBy(payrolls.filter((payroll) => this.numberField(payroll, 'employeeId') === employeeId), 'payPeriodEnd');
				const latestLeave = this.latestBy(employeeLeaves, 'startDate');
				const department = departments.find((record) => this.numberField(record, 'id') === this.numberField(employee, 'departmentId'));
				const position = positions.find((record) => this.numberField(record, 'id') === this.numberField(employee, 'positionId'));
				const leaveType = leaveTypes.find((record) => this.numberField(record, 'leaveType') === this.numberField(latestLeave || {}, 'leaveType'));
				const firstName = this.stringField(employee, 'firstName') || '';
				const lastName = this.stringField(employee, 'lastName') || '';

				return {
					employeeId,
					employeeFullName: `${firstName} ${lastName}`.trim(),
					gender: this.stringField(employee, 'gender'),
					departmentName: this.stringField(department || {}, 'name'),
					positionTitle: this.stringField(position || {}, 'title') || this.stringField(position || {}, 'name'),
					basicSalary: this.numberField(latestSalary || {}, 'basicSalary'),
					netPay: this.numberField(latestPayroll || {}, 'netPay'),
					paymentStatus: this.stringField(latestPayroll || {}, 'paymentStatus'),
					leaveTypeName: this.stringField(leaveType || {}, 'name'),
					leaveTotalDays: employeeLeaves.reduce((total, leave) => total + (this.numberField(leave, 'totalDays') || 0), 0),
				};
			}),
		));
	}

	login(username: string, password: string): Observable<LoginResponse> { return this.http.post<LoginResponse>(`${this.getApiBaseUrl('auth')}/auth/login`, { username, password }); }
	register(username: string, email: string, password: string, role = 'USER'): Observable<RegisterResponse> {
		return this.http.post<RegisterResponse>(`${this.getApiBaseUrl('auth')}/auth/register`, { username, email, password, role });
	}

	getUsers(): Observable<UserRecord[]> { return this.http.get<UserRecord[]>(`${this.getApiBaseUrl('auth')}/users`); }
	createUser(user: Partial<UserRecord> & { password?: string }): Observable<UserRecord> { return this.http.post<UserRecord>(`${this.getApiBaseUrl('auth')}/users`, user); }
	updateUser(id: number, user: Partial<UserRecord> & { password?: string }): Observable<UserRecord> { return this.http.put<UserRecord>(`${this.getApiBaseUrl('auth')}/users/${id}`, user); }
	deleteUser(id: number): Observable<void> { return this.http.delete<void>(`${this.getApiBaseUrl('auth')}/users/${id}`); }

	list(resource: string): Observable<ResourceRecord[]> { return this.http.get<ResourceRecord[]>(`${this.getApiBaseUrl(this.resourceService(resource))}/${resource}`); }
	get(resource: string, id: number): Observable<ResourceRecord> { return this.http.get<ResourceRecord>(`${this.getApiBaseUrl(this.resourceService(resource))}/${resource}/${id}`); }
	create(resource: string, value: ResourceRecord): Observable<ResourceRecord> { return this.http.post<ResourceRecord>(`${this.getApiBaseUrl(this.resourceService(resource))}/${resource}`, value); }
	update(resource: string, id: number, value: ResourceRecord): Observable<ResourceRecord> { return this.http.put<ResourceRecord>(`${this.getApiBaseUrl(this.resourceService(resource))}/${resource}/${id}`, value); }
	remove(resource: string, id: number): Observable<void> { return this.http.delete<void>(`${this.getApiBaseUrl(this.resourceService(resource))}/${resource}/${id}`); }

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

	private latestBy(records: ResourceRecord[], dateField: string): ResourceRecord | undefined {
		return [...records].sort((left, right) =>
			String(left[dateField] || '').localeCompare(String(right[dateField] || '')),
		).at(-1);
	}
}
