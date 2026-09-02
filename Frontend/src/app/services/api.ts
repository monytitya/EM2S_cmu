import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
	private readonly baseUrl = this.getApiBaseUrl();

	private getApiBaseUrl(): string {
		// Use relative API path to match backend server origin
		const protocol = window.location.protocol;
		const hostname = window.location.hostname;
		const port = window.location.port ? `:${window.location.port}` : '';
		const baseHost = `${protocol}//${hostname}${port}`;
		if (hostname === 'localhost' && window.location.port === '4200') {
			return 'http://localhost:9090/api';
		}
		return `${baseHost}/api`;
	}

	getEmployeeOverview(): Observable<EmployeeOverview[]> {
		return this.http.get<EmployeeOverview[]>(`${this.baseUrl}/employees/details`);
	}

	login(username: string, password: string): Observable<LoginResponse> { return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { username, password }); }
	register(username: string, email: string, password: string, role = 'USER'): Observable<RegisterResponse> {
		return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, { username, email, password, role });
	}

	getUsers(): Observable<UserRecord[]> { return this.http.get<UserRecord[]>(`${this.baseUrl}/users`); }
	createUser(user: Partial<UserRecord> & { password?: string }): Observable<UserRecord> { return this.http.post<UserRecord>(`${this.baseUrl}/users`, user); }
	updateUser(id: number, user: Partial<UserRecord> & { password?: string }): Observable<UserRecord> { return this.http.put<UserRecord>(`${this.baseUrl}/users/${id}`, user); }
	deleteUser(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/users/${id}`); }

	list(resource: string): Observable<ResourceRecord[]> { return this.http.get<ResourceRecord[]>(`${this.baseUrl}/${resource}`); }
	get(resource: string, id: number): Observable<ResourceRecord> { return this.http.get<ResourceRecord>(`${this.baseUrl}/${resource}/${id}`); }
	create(resource: string, value: ResourceRecord): Observable<ResourceRecord> { return this.http.post<ResourceRecord>(`${this.baseUrl}/${resource}`, value); }
	update(resource: string, id: number, value: ResourceRecord): Observable<ResourceRecord> { return this.http.put<ResourceRecord>(`${this.baseUrl}/${resource}/${id}`, value); }
	remove(resource: string, id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${resource}/${id}`); }
}
