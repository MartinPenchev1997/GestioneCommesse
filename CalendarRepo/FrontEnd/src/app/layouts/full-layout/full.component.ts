import { Component, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { decodeToken, getClaims, getRole } from "src/app/shared/helper/jwtDecode.helper";

@Component({
  selector: 'full-component',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullLayoutComponent {
  isSidebarOpen = true; // Sidebar aperta di default su desktop
  loggedUser: string = '';
  isAdmin: boolean = false;
  constructor(private renderer: Renderer2, private authService: AuthService, private router: Router) {
    this.loggedUser = this.authService.getLoggedUser();
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = decodeToken(token);
      if (decoded) {
        this.loggedUser = getClaims(decoded) || 'Utente';
        this.isAdmin = getRole(decoded) === 'Admin';
      }
      // this.loggedUser = decoded.name || decoded.unique_name || 'Utente';
      // this.isAdmin = decoded.role === 'Admin';
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;

    // Gestione del margine su desktop
    if (!this.isSidebarOpen) {
      this.renderer.addClass(document.querySelector('.main-content'), 'sidebar-closed');
    } else {
      this.renderer.removeClass(document.querySelector('.main-content'), 'sidebar-closed');
    }
  }

  doLogout() {
    this.authService.logout().subscribe({
      next: (result) => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        alert('Errore durante il logout!');
      }
    });
  }
}

