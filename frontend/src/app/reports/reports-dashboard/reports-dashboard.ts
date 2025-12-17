import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Reports & Analytics</mat-card-title>
          <mat-card-subtitle>View detailed reports and analytics</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Report Type Selector -->
          <div class="report-selector">
            <mat-form-field appearance="outline" class="period-selector">
              <mat-label>Report Type</mat-label>
              <mat-select [(value)]="selectedReport" (selectionChange)="loadReport()">
                <mat-option value="revenue">Revenue Report</mat-option>
                <mat-option value="occupancy">Occupancy Report</mat-option>
                <mat-option value="customers">Customer Report</mat-option>
                <mat-option value="services">Service Report</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="period-selector">
              <mat-label>Period</mat-label>
              <mat-select [(value)]="selectedPeriod" (selectionChange)="loadReport()">
                <mat-option value="daily">Daily</mat-option>
                <mat-option value="weekly">Weekly</mat-option>
                <mat-option value="monthly">Monthly</mat-option>
                <mat-option value="yearly">Yearly</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="exportReport()">
              <mat-icon>download</mat-icon>
              Export Report
            </button>
          </div>

          <!-- Loading Spinner -->
          <div class="loading-spinner" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Revenue Report -->
          <div *ngIf="!isLoading && selectedReport === 'revenue'">
            <div class="summary-cards">
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="primary">trending_up</mat-icon>
                    <div>
                      <h3>LKR {{revenueStats?.total_revenue || 0 | number}}</h3>
                      <p>Total Revenue</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="accent">today</mat-icon>
                    <div>
                      <h3>LKR {{revenueStats?.today_revenue || 0 | number}}</h3>
                      <p>Today's Revenue</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="warn">assessment</mat-icon>
                    <div>
                      <h3>{{revenueStats?.average_daily_rate || 0 | number}}</h3>
                      <p>Avg Daily Rate</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="report-data" *ngIf="reportData.length > 0">
              <h3>Revenue Data</h3>
              <div class="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Revenue</th>
                      <th>Bookings</th>
                      <th *ngIf="selectedPeriod === 'monthly'">Occupancy Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of reportData">
                      <td>{{getPeriodLabel(item)}}</td>
                      <td>LKR {{item.revenue || 0 | number}}</td>
                      <td>{{item.bookings || 0}}</td>
                      <td *ngIf="selectedPeriod === 'monthly'">{{item.occupancy_rate || 0}}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Occupancy Report -->
          <div *ngIf="!isLoading && selectedReport === 'occupancy'">
            <div class="summary-cards">
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="primary">hotel</mat-icon>
                    <div>
                      <h3>{{occupancyStats?.current_occupancy?.occupancy_rate || 0}}%</h3>
                      <p>Current Occupancy</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="accent">meeting_room</mat-icon>
                    <div>
                      <h3>{{occupancyStats?.current_occupancy?.available_rooms || 0}}</h3>
                      <p>Available Rooms</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="warn">bed</mat-icon>
                    <div>
                      <h3>{{occupancyStats?.current_occupancy?.booked_rooms || 0}}</h3>
                      <p>Booked Rooms</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Customer Report -->
          <div *ngIf="!isLoading && selectedReport === 'customers'">
            <div class="summary-cards">
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="primary">people</mat-icon>
                    <div>
                      <h3>{{customerStats?.total_customers || 0}}</h3>
                      <p>Total Customers</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="accent">person_add</mat-icon>
                    <div>
                      <h3>{{customerStats?.new_customers_this_month || 0}}</h3>
                      <p>New This Month</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="warn">repeat</mat-icon>
                    <div>
                      <h3>{{customerStats?.customers_with_bookings || 0}}</h3>
                      <p>Customers with Bookings</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Service Report -->
          <div *ngIf="!isLoading && selectedReport === 'services'">
            <div class="summary-cards">
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="primary">room_service</mat-icon>
                    <div>
                      <h3>LKR {{serviceStats?.total_service_revenue || 0 | number}}</h3>
                      <p>Total Service Revenue</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-content">
                    <mat-icon color="accent">spa</mat-icon>
                    <div>
                      <h3>{{serviceStats?.average_service_per_booking || 0}}</h3>
                      <p>Avg Services per Booking</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
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
    
    .report-selector {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    
    .period-selector {
      min-width: 200px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      height: 100%;
    }
    
    .summary-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .summary-content mat-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
    }
    
    .summary-content h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    
    .summary-content p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 14px;
    }
    
    .report-data {
      margin-top: 30px;
    }
    
    .report-data h3 {
      margin-bottom: 15px;
      color: #333;
    }
    
    .data-table {
      overflow-x: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .data-table table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .data-table th {
      background-color: #f5f5f5;
      padding: 12px 15px;
      text-align: left;
      font-weight: 500;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .data-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .data-table tr:hover {
      background-color: #f9f9f9;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class ReportsDashboardComponent implements OnInit {
  selectedReport = 'revenue';
  selectedPeriod = 'monthly';
  isLoading = false;
  reportData: any[] = [];
  revenueStats: any = null;
  occupancyStats: any = null;
  customerStats: any = null;
  serviceStats: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    
    switch(this.selectedReport) {
      case 'revenue':
        this.loadRevenueReport();
        break;
      case 'occupancy':
        this.loadOccupancyReport();
        break;
      case 'customers':
        this.loadCustomerReport();
        break;
      case 'services':
        this.loadServiceReport();
        break;
    }
  }

  loadRevenueReport() {
    this.api.get<{success: boolean, data: any}>(`/reports/revenue?period=${this.selectedPeriod}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.reportData = response.data.revenue_data || [];
          this.revenueStats = response.data.summary || {};
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading revenue report:', error);
        this.isLoading = false;
      }
    });
  }

  loadOccupancyReport() {
    this.api.get<{success: boolean, data: any}>(`/reports/occupancy?period=${this.selectedPeriod}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.reportData = response.data.occupancy_data || [];
          this.occupancyStats = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading occupancy report:', error);
        this.isLoading = false;
      }
    });
  }

  loadCustomerReport() {
    this.api.get<{success: boolean, data: any}>(`/reports/customers?period=${this.selectedPeriod}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.customerStats = response.data.summary || {};
          this.reportData = response.data.acquisition_data || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customer report:', error);
        this.isLoading = false;
      }
    });
  }

  loadServiceReport() {
    this.api.get<{success: boolean, data: any}>('/reports/services').subscribe({
      next: (response) => {
        if (response.success) {
          this.serviceStats = response.data.summary || {};
          this.reportData = response.data.top_services || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading service report:', error);
        this.isLoading = false;
      }
    });
  }

  getPeriodLabel(item: any): string {
    switch(this.selectedPeriod) {
      case 'daily':
        return item.day_name + ' ' + item.day;
      case 'weekly':
        return 'Week ' + item.week + ' (' + item.week_range + ')';
      case 'monthly':
        return item.month_name;
      case 'yearly':
        return item.year.toString();
      default:
        return '';
    }
  }

  exportReport() {
    const exportData = {
      report_type: this.selectedReport,
      format: 'csv',
      period: this.selectedPeriod
    };

    this.api.post('/reports/export', exportData).subscribe({
      next: (response) => {
        console.log('Export initiated:', response);
        // TODO: Handle file download
      },
      error: (error) => {
        console.error('Error exporting report:', error);
      }
    });
  }
}