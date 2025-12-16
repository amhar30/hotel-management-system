import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
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
import { ApiService } from '../../services/api.service';
import { Room } from '../../models/room.model';
// import { RoomFormComponent } from '../room-form/room-form';

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

          <!-- Stats Cards -->
          <div class="stats-cards" *ngIf="roomStats">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon color="primary">meeting_room</mat-icon>
                  <div>
                    <h3>{{roomStats.total}}</h3>
                    <p>Total Rooms</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon color="accent">check_circle</mat-icon>
                  <div>
                    <h3>{{roomStats.available}}</h3>
                    <p>Available</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon color="warn">event_busy</mat-icon>
                  <div>
                    <h3>{{roomStats.booked}}</h3>
                    <p>Booked</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon color="warn">build</mat-icon>
                  <div>
                    <h3>{{roomStats.maintenance}}</h3>
                    <p>Maintenance</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Loading Spinner -->
          <div class="loading-spinner" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Rooms Table -->
          <div class="table-container" *ngIf="!isLoading">
            <table mat-table [dataSource]="rooms" class="mat-elevation-z8">
              
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
            <div class="empty-state" *ngIf="rooms.length === 0 && !isLoading">
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
    
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
export class RoomsListComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = false;
  roomStats: any = null;
  displayedColumns: string[] = ['room_number', 'type', 'price', 'capacity', 'status', 'amenities', 'actions'];
  filterForm: FormGroup;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      type: [''],
      search: ['']
    });
  }

  ngOnInit() {
    this.loadRooms();
    this.loadRoomStatistics();
  }

  loadRooms() {
    this.isLoading = true;
    const filters = this.filterForm.value;
    
    this.api.get<{success: boolean, data: any}>('/rooms', filters).subscribe({
      next: (response) => {
        this.rooms = response.data?.data || response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.isLoading = false;
      }
    });
  }

  loadRoomStatistics() {
    this.api.get<{success: boolean, data: any}>('/rooms/statistics').subscribe({
      next: (response) => {
        if (response.success) {
          this.roomStats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading room statistics:', error);
      }
    });
  }

  applyFilters() {
    this.loadRooms();
  }

  clearFilters() {
    this.filterForm.reset();
    this.loadRooms();
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
    // TODO: Implement add room dialog
    console.log('Add room clicked');
  }

  editRoom(room: Room) {
    // TODO: Implement edit room dialog
    console.log('Edit room:', room.id);
  }

  deleteRoom(room: Room) {
    // TODO: Implement delete room with confirmation
    console.log('Delete room:', room.id);
  }
}