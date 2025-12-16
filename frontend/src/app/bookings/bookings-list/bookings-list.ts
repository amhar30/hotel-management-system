import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Booking } from '../../models/booking.model';
import { 
  loadBookings, 
  updateBookingFilters,
  updateBookingStatus,
  cancelBooking 
} from '../../store/bookings/bookings.actions';
import { 
  selectAllBookings, 
  selectBookingsLoading,
  selectFilteredBookings,
  selectBookingFilters 
} from '../../store/bookings/bookings.selectors';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Bookings Management</mat-card-title>
          <mat-card-subtitle>View and manage all bookings</mat-card-subtitle>
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
                  <mat-option value="confirmed">Confirmed</mat-option>
                  <mat-option value="checked_in">Checked In</mat-option>
                  <mat-option value="checked_out">Checked Out</mat-option>
                  <mat-option value="completed">Completed</mat-option>
                  <mat-option value="cancelled">Cancelled</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Search</mat-label>
                <input matInput formControlName="search" placeholder="Customer name, email, room number">
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

          <!-- Loading Spinner -->
          <div class="loading-spinner" *ngIf="loading$ | async">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Bookings Table -->
          <div class="table-container" *ngIf="!(loading$ | async)">
            <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
              
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let booking">{{booking.id}}</td>
              </ng-container>

              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let booking">{{booking.customer?.name}}</td>
              </ng-container>

              <!-- Room Column -->
              <ng-container matColumnDef="room">
                <th mat-header-cell *matHeaderCellDef>Room</th>
                <td mat-cell *matCellDef="let booking">{{booking.room?.room_number}} ({{booking.room?.type}})</td>
              </ng-container>

              <!-- Dates Column -->
              <ng-container matColumnDef="dates">
                <th mat-header-cell *matHeaderCellDef>Dates</th>
                <td mat-cell *matCellDef="let booking">
                  {{booking.check_in_date | date:'shortDate'}} - {{booking.check_out_date | date:'shortDate'}}
                </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let booking">₹{{booking.total_amount}}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let booking">
                  <span [class]="'status-badge status-' + booking.status">
                    {{booking.status | titlecase}}
                  </span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let booking">
                  <button mat-icon-button color="primary" [routerLink]="['/admin/bookings', booking.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" *ngIf="booking.status === 'pending'" (click)="confirmBooking(booking)">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" *ngIf="booking.status === 'pending' || booking.status === 'confirmed'" (click)="cancelBooking(booking)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="dataSource.data.length === 0 && !(loading$ | async)">
              <mat-icon>event_busy</mat-icon>
              <h3>No bookings found</h3>
              <p>Try changing your filters or check back later.</p>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/admin/bookings/new">
            <mat-icon>add</mat-icon>
            New Booking
          </button>
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
      min-width: 200px;
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
    
    .status-confirmed {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    .status-checked_in {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-checked_out {
      background-color: #cce5ff;
      color: #004085;
    }
    
    .status-completed {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    
    .status-cancelled {
      background-color: #f8d7da;
      color: #721c24;
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
export class BookingsListComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  displayedColumns: string[] = ['id', 'customer', 'room', 'dates', 'amount', 'status', 'actions'];
  
  filteredBookings$: Observable<Booking[]>;
  loading$: Observable<boolean>;
  dataSource = new MatTableDataSource<Booking>([]);
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      search: [''],
      from_date: [''],
      to_date: ['']
    });

    this.filteredBookings$ = this.store.select(selectFilteredBookings);
    this.loading$ = this.store.select(selectBookingsLoading);
  }

  ngOnInit() {
    // Load initial bookings
    this.store.dispatch(loadBookings({}));
    
    // Subscribe to filtered bookings and update data source
    this.filteredBookings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => {
        this.dataSource.data = bookings || [];
      });
    
    // Subscribe to filter changes
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.store.dispatch(updateBookingFilters({ filters }));
      });
    
    // Load initial filters from store
    this.store.select(selectBookingFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.filterForm.patchValue(filters, { emitEvent: false });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters() {
    const filters = this.filterForm.value;
    this.store.dispatch(updateBookingFilters({ filters }));
    this.store.dispatch(loadBookings({ filters }));
  }

  clearFilters() {
    this.filterForm.reset();
    const emptyFilters = { status: '', search: '', from_date: '', to_date: '' };
    this.store.dispatch(updateBookingFilters({ filters: emptyFilters }));
    this.store.dispatch(loadBookings({}));
  }

  confirmBooking(booking: Booking) {
    if (confirm(`Confirm booking #${booking.id}?`)) {
      this.store.dispatch(updateBookingStatus({ 
        id: booking.id, 
        status: 'confirmed' 
      }));
    }
  }

  cancelBooking(booking: Booking) {
    if (confirm(`Cancel booking #${booking.id}?`)) {
      this.store.dispatch(cancelBooking({ id: booking.id }));
    }
  }
}