import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../services/admin.service';
import { ConfirmDialogComponent, ConfirmDialogData } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface User {
  Id: number;
  Username: string;
  Role: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // users: User[] = [];
  displayedColumns: string[] = ['id', 'username', 'ruolo', 'actions'];
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAll().subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: error => console.error('Errore nel caricamento degli utenti', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteUser(userId: number): void {
    // Apro la dialog di conferma
    const dialogData: ConfirmDialogData = {
      title: 'Conferma eliminazione',
      message: 'Sei sicuro di voler eliminare questo utente?'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.snackBar.open('Utente eliminato con successo', 'Chiudi', { duration: 3000 });
            this.loadUsers();
          },
          error: () => {
            this.snackBar.open('Errore durante l\'eliminazione', 'Chiudi', { duration: 3000 });
          }
        });
      }
    });
  }
}
