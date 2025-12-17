import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';

interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  method: 'cash' | 'card' | 'online';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  booking?: {
    id: number;
    customer?: {
      name: string;
      email: string;
    };
    room?: {
      room_number: string;
    };
  };
}

@Component({
  selector: 'app-payments-list',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Payments Management</mat-card-title>
          <mat-card-subtitle>View and manage all payments</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <form [formGroup]="filterForm" class="filters">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="">All</mat-option>
                  <mat-option value="pending">Pending</mat-option>
                  <mat-option value="paid">Paid</mat-option>
                  <mat-option value="failed">Failed</mat-option>
                  <mat-option value="refunded">Refunded</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Method</mat-label>
                <mat-select formControlName="method">
                  <mat-option value="">All</mat-option>
                  <mat-option value="cash">Cash</mat-option>
                  <mat-option value="card">Card</mat-option>
                  <mat-option value="online">Online</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Search</mat-label>
                <input matInput formControlName="search" placeholder="Customer name or Transaction ID">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <button mat-raised-button color="primary" (click)="applyFilters()">
                Apply Filters
              </button>
              <button mat-button (click)="clearFilters()">
                Clear
              </button>
            </div>
          </form>

          <!-- Stats Cards -->
          <div class="stats-cards" *ngIf="paymentStats">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon color="primary">payments</mat-icon>
                  <div>
                    <h3>LKR {{paymentStats.total_revenue | number}}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon color="accent">today</mat-icon>
                  <div>
                    <h3>LKR {{paymentStats.today_revenue | number}}</h3>
                    <p>Today's Revenue</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon color="warn">pending</mat-icon>
                  <div>
                    <h3>{{paymentStats.pending_payments}}</h3>
                    <p>Pending Payments</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Loading Spinner -->
          <div class="loading-spinner" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Payments Table -->
          <div class="table-container" *ngIf="!isLoading">
            <table mat-table [dataSource]="payments" class="mat-elevation-z8">
              
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let payment">{{payment.id}}</td>
              </ng-container>

              <!-- Booking Column -->
              <ng-container matColumnDef="booking">
                <th mat-header-cell *matHeaderCellDef>Booking</th>
                <td mat-cell *matCellDef="let payment">
                  <div>Booking #{{payment.booking_id}}</div>
                  <small *ngIf="payment.booking?.customer">{{payment.booking.customer.name}}</small>
                </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let payment">
                  <strong>LKR {{payment.amount}}</strong>
                </td>
              </ng-container>

              <!-- Method Column -->
              <ng-container matColumnDef="method">
                <th mat-header-cell *matHeaderCellDef>Method</th>
                <td mat-cell *matCellDef="let payment">
                  <mat-chip-set>
                    <mat-chip [color]="getMethodColor(payment.method)" selected>
                      {{payment.method | titlecase}}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let payment">
                  <span [class]="'status-badge status-' + payment.status">
                    {{payment.status | titlecase}}
                  </span>
                </td>
              </ng-container>

              <!-- Transaction ID Column -->
              <ng-container matColumnDef="transaction_id">
                <th mat-header-cell *matHeaderCellDef>Transaction ID</th>
                <td mat-cell *matCellDef="let payment">
                  {{payment.transaction_id || 'N/A'}}
                </td>
              </ng-container>

              <!-- Paid Date Column -->
              <ng-container matColumnDef="paid_at">
                <th mat-header-cell *matHeaderCellDef>Paid Date</th>
                <td mat-cell *matCellDef="let payment">
                  {{payment.paid_at ? (payment.paid_at | date:'medium') : 'N/A'}}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let payment">
                  <button mat-icon-button color="primary" [routerLink]="['/admin/payments', payment.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" *ngIf="payment.status === 'pending'" (click)="processPayment(payment)">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" *ngIf="payment.status === 'paid'" (click)="refundPayment(payment)">
                    <mat-icon>undo</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="payments.length === 0 && !isLoading">
              <mat-icon>receipt_long</mat-icon>
              <h3>No payments found</h3>
              <p>Try changing your filters or check back later.</p>
            </div>
          </div>
        </mat-card-content>
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
      min-width: 200px;
    }
    
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      height: 100%;
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .stat-content mat-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
    }
    
    .stat-content h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    
    .stat-content p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 14px;
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
    
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-paid {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    
    .status-failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .status-refunded {
      background-color: #cce5ff;
      color: #004085;
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
  `]
})
export class PaymentsListComponent implements OnInit {
  payments: Payment[] = [];
  isLoading = false;
  paymentStats: any = null;
  displayedColumns: string[] = ['id', 'booking', 'amount', 'method', 'status', 'transaction_id', 'paid_at', 'actions'];
  filterForm: FormGroup;

  constructor(
    private api: ApiService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      method: [''],
      search: [''],
      from_date: [''],
      to_date: ['']
    });
  }

  ngOnInit() {
    this.loadPayments();
    this.loadPaymentStatistics();
  }

  loadPayments() {
    this.isLoading = true;
    const filters = this.filterForm.value;
    
    this.api.get<{success: boolean, data: any}>('/payments', filters).subscribe({
      next: (response) => {
        this.payments = response.data?.data || response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
      }
    });
  }

  loadPaymentStatistics() {
    this.api.get<{success: boolean, data: any}>('/payments/statistics').subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentStats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading payment statistics:', error);
      }
    });
  }

  applyFilters() {
    this.loadPayments();
  }

  clearFilters() {
    this.filterForm.reset();
    this.loadPayments();
  }

  getMethodColor(method: string): any {
    switch(method) {
      case 'cash': return 'primary';
      case 'card': return 'accent';
      case 'online': return 'warn';
      default: return undefined;
    }
  }

  processPayment(payment: Payment) {
    // TODO: Implement process payment
    console.log('Process payment:', payment.id);
  }

  refundPayment(payment: Payment) {
    // TODO: Implement refund payment
    console.log('Refund payment:', payment.id);
  }
}