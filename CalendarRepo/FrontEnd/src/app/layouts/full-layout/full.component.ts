import { Component, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: 'full-component',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullLayoutComponent {
  isSidebarOpen = true; // Sidebar aperta di default su desktop

  constructor(private renderer: Renderer2, private authService: AuthService, private router: Router) { }

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
    debugger;
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
