import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Room Form</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Room form will be displayed here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RoomFormComponent {}