import { Component, OnInit } from '@angular/core';
import { Commesse } from '../models/commessa.model';
import { EventService } from '../services/event.service';
import { ChartType } from 'chart.js';
import { CommesseService } from '../services/commesse.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Array degli eventi
  events: Commesse[] = [];

  // Grafico 1: Ore per mese
  public chart1Labels: string[] = [];
  public chart1Data: number[] = [];
  public chart1Options = { responsive: true, plugins: { legend: { display: true } } };
  public chart1Type: ChartType = 'bar';

  // Grafico 2: Ore per commessa con slider
  public chart2Labels: string[] = [];
  public chart2Data: number[] = [];
  public chart2Type: ChartType = 'bar';
  public commesseUniche: string[] = [];
  public selectedCommessaIndex = 0;

  // Grafico 3: Somma ore per ogni giorno per commessa
  public chart3Labels: string[] = [];
  public chart3Data: number[] = [];
  public chart3Type: ChartType = 'line';

  // Grafico 4: Totale ore di manutenzione per giorno per commessa
  public chart4Labels: string[] = [];
  public chart4Data: number[] = [];
  public chart4Type: ChartType = 'line';


  constructor(private commesseService: CommesseService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.commesseService.getCommesse().subscribe({
      next: (res: any) => {
        this.events = res;
        this.prepareChart1();
        this.prepareChart2();
        this.prepareChart3();
        this.prepareChart4();
      },
      error: (err: any) => {
        this.toastr.error('Errore caricamento commesse');
      }
    })
  }

  // Ore per mese
  prepareChart1(): void {
    const monthMap: { [key: string]: number } = {};
    this.events.forEach(event => {
      const date = new Date(event.Date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthMap[key] = (monthMap[key] || 0) + event.Hours;
    });

    const sortedKeys = Object.keys(monthMap).sort();
    this.chart1Labels = sortedKeys.map(key => {
      const [year, month] = key.split('-').map(Number);
      return new Date(year, month - 1).toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    });
    this.chart1Data = sortedKeys.map(key => monthMap[key]);
  }

  // Ore per commessa con slider
  prepareChart2(): void {
    const commessaMap: { [key: string]: number } = {};
    this.events.forEach(event => {
      commessaMap[event.Title] = (commessaMap[event.Title] || 0) + event.Hours;
    });

    this.commesseUniche = Object.keys(commessaMap);
    this.updateChart2(0);
  }

  updateChart2(index: number): void {
    this.selectedCommessaIndex = index;
    const commessa = this.commesseUniche[index];
    const hours = this.events.filter(e => e.Title === commessa).reduce((sum, e) => sum + e.Hours, 0);
    this.chart2Labels = [commessa];
    this.chart2Data = [hours];
  }

  // Somma ore per giorno per commessa
  prepareChart3(): void {
    const dailyMap: { [key: string]: number } = {};
    this.events.forEach(event => {
      const date = new Date(event.Date).toISOString().split('T')[0];
      dailyMap[date] = (dailyMap[date] || 0) + event.Hours;
    });

    this.chart3Labels = Object.keys(dailyMap).sort();
    this.chart3Data = this.chart3Labels.map(date => dailyMap[date]);
  }

  // Ore di manutenzione per giorno per commessa
  prepareChart4(): void {
    const maintenanceMap: { [key: string]: number } = {};
    this.events.forEach(event => {
      const date = new Date(event.Date).toISOString().split('T')[0];
      maintenanceMap[date] = (maintenanceMap[date] || 0) + (event.MaintenanceHours ? event.Hours : 0);
    });

    this.chart4Labels = Object.keys(maintenanceMap).sort();
    this.chart4Data = this.chart4Labels.map(date => maintenanceMap[date]);
  }
}
