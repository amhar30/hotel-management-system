import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/user.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Customers Management</mat-card-title>
          <mat-card-subtitle>View and manage hotel customers</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <form [formGroup]="filterForm" class="filters">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Search Customers</mat-label>
                <input matInput formControlName="search" placeholder="Name, email, or phone">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <button mat-raised-button color="primary" (click)="applyFilters()">
                Search
              </button>
              <button mat-button (click)="clearFilters()">
                Clear
              </button>
            </div>
          </form>

          <!-- Loading Spinner -->
          <div class="loading-spinner" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Customers Table -->
          <div class="table-container" *ngIf="!isLoading">
            <table mat-table [dataSource]="customers" class="mat-elevation-z8">
              
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let customer">{{customer.id}}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let customer">{{customer.name}}</td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let customer">{{customer.email}}</td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let customer">{{customer.phone || 'N/A'}}</td>
              </ng-container>

              <!-- Bookings Column -->
              <ng-container matColumnDef="bookings">
                <th mat-header-cell *matHeaderCellDef>Bookings</th>
                <td mat-cell *matCellDef="let customer">
                  <mat-chip-set>
                    <mat-chip color="primary" selected>
                      {{customer.bookings_count || 0}}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Total Spent Column -->
              <ng-container matColumnDef="total_spent">
                <th mat-header-cell *matHeaderCellDef>Total Spent</th>
                <td mat-cell *matCellDef="let customer">₹{{customer.total_spent || 0}}</td>
              </ng-container>

              <!-- Member Since Column -->
              <ng-container matColumnDef="member_since">
                <th mat-header-cell *matHeaderCellDef>Member Since</th>
                <td mat-cell *matCellDef="let customer">{{customer.created_at | date:'mediumDate'}}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let customer">
                  <button mat-icon-button color="primary" [routerLink]="['/admin/customers', customer.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" [routerLink]="['/admin/customers', customer.id, 'bookings']">
                    <mat-icon>book_online</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteCustomer(customer)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="customers.length === 0 && !isLoading">
              <mat-icon>people</mat-icon>
              <h3>No customers found</h3>
              <p>Try changing your search or check back later.</p>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total Customers:</span>
              <span class="stat-value">{{totalCustomers}}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Active Customers:</span>
              <span class="stat-value">{{activeCustomers}}</span>
            </div>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    
    .filters {
      margin-bottom: 20px;
    }
    
    .filter-row {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .filter-field {
      min-width: 300px;
    }
    
    .table-container {
      overflow-x: auto;
      margin-top: 20px;
    }
    
    table {
      width: 100%;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }
    
    .empty-state h3 {
      margin: 10px 0;
      color: #333;
    }
    
    .stats {
      display: flex;
      gap: 30px;
      padding: 10px 0;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }
  `]
})
export class CustomersListComponent implements OnInit {
  customers: Customer[] = [];
  isLoading = false;
  totalCustomers = 0;
  activeCustomers = 0;
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'bookings', 'total_spent', 'member_since', 'actions'];
  filterForm: FormGroup;

  constructor(
    private api: ApiService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadStatistics();
  }

  loadCustomers() {
    this.isLoading = true;
    const filters = this.filterForm.value;
    
    this.api.get<{success: boolean, data: any}>('/customers', filters).subscribe({
      next: (response) => {
        this.customers = response.data?.data || response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.isLoading = false;
      }
    });
  }

  loadStatistics() {
    this.api.get<{success: boolean, data: any}>('/customers/statistics').subscribe({
      next: (response) => {
        if (response.success) {
          this.totalCustomers = response.data.total_customers || 0;
          this.activeCustomers = response.data.customers_with_bookings || 0;
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  applyFilters() {
    this.loadCustomers();
  }

  clearFilters() {
    this.filterForm.reset();
    this.loadCustomers();
  }

  deleteCustomer(customer: Customer) {
    // TODO: Implement delete customer with confirmation
    console.log('Delete customer:', customer.id);
  }
}