import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  user_type: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  user_type: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuth();
  }

  private loadStoredAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user && user !== 'undefined') {
    try {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    } catch (e) {
      console.error('Invalid user data in localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

  login(email: string, password: string, userType: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password,
      user_type: userType
    }).pipe(
      tap(response => {
        this.setAuth(response);
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        this.setAuth(response);
      })
    );
  }

  private setAuth(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.tokenSubject.next(response.token);
    this.currentUserSubject.next(response.user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  isStaff(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'staff';
  }

  isCustomer(): boolean {
    const user = this.currentUserSubject.value;
    return user?.user_type === 'customer';
  }

  getUserRole(): string {
    const user = this.currentUserSubject.value;
    return user?.role || user?.user_type || '';
  }
}