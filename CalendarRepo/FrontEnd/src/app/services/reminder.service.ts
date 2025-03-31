// src/app/reminder.service.ts
import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { Commesse } from '../models/commessa.model';
import { CommesseService } from './commesse.service';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private reminderInterval: any;

  constructor(private commesseService: CommesseService) { }

  // Avvia il controllo periodico per i promemoria
  startReminders(): void {
    // Richiedi il permesso per le notifiche se non già concesso
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Pulisce eventuali intervalli già attivi
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }

    // Esegue il controllo ogni minuto (60000 ms)
    this.reminderInterval = setInterval(() => {
      this.checkReminders();
    }, 60000);

    // Esegui subito un controllo iniziale
    this.checkReminders();
  }

  // Ferma i promemoria
  stopReminders(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }

  // Controlla se ci sono eventi imminenti e invia una notifica
  private checkReminders(): void {
    this.commesseService.getCommesse().subscribe({
      next: (commesse: Commesse[]) => {
        const events: Commesse[] = commesse;
        const now = new Date();
        // Impostiamo un intervallo di promemoria: eventi che iniziano entro la prossima settimana
        const reminderLimit = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        events.forEach(e => {
          const eventDate = new Date(e.Date);
          // Se l'evento è futuro e rientra nell'intervallo di 15 minuti
          if (eventDate > now && eventDate <= reminderLimit) {
            setTimeout(() => {
              // Se le notifiche sono supportate e il permesso è stato concesso
              let startEvent = new Date(eventDate);
              let endEvent = new Date(eventDate);
              startEvent.setHours(e.Start);
              endEvent.setHours(e.End);
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`Commessa "${e.Title.toUpperCase()}"`, {
                  body: `Inizio: ${startEvent.toLocaleTimeString()}. Fine: ${endEvent.toLocaleTimeString()}`
                });
              }
            }, 5000);
          }
        });
      },
      error: (error) => {
        console.error('Errore durante il recupero delle commesse:', error);
      }
    });
  }
}
