import { Component, OnInit } from '@angular/core';
import { Commesse } from 'src/app/models/commessa.model';
import { EventService } from 'src/app/services/event.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommesseService } from 'src/app/services/commesse.service';
import { ToastrService } from 'ngx-toastr';

interface CommesseGrouped {
  title: string;
  totalHours: number;
  totalMaintenance: number;
  eventsCount: number;
  records: Commesse[];
}

interface MonthlyReport {
  month: string;
  totalHours: number;
  totalMaintenance: number;
  eventsCount: number;
  details: CommesseGrouped[];
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class ReportComponent implements OnInit {
  reports: MonthlyReport[] = [];
  // Variabile per la riga espansa
  expandedElement: MonthlyReport | null = null;
  expandedCommessa: CommesseGrouped | null = null;

  displayedColumns: string[] = ['month', 'totalHours', 'totalMaintenance', 'eventsCount'];
  displayedColumnsInner: string[] = ['title', 'totalHours', 'totalMaintenance', 'eventsCount'];

  constructor(private commesseService: CommesseService, private toast: ToastrService) { }

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    this.commesseService.getCommesse().subscribe({
      next: (data: Commesse[]) => {
        const events: Commesse[] = data;

        const reportMap: { [key: string]: MonthlyReport } = {};

        events.forEach(event => {
          const date = new Date(event.Date);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          if (!reportMap[key]) {
            reportMap[key] = {
              month: date.toLocaleString('it-IT', { month: 'long', year: 'numeric' }),
              totalHours: 0,
              totalMaintenance: 0,
              eventsCount: 0,
              details: []
            };
          }
          reportMap[key].totalHours += event.Hours;
          reportMap[key].totalMaintenance += event.MaintenanceHours ? 1 : 0;
          reportMap[key].eventsCount++;

          // Raggruppa per titolo
          const existing = reportMap[key].details.find(d => d.title === event.Title);
          if (existing) {
            existing.totalHours += event.Hours;
            existing.totalMaintenance += event.MaintenanceHours ? 1 : 0;
            existing.eventsCount++;
            existing.records.push(event);
          } else {
            reportMap[key].details.push({
              title: event.Title,
              totalHours: event.Hours,
              totalMaintenance: event.MaintenanceHours ? 1 : 0,
              eventsCount: 1,
              records: [event]
            });
          }
        });

        // Trasforma l'oggetto in un array ordinato per data
        this.reports = Object.values(reportMap).sort((a, b) => a.month.localeCompare(b.month));
      },
      error: (error) => {
        this.toast.error('Errore durante il recupero delle commesse');
      }
    });
  }
}
