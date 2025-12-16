import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
    MatMenuModule    // 💡 Mat Menu, matMenuTriggerFor, සහ exportAs 'matMenu' දෝෂ නිරාකරණය කරයි
    
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav #sidenav mode="side" [opened]="sidebarOpen">
        <div class="sidebar-header">
          <h3>{{isAdmin ? 'Admin Panel' : 'My Account'}}</h3>
        </div>
        
        <mat-nav-list>
          <!-- Admin/Staff Navigation -->
          <ng-container *ngIf="isAdmin">
            <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/admin/rooms" routerLinkActive="active">
              <mat-icon>meeting_room</mat-icon>
              <span>Rooms</span>
            </a>
            <a mat-list-item routerLink="/admin/bookings" routerLinkActive="active">
              <mat-icon>book_online</mat-icon>
              <span>Bookings</span>
            </a>
            <a mat-list-item routerLink="/admin/customers" routerLinkActive="active">
              <mat-icon>people</mat-icon>
              <span>Customers</span>
            </a>
            <a mat-list-item routerLink="/admin/payments" routerLinkActive="active">
              <mat-icon>payments</mat-icon>
              <span>Payments</span>
            </a>
            <a mat-list-item routerLink="/admin/reports" routerLinkActive="active">
              <mat-icon>analytics</mat-icon>
              <span>Reports</span>
            </a>
          </ng-container>

          <!-- Customer Navigation -->
          <ng-container *ngIf="isCustomer">
            <a mat-list-item routerLink="/customer/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/customer/bookings" routerLinkActive="active">
              <mat-icon>book_online</mat-icon>
              <span>My Bookings</span>
            </a>
            <a mat-list-item routerLink="/customer/profile" routerLinkActive="active">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </a>
          </ng-container>

          <!-- Common Navigation -->
          <mat-divider></mat-divider>
          <a mat-list-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="toggleSidebar()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Hotel Management System</span>
          <span class="spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{isAdmin ? 'Admin' : 'Customer'}}
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    
    .sidebar-header {
      padding: 16px;
      text-align: center;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .sidebar-header h3 {
      margin: 0;
      color: #333;
    }
    
    mat-nav-list a {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    mat-nav-list a.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .content {
      padding: 20px;
    }
  `]
})
export class DashboardComponent {
  isAdmin = false;
  isCustomer = false;
  sidebarOpen = true;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.isAdmin() || this.authService.isStaff();
    this.isCustomer = this.authService.isCustomer();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout();
  }
}