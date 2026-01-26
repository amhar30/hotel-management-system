import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Create Customer Account</mat-card-title>
          <mat-card-subtitle>Register to book rooms and services</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Full Name</mat-label>
                <input
                  matInput
                  [(ngModel)]="userData.name"
                  name="name"
                  required
                  minlength="3"
                  #name="ngModel"
                />
                <mat-error *ngIf="name.invalid && name.touched">
                  Name must be at least 3 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Phone</mat-label>
                <input
                  matInput
                  type="tel"
                  [(ngModel)]="userData.phone"
                  name="phone"
                  #phone="ngModel"
                />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                [(ngModel)]="userData.email"
                name="email"
                required
                email
                #email="ngModel"
              />
              <mat-error *ngIf="email.invalid && email.touched">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  type="password"
                  [(ngModel)]="userData.password"
                  name="password"
                  required
                  minlength="6"
                  #password="ngModel"
                />
                <mat-error *ngIf="password.invalid && password.touched">
                  Password must be at least 6 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Confirm Password</mat-label>
                <input
                  matInput
                  type="password"
                  [(ngModel)]="userData.password_confirmation"
                  name="password_confirmation"
                  required
                  #confirmPassword="ngModel"
                />
                <mat-error *ngIf="confirmPassword.invalid && confirmPassword.touched">
                  Please confirm your password
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <textarea
                matInput
                [(ngModel)]="userData.address"
                name="address"
                rows="2"
              ></textarea>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="registerForm.invalid || isLoading || !passwordsMatch()"
            >
              <span *ngIf="!isLoading">Register</span>
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            </button>
          </form>

          <div class="login-link">
            <p>Already have an account? <a routerLink="/login">Login here</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 500px;
      padding: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
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

    .login-link {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
    }

    .login-link a {
      color: #3f51b5;
      text-decoration: none;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class RegisterComponent {
  userData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    address: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  passwordsMatch(): boolean {
    return this.userData.password === this.userData.password_confirmation;
  }

  async onSubmit() {
    if (this.isLoading || !this.passwordsMatch()) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.userData).toPromise();
      this.router.navigate(['/customer/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.error?.message || error.error?.errors || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}