import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { Commesse } from 'src/app/models/commessa.model';
import { EventService } from 'src/app/services/event.service';
import { EventData, EventDialogComponent } from '../event-dialog/event-dialog.component';
import { FilterCriteria } from '../filter/filter.component';
import { ExtendedCalendarEvent } from 'src/app/models/calendar-event.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

// Import jsPDF e il plugin per creare tabelle
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReminderService } from 'src/app/services/reminder.service';
import { CommesseService } from 'src/app/services/commesse.service';
import { ToastrService } from 'ngx-toastr';
import { concatMap, from } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  viewDate: Date = new Date();
  calendarEvents: ExtendedCalendarEvent[] = [];
  // Conserva tutti gli eventi e quelli filtrati separatamente
  allEvents: Commesse[] = [];
  // filteredEvents: CalendarEvent[] = [];

  showSpinner = false;
  constructor(
    private commesseService: CommesseService,
    private reminderService: ReminderService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) { }
  ngOnDestroy(): void {
    // this.stopReminders();
  }

  ngOnInit(): void {
    this.loadEvents();

    // this.startReminders();
  }

  loadEvents(): void {
    this.showSpinner = true;
    this.commesseService.getCommesse().subscribe({
      next: (response) => {
        this.allEvents = response;
        this.showSpinner = false;
        this.calendarEvents = this.allEvents.map(e => ({
          id: e.Id,
          start: new Date(e.Date),
          meta: { id: e.Id, original: e },  // Conserva l'evento originale
          title: `${e.Title} (Ore: ${e.Hours}, Manutenzione: ${e.MaintenanceHours}, Note: ${e.Note || ''})`,
          client: e.Client,
          project: e.Project,
          status: e.Status,
          hours: e.Hours,
          minHours: e.Start,
          maxHours: e.End,
          maintenanceHours: e.MaintenanceHours,
          note: e.Note
        }));

        this.applyFilter({}); // inizialmente nessun filtro
      },
      error: (err) => {
        this.toastr.error('Errore caricamento commesse');
        this.showSpinner = false;
      }
    });
  }

  // Metodi per attivare/disattivare i promemoria
  startReminders(): void {
    this.reminderService.startReminders();
    // alert('Promemoria attivati!');
  }

  stopReminders(): void {
    this.reminderService.stopReminders();
    // alert('Promemoria disattivati!');
  }

  applyFilter(criteria: FilterCriteria): void {
    let filtered = this.allEvents;

    if (criteria.title && criteria.title.trim() !== '') {
      filtered = filtered.filter(e => e.Title.toLowerCase().includes(criteria.title!.toLowerCase()));
    }

    // if (criteria.startDate) {
    //   filtered = filtered.filter(e => new Date(e.date) >= new Date(criteria.startDate!));
    // }

    // if (criteria.endDate) {
    //   filtered = filtered.filter(e => new Date(e.date) <= new Date(criteria.endDate!));
    // }

    if (criteria.minHours != null) {
      filtered = filtered.filter(e => e.Start >= criteria.minHours!);
    }

    if (criteria.maxHours != null) {
      filtered = filtered.filter(e => e.End <= criteria.maxHours!);
    }

    if (criteria.maintenanceHours) {
      filtered = filtered.filter(e => e.MaintenanceHours == criteria.maintenanceHours!);
    }

    if (criteria.statuses && criteria.statuses.length > 0) {
      filtered = filtered.filter(e => criteria.statuses!.includes(e.Status));
    }

    if (criteria.client) {
      filtered = filtered.filter(e => e.Client ? criteria.client!.includes(e.Client) : true);
    }

    if (criteria.project) {
      filtered = filtered.filter(e => e.Project ? criteria.project!.includes(e.Project) : true);
    }

    // Mappa gli eventi filtrati al formato richiesto da angular-calendar
    this.calendarEvents = filtered.map(e => ({
      id: e.Id,
      start: new Date(e.Date),
      title: `${e.Title} (Ore: ${e.Hours}, Manutenzione: ${e.MaintenanceHours}, Note: ${e.Note || ''})`,
      client: e.Client,
      project: e.Project,
      status: e.Status,
      hours: e.Hours,
      minHours: e.Start,
      maxHours: e.End,
      maintenanceHours: e.MaintenanceHours,
      note: e.Note
    }));

  }

  dayClicked(event: any): void {
    console.log('Day clicked:', event.day);
    console.log('Day clicked:', event.day.date);
    // Apri il dialog per aggiungere una nuova commessa per il giorno cliccato
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '400px',
      data: {
        Id: 0, //this.eventService.getNewIndex(), // generazione semplice dell'ID
        Date: event.day.date,
        Title: '',
        Hours: 0,
        MaintenanceHours: false,
        Start: 8,
        End: 17,
        Status: 'in-progress',
        Note: ''
      } as EventData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'delete') {
        alert('Non puoi eliminare senza prima aver create l\'elemento!');
      }
      else if (result) {
        // Se si è salvato il dialog, aggiungi la commessa tramite il service
        const newEvent: Commesse = {
          Id: result.Id,
          Date: result.Date,
          Start: result.start,
          End: result.end,
          Status: result.status,
          Client: result.client,
          Project: result.project,
          Title: result.title,
          Hours: result.hours,
          MaintenanceHours: result.maintenanceHours,
          Note: result.note
        };
        const _Date = this.convertToUtc(newEvent.Date);
        newEvent.Date = _Date;
        this.showSpinner = true;
        this.commesseService.addCommessa(newEvent).subscribe({
          next: (response) => {
            this.toastr.success('Commessa creata');
            this.showSpinner = false;
          },
          error: (err) => {
            this.toastr.error('Errore creazione commessa');
            this.showSpinner = false;
          }
        });
      }
      this.loadEvents(); // ricarica gli eventi per aggiornare il calendario
    });
  }

  eventClicked(data: any) {
    const event = this.calendarEvents.find(f => f.title == data.event.title);
    const storedEvent = this.allEvents.find(f => f.Id == event?.id);
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '400px',
      data: {
        Id: storedEvent?.Id,
        Date: storedEvent?.Date,
        Title: storedEvent?.Title,
        Hours: storedEvent?.Hours,
        MaintenanceHours: storedEvent?.MaintenanceHours,
        End: storedEvent?.End,
        Start: storedEvent?.Start,
        Project: storedEvent?.Project,
        Client: storedEvent?.Client,
        Status: storedEvent?.Status,
        Note: storedEvent?.Note
      } as EventData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'delete') {
        this.deleteEvent(storedEvent);
      }
      else if (result) {
        // Se si è salvato il dialog, aggiungi la commessa tramite il service
        const newEvent: Commesse = {
          Id: result.Id,
          Date: result.Date,
          Title: result.title,
          Hours: result.hours,
          MaintenanceHours: result.maintenanceHours,
          Start: result.start,
          End: result.end,
          Status: result.status,
          Client: result.client,
          Project: result.project,
          Note: result.note
        };
        this.commesseService.updateCommessa(newEvent).subscribe({
          next: (response) => {
            this.toastr.success('Commessa aggiornata');
            this.showSpinner = false;
            this.loadEvents();
          },
          error: (err) => {
            this.toastr.error('Errore aggiornamento commessa');
            this.showSpinner = false;
          }
        });
      }
    });
  }

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
  }

  previousYear(): void {
    this.viewDate = new Date(this.viewDate.getFullYear() - 1, this.viewDate.getMonth(), 1);
  }

  nextYear(): void {
    this.viewDate = new Date(this.viewDate.getFullYear() + 1, this.viewDate.getMonth(), 1);
  }

  // drop(event: CdkDragDrop<any>, cell: any): void {
  //   // Recupera l'evento trascinato dalla proprietà data
  //   const draggedEvent = event.item.data;
  //   // La nuova data è quella della cella drop target
  //   const newDate = cell.date;

  //   // Recupera l'evento originale salvato in meta
  //   let originalEvent: Commesse = draggedEvent.meta.original;
  //   // Aggiorna la data dell'evento
  //   originalEvent.Date = newDate;

  //   // Salva l'aggiornamento usando il service
  //   this.eventService.updateEvent(originalEvent);

  //   // Ricarica gli eventi per aggiornare la vista
  //   this.loadEvents();
  // }

  exportData(): void {
    const events = this.allEvents; //this.eventService.getEvents();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "commesseData.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // Esporta i dati in formato CSV
  exportCSV(): void {
    const events: Commesse[] = this.allEvents; //this.eventService.getEvents();
    let csvContent = "data:text/csv;charset=utf-8,";
    // Intestazione delle colonne
    csvContent += "ID,Data,Titolo,Ore,Manutenzione,Status,Nota\n";
    events.forEach(e => {
      const dateStr = new Date(e.Date).toLocaleDateString();
      // Se il titolo contiene virgole, lo racchiudiamo fra virgolette
      csvContent += `${e.Id},${dateStr},"${e.Title}",${e.Hours},${e.MaintenanceHours},"${e.Status || ''}","${e.Note || ''}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "commesse.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Esporta i dati in formato PDF
  exportPDF(): void {
    const events: Commesse[] = this.allEvents; //this.eventService.getEvents();
    const doc = new jsPDF();

    // Titolo del PDF
    doc.setFontSize(18);
    doc.text("Report Commesse", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Preparazione della tabella: header e body
    const head = [['ID', 'Data', 'Titolo', 'Ore', 'Manutenzione', 'Status', 'Nota']];
    const body: any = events.map(e => [
      e.Id,
      new Date(e.Date).toLocaleDateString(),
      e.Title,
      e.Hours,
      e.MaintenanceHours,
      e.Status,
      e.Note || ''
    ]);

    // Usa la funzione autoTable passando l'istanza doc e le opzioni
    autoTable(doc, {
      head: head,
      body: body,
      startY: 30,
      theme: 'grid'
    });

    doc.save("commesse.pdf");
  }

  // Metodo per attivare il file input nascosto
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Metodo per leggere il file JSON e importare i dati
  importJSON(event: any): void {

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          // Legge e parsifica il file JSON
          const importedData = JSON.parse(e.target.result);
          const batchSize = 10;
          const batches = this.chunkArray(importedData, batchSize);

          from(batches).pipe(
            concatMap(batch => this.commesseService.addFromJson(batch)
            )).subscribe({
              next: (response) => {
                this.toastr.success('Commesse create');
                this.loadEvents();
                this.showSpinner = false;
              },
              error: (err) => {
                this.toastr.error('Errore creazione commesse');
                this.showSpinner = false;
              }
            });

          // this.commesseService.addFromJson(JSON.stringify(batches)).subscribe({
          //   next: (response) => {
          //     this.toastr.success('Commesse create');
          //     this.loadEvents();
          //     this.showSpinner = false;
          //   },
          //   error: (err) => {
          //     this.toastr.error('Errore creazione commesse');
          //     this.showSpinner = false;
          //   }
          // })
        } catch (error) {
          console.error("Errore durante l'importazione dei dati", error);
          alert("Errore durante l'importazione. Controlla il formato del file.");
        }
      };
      reader.readAsText(file);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  // Metodo per modificare un evento
  // editEvent(event: any, data: any): void {
  //   event.stopPropagation();
  //   // Usa i dati originali dell'evento salvati in event.meta.original
  //   const originalEvent = data;
  //   const dialogRef = this.dialog.open(EventDialogComponent, {
  //     width: '400px',
  //     data: {
  //       Id: originalEvent.id,
  //       Date: new Date(originalEvent.start),
  //       Title: originalEvent.title,
  //       Hours: originalEvent.hours,
  //       MaintenanceHours: originalEvent.maintenanceHours,
  //       Start: originalEvent.minHours,
  //       End: originalEvent.maxHours,
  //       Status: originalEvent.status,
  //       Client: originalEvent.client,
  //       Project: originalEvent.project,
  //       Note: originalEvent.note || ''
  //     } as EventData
  //   });

  //   dialogRef.afterClosed().subscribe((result: EventData) => {
  //     if (result) {
  //       const updatedEvent = {
  //         // ...originalEvent,
  //         date: result.Date,
  //         title: result.Title,
  //         hours: result.Hours,
  //         maintenanceHours: result.MaintenanceHours,
  //         minHours: result.Start,
  //         maxHours: result.End,
  //         status: result.Status,
  //         note: result.Note
  //       };
  //       this.eventService.updateEvent(result);
  //       this.loadEvents();  // Ricarica gli eventi aggiornati
  //     }
  //   });
  // }

  // Metodo per eliminare un evento
  deleteEvent(data: any): void {
    if (confirm(`Sei sicuro di voler eliminare la commessa "${data.Title}"?`)) {
      this.commesseService.deleteCommessa(data.Id).subscribe({
        next: (response) => {
          this.toastr.success('Commessa eliminata');
          this.loadEvents();
          this.showSpinner = false;
        },
        error: (err) => {
          this.toastr.error('Errore eliminazione commessa');
          this.showSpinner = false;
        }
      });
    }
  }

  convertToUtc(date: any) {
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ));
  }
}
