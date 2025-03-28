import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRequest, AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
  credentials: AuthRequest = { username: '', password: '', role: '' };
  confirmPassword: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  register(signinForm: any) {
    if (this.credentials.password !== this.confirmPassword) {
      this.message = 'Le password non coincidono.';
      return;
    }

    this.authService.register(this.credentials).subscribe({
      next: (response) => {
        this.message = 'Registrazione effettuata con successo. Effettua il login!';
        // Dopo 2 secondi reindirizza al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.message = 'Errore durante la registrazione: ' + err.error;
      }
    });
  }

  onHover() {
    setTimeout(() => {
      this.message = '';
    }, 1000);
  }
}
