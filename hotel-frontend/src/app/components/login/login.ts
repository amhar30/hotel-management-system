import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Hotel Management System</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                [(ngModel)]="credentials.email"
                name="email"
                required
                email
                #email="ngModel"
              />
              <mat-error *ngIf="email.invalid && email.touched">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                [(ngModel)]="credentials.password"
                name="password"
                required
                minlength="6"
                #password="ngModel"
              />
              <mat-error *ngIf="password.invalid && password.touched">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Login As</mat-label>
              <mat-select [(ngModel)]="credentials.userType" name="userType" required>
                <mat-option value="user">Staff/Admin</mat-option>
                <mat-option value="customer">Customer</mat-option>
              </mat-select>
              <mat-error *ngIf="!credentials.userType">
                Please select user type
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="loginForm.invalid || isLoading"
            >
              <span *ngIf="!isLoading">Sign In</span>
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            </button>
          </form>

          <div class="register-link">
            <p>Don't have an account? <a routerLink="/register">Register here</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .error-message {
      color: #f44336;
      margin: 16px 0;
      text-align: center;
      font-size: 14px;
    }

    .register-link {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
    }

    .register-link a {
      color: #3f51b5;
      text-decoration: none;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
    userType: 'user'
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(
        this.credentials.email,
        this.credentials.password,
        this.credentials.userType
      ).toPromise();

      // Navigate based on user type
      const user = this.authService.getCurrentUser();
      if (user?.user_type === 'customer') {
        this.router.navigate(['/customer/dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}