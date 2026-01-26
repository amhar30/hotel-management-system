import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-toolbar color="primary">
        <span>Customer Dashboard</span>
        <span class="spacer"></span>
        <button mat-button (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-toolbar>

      <div class="dashboard-content">
        <h2>Welcome, {{ user?.name }}!</h2>
        <p>Email: {{ user?.email }}</p>
        
        <div class="cards-container">
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Book a Room</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Find and book available rooms</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>My Bookings</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>View your current and past bookings</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>My Profile</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Update your personal information</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Services</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Browse additional services</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }

    .dashboard-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
    }

    mat-card-content p {
      color: #666;
    }
  `]
})
export class CustomerDashboardComponent {
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
  }
}
