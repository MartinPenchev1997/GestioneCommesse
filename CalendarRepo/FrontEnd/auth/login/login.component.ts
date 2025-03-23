// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRequest, AuthResponse, AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials: AuthRequest = { username: '', password: '' };
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {
    if(this.authService.isAuthenticated())
      this.router.navigate(['/calendar']);
  }

  login() {
    this.authService.login(this.credentials).subscribe({
      next: (response: AuthResponse) => {
        // Salva il token in localStorage o in un service dedicato
        localStorage.setItem('token', response.Token);
        localStorage.setItem('refreshToken', response.RefreshToken);
        this.message = 'Login effettuato con successo.';

        this.router.navigate(['/calendar']);
      },
      error: (err) => {
        this.message = 'Errore durante il login: ' + err.error;
      }
    });
  }

  register() {
    this.authService.register(this.credentials).subscribe({
      next: (response) => {
        this.message = 'Registrazione effettuata con successo.';
      },
      error: (err) => {
        this.message = 'Errore durante la registrazione: ' + err.error;
      }
    })
  }
}
