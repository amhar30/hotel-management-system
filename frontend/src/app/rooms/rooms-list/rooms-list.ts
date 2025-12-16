import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Room } from '../../models/room.model';
import { 
  loadRooms, 
  updateRoomFilters,
  deleteRoom 
} from '../../store/rooms/rooms.actions';
import { 
  selectFilteredRooms, 
  selectRoomsLoading,
  selectRoomFilters 
} from '../../store/rooms/rooms.selectors';

@Component({
  selector: 'app-rooms-list',
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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Rooms Management</mat-card-title>
          <mat-card-subtitle>View and manage hotel rooms</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <form [formGroup]="filterForm" class="filters">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="">All</mat-option>
                  <mat-option value="available">Available</mat-option>
                  <mat-option value="booked">Booked</mat-option>
                  <mat-option value="maintenance">Maintenance</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="">All</mat-option>
                  <mat-option value="single">Single</mat-option>
                  <mat-option value="double">Double</mat-option>
                  <mat-option value="deluxe">Deluxe</mat-option>
                  <mat-option value="suite">Suite</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Search</mat-label>
                <input matInput formControlName="search" placeholder="Room number">
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

          <!-- Rooms Table -->
          <div class="table-container" *ngIf="!(loading$ | async)">
            <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
              
              <!-- Room Number Column -->
              <ng-container matColumnDef="room_number">
                <th mat-header-cell *matHeaderCellDef>Room No.</th>
                <td mat-cell *matCellDef="let room">
                  <strong>{{room.room_number}}</strong>
                </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let room">
                  <mat-chip-set>
                    <mat-chip [color]="getTypeColor(room.type)" selected>
                      {{room.type | titlecase}}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price/Night</th>
                <td mat-cell *matCellDef="let room">₹{{room.price_per_night}}</td>
              </ng-container>

              <!-- Capacity Column -->
              <ng-container matColumnDef="capacity">
                <th mat-header-cell *matHeaderCellDef>Capacity</th>
                <td mat-cell *matCellDef="let room">
                  <mat-icon>person</mat-icon> {{room.capacity}}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let room">
                  <span [class]="'status-badge status-' + room.status">
                    {{room.status | titlecase}}
                  </span>
                </td>
              </ng-container>

              <!-- Amenities Column -->
              <ng-container matColumnDef="amenities">
                <th mat-header-cell *matHeaderCellDef>Amenities</th>
                <td mat-cell *matCellDef="let room">
                  <div class="amenities">
                    <span *ngFor="let amenity of room.amenities?.slice(0, 3)" class="amenity-chip">
                      {{amenity}}
                    </span>
                    <span *ngIf="(room.amenities?.length || 0) > 3" class="amenity-more">
                      +{{(room.amenities?.length || 0) - 3}} more
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let room">
                  <button mat-icon-button color="primary" [routerLink]="['/admin/rooms', room.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="editRoom(room)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteRoom(room)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="dataSource.data.length === 0 && !(loading$ | async)">
              <mat-icon>meeting_room</mat-icon>
              <h3>No rooms found</h3>
              <p>Try changing your filters or add new rooms.</p>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="addRoom()">
            <mat-icon>add</mat-icon>
            Add New Room
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
    
    .status-available {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    
    .status-booked {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .status-maintenance {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .amenity-chip {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
    }
    
    .amenity-more {
      color: #666;
      font-size: 11px;
      font-style: italic;
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
export class RoomsListComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  displayedColumns: string[] = ['room_number', 'type', 'price', 'capacity', 'status', 'amenities', 'actions'];
  
  filteredRooms$: Observable<Room[]>;
  loading$: Observable<boolean>;
  dataSource = new MatTableDataSource<Room>([]);
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      type: [''],
      search: ['']
    });

    this.filteredRooms$ = this.store.select(selectFilteredRooms);
    this.loading$ = this.store.select(selectRoomsLoading);
  }

  ngOnInit() {
    // Load initial rooms
    this.store.dispatch(loadRooms({}));
    
    // Subscribe to filtered rooms and update data source
    this.filteredRooms$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rooms => {
        this.dataSource.data = rooms || [];
      });
    
    // Subscribe to filter changes
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.store.dispatch(updateRoomFilters({ filters }));
      });
    
    // Load initial filters from store
    this.store.select(selectRoomFilters)
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
    this.store.dispatch(updateRoomFilters({ filters }));
    this.store.dispatch(loadRooms({ filters }));
  }

  clearFilters() {
    this.filterForm.reset();
    const emptyFilters = { status: '', type: '', search: '' };
    this.store.dispatch(updateRoomFilters({ filters: emptyFilters }));
    this.store.dispatch(loadRooms({}));
  }

  getTypeColor(type: string): any {
    switch(type) {
      case 'single': return 'primary';
      case 'double': return 'accent';
      case 'deluxe': return 'warn';
      case 'suite': return undefined;
      default: return undefined;
    }
  }

  addRoom() {
    console.log('Add room clicked');
  }

  editRoom(room: Room) {
    console.log('Edit room:', room.id);
  }

  deleteRoom(room: Room) {
    if (confirm(`Are you sure you want to delete room ${room.room_number}?`)) {
      this.store.dispatch(deleteRoom({ id: room.id }));
    }
  }
}