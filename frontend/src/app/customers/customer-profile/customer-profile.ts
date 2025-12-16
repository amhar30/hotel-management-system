import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>My Profile</mat-card-title>
          <mat-card-subtitle>View and update your profile</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Your profile information will be displayed here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class CustomerProfileComponent {}