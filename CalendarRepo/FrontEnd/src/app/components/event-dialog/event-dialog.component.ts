import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/services/event.service';

export interface EventData {
  Id: number;
  Title: string;
  Date: Date;
  Start: number;
  End: number;
  Hours: number;
  MaintenanceHours: boolean;
  Client?: string;
  Project?: string;
  Status: 'completed' | 'in-progress' | 'pending';
  Note?: string;
}

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})

export class EventDialogComponent {
  eventForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventData,
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    // Inizializza il form con i dati passati (oppure valori di default)
    this.eventForm = this.fb.group({
      title: [data.Title, Validators.required],
      hours: [data.Hours, [Validators.required, Validators.min(0)]],
      maintenanceHours: [data.MaintenanceHours, []],
      start: [data.Start, [Validators.required]],
      end: [data.End, [Validators.required]],
      client: [data.Client, []],
      project: [data.Project, []],
      status: [data.Status, [Validators.required]],
      note: [data.Note || '']
    });
  }

  onSave(): void {
    if (this.eventForm.valid) {
      // Raccogli i dati dal form e li restituisce
      const result: EventData = {
        Id: this.data.Id,
        Date: this.data.Date,
        ...this.eventForm.value
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    // this.eventService.deleteEvent(this.data.Id);
    this.dialogRef.close('delete');
  }
}
